//Node Modules
import { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { connect } from 'react-redux';
import Cookie from 'js-cookie';
import Skeleton from '@mui/material/Skeleton';
import Head from 'next/head';
import dompurify from 'dompurify';

//Compoenents
import BackBtn from '../../components/primitives/BackBtn/BackBtn';
import Seo from '../../components/layout/seo';
import PrivateLinkPopup from '../../components/assetDetails/PrivateLinkPopup';
import AssetDetailMobileSkeleton from '../../skeletons/asset-detail-skeleton-mobile/AssetDetailMobileSkeleton';
import AssetDetailSkeleton from '../../skeletons/asset-detail-skeleton/AssetDetailSkeleton';
import AssetCalculatorSkeleton from '../../components/assetDetails/AssetCalculatorSkeleton/AssetCalculatorSkeleton';
import GripLayout from '../../components/assetDetails/PageLayout/GripLayout';

//HOOKS
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

//API
import { RootState } from '../../redux/index';
import {
  fetchAndSetAsset,
  setToggle,
  fetchAndSetPastAsset,
  setShowDefaultAssetDetailPage,
} from '../../redux/slices/assets';
import { getPanAadhaarDetails } from '../../redux/slices/user';
import { setFdInputValue, setFdMetaData } from '../../redux/slices/fd';
import { getPaymentMethodsMf } from '../../api/mf';
import { setMfData } from '../../components/mutual-funds/redux/mf';

//UTILS
import {
  absoluteCommittedInvestment,
  assetStatus,
  isFirstTimeInvestor,
  isInValidAssetUrl,
  getMaturityDate,
  getMaturityMonths,
} from '../../utils/asset';
import {
  isHighYieldFd,
  isAssetUnlistedPTC,
  isAssetBonds,
  isSDISecondary,
  isAssetBasket,
  isAssetBondsMF,
} from '../../utils/financeProductTypes';
import {
  getDocumentStatus,
  experimentUserCategoryCheck,
  getAssetDetailSchema,
} from '../../components/assetDetails/utils';
import {
  getAllPaymentMethods,
  getPaymentMethod,
} from '../../components/mutual-funds/utils/helpers';
import { isUserLogged } from '../../utils/user';
import { newRelicErrLogs, trackEvent } from '../../utils/gtm';
import { isGCOrder } from '../../utils/gripConnect';
import { getTotalAmountPaybale } from '../../utils/investment';
import { getOverallDefaultKycStatus } from '../../utils/discovery';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { getMarketStatus } from '../../utils/marketTime';

//APIs
import { fetchAPI } from '../../api/strapi';
import { fetchUserDebarmentDetails } from '../../api/user';
import { getFdMetadata, handleAssetCalculation } from '../../api/assets';

//Redux
import {
  setLocalProps,
  setUnits,
  setShowMobileMonthlyPlan,
  setDisableBondsInvestBtn,
  resetMonthlyCard,
  setViewAssetDetailEventFields,
  setSingleLotCalculation,
  setSubmitLoading,
} from '../../redux/slices/monthlyCard';
import {
  setCkycData,
  setUserDebartmentData,
} from '../../redux/slices/userConfig';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';

//styles
import styles from '../../styles/AssetDetails.module.css';

const RbiPopup = dynamic(
  () => import('../../components/unlisted-ptc/rbi-popup'),
  {
    ssr: false,
  }
);

let startTime = 0,
  endTime = 0;

const AssetDetails: NextPage = (props: any) => {
  const dispatch = useAppDispatch();
  const sanitizer = dompurify.sanitize;
  const router = useRouter();
  const { value } = router.query;
  const isMobileDevice = useMediaQuery();
  const isTabDevice = useMediaQuery('(max-width: 991px)');
  const [ctaText, setCtaText] = useState('Invest Now');
  const { userData: user, kycConfigStatus: kycStatusConfig } =
    props.kycUserData;

  let { pricePerLot = 0, minLotValue = 0 } = props?.asset?.sdiDetails ?? {};
  const isLoggedInUser = isUserLogged();
  const [loading, setLoading] = useState(true);

  const { localProps } = useAppSelector((state) => state.monthlyCard);
  const isPreviouslyInvested = useAppSelector(
    (state) => state.monthlyCard?.singleLotCalculation?.isPreviouslyInvested
  );
  const { NSE: uccStatus = {} } = useAppSelector(
    (state) => state.user?.uccStatus
  );
  const marketTiming = useAppSelector((state) => state.config.marketTiming);
  const [openPrivateLinkPopup, setOpenPrivateLinkPopup] = useState(false);
  const [showRBIModal, setShowRBIModal] = useState(false);

  const marketStatus = getMarketStatus(
    marketTiming?.marketStartTime,
    marketTiming?.marketClosingTime,
    marketTiming?.isMarketOpenToday
  );
  const isMarketClosed = ['closed', 'opens in'].includes(marketStatus);

  const { debarmentData } = useAppSelector((state) => state.userConfig);
  const { showDefaultAssetDetailPage } = props ?? {};

  const fetchSingleLotData = async (asset: any) => {
    const {
      irr = 0,
      isRfq,
      productCategory,
      productSubcategory,
      desc,
      partnerLogo,
      financeProductType = 'Unknown',
      name,
      assetMappingData,
    } = asset ?? {};

    const { kycUserData } = props;
    const { kycConfigStatus } = kycUserData;
    const { calculationInputFields } = assetMappingData || {};
    const kycStatus =
      getOverallDefaultKycStatus(kycConfigStatus) === 'verified';

    const userUccStatus = uccStatus?.status || '';
    const { isFilteredKYCComplete } = kycConfigStatus?.default || {};
    const previousPath = sessionStorage.getItem('lastVisitedPage') as string;
    const reducedMinInvestment = isFirstTimeInvestor(user)
      ? asset?.reducedTransactionAmount
      : '';

    let fields: any = {
      assetID: asset?.assetID,
      completedPercentage: absoluteCommittedInvestment(asset, false),
      market_open: marketTiming?.isMarketOpenToday,
      market_day_type: marketTiming?.reason,
      debarment_status: (debarmentData as any)?.isDebarred,
      assetName: name,
      irr: irr,
      reduced_minimum_investment_amount: reducedMinInvestment,
      rfq_enabled: isRfq,
      kyc_status: kycStatus,
      ucc_status: userUccStatus || false,
      financial_product_type: financeProductType,
      assetLogo: partnerLogo,
      assetDescription: desc,
      product_category: productCategory,
      product_sub_category: productSubcategory,
      assetRating: calculationInputFields?.rating,
      URL: window.location.href,
      fd_kyc_status: isFilteredKYCComplete,
      obpp_kyc_status: isFilteredKYCComplete,
      path: previousPath,
    };
    if (isHighYieldFd(asset)) {
      const data = await getFdMetadata(asset?.assetID);
      dispatch(setFdMetaData(data));
      const { amount } = router.query;
      const purifyAmount = Math.ceil(Number(sanitizer(amount)) / 1000) * 1000;
      // amount should be a multiple of 1000
      if (data?.minAmount && data?.maxAmount) {
        // waiting for minAmount and maxAmount to be set in redux to stop flickering
        if (
          purifyAmount &&
          !isNaN(Number(purifyAmount)) &&
          Number(purifyAmount) >= data?.minAmount &&
          Number(purifyAmount) <= data?.maxAmount
        ) {
          // only set the value if it is a valid number and within the range
          dispatch(setFdInputValue(Math.ceil(Number(purifyAmount))));
        } else {
          // set the default amount if it is not a valid number or not within the range
          dispatch(setFdInputValue(50000));
        }
      }
      fields['fd_type'] = asset?.category;
      fields['min_investment'] = calculationInputFields?.minTxnAmount;
      fields['tenure'] =
        asset?.assetMappingData?.calculationInputFields?.tenure;
    } else if (isAssetBondsMF(asset)) {
      const allowedMinInputValue = isPreviouslyInvested
        ? calculationInputFields?.minAdditionalInvestment
        : calculationInputFields?.minInitialInvestment;
      const allowedMaxInputValue = isPreviouslyInvested
        ? calculationInputFields?.maxAdditionalInvestment
        : calculationInputFields?.maxInitialInvestment;

      const multiplierCount = isPreviouslyInvested
        ? calculationInputFields?.additionalInvestmentMultiples
        : calculationInputFields?.initialInvestmentMultiples;

      const paymentMethods = await getPaymentMethodsMf({
        amount: Number(allowedMinInputValue),
        assetID: asset?.assetID,
      });
      const paymentMethod = getPaymentMethod(paymentMethods);
      const availablePaymentMethods = getAllPaymentMethods(paymentMethods);

      dispatch(
        setMfData({
          isLoading: false,
          isPendingOrder: isPreviouslyInvested,
          inputValue:
            allowedMinInputValue < 50000 ? 50000 : allowedMinInputValue,
          allowedMinInputValue: allowedMinInputValue,
          allowedMaxInputValue,
          multiplier: multiplierCount,
          assetId: asset?.assetID,
          selectedPaymentMethod: paymentMethod,
          bankDetails: paymentMethods?.netBanking?.details,
          availablePaymentMethods,
        })
      );
    }

    //Header calculation API for non FD assets
    if (!isHighYieldFd(asset)) {
      const calculationData = await handleAssetCalculation(asset?.assetID);
      const { assetCalcDetails } = calculationData;
      dispatch(setSingleLotCalculation(assetCalcDetails));
      const minInvestmentAmount = getTotalAmountPaybale(
        assetCalcDetails?.investmentAmount,
        assetCalcDetails?.stampDuty,
        assetCalcDetails?.minLots
      );

      fields.min_investment = minInvestmentAmount;
      fields.tenure = getMaturityMonths(getMaturityDate(asset));
    }

    dispatch(setViewAssetDetailEventFields(fields));
    dispatch(setSubmitLoading(false));
    try {
      await trackEvent('View Asset Details', { ...fields });
    } catch (e) {
      console.log(e, 'error');
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    const { view } = router.query;
    const showMobileMonthlyPlan =
      view === 'calculator' && isTabDevice && showDefaultAssetDetailPage;

    dispatch(setShowMobileMonthlyPlan(showMobileMonthlyPlan));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query, isTabDevice, showDefaultAssetDetailPage]);

  useEffect(() => {
    if (pricePerLot && minLotValue) {
      const units = minLotValue * 3;
      dispatch(setUnits(units));
    }
  }, [pricePerLot, minLotValue, dispatch]);

  useEffect(() => {
    dispatch(
      setDisableBondsInvestBtn(
        !props?.asset?.isRfq &&
          getDocumentStatus(props?.kycUserData?.kycDetails, 'depository') ===
            'Pending Verification'
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.asset?.isRfq, props?.kycUserData?.kycDetails]);

  const getData = async () => {
    const data = await getServerData();
    dispatch(setLocalProps({ loading: false, ...data?.props }));
  };

  useEffect(() => {
    getData();
    return () => {
      dispatch(resetMonthlyCard());
      dispatch(setShowMobileMonthlyPlan(false));
      dispatch(setUnits(-1));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nonLoggedInSuccessCb = async () => {
    setLoading(false);
  };

  const nonLoggedInFailedCb = () => {
    const location = window.location;
    Cookie.set(
      'redirectTo',
      `${location.pathname}${location.hash ? location.hash : ''}` +
        location.search
    );

    setTimeout(() => {
      if (isGCOrder()) {
        newRelicErrLogs('Login_error_Redirect_from_asset_detail', 'info', {
          userID: user?.userID,
        });
      }
      router.push('/login');
    }, 1000);
  };

  useEffect(() => {
    startTime = performance.now();
    return () => {
      startTime = 0;
      endTime = 0;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedInUser) {
      setLoading(true);
      const assetId = Number(value[value.length - 1]);
      if (assetId) {
        props.fetchAndSetPastAsset(
          assetId,
          nonLoggedInSuccessCb,
          nonLoggedInFailedCb
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: Can be fetched when clicked on button to reduce initial load time
  useEffect(() => {
    const fetchData = async () => {
      try {
        const isActive = assetStatus(props.asset) === 'active';
        if (isActive && !loading) {
          if (props?.asset?.isRfq) {
            const res = await fetchUserDebarmentDetails();
            dispatch(setUserDebartmentData({ debarmentData: res }));
          }
        }
      } catch (err) {
        console.log('Error fetching data:', err);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Fetch User KYC Details Info
  useEffect(() => {
    if (isLoggedInUser) {
      // Parameter value added to prevent user fetch API multiple calls
      // https://gripinvest.atlassian.net/browse/PT-10661
      props.getPanAadhaarDetails({}, false, false);
      dispatch(setCkycData());
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isDiwaliModalClose');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endLoadTime = () => {
    endTime = performance.now();
  };
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current && startTime && endTime && user?.userID) {
      const { asset, kycUserData } = props;
      const {
        productCategory,
        productSubcategory,
        isRfq,
        financeProductType = 'Unknown',
        assetID,
        name,
      } = asset || {};
      const { kycConfigStatus, kycDetails, userData } = kycUserData || {};

      const loadTime = ((endTime - startTime) / 1000).toFixed(4);
      const kycStatus =
        getOverallDefaultKycStatus(kycConfigStatus) === 'verified';
      const isDisabled =
        !isRfq &&
        getDocumentStatus(kycDetails, 'depository') === 'Pending Verification';
      const isAmo = isMarketClosed && isRfq ? 'true' : 'false';
      const ctaText = !kycStatus ? 'Complete KYC' : 'Invest Now';

      setCtaText(ctaText);

      const { default: defaultKycStatus = {} } = kycConfigStatus || {};
      const { isFilteredKYCComplete = false } = defaultKycStatus;
      const loadEventAsync = async () => {
        const userUccStatus = uccStatus?.status || '';
        const eventPayload = {
          user_id: userData?.userID,
          load_time: loadTime,
          asset_id: assetID,
          asset_name: name,
          cta_text: ctaText,
          product_category: productCategory,
          product_sub_category: productSubcategory,
          kyc_status: kycStatus,
          rfq_enabled: isRfq || false,
          fd_kyc_status: isFilteredKYCComplete,
          obpp_kyc_status: isFilteredKYCComplete,
          is_disabled: isDisabled,
          ucc_status: userUccStatus || false,
          financial_product_type: financeProductType,
          amo: isAmo,
        };
        trackEvent('invest_now_button_loaded', eventPayload);
        hasTracked.current = true;
      };
      loadEventAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, kycStatusConfig, props, isMarketClosed, ctaText]);

  const { isTimeLessThanTwoHoursRBI } = useAppSelector((state) => state.access);

  const showPrivateLink = (asset: any) => {
    if (asset?.isVisible === false) {
      setOpenPrivateLinkPopup(true);
    } else if (isAssetUnlistedPTC(asset) && isTimeLessThanTwoHoursRBI) {
      setShowRBIModal(true);
    }
  };

  useEffect(() => {
    if (isLoggedInUser) {
      setLoading(true);
      dispatch(setSubmitLoading(true));
      if (value[value.length - 1]) {
        props.fetchAndSetAsset(value[value.length - 1], async (asset: any) => {
          endLoadTime();
          // If asset name and id doesn't match with url
          const urlAssetName = value[value.length - 2];
          if (isInValidAssetUrl(asset, urlAssetName)) {
            setOpenPrivateLinkPopup(true);
          }

          showPrivateLink(asset);

          const { isPreTax } = router.query;
          let postTaxToggle = true;
          if (isPreTax && isPreTax === 'true') {
            postTaxToggle = false;
          } else if (isPreTax && isPreTax === 'false') {
            postTaxToggle = true;
          }
          if (isPreTax) {
            props.setToggle(postTaxToggle);
          }
          await fetchSingleLotData(asset);
          setLoading(false);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleBackEvent = () => {
    if (localStorage?.getItem('isFromAssetDetail') === 'true') {
      router.back();
    } else if (localStorage?.getItem('isFromDiscover') === 'true') {
      router.push('/discover');
    } else {
      localStorage.setItem('isFromAssetDetail', 'true');
      router.push('/assets');
    }
  };

  const seoData = localProps?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];

  useEffect(() => {
    if (
      !props?.asset?.assetID ||
      !props?.access?.userID ||
      !localProps?.assetDetailConfig
    )
      return;
    if (
      (isAssetBonds(props?.asset) ||
        isSDISecondary(props?.asset) ||
        isAssetBasket(props?.asset)) &&
      isMobileDevice &&
      assetStatus(props?.asset) === 'active'
    ) {
      let showExperimentPage =
        localProps?.assetDetailConfig?.enable &&
        experimentUserCategoryCheck(
          localProps?.assetDetailConfig?.userType,
          props?.access?.userID
        );
      dispatch(setShowDefaultAssetDetailPage(!showExperimentPage));
    } else {
      dispatch(setShowDefaultAssetDetailPage(true));
    }
  }, [
    localProps?.assetDetailConfig,
    props?.asset,
    props?.access?.userID,
    isMobileDevice,
  ]);

  const renderSkeleton = () => {
    const skeleton = () => {
      if (isMobileDevice) {
        return (
          <>
            <div
              className="items-align-center-row-wise"
              style={{
                position: 'fixed',
                width: '100%',
                padding: '4px 0 4px 15px',
                zIndex: 49,
                backgroundColor: 'var(--gripWhite, #fff)',
                left: 0,
                top: 0,
                height: 56,
              }}
            >
              <BackBtn handleBackEvent={handleBackEvent} shouldHandleAppBack />
            </div>
            <AssetDetailMobileSkeleton isDefault={showDefaultAssetDetailPage} />
          </>
        );
      }
      return (
        <div className={styles.AssetDetailsnner}>
          <div className={styles.AssetDetaiLeft}>
            <div className={`items-align-center-row-wise ${styles.mt_15}`}>
              <BackBtn handleBackEvent={handleBackEvent} shouldHandleAppBack />
              <Skeleton
                animation="wave"
                variant="rounded"
                height={47}
                width={148}
              />
            </div>
            <AssetDetailSkeleton />
          </div>
          <div
            className={`${styles.DesktopSkeleton} ${styles.AssetDetaiRight}`}
          >
            <AssetCalculatorSkeleton />
          </div>
        </div>
      );
    };
    return (
      <div className={`${styles.AssetDetailsMain} ${styles.SkeletonWrapper}`}>
        <div className="containerNew">{skeleton()}</div>
      </div>
    );
  };

  const backgroundImageUrl =
    props?.asset?.bgimageWebsite ||
    `${GRIP_INVEST_BUCKET_URL}dealsV2/PlaceholderBanner.png`;

  if (loading) {
    return renderSkeleton();
  }

  return (
    <>
      <div id={'assetdetailTop'} className={styles.AssetDetailsMain}>
        <Head>
          <link rel="preload" href={backgroundImageUrl} as="image" />
        </Head>
        <Seo
          seo={seoData}
          isPublicPage={assetStatus(props?.asset) !== 'active'}
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(getAssetDetailSchema(props?.asset)),
            }}
          />
        </Seo>
        <GripLayout asset={props?.asset} isLoggedInUser={isLoggedInUser} />
      </div>

      <PrivateLinkPopup
        onClose={() => {
          router.push('/assets');
          setOpenPrivateLinkPopup(false);
        }}
        open={openPrivateLinkPopup}
      />
      <RbiPopup
        showModal={showRBIModal}
        onClose={() => setShowRBIModal(false)}
      />
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  kycUserData: state.user,
  assetLoading: state.assets.assetLoading,
  toggle: state.assets.toggle,
  asset: state.assets.selectedAsset,
  loading: state.assets.loading.active,
  redirect: state.redirect,
  access: state.access,
  showDefaultAssetDetailPage: state.assets.showDefaultAssetDetailPage,
});

const mapDispatchToProps = {
  fetchAndSetAsset,
  setToggle,
  getPanAadhaarDetails,
  fetchAndSetPastAsset,
};

export async function getServerData() {
  try {
    const pageData = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/assetdetail',
        },
        populate: '*',
      },
      {},
      false
    );
    const response = await fetchAPI(
      '/inner-pages-data',
      {
        filters: { url: '/experiment-users' },
        populate: '*',
      },
      {},
      false
    );
    const aiAssistUserIds =
      response?.data?.[0]?.attributes?.pageData[0]?.objectData
        ?.aiAssistUserIds || [];
    const assetDetailConfig =
      response?.data?.[0]?.attributes?.pageData[0]?.objectData?.[
        'assetDetail2.0'
      ] || [];

    return {
      props: {
        pageData: pageData?.data?.[0]?.attributes?.pageData,
        aiAssistUserIds,
        assetDetailConfig,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AssetDetails);
