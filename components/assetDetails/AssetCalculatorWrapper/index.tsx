import { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Cookie from 'js-cookie';

//Components
import MonthlyReturnCard from '../MonthlyReturnCard';
import MobileDrawer from '../../primitives/MobileDrawer/MobileDrawer';
import HowItWorks from '../HowItWorks';
import CalculatorInvestNowBtn from '../CalculatorInvestNowBtn';

//Redux
import { useDispatch } from 'react-redux';
import {
  setPendingOrders,
  setShowMobileMonthlyPlan,
  setSubmitLoading,
} from '../../../redux/slices/monthlyCard';
import { getKYCDetailsList } from '../../../redux/slices/spvDetails';
import {
  closeKycPopup,
  getKYCConsent,
  getUserKycDocuments,
} from '../../../redux/slices/user';
import { setSelected } from '../../../redux/slices/assets';

//Utils
import { assetStatus, generateAgreementURL } from '../../../utils/asset';
import {
  isAssetBonds,
  isAssetCommercialProduct,
  isAssetEligibleForRepeatOrderPopup,
  isAssetStartupEquity,
  isHighYieldFd,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import { isOBPPKYCEnabledForAsset } from '../../../utils/rfq';
import { getUTMParams, popuplateUTMParams } from '../../../utils/utm';
import { trackEvent } from '../../../utils/gtm';
import { hasSpvCategoryBank } from '../../../utils/spv';
import {
  fetchTransactionsPortfolio,
  handleAssetCalculation,
} from '../../../api/assets';
import { confirmedOrderStatus } from '../../../utils/order';
import {
  getOverallDefaultKycStatus,
  isVerifiedKYCStatus,
} from '../../../utils/discovery';
import { KycStatusResponseModel } from '../../user-kyc/utils/models';
import { getKycStepStatus } from '../../user-kyc/utils/helper';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import {
  isAdditionalKYCPending,
  isAdditionalKycPendingVerification,
  isEnhancedKycRequired,
  isKycPending,
  isKycUnderVerification,
  isUserCkycPending,
  isUserLogged,
} from '../../../utils/user';
import { fetchAPI } from '../../../api/strapi';
import { isCommercialProductConsentCompleted } from './utils';
import { getDocumentStatus, getNriAddressDocumentStatus } from '../utils';

//APIs
import { getUserUccStatus, updateUserPreferences } from '../../../api/user';
import { createRFQOrder } from '../../../api/order';
import { getPendingOrdersRfq } from '../../../api/rfq';

// Hooks
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../../redux/slices/hooks';

//Context
import { GlobalContext } from '../../../pages/_app';

//Styles
import styles from './AssetCalculatorWrapper.module.css';

//Dynamic Imports for Modals
const CkycDialog = dynamic(() => import('../CkycDialog'), { ssr: false });

const IconDialog = dynamic(() => import('../../common/IconDialog'), {
  ssr: false,
});

const BondsDocuementModal = dynamic(() => import('../BondsDocuementModal'), {
  ssr: false,
});

const PendingOrdersModal = dynamic(() => import('../PendingOrdersModal'), {
  ssr: false,
});

const MaterialModalPopup = dynamic(
  () => import('../../primitives/MaterialModalPopup'),
  { ssr: false }
);

const UtrFormModal = dynamic(() => import('../../rfq/UtrModal'), {
  ssr: false,
});

const UccInprogressModal = dynamic(
  () => import('../../../components/assetDetails/UccInprogressModal'),
  { ssr: false }
);

const GenericModal = dynamic(
  () => import('../../../components/user-kyc/common/GenericModal'),
  { ssr: false }
);

const AssetCalculatorWrapper = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isMobileDevice = useMediaQuery('(max-width: 992px)');

  const { selectedAsset: asset = {}, ckycOpened } = useAppSelector(
    (state) => state.assets
  );
  const user = useAppSelector((state) => state.user);
  const access = useAppSelector((state) => state.access);
  const isLoggedInUser = isUserLogged();

  const { kycTypes } = useAppSelector((state) => state.spvDetails);

  const [localProps, setLocalProps] = useState<any>({});

  const {
    pendingOrders,
    singleLotCalculation,
    disableBondsInvestBtn,
    showMobileMonthlyPlan,
    units,
    investmentAmount,
  } = useAppSelector((state) => state.monthlyCard);

  const { obppSPVCategoryID = [] } = useContext<any>(GlobalContext);

  const [normalKYCPending, setNormalKYCPending] = useState(false);
  const [normalKYCUnderVerification, setNormalKYCUnderVerification] =
    useState(false);

  const [showKYCDialog, setShowKYCDialog] = useState(false);
  const [showCKYCDialog, setShowCKYCDialog] = useState(false);
  const [showBondDocModal, setShowBondDocModal] = useState(false);
  const [showUccPendingModal, setShowUccPendingModal] = useState(false);
  const [showRepeatOrder, setShowRepeatOrder] = useState(false);
  const [openPendingOrderModal, setOpenPendingOrderModal] = useState(false);
  const [showAmoFailed, setShowAmoFailed] = useState({
    status: false,
    msg: '',
    subtitle: '',
  });
  const [showUtrModal, setShowUtrModal] = useState(false);
  const [showFd, setShowFd] = useState(false);

  const [transactionIdForUtr, setTransactionIdForUtr] = useState();
  let [isAmoOrder, setIsAmoOrder] = useState(false);
  const [rfqDocList, setRfqDocList] = useState([]);
  const isDefaultAssetDetailPage = useAppSelector(
    (state) => state.assets.showDefaultAssetDetailPage
  );

  const assetDetailsCB = () => {
    if (
      (isAssetCommercialProduct(asset) || isAssetStartupEquity(asset)) &&
      !isCommercialProductConsentCompleted(user?.kycConsent, kycTypes)
    ) {
      // Past Deals should open for SE and CRE
      const isActive = assetStatus(asset) === 'active';
      if (isActive) {
        window.open('/assets/#active', '_self');
      }
    } else {
      const userKYCPending = isKycPending(user?.userData, user);
      const userKYCUnderVerification = isKycUnderVerification(user?.userData);
      if (userKYCPending) {
        setNormalKYCPending(true);
        if (user?.showAssetKycPopup && asset?.assetID) {
          closeKycPopup();
          if (isAssetBonds(asset) || isSDISecondary(asset)) {
            handleBondDocumentModal();
          } else {
            setShowKYCDialog(true);
          }
        }
      } else if (userKYCUnderVerification) {
        setNormalKYCUnderVerification(true);
      } else {
        setNormalKYCPending(false);
      }
    }
  };

  useEffect(() => {
    if (isLoggedInUser) {
      getKYCDetailsList(assetDetailsCB);
      dispatch(getKYCConsent() as any);
      if (isEnhancedKycRequired(asset)) {
        if (user?.userData.cheque) {
          getUserKycDocuments(
            access?.userID,
            null,
            isAssetStartupEquity(asset)
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPendingOrders = async () => {
    const orders = await getPendingOrdersRfq('?filter[orderDate]=asc');
    dispatch(setPendingOrders(orders));
  };

  useEffect(() => {
    const fetchOrderNudgeData = async () => {
      try {
        const orderNudge = await fetchAPI(
          '/inner-pages-data',
          {
            filters: {
              url: '/order-nudge',
            },
            populate: '*',
          },
          {},
          false
        );
        const finalOrderNudgeData =
          orderNudge?.data?.[0]?.attributes?.pageData?.[0]?.objectData || {};

        if (finalOrderNudgeData?.enableOrderNudge) {
          getPendingOrders();
        }

        setLocalProps({
          orderNudgeData: finalOrderNudgeData,
        });
      } catch (err) {
        console.log('Error fetching order nudge data');
      }
    };

    const isActive = assetStatus(asset) === 'active';

    if (isActive) {
      fetchOrderNudgeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.assetID]);

  const docArr: string[] = ['pan', 'aadhaar', 'depository', 'cheque'];
  let statusArr: string[] = [];

  const handleStatusArr = (kycObj: any) => {
    statusArr = [];
    const handleObject = (itemId: string) =>
      itemId === 'cheque' ? user?.userData : user?.kycDetails;

    for (let index = 0; index < docArr.length; index++) {
      if (
        docArr[index] === 'aadhaar' &&
        user?.userData?.residentialStatus === 'nri'
      ) {
        statusArr.push(
          getNriAddressDocumentStatus(handleObject(docArr[index]))
        );
      } else {
        statusArr.push(
          getDocumentStatus(handleObject(docArr[index]), docArr[index])
        );
      }
    }
  };

  const goToInvestmentOverview = () => {
    setSubmitLoading(true);
    if (isAmoOrder) {
      return placeAmoOrder();
    }
    window.open(
      generateAgreementURL(
        asset,
        isSDISecondary(asset) ? units : investmentAmount
      ),
      '_self'
    );
  };

  const showOverview = async () => {
    if (
      isEnhancedKycRequired(asset) &&
      // if enhancedKycRequired is true redirect to KYC paege if any KYC is pending
      isAdditionalKYCPending(user?.userData) &&
      !isAssetStartupEquity(asset)
    ) {
      setShowKYCDialog(true);
      return;
    }

    if (
      normalKYCPending &&
      !isEnhancedKycRequired(asset) &&
      !isAssetStartupEquity(asset)
    ) {
      setShowKYCDialog(true);
      return;
    }

    if (isUserCkycPending(user.userData) && isAssetCommercialProduct(asset)) {
      if (!ckycOpened) {
        setShowCKYCDialog(true);
        dispatch(setShowMobileMonthlyPlan(false));
      }

      return;
    }

    const isReportOrderStatus = await isRepeatOrder();

    if (isReportOrderStatus) {
      setShowRepeatOrder(true);
      return;
    }

    goToInvestmentOverview();
  };

  const showLearnMore = (val: boolean) => {
    setShowCKYCDialog(val);
    dispatch(setShowMobileMonthlyPlan(!val));
  };

  const isBondKycPending = () => {
    const { nomineeName, residentialStatus } = user?.userData ?? {};
    if (
      !statusArr.includes('Pending') &&
      !statusArr.includes('Submitted') &&
      !statusArr.includes('Rejected') &&
      !statusArr.includes('Pending Verification') &&
      nomineeName &&
      residentialStatus
    ) {
      return false;
    } else {
      return true;
    }
  };

  const showPendingKycModal = (statusArr: any, isOBPPKYC: boolean) => {
    setShowBondDocModal(true);
    dispatch(setShowMobileMonthlyPlan(false));
  };

  const isRepeatOrder = async () => {
    if (isAssetEligibleForRepeatOrderPopup(asset)) {
      try {
        const data = await fetchTransactionsPortfolio(
          asset?.assetID,
          confirmedOrderStatus
        );

        return Boolean(data?.orderID?.length);
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  };

  const handleRepeatOrderCheck = async () => {
    if (
      isSDISecondary(asset) &&
      hasSpvCategoryBank(asset?.spvCategoryDetails)
    ) {
      return await isRepeatOrder();
    }
    return false;
  };

  /**
   * Redirection function to kyc flow
   * Redirect to user-kyc if asset is RFQ
   * Otherwise redirect to kyc old flow
   * @param isAssetRfq Asset type RFQ or non RFQ
   */
  const redirectToKycPage = (isAssetRfq = true) => {
    const path = isAssetRfq ? '/user-kyc' : '/kyc';
    router.push(path);
  };

  /**
   * @param eventName Name of the event for GA AND RudderStack
   * @param extraData If extra data needed to pass as an object
   */
  const onClickEvent = (
    eventName: string,
    extraData: {
      [key: string]: string | boolean | number;
    } = {}
  ) => {
    const data = {
      assetID: asset?.assetID,
      userID: user?.userData?.userID,
      createdAt: new Date(),
      financeProductType: asset?.financeProductType,
      ...extraData,
    };
    trackEvent(eventName, data);
  };

  const onClickRA = (
    eventName: string,
    extraData: {
      [key: string]: string;
    } = {}
  ) => {
    const data = {
      assetID: asset?.assetID,
      userID: user?.userData?.userID,
      createdAt: new Date(),
      financeProductType: asset?.financeProductType,
      ...extraData,
    };
    trackEvent(eventName, data);
  };

  const onClickContinueRepeatOrderPopup = () => {
    setShowRepeatOrder(false);
    onClickRA('Repeat_popup', {
      buttonClicked: 'CONTINUE',
    });
    goToInvestmentOverview();
  };

  const onCloseRepeatOrderPopuop = () => {
    setShowRepeatOrder(false);
    onClickRA('Repeat_popup', {
      buttonClicked: 'GO_BACK',
    });
  };

  const placeAmoOrder = async () => {
    try {
      dispatch(setSubmitLoading(true));

      const dataToUpdate = {
        channel: 'whatsapp',
        data: { transactional: true },
      };
      const { assetID } = asset;

      const promise1 = updateUserPreferences(dataToUpdate, '', false);
      const promise2 = handleAssetCalculation(assetID, units);
      const [_updatedPreferences, calculationData] = await Promise.all([
        promise1,
        promise2,
      ]);

      let utmParams = {};
      if (Cookie.get('utm')) {
        utmParams = getUTMParams();
      } else {
        utmParams = {
          search: 'Not received',
          ...popuplateUTMParams({}),
        };
      }
      const { assetCalcDetails } = calculationData;
      if (assetCalcDetails?.investmentAmount) {
        const payload = {
          assetID,
          units,
          amount: assetCalcDetails?.investmentAmount,
          upiID: '',
          bankingName: '',
          utmParams,
          isAmo: true,
        };
        const response = await createRFQOrder(payload, true);
        if (response?.transactionID) {
          dispatch(
            setSelected({
              transactionID: response?.transactionID,
              isAmo: true,
            })
          );
          router.push('/confirmation');
        }
      }
    } catch (e) {
      setOpenPendingOrderModal(false);
      e?.statusCode === 422
        ? setShowAmoFailed({
            status: true,
            msg: 'Your AMO cannot be placed as the Asset is fully subscribed',
            subtitle: '',
          })
        : setShowAmoFailed({
            status: true,
            msg: 'Your AMO can not get placed due to some technical glitch',
            subtitle:
              'We are resolving it and will notify you once it is resolved',
          });
      dispatch(setSubmitLoading(false));
    }
  };

  const routeToAssetAggrementUrl = (isMarketClosed = false) => {
    const isRFQAsset = asset?.isRfq;
    // AMO Order only for RFQ Enabled Orders
    if (
      isRFQAsset &&
      (isMarketClosed || isAmoOrder) &&
      asset?.spvCategoryDetails?.spvCategoryPg.length === 0
    ) {
      return placeAmoOrder();
    }
    setSubmitLoading(true);
    router.push(generateAgreementURL(asset, units));
  };

  /**
   * Handles the document modal for RFQ assets.
   *
   * @param {boolean} isMarketClosed - Indicates if the market is closed.
   *
   * 1. Retrieve KYC configuration status and RFQ KYC status.
   * 2. Update AMO order status if the market is closed.
   * 3. Show pending KYC modal if KYC is pending.
   * 4. Check UCC status before moving to the investment overview screen.
   * 5. Handle repeat order check.
   * 6. Check pending orders status.
   */

  const handleRFQDocumentModal = async (isMarketClosed = false) => {
    const kycConfigStatus = user?.kycConfigStatus;
    const rfqStatusKYC = getOverallDefaultKycStatus(kycConfigStatus);
    const isRFQVerifiedKYC = isVerifiedKYCStatus(rfqStatusKYC);
    const isRFQAsset = asset?.isRfq;

    // AMO order will be placed only for RFQ Deals
    if (
      isRFQAsset &&
      isMarketClosed &&
      asset?.spvCategoryDetails?.spvCategoryPg.length === 0
    ) {
      setIsAmoOrder(true);
    }

    const kycStatusArr: KycStatusResponseModel[] =
      kycConfigStatus?.default?.kycTypes;
    setRfqDocList(getKycStepStatus(kycStatusArr));
    const isKycPending = !isRFQVerifiedKYC;

    if (isKycPending) {
      showPendingKycModal(kycStatusArr, true);
      return;
    }

    // UCC Check for RFQ Assets only
    if (isRFQAsset) {
      const userUccStatus = await getUserUccStatus();
      if (!userUccStatus?.NSE || userUccStatus?.NSE?.status !== 'active') {
        setShowUccPendingModal(true);
        return;
      }
    }

    const isRepeatOrder = await handleRepeatOrderCheck();
    if (isRepeatOrder) {
      setShowRepeatOrder(true);
      return;
    }

    // Pending Order Modal only should be available for RFQ Assets
    if (
      isRFQAsset &&
      pendingOrders?.length &&
      localProps?.orderNudgeData?.enableOrderNudge
    ) {
      setOpenPendingOrderModal(true);
      return;
    }

    routeToAssetAggrementUrl(isMarketClosed);
  };

  /**
   * Handles the document modal for non-RFQ assets.
   *
   * 1. Handle KYC status for non-RFQ assets.
   * 2. Show pending KYC modal if KYC is pending.
   * 3. Handle repeat order check.
   */

  const handleNonRFQDocumentModal = async () => {
    handleStatusArr(user);
    const isKycPending = isBondKycPending();

    if (isKycPending) {
      showPendingKycModal(statusArr, false);
      return;
    }

    const isRepeatOrder = await handleRepeatOrderCheck();
    if (isRepeatOrder) {
      setShowRepeatOrder(true);
      return;
    }

    routeToAssetAggrementUrl();
  };

  const handleBondDocumentModal = async (isMarketClosed: boolean = false) => {
    dispatch(setShowMobileMonthlyPlan(false));
    if (disableBondsInvestBtn) {
      return;
    }

    if (isOBPPKYCEnabledForAsset(asset, obppSPVCategoryID)) {
      handleRFQDocumentModal(isMarketClosed);
    } else {
      handleNonRFQDocumentModal();
    }
  };

  const handleDocumentContinue = () => {
    dispatch(setShowMobileMonthlyPlan(false));
    let rfqKycStatus = false;
    const shouldUseOBPPKYC = isOBPPKYCEnabledForAsset(asset, obppSPVCategoryID);

    // OBPP KYC for RFQ Assets and SDI Secondary Assets
    if (shouldUseOBPPKYC) {
      const statusArr = rfqDocList.map((ele) => ele.status);
      rfqKycStatus = !statusArr.every((ele) => ele === 1);
    } else {
      handleStatusArr(user);
    }

    if (!rfqKycStatus) {
      setTimeout(() => {
        trackEvent('kyc_redirect', {
          page: 'asset_detail',
        });

        redirectToKycPage(shouldUseOBPPKYC);
      }, 0);
    } else {
      setShowBondDocModal(false);
      dispatch(setShowMobileMonthlyPlan(true));
    }
  };

  const handleUtrModal = (value) => {
    setShowUtrModal(true);
    setTransactionIdForUtr(value);
    setOpenPendingOrderModal(false);
  };

  const handleBondsDocuementModalClose = () => {
    dispatch(setShowMobileMonthlyPlan(isMobileDevice));
    setShowBondDocModal(false);
  };

  const getSpecialSubHeasingText = (showAdditionalKYC: boolean) => {
    const textForProduct = isAssetStartupEquity(asset)
      ? 'Opportunities'
      : 'Deals';
    return showAdditionalKYC
      ? `${asset?.financeProductType} ${textForProduct}`
      : '';
  };

  const renderKYCDialog = () => {
    if (isAdditionalKycPendingVerification(user)) {
      return null;
    }
    const isNormalKYCComplete = normalKYCUnderVerification || !normalKYCPending;
    const showAdditionalKYC =
      isNormalKYCComplete && isEnhancedKycRequired(asset);
    let subHeadingText = `You need to complete ${
      isNormalKYCComplete ? 'additional' : ''
    } KYC requirements to invest`;
    let specialSubHeadingText = getSpecialSubHeasingText(showAdditionalKYC);
    if (showAdditionalKYC) {
      subHeadingText += ' in';
    }
    return (
      <IconDialog
        classes={{
          modalContainerClass: styles.KYCModalMain,
          modalContentClass: 'KYCDialog',
        }}
        showDialog={showKYCDialog}
        iconUrl={`${GRIP_INVEST_BUCKET_URL}dealsV2/additional-kyc-warning.svg`}
        headingText={
          isNormalKYCComplete ? 'Additional KYC Needed' : 'KYC Needed'
        }
        subHeadingText={subHeadingText}
        submitButtonText={`Complete ${
          isNormalKYCComplete ? 'Additional' : ''
        } KYC`}
        onSubmit={() => {
          const location = window.location;
          Cookie.set('kycRedirectTo', `${location.pathname}`);
          onClickEvent('Complete_KYC_Asset_Details');
          window.open('/kyc/pan', '_self');
        }}
        specialSubHeadingText={specialSubHeadingText}
        onCloseDialog={() => setShowKYCDialog(false)}
        id="additional-kyc-drawer"
        isLoadingButton
      />
    );
  };

  let getRepeatSubHeadingText = () => {
    return isSDISecondary(asset)
      ? 'Looks like you have already invested in this opportunity. By continuing, you will be placing an additional order for the same asset'
      : 'You have already invested in this opportunity. In terms of next steps, a drawdown notice will be issued by the AIF to your registered email address. By continuing, you will be increasing your commitment amount to this opportunity.';
  };

  const renderRepeatInvestmentPopup = () => {
    return (
      <IconDialog
        showDialog={showRepeatOrder}
        iconUrl={`${GRIP_INVEST_BUCKET_URL}dealsV2/additional-kyc-warning.svg`}
        headingText={'Do you want to continue?'}
        subHeadingText={getRepeatSubHeadingText()}
        id={'repeat-investment-popup'}
        submitButtonText={'Continue'}
        onSubmit={onClickContinueRepeatOrderPopup}
        isLoadingButton
        onCloseDialog={onCloseRepeatOrderPopuop}
      />
    );
  };

  const handleDrawerVisibility = (visibility: boolean) => {
    setShowFd(visibility);
    dispatch(setShowMobileMonthlyPlan(!visibility));
  };

  const handleModalClose = () => {
    dispatch(setShowMobileMonthlyPlan(false));
  };

  const renderMonthlyReturns = () => (
    <MonthlyReturnCard
      showOverview={showOverview}
      showLearnMore={showLearnMore}
      handleInvestNowBtnClick={handleBondDocumentModal}
      handleKycContinue={handleDocumentContinue}
    />
  );

  const renderMobileExperiment = () => {
    if (isDefaultAssetDetailPage) return null;

    return (
      <CalculatorInvestNowBtn
        handleKycContinue={handleDocumentContinue}
        handleInvestNowBtnClick={handleBondDocumentModal}
      />
    );
  };

  return (
    <>
      {asset && Object.keys(asset).length ? (
        <>
          {isMobileDevice ? (
            <MaterialModalPopup
              showModal={showMobileMonthlyPlan}
              isModalDrawer
              className={`${isHighYieldFd(asset) ? styles.FdDrawer : ''}`}
              handleModalClose={() => handleModalClose()}
              cardClass={styles.MonthlyReturnCardDrawer}
              drawerRootExtraClass={'CalculatorAssetDrawer'}
            >
              {renderMonthlyReturns()}
            </MaterialModalPopup>
          ) : (
            <div className={styles.AssetDetailRight}>
              {renderMonthlyReturns()}
            </div>
          )}
        </>
      ) : null}

      {renderMobileExperiment()}

      {renderKYCDialog()}

      <CkycDialog
        onClickDialog={showLearnMore}
        showCKYCDialog={showCKYCDialog}
      />

      <UtrFormModal
        showModal={showUtrModal}
        setShowUtrModal={setShowUtrModal}
        transactionId={transactionIdForUtr}
      />
      <MaterialModalPopup
        showModal={showBondDocModal}
        className={styles.BondsDocuementModal}
        isModalDrawer={true}
        handleModalClose={handleBondsDocuementModalClose}
        cardClass={styles.BondsDocuementModalCard}
        cardStyles={
          asset?.isRfq
            ? {}
            : {
                backgroundImage: `url(${GRIP_INVEST_BUCKET_URL}bonds/bond-doc-modal-background.png)`,
              }
        }
      >
        <BondsDocuementModal
          handleContinueBtn={handleDocumentContinue}
          userData={user}
          rfqDocList={rfqDocList}
          asset={asset}
        />
      </MaterialModalPopup>

      {renderRepeatInvestmentPopup()}

      <UccInprogressModal
        showModal={showUccPendingModal}
        isAmoOrder={isAmoOrder}
        handleModalClose={() => setShowUccPendingModal(false)}
      />

      {openPendingOrderModal ? (
        <PendingOrdersModal
          pendingOrders={pendingOrders}
          setOpenPendingOrderModal={setOpenPendingOrderModal}
          PendingOrderModal={openPendingOrderModal}
          clickOnNewOrder={routeToAssetAggrementUrl}
          orderNudgeData={localProps?.orderNudgeData}
          handleUtrModal={handleUtrModal}
          assetID={asset?.assetID ?? ''}
          investmentAmount={singleLotCalculation?.investmentAmount * units}
          units={units}
        />
      ) : null}

      {showAmoFailed && (
        <GenericModal
          showModal={showAmoFailed.status}
          lottieType={'warning'}
          title={showAmoFailed.msg}
          subtitle={showAmoFailed.subtitle}
          btnText={'Explore other deals'}
          handleBtnClick={() => router.push('/discover')}
        />
      )}

      {showFd && (
        <MobileDrawer
          showFlyer={showFd}
          className={styles.HowItWorksModal}
          handleDrawerClose={() => {
            handleDrawerVisibility(false);
          }}
        >
          <HowItWorks
            handleOnSubmit={() => {
              handleDrawerVisibility(false);
            }}
          />
        </MobileDrawer>
      )}
    </>
  );
};

export default AssetCalculatorWrapper;
