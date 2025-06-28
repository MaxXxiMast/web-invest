import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import PubSub from 'pubsub-js';
import dayjs from 'dayjs';
import styles from '../../styles/Investment/InvestmentSuccess.module.css';
import { fetchTransactionHistory } from '../../redux/slices/referral';
import { useAppDispatch } from '../../redux/slices/hooks';
import { RootState } from '../../redux';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';
import { callErrorToast, fetchAPI } from '../../api/strapi';
import Seo from '../../components/layout/seo';
import SuccessBanner from '../../components/investment-success/successBanner';
import TransactionDetails from '../../components/investment-success/TransactionDetails';
import NextSteps from '../../components/investment-success/nextSteps';
import OrderJourney from '../../components/investment-success/orderJourney';
import BottomSwitch from '../../components/investment-success/MobileButtonSwitch';
import Retry from '../../components/investment-success/retry';
import {
  getDocumentDetails,
  retryPayment,
  getMCADocumentDetails,
  getLLpDocuments,
} from '../../redux/slices/orders';
import { ORDER_STATUS_MAPPING } from '../../utils/order';
import {
  getKycUrl,
  isKycPending,
  isKycUnderVerification,
  isUserLogged,
} from '../../utils/user';
import {
  absoluteCommittedInvestment,
  generateAgreementURL,
  generateAssetURL,
  getAssetPartnersName,
} from '../../utils/asset';
import { isAssetBonds } from '../../utils/financeProductTypes';
import DiwaliJackpotModal from '../../components/miscellaneous/DiwaliJackpotModal';
import { isBetweenDates } from '../../utils/date';
import { trackEvent } from '../../utils/gtm';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { isEmpty } from '../../utils/object';
import InvestmentSuccessSkeleton from '../../skeletons/investment-success-skeleton/InvestmentSuccessSkeleton';
import { isGCOrder } from '../../utils/gripConnect';
import { getHolidayList } from '../../api/bonds';

