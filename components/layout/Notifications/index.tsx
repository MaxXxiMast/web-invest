// NODE MODULES
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import snakeCase from 'lodash/snakeCase';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CircularProgress } from '@mui/material';

// SVG ICONS
import NotificationProfileIcon from '../../../icons/NotificationsProfileIcon.svg';
import CircularRightArrow from '../../../icons/CircularRightArrow.svg';

// Components
import Image from '../../primitives/Image';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';

// Types
import type { RootState } from '../../../redux';

// Redux Slices
import {
  getDocumentDetails,
  getPartnerResignation,
  toggleEsignLoading,
  getMCADocumentDetails,
} from '../../../redux/slices/orders';
import {
  esignDocument,
  fetchUserNotifications,
  getKYCConsent,
  validateAgreementsEsign,
} from '../../../redux/slices/user';
import { setAfterEsignDone } from '../../../redux/slices/config';

// Utils
import {
  isAdditionalKYCPending,
  isAdditionalKycPendingVerification,
  isKycPending,
  isKycUnderVerification,
  isUserAccredited,
} from '../../../utils/user';
import { callErrorToast } from '../../../api/strapi';
import { trackEvent } from '../../../utils/gtm';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../../utils/string';
import {
  getAssetNameFromFilename,
  ESIGN_LOADING_TIME,
} from '../../../utils/portfolio';
import { isAssetAIF } from '../../../utils/asset';

import styles from './Notifications.module.css';

dayjs.extend(relativeTime);

let isLoaded = false;

