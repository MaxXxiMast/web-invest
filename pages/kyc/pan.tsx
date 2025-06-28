import { NextPage } from 'next';
import Cookie from 'js-cookie';
import styles from '../../styles/ProfileKYC.module.css';
import mobileStyles from '../../styles/ProfileKYCMobile.module.css';

import Header from '../../components/kyc/Header';
import ActionButton from '../../components/kyc/ActionButton';
import Modal from '../../components/kyc/Modal';
import { isMobile } from '../../utils/resolution';
import {
  kycStepDataArr,
  header,
  modalData,
  panActions,
} from '../../pages_utils/kyc';
import {
  failCardData,
  postUploadDataForm,
  uploadFormData,
} from '../../pages_utils/pan';

import { useEffect, useState } from 'react';
import KYCLayout from '../../components/kyc/kycLayout';
import { RootState } from '../../redux';
import {
  getBankInfo,
  getKYCConsent,
  getPanAadhaarDetails,
  updateCkyc,
  updateUserKYC,
  uploadKycDocuments,
} from '../../redux/slices/user';
import { connect, ConnectedProps } from 'react-redux';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { callErrorToast, processError } from '../../api/strapi';
import { getHeaderData, getPanStatus } from '../../utils/kyc';
import { useRouter } from 'next/router';
import { getKycUrl, isUserAccredited } from '../../utils/user';
import BackdropComponent from '../../components/common/BackdropComponent';
import { bytesToSize } from '../../utils/number';
import { trackEvent } from '../../utils/gtm';
import { isUserEligibleForCkycDownload } from '../../components/kyc/utils';

dayjs.extend(customParseFormat);

const mapStateToProps = (state: RootState) => ({
  userKycDetails: state.user.kycDetails,
  userData: state.user.userData,
  kycConsent: state.user.kycConsent,
  selectedAsset: state.access?.selectedAsset,
  access: state.access,
});