const InvestmentSuccess: NextPage = (props: any) => {
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery();
  const router = useRouter();
  const didMount = useRef(false);
  const [isModalCloseManual, setIsModalCloseManual] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const isGC = isGCOrder();

  useEffect(() => {
    const eventData = {
      is_rfq: false,
      order_status: null,
      payment_status: null,
      payment_mode: null,
    };
    trackEvent('Investment Success', eventData);
  }, []);

  useEffect(() => {
    dispatch(fetchTransactionHistory());
    if (isEmpty(props?.order)) {
      redirecttoAssets();
    }

    if (typeof window !== 'undefined') {
      setIsModalCloseManual(
        JSON.parse(localStorage.getItem('isDiwaliModalClose'))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([
        getHolidayList(),
        props.getLLpDocuments(props?.order?.orderID),
      ]).then((res) => {
        setHolidays(res[0]);
        setLoading(false);
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.order?.orderID]);

  const seoData = props?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];

  const [localState, setLocalState] = useState({
    loadingRetry: false,
    verificationLoading: false,
    loadingTime: 10,
    esignLoading: false,
    esignMCALoading: false,
    showReferralDrawer: false,
    optIn: {},
    optInToggle: false,
    showShareOptions: false,
  });
  const timeoutId: number | null = null;
  useEffect(() => {
    didMount.current = true;
  }, []);

  const isBondOrder = isAssetBonds(props?.selectedAsset);
  const isScondarySdiOrder = props?.order?.isSdiSecondaryOrder;
  const isScondarySdiOrderPending = props?.order?.createPendingOrder;

  const isCommercialOrder = () => {
    return props.order?.useCommercialNEFT;
  };

  const orderSuccessLabels = () => {
    if (isBondOrder || (isScondarySdiOrder && !isScondarySdiOrderPending)) {
      return {
        label: 'Order Initiated!',
        subLabel: 'We will update you regarding your order status soon',
        icon: 'investment-success/invested.svg',
      };
    } else if (isScondarySdiOrder && isScondarySdiOrderPending) {
      return {
        label: 'Order Initiated!',
        subLabel:
          'Your request has been accepted, please read the details below for completing your transaction.',
        icon: 'investment-success/commercialOrderCreated.svg',
        mobileIcon: 'investment-success/commercialOrderCreatedInverted.svg',
      };
    } else if (isCommercialOrder()) {
      return {
        label: 'Order Created !',
        subLabel:
          'Your order is created in the portfolio <b>pending payment</b> of money.',
        icon: 'investment-success/commercialOrderCreated.svg',
      };
    }
    return {
      label: 'Order Initiated!',
      subLabel: 'We will update you regarding your order status soon',
      icon: 'investment-success/invested.svg',
    };
  };
  const shouldEsign = () => {
    const { order, user, llpDocuments, userKycDetails } = props;
    const { hasLlp, isOrderSuccessful, shouldEsignDocuments } = order;
    if (isOrderSuccessful) {
      if (
        user?.userData &&
        !isKycPending(user.userData, userKycDetails) &&
        isKycUnderVerification(user.userData)
      ) {
        return false;
      } else if (hasLlp && shouldEsignDocuments) {
        const document = llpDocuments.find(
          (a: any) => a.docSubType === 'signed' && a.docType === 'agreement'
        );
        if (document) {
          return false;
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
  const shouldEsignMCA = () => {
    const { order, user, llpDocuments, userKycDetails } = props;
    const { hasLlp, isOrderSuccessful, shouldEsignMca } = order;
    if (isOrderSuccessful) {
      if (
        user?.userData &&
        !isKycPending(user.userData, userKycDetails) &&
        isKycUnderVerification(user.userData)
      ) {
        return false;
      } else if (hasLlp && shouldEsignMca) {
        const document = llpDocuments.find((a: any) => a.docType === 'mca');
        if (document) {
          return false;
        }
        return true;
      }
    }
    return false;
  };

  const verifyEsignDetails = (data: any, fileName: string) => {
    PubSub.publish('openDigio', {
      redirectTo: '',
      type: 'order',
      openDigioModal: true,
      data: {
        ...data,
        fileName,
      },
      onEsignDone: () => props.getLLpDocuments(props?.order?.orderID),
      onEsignCancel: () => stopLoading(),
    });
    setLocalState((localState) => ({
      ...localState,
      verificationLoading: false,
      esignMCALoading: false,
    }));
  };

  const verifyMCAEsignDetails = (data: any, fileName: string) => {
    PubSub.publish('openDigio', {
      redirectTo: '',
      type: 'mca',
      openDigioModal: true,
      data: {
        ...data,
        fileName,
        spvID: props?.order?.spvID,
      },
      onEsignDone: () => props.getLLpDocuments(props?.order?.orderID),
    });
    setLocalState((localState) => ({
      ...localState,
      verificationLoading: false,
      esignMCALoading: false,
    }));
  };

  const showAssetDetails = () => {
    const assetUrl = generateAssetURL(props.order);
    router.push(assetUrl);
  };
  const signIn = () => {
    const loginButton = document.getElementById('login-button-header');
    if (loginButton) {
      loginButton.click();
    } else {
      router.push('/login');
    }
  };
  const failedEsign = (msg: string) => {
    callErrorToast(msg);
  };

  const fetchEsignDoc = () => {
    clearInterval(timeoutId as any);
    setLocalState({
      ...localState,
      verificationLoading: true,
      esignLoading: true,
    });
    const fileName = `Unsigned_${props.user.userData?.firstName}_${props.order.assetName}`;
    props.getDocumentDetails(
      props.order?.assetID,
      verifyEsignDetails,
      failedEsign,
      fileName,
      props.order?.orderID
    );
  };

  const fetchMCADoc = () => {
    clearInterval(timeoutId as any);
    setLocalState({
      ...localState,
      verificationLoading: true,
      esignMCALoading: true,
    });

    const fileName = `${props.user.userData?.firstName}_${props.order.assetName}_Interest_Disclosure_Document_agreement`;

    props.getMCADocumentDetails(
      props.order.orderID,
      verifyMCAEsignDetails,
      failedEsign,
      fileName
    );
  };

  const redirectForKyc = () => {
    router.push(getKycUrl(props.user.userData));
  };

  const stopLoading = () => {
    setLocalState({
      ...localState,
      esignLoading: false,
    });
  };

  const showPortfolio = () => {
    const { accessToken, userID } = props.access;
    if (accessToken && userID) {
      router.push('/portfolio#my_investments');
    } else {
      router.push('/login');
    }
  };

  const getOrderActionsCard = () => {
    const { user, order } = props;
    const assetsByFinanceProductType = props.portfolioList?.filter(
      (portfolio: any) => {
        return (
          order?.financeProductType &&
          portfolio?.financeProductType &&
          order?.financeProductType === portfolio?.financeProductType
        );
      }
    );
    const allConfirmedOrders = assetsByFinanceProductType?.reduce(
      (previous: any, curr: any) => {
        let orders = previous;
        const confirmedOrders = curr?.transactions?.filter(
          (order: any) => order.status === ORDER_STATUS_MAPPING.Confirmed
        );
        if (confirmedOrders.length) {
          orders = [...orders, ...confirmedOrders];
        }
        return orders;
      },
      []
    );
    let isConfirmedOrders = Boolean(allConfirmedOrders?.length);
    return {
      userData: user?.userData,
      isUserLogged: isUserLogged(),
      shouldEsign: shouldEsign,
      shouldEsignMCA: shouldEsignMCA,
      verificationLoading: localState.verificationLoading,
      signIn: signIn,
      fetchEsignDoc: fetchEsignDoc,
      fetchMCADOC: fetchMCADoc,
      esignLoading: localState.esignLoading,
      esignMCALoading: localState.esignMCALoading,
      redirectForKyc: redirectForKyc,
      showPortfolio: showPortfolio,
      isCommercialOrder: isCommercialOrder(),
      accountNumber: props.order.spvAccountNo,
      ifscCode: props.order.spvIfscCode,
      spvName: props.order.spvName,
      isConfirmedOrders: isConfirmedOrders,
      order,
      stopLoading: stopLoading,
      kycDetails: user?.kycDetails,
    };
  };
  const nextStep = (): [string, () => void, boolean] => {
    const { userData } = props.user;
    if (!isUserLogged()) {
      return ['Login', signIn, false];
    } else if (isCommercialOrder() || isBondOrder || isScondarySdiOrder) {
      return ['View Portfolio', showPortfolio, false];
    } else if (isKycPending(userData, props?.userKycDetails)) {
      return ['Complete KYC', redirectForKyc, false];
    } else {
      return ['View Portfolio', showPortfolio, false];
    }
  };

  const redirecttoAssets = () => {
    if (isUserLogged()) {
      router.push('/assets');
    } else {
      router.push('/login');
    }
  };
  const retryText = () => {
    return props.order.isDealCompleted
      ? 'The asset you tried to invest in is fully subscribed. The amount is refunded to your vault. You can use it to invest in other assets.'
      : "We didn't receive your payment! In case money debited by your bank, it will get refunded in 5-7 days. Retry now to secure your returns.";
  };
  const retryFailedPayment = () => {
    setLocalState({
      ...localState,
      loadingRetry: true,
    });
    const asset = props?.selectedAsset || {};
    const amount = props?.order?.amount || '';
    const {
      assetPartners = [],
      tenure = '',
      irr = '',
      assetID = '',
      name = '',
      financeProductType = '',
    } = asset;

    let isCombo = assetPartners?.length > 1;
    let completedPercentage = absoluteCommittedInvestment(asset, false);
    let partnerNames = getAssetPartnersName(asset);

    // Rudderstack analytics `retry_payment`
    const rudderData = {
      amount: amount,
      is_adding_money: false,
      is_combo: isCombo,
      partner_names: partnerNames,
      completed_percentage: completedPercentage,
      tenure: tenure,
      irr: irr,
      asset_id: assetID,
      asset_name: name,
      financeProductType: financeProductType,
    };
    trackEvent('retry_payment', rudderData);
    if (isAssetBonds(asset)) {
      window.open(
        `${process.env.NEXT_PUBLIC_GRIP_BROKING_API_URL}/invest/${props?.order?.orderID}`,
        '_self'
      );
    } else {
      router.push(generateAgreementURL(asset, amount));
    }
  };

  const shouldRenderDiwaliJackpot = () => {
    return (
      props?.order?.isOrderSuccessful &&
      isBetweenDates(dayjs(), '2022-10-14', '2022-11-04') &&
      props?.user?.userData?.totalOrdersDuringDiwaliJackpot <= 5 &&
      !isModalCloseManual
    );
  };

  const getOrderJourney = () =>
    isBondOrder || isScondarySdiOrder ? (
      <OrderJourney
        nextStep={nextStep}
        holidays={holidays}
        isScondarySdiOrder={isScondarySdiOrder}
        pageData={props?.pageData}
        isScondarySdiOrderPending={isScondarySdiOrderPending}
        orderData={props?.order}
      />
    ) : null;

  const getNextStep = () =>
    !(isBondOrder || (isScondarySdiOrder && !isScondarySdiOrderPending)) ? ( // donot show next step for bonds and SDI secondary W/ PG
      <NextSteps
        data={getOrderActionsCard()}
        isScondarySdiOrder={isScondarySdiOrder}
        orderData={props?.order}
      />
    ) : null;

  const desktopView = () => {
    const { order } = props;
    if (order.isOrderSuccessful)
      return (
        <>
          <Seo seo={seoData} />
          <div className={styles.mainContainer}>
            <SuccessBanner
              data={orderSuccessLabels()}
              className={`${isScondarySdiOrder ? styles.TextWrapper : ''}`}
            />
            <TransactionDetails
              order={order}
              asset={props.selectedAsset}
              showAssetDetails={showAssetDetails}
              isCommercialOrder={isCommercialOrder()}
              isBondOrSdiSecondaryOrder={isBondOrder || isScondarySdiOrder}
              isBondOrder={isBondOrder}
              holidays={holidays}
              userData={props?.user?.userData}
            />
            <div
              className={`containerNew ${
                isBondOrder || isScondarySdiOrder ? styles.BondsSucessPage : ''
              }`}
              style={{
                position: 'relative',
                top: isBondOrder || isScondarySdiOrder ? -212 : -132,
                left: isBondOrder || isScondarySdiOrder ? -8 : 0,
                display: 'flex',
                gap: 60,
                flexDirection: 'column',
              }}
            >
              {getOrderJourney()}
              {getNextStep()}
            </div>
          </div>
        </>
      );
    else {
      return (
        <Retry
          gotoAssets={redirecttoAssets}
          text={retryText()}
          retryClick={retryFailedPayment}
          loadingRetry={localState.loadingRetry}
        />
      );
    }
  };
  const mobileView = () => {
    const { order } = props;
    if (order.isOrderSuccessful)
      return (
        <div style={{ marginBottom: 94 }}>
          <Seo seo={seoData} />
          <SuccessBanner data={orderSuccessLabels()} />
          <TransactionDetails
            order={order}
            asset={props.selectedAsset}
            showAssetDetails={showAssetDetails}
            isCommercialOrder={isCommercialOrder()}
            isBondOrSdiSecondaryOrder={isBondOrder || isScondarySdiOrder}
            holidays={holidays}
            userData={props?.user?.userData}
          />
          <div
            style={{ marginTop: '-19%' }}
            className={`${
              isAssetBonds(props.selectedAsset) ? styles.AssetBond : ''
            }`}
          >
            {getOrderJourney()}
            {getNextStep()}
            {!isGC ? (
              <BottomSwitch nextStep={nextStep} gotoAssets={redirecttoAssets} />
            ) : null}
          </div>
        </div>
      );
    else {
      return (
        <Retry
          gotoAssets={redirecttoAssets}
          text={retryText()}
          retryClick={retryFailedPayment}
          loadingRetry={localState.loadingRetry}
        />
      );
    }
  };
  if (loading) {
    return <InvestmentSuccessSkeleton />;
  }
  return (
    <>
      {isMobile ? mobileView() : desktopView()}
      {/* SHOW DIWALI MODAL BETWEEN TWO DATES */}
      {shouldRenderDiwaliJackpot() && (
        <DiwaliJackpotModal userData={props.user} />
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  assets: state.assets.active,
  loading: state.assets.loading.active,
  order: state.orders.selectedOrder,
  llpDocuments: state.orders.llpDocuments,
  userKycDetails: state.user.kycDetails,
  orders: state.orders,
  user: state.user,
  selectedAsset: state.assets.selectedAsset || {},
  access: state.access,
});

const mapDispatchToProps = {
  retryPayment,
  getDocumentDetails,
  getMCADocumentDetails,
  getLLpDocuments,
};

export async function getServerSideProps() {
  try {
    const pageData = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/investment-success',
        },
        populate: '*',
      },
      {},
      false
    );
    return {
      props: {
        pageData: pageData?.data?.[0]?.attributes?.pageData,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvestmentSuccess);