const NotificationsList = (props: any) => {
  const router = useRouter();
  const [localState, setLocalState] = useState({
    showExperianDailog: false,
    esignOrderLoading: [],
  });
  const notifyArr: any = [];
  const [loading, setLoading] = useState('');
  const setState = (data: Record<string, any>) => {
    setLocalState({ ...localState, ...data });
  };
  const { userData, userKycDetails } = props;
  const { pendingResignations = [] } = props;
  const setDigioLoading = (assetName?: string) => {
    if (assetName) {
      setLoading(assetName);
      setTimeout(() => setLoading(''), ESIGN_LOADING_TIME);
    }
    return true;
  };
  const renderNotification = (data: Record<any, any>) => {
    return (
      <div
        style={{
          backgroundColor:
            data?.id === 'KYC' ? 'rgba(253, 172, 66, 0.1)' : 'transparent',
          minHeight: data?.buttonText ? '120px' : '90px',
        }}
        className={styles.notification_wrapper}
        key={data?.key}
        data-type="notification"
        id={data?.id}
      >
        <div className={styles.notification_image}>
          <Image
            src={data?.icon}
            layout={'fixed'}
            width={40}
            height={40}
            key={`Image${data?.key}`}
            alt="icon"
          />
        </div>
        <div className={styles.notification_right}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className={styles.notification_title}>{data.title}</span>
            <span className={styles.notification_subTitle}>
              {data.subTitle}
            </span>
          </div>
          <span className={styles.notification_time}>{data.time}</span>
        </div>
        {data?.buttonText ? (
          data?.disabled ? (
            <TooltipCompoent
              toolTipText={data?.tooltip || 'Error Occured while Loading'}
            >
              <div
                className={styles.notification_button}
                style={{ cursor: 'not-allowed' }}
              >
                <span className={styles.notification_button_title_disabled}>
                  {data.buttonText}
                </span>
                <Image
                  src={data?.buttonIcon}
                  layout={'fixed'}
                  width={16}
                  height={16}
                  className={styles.disabledArrow}
                  alt="buttonIcon"
                />
              </div>
            </TooltipCompoent>
          ) : (
            <div
              className={styles.notification_button}
              onClick={() => setDigioLoading(data?.assetName) && data?.action()}
            >
              {loading && loading === data.assetName ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <span className={styles.notification_button_title}>
                    {data.buttonText}
                  </span>
                  <Image
                    src={data?.buttonIcon}
                    layout={'fixed'}
                    width={16}
                    height={16}
                    alt="buttonIcon"
                  />
                </>
              )}
            </div>
          )
        ) : null}
      </div>
    );
  };

  const stopEsignLoading = (assetName: string) => {
    setState({
      esignOrderLoading: localState.esignOrderLoading?.filter(
        (value: string) => value !== assetName
      ),
    });
  };

  const verifyEsignDetails = (
    data: any,
    fileName: string,
    type?: string,
    orderId?: string
  ) => {
    // get the clicked esing asset name
    const assetName = getAssetNameFromFilename(fileName);
    // currently esign loadings
    const loadingEsigns = localState.esignOrderLoading;
    // check if clicked esign is in loading state or not

    const isAssetEsignInProgress = loadingEsigns?.includes(assetName);

    // if asset esign not in loading then it should not show another popup
    if (!isAssetEsignInProgress) {
      PubSub.publish('openDigio', {
        type: type || 'order',
        openDigioModal: true,
        data: { ...data, fileName, notification: true, orderId: orderId },
        redirectTo: `${window.location.pathname}`,
        onEsignDone: afterEsignDone,
      });
      props.toggleEsignLoading(false);
      setState({
        esignOrderLoading: [...localState.esignOrderLoading, assetName],
      });

      // Should stop loading after 5 mins ( if esign not completed)
      setTimeout(() => stopEsignLoading(assetName), ESIGN_LOADING_TIME);
    }
  };
  const failedEsign = (msg: string, filename: string) => {
    callErrorToast(msg);
    props.toggleEsignLoading(false);
    const assetName = getAssetNameFromFilename(filename);
    stopEsignLoading(assetName);
  };
  const getLlpTooltipText = () => {
    const { userData } = props;
    if (isKycPending(userData, userKycDetails)) {
      return 'You can eSign the agreement only after the KYC';
    }
    if (isKycUnderVerification(userData)) {
      return 'You can eSign your agreement once the KYC submitted by you is approved';
    }
    return '';
  };
  const getResignTooltipText = (action?: any) => {
    const { userData } = props;
    if (isKycPending(userData, userKycDetails)) {
      return 'You can eSign the resignation letter only after the KYC';
    }
    if (isKycUnderVerification(userData)) {
      return 'You can eSign your resignation letter once the KYC submitted by you is approved';
    }
    if (action && disableResignation(action)) {
      const asset: any = action.Asset;
      return `Please first sign the LLP agreement for ${asset.name}`;
    }
    return '';
  };

  const afterEsignDone = () => {
    props.setAfterEsignDone(true);
    router.reload();
  };

  const onAifEsign = async (params: any) => {
    await props.validateAgreementsEsign(params, () => {
      window.location.reload();
    });

    afterEsignDone();
  };

  const verifyAifEsign = (data: any, type?: string, notification?: any) => {
    const { userID } = props.userData;
    const { assetID, spvID, agreementFormId, module, signOnce, orderID } =
      notification;
    PubSub.publish('openDigio', {
      type: type || '',
      openDigioModal: true,
      data: {
        ...data,
        userID,
        assetID,
        spvID: signOnce ? spvID : '',
        module,
        formID: agreementFormId,
        fileName: type,
        type,
        signOnce,
        orderID,
      },
      onEsignDone: onAifEsign,
    });
  };

  const isNotificationAgreementForm = (
    item: any,
    orderID: string,
    agreementFormId?: number | string
  ) => {
    return (
      (item.orderID && orderID && item.orderID === orderID) ||
      (agreementFormId &&
        item.agreementFormId &&
        item.agreementFormId === agreementFormId)
    );
  };

  /**
   * Esign only after kyc and accreditions is completed
   * @returns `true` When Completed
   */
  const isOneTimeAgreementKYCCompleted = () => {
    if (!isUserAccredited(props.kycConsent)) {
      callErrorToast("You're yet to be accredited to invest in this deal.");
      return false;
    }

    if (isAdditionalKYCPending(props.userData)) {
      trackEvent('kyc_redirect', {
        page: 'notifications',
        userID: props.userData?.userID,
      });
      router.push('/user-kyc');
      return false;
    }

    if (isAdditionalKycPendingVerification(props.userData)) {
      callErrorToast('Your KYC is under verification');
      return false;
    }

    return true;
  };

  const esignOrder = (
    assetID: string,
    assetName?: string,
    agreementFormId?: number | string,
    orderID?: string
  ) => {
    let notification = {
      spvType: 0,
      agreementFormId: agreementFormId,
      amount: 0,
      signOnce: false,
    };
    props.notifications.forEach((item: any) => {
      if (isNotificationAgreementForm(item, assetID, agreementFormId)) {
        notification = item;
      }
    });

    const fileName = snakeCase(
      `Signed_${props.userData?.firstName}_${assetName || ''}_${
        agreementFormId || ''
      }`.trim()
    );

    if (isAssetAIF(notification)) {
      // One time agreement for an AIF Deal should check for kyc
      if (notification.signOnce && !isOneTimeAgreementKYCCompleted()) {
        return;
      }

      props.esignDocument(
        verifyAifEsign,
        failedEsign,
        fileName,
        agreementFormId,
        notification.amount ? notification.amount : 0,
        notification
      );
    } else {
      if (props.userData?.kycDone) {
        props.toggleEsignLoading(true);
        props.getDocumentDetails(
          assetID,
          verifyEsignDetails,
          failedEsign,
          fileName,
          orderID
        );
      }
    }
  };

  const fetchMCADoc = (orderID, assetName, spvID) => {
    props.toggleEsignLoading(true);
    const fileName = `${props.userData?.firstName}_${assetName}_Investment_Declaration_Document_agreement`;
    props.getMCADocumentDetails(
      spvID,
      verifyMCAEsignDetails,
      failedEsign,
      fileName,
      orderID
    );
  };

  const verifyMCAEsignDetails = (data: any, fileName: string) => {
    const pendingMcaEsign = props?.pendingMcaEsign || [];
    const notificaiton = pendingMcaEsign.find(
      (e) => e.orderID === data.orderID
    );
    PubSub.publish('openDigio', {
      redirectTo: '',
      type: 'mca',
      openDigioModal: true,
      data: {
        ...data,
        fileName,
        spvID: notificaiton?.spvID,
      },
      onEsignDone: () => {
        props.fetchUserNotifications(props.userData?.userID, () =>
          afterEsignDone()
        );
      },
    });
    setLocalState((localState) => ({
      ...localState,
      verificationLoading: false,
      esignMCALoading: false,
    }));
  };

  const resignOrder = (orderID: string) => {
    const pendingResignations = props.pendingResignations;
    const order = pendingResignations?.find((e) => e.orderID === orderID);
    if (order) {
      const { Asset, user } = order;
      const fileName = `Unsigned_resignation_${user.firstName}_${Asset.name}`;
      props.toggleEsignLoading(true);
      props.getPartnerResignation(
        orderID,
        fileName,
        verifyEsignDetails,
        failedEsign
      );
    }
  };

  const disableResignation = (action: any) => {
    const { userData, notifications = [] } = props;
    const asset: any = action.Asset;
    const esignPending = notifications.find(
      (e: any) => e.assetName === asset.name
    );
    return !userData?.kycDone || !!esignPending;
  };

  const renderEsignNotification = () => {
    let esignNotifications = props?.notifications || [];
    let esignNotification = {
      icon: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/esign.svg`,
      title: 'eSign Needed',
      subTitle: 'Deal:',
      buttonText: 'eSign Now',
      buttonIcon: CircularRightArrow,
    };
    if (esignNotifications.length) {
      notifyArr.push(
        ...esignNotifications.map((notification, index) => {
          return {
            assetName: `${notification.assetName} ${
              notification.agreementFormId || ''
            }`.trim(),
            key: `esign${index}`,
            ...esignNotification,
            subTitle: `Deal: ${notification.assetName}`,
            time: dayjs(notification.lastUpdatedAt).fromNow(),
            disabled: !userData?.kycDone,
            tooltip: getLlpTooltipText(),
            action: () =>
              esignOrder(
                notification.assetID,
                notification.assetName,
                notification.agreementFormId,
                notification.orderID
              ),
          };
        })
      );
    }
  };

  const renderMcaNotifications = () => {
    let pendingMcaEsign = props?.pendingMcaEsign || [];
    let esignNotification = {
      icon: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/esign.svg`,
      title: 'eSign Needed',
      subTitle: 'Deal:',
      buttonText: 'eSign Now',
      buttonIcon: CircularRightArrow,
    };
    if (pendingMcaEsign.length) {
      notifyArr.push(
        ...pendingMcaEsign.map((notification, index) => {
          return {
            assetName: `${notification.assetName} ${
              notification.agreementFormId || ''
            }`.trim(),
            key: `esign${index}`,
            ...esignNotification,
            subTitle: `${notification.assetName}`,
            time: dayjs(notification.lastUpdatedAt).fromNow(),
            disabled: !userData?.kycDone,
            tooltip: getLlpTooltipText(),
            action: () =>
              fetchMCADoc(
                notification.orderID,
                notification.assetName,
                notification.spvID
              ),
          };
        })
      );
    }
  };

  const renderResignationNotification = () => {
    let resignationNotification = {
      icon: NotificationProfileIcon,
      title: `eSign Needed `,
      subTitle: ' eSign your resignation letter to complete the investment ',
      buttonText: 'Complete eSign',
      buttonIcon: CircularRightArrow,
    };
    if (pendingResignations.length)
      notifyArr.push(
        ...pendingResignations.map((notification, index) => {
          let disabled: boolean = disableResignation(notification);
          return {
            key: `resign${index}`,
            assetName: notification.assetName,
            disabled: disabled,
            tooltip: getResignTooltipText(notification),
            ...resignationNotification,
            subTitle: `eSign Resignation letter for ${notification?.Asset?.name}`,
            time: dayjs(notification.lastUpdatedAt).fromNow(),
            action: () => {
              resignOrder(notification.orderID);
            },
          };
        })
      );
  };

  useEffect(() => {
    if (!isLoaded) {
      props.getKYCConsent();
      isLoaded = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userKycDetails && !isLoaded) {
      getAllNotifications();
      isLoaded = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKycDetails]);

  const getAllNotifications = () => {
    if (notifyArr.length === 0) {
      renderResignationNotification();
      renderEsignNotification();
      renderMcaNotifications();
    }
  };

  getAllNotifications();
  return (
    <div
      style={{ overflow: 'auto', width: '100%' }}
      id="notification-container"
    >
      {props?.showAllNotifications
        ? notifyArr.map((data) => renderNotification(data))
        : notifyArr?.slice(0, 2).map((data) => renderNotification(data))}
    </div>
  );
};
const mapStateToProps = (state: RootState) => ({
  userData: state.user.userData,
  userKycDetails: state.user.kycDetails,
  notifications: state.user.notifications,
  pendingResignations: state.user.pendingResignations,
  pendingMcaEsign: state.user.pendingMcaEsign,
  kycConsent: state.user.kycConsent,
});

const mapDispatchToProps = {
  getDocumentDetails,
  getPartnerResignation,
  toggleEsignLoading,
  fetchUserNotifications,
  esignDocument,
  validateAgreementsEsign,
  getMCADocumentDetails,
  getKYCConsent,
  setAfterEsignDone,
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsList);