const mapDispatchToProps = {
  getPanAadhaarDetails,
  getKYCConsent,
  uploadKycDocuments,
  updateUserKYC,
  getBankInfo,
  updateCkyc,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const convertDatetoFormat = (x: any) => {
  return dayjs(x, 'DD/MM/YYYY').format('YYYY-MM-DD');
};

type extraData = Partial<{
  fileFormat: string;
  fileSize: string;
  attempt_number: number;
  userChanged: boolean;
  manualVerification: boolean;
}>;

interface PanProps extends ConnectedProps<typeof connector> {}

const Pan: NextPage = (props: PanProps) => {
  const headerData = getHeaderData(kycStepDataArr, props?.selectedAsset);

  const finalStyles = isMobile() ? mobileStyles : styles;

  const router = useRouter();
  const kycType = 'pan';

  const [showModal, setShowModal] = useState(false);
  const step = 0;

  const [panName, setPanname] = useState(
    props.userKycDetails?.pan?.docName || ''
  );
  const [panNumber, setPanNumber] = useState(
    props.userKycDetails?.pan?.docIDNo || ''
  );
  const [panDob, setPanDob] = useState(
    convertDatetoFormat(props.userKycDetails?.pan?.dob || '')
  );
  const [nomineeName, setNomineeName] = useState(
    props.userKycDetails?.pan?.nomineeName || ''
  );

  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [error, setError] = useState('');

  const [panStatus, setPanStatus] = useState(getPanStatus(props.userData));
  const [showHints, setShowHints] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  // Store file size
  const [rudderEventData, setRudderEventData] = useState<extraData>({
    fileFormat: '',
    fileSize: '0',
    attempt_number: 0,
    userChanged: false,
    manualVerification: false,
  });

  const updatePanDetails = async (cb?: any) => {
    props.getPanAadhaarDetails(cb);
    setPanDetails();
  };

  useEffect(() => {
    const { userData, kycConsent, userKycDetails } = props;
    const kycUrl = getKycUrl(
      {
        ...userData,
        isUserAccredited: isUserAccredited(kycConsent),
      },
      userKycDetails,
      props.selectedAsset
    );
    router.push(kycUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userData]);

  useEffect(() => {
    setPanDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userKycDetails?.pan]);

  useEffect(() => {
    props.getPanAadhaarDetails();
    props.getKYCConsent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBackClick = () => {
    if (panName || panNumber || panDob || nomineeName) {
      setPanname('');
      setPanNumber('');
      setPanDob('');
      setNomineeName('');
      setPanStatus('pending');
    } else {
      const redirectTo = Cookie.get('redirectTo');
      if (Cookie.get('kycSource') == 'discovery') {
        router.push('/discover');
      } else if (redirectTo) {
        router.push(redirectTo);
        Cookie.remove('redirectTo');
      } else {
        router.push('/assets');
      }
    }
  };

  useEffect(() => {
    router.events.on('routeChangeStart', () => setShowLoader(true));
    router.events.on('routeChangeComplete', () => setShowLoader(false));

    return () => {
      router.events.off('routeChangeStart', () => setShowLoader(true));
      router.events.off('routeChangeComplete', () => setShowLoader(false));
    };
  }, [router]);

  const onHintsClick = () => {
    setShowHints(true);
  };

  const onCloseHintsModal = () => {
    setShowHints(false);
  };

  const onOpenModal = () => {
    setShowModal(true);
  };

  const onCloseModal = () => {
    setShowModal(false);
  };

  const sendRudderStackEvent = () => {
    // Rudderstack event kyc_pan_added
    trackEvent('kyc_pan_added', {
      pan: panNumber,
      pan_name: panName,
      file_format: rudderEventData.fileFormat,
      file_size: rudderEventData.fileSize,
      attempt_number: rudderEventData?.attempt_number,
      user_changed: rudderEventData?.userChanged,
      manual_verification: rudderEventData.manualVerification,
    });

    if (Cookie.get('kycSource')) {
      trackEvent('Click_complete_kyc', {
        url: router.pathname,
        Is_FTI: !Boolean(props?.userData?.investmentData?.totalInvestments),
      });
    }
  };

  const uploadDone = (_success?: boolean, apiError?: unknown) => {
    onCloseModal();
    if (apiError) {
      setError(String(apiError));
      setWrongAttempts(wrongAttempts + 1);
      updateRudderEventData({
        attempt_number: wrongAttempts + 1,
        manualVerification: wrongAttempts + 1 >= 2,
      });
    } else {
      setWrongAttempts(0);
      // Update pan details after successfull upload
      updatePanDetails();
    }
  };

  const successCB = () => {
    onCloseModal();
    let cb = props.updateCkyc;
    if (props?.userData?.ckycDisabled) {
      cb = null;
    }
    updatePanDetails(cb);
    sendRudderStackEvent();
  };

  const failedCB = (err: any) => {
    onCloseModal();
    setError(processError(err));
  };

  const onActionClick = () => {
    if (!panName || !panNumber || !panDob || !nomineeName) {
      callErrorToast(`Missing mandatory field`);
      return;
    }
    const dob = dayjs(panDob).format('DD/MM/YYYY');
    const { userData, userKycDetails = {} } = props;
    const pan = userKycDetails?.pan;
    const params: any = {
      docName: panName,
      docIDNo: panNumber,
      dob: dob,
      userID: userData?.userID,
      kycID: pan.docID,
      nomineeName: nomineeName,
    };
    onOpenModal();
    props.updateUserKYC(params, kycType, successCB, failedCB);
  };

  const updateRudderEventData = (data: extraData) => {
    setRudderEventData({
      ...rudderEventData,
      ...data,
    });
  };

  const onPanChange = (file?: File, isReupload = false) => {
    if (isReupload) {
      setError('');
      return;
    }

    // Update file format and size
    updateRudderEventData({
      fileFormat: file?.type,

      fileSize: bytesToSize(file?.size),
      manualVerification: wrongAttempts >= 2,
    });

    onOpenModal();
    const sendToTerminal = wrongAttempts >= 2;
    props.uploadKycDocuments(
      file,
      'kyc',
      kycType,
      uploadDone,
      undefined,
      false,
      sendToTerminal
    );
  };

  const setUserChanged = () => {
    updateRudderEventData({
      userChanged: true,
    });
  };

  const onPanNameChange = (e: any) => {
    const value = e.target.value;
    setUserChanged();
    setPanname(value);
  };

  const onPanNoChange = (e: any) => {
    const value = e.target.value;
    setUserChanged();
    updateRudderEventData({
      manualVerification: true,
    });
    setPanNumber(value);
  };

  const onPanDobChange = (e: any) => {
    const value = e.target.value;
    setUserChanged();
    setPanDob(value);
  };

  const onPanNomineeChange = (e: any) => {
    const value = e.target.value;
    setUserChanged();
    setNomineeName(value);
  };

  const onChange = {
    pan: onPanChange,
    panName: onPanNameChange,
    panNumber: onPanNoChange,
    panDob: onPanDobChange,
    nomineeName: onPanNomineeChange,
  };

  const getFormValues = (id: string) => {
    const formValues = {
      pan: '',
      panName: panName,
      panNumber: panNumber,
      panDob: panDob,
      nomineeName: nomineeName,
      disable: isUserEligibleForCkycDownload(props.userData),
    };
    return formValues[id];
  };

  const setPanDetails = () => {
    const panDetailsx = props.userKycDetails?.pan;
    const panDOB = panDetailsx?.dob
      ? convertDatetoFormat(panDetailsx?.dob)
      : '';

    setPanNumber(panDetailsx?.docIDNo);
    setPanname(panDetailsx?.docName);
    setPanDob(panDOB);
    setNomineeName(panDetailsx?.nomineeName);
    setPanStatus(getPanStatus(props.userData));
  };

  const isPanDetailsNA = () => {
    // The investor should see the upload screen when added Pan Details from SDI Deal
    return panStatus === 'pending';
  };

  const getFormData = () => {
    if (Boolean(error)) {
      return failCardData;
    } else if (isPanDetailsNA()) {
      return uploadFormData;
    } else {
      return postUploadDataForm;
    }
  };

  const isActionDisabled = () => {
    if (!panName || !panNumber || !panDob || !nomineeName) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <div className={`${finalStyles.profileContainer}`}>
      <Header
        data={header}
        onBackClick={onBackClick}
        onHintsClick={onHintsClick}
        step={step}
        contentData={headerData}
      />
      <KYCLayout
        id="pan"
        step={step}
        data={kycStepDataArr}
        actionActive={isActionDisabled()}
        onActionClick={onActionClick}
        formData={getFormData()}
        onChangeFunctions={onChange}
        getFormValues={getFormValues}
        formError={error}
        showHintsModal={showHints}
        onCloseHintsModal={onCloseHintsModal}
        showHintsMobile={isPanDetailsNA()}
        showEditDetails={
          isUserEligibleForCkycDownload(props.userData) && panNumber
        }
        assetData={props.selectedAsset}
      />
      {!isMobile() ? (
        <ActionButton
          active={isActionDisabled()}
          data={panActions}
          onClick={onActionClick}
        />
      ) : null}
      <BackdropComponent open={showModal}>
        <Modal
          data={modalData}
          closeModal={onCloseModal}
          showModal={showModal}
          isBottomModal={false}
        />
      </BackdropComponent>
      <BackdropComponent open={showLoader} />
    </div>
  );
};

export default connector(Pan);
