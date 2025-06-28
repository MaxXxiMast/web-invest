// NODE MODULES
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Cookie from 'js-cookie';
import CircularProgress from '@mui/material/CircularProgress';

// CONTEXT
import { useKycContext } from '../../../contexts/kycContext';

// API
import { handleKycStatus } from '../../../api/rfqKyc';
import { fetchCommentsCount } from '../../../api/user';

// HOOKS
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Redux Slices
import { setKYCProcessing, setOpenCommentBox } from '../../../redux/slices/rfq';
import { RootState } from '../../../redux';

// UTILS
import { kycStepsArr } from '../../../utils/kyc';
import {
  KycStatusResponseModel,
  KycStepModel,
  KycStepType,
} from '../utils/models';
import { financialKycSteps } from '../utils/financialUtils';
import { identityKycSteps } from '../utils/identityUtils';
import { isCompletedStep } from '../utils/helper';
import { kycStepCountMapping } from '../../../utils/kycEntryPoint';
import {
  handleRedirection,
  sortingEntryBannerArr,
} from '../../CommentBox/utils';
import { trackEvent } from '../../../utils/gtm';

// CUSTOM COMPONENTS
import LayoutHeader from '../header';
import LayoutSidebar from '../sidebar';
import LayoutBody from './layoutBody';
import KYCComplete from '../common/KYCComplete';

// STYLESHEETS
import classes from './Layout.module.css';

// Dynamic Components
const GenericModal = dynamic(() => import('../common/GenericModal'), {
  ssr: false,
});

const KycDocumentModal = dynamic(() => import('../common/document-modal'), {
  ssr: false,
});

const Layout = () => {
  let interVal: any;
  const isMobile = useMediaQuery('(max-width: 992px)');
  const router = useRouter();
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [activeStepLoader, setActiveStepLoader] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { gcCallbackUrl } = useSelector(
    (state: RootState) => state?.gcConfig?.gcData
  );

  const dispatch = useDispatch();
  const {
    completedKycSteps,
    updateCompletedKycSteps,
    handleKycActiveStep,
    updateKycContextValue,
  } = useKycContext();

  const { created_at, investmentData } = useSelector(
    (state) => (state as any)?.user?.userData ?? {}
  );

  // For Digilocker Error consent should go away when refresh
  const { isError = false, data: kycProcessingData = {} } = useSelector(
    (state) => (state as any)?.rfq?.kycProcessing ?? {}
  );

  // This will set kyc steps when ever user refresh the screen
  const fetchKycStatus = async () => {
    const statusResponse = await handleKycStatus();
    let kycContextStatus = {};
    const kycStatusArr: KycStatusResponseModel[] = statusResponse?.kycTypes;
    if (kycStatusArr?.length > 0) {
      const completedSteps: KycStepModel[] = kycStatusArr.map((ele) => {
        let stepStatus = 0;

        // Update Context values for the data
        kycContextStatus = {
          ...kycContextStatus,
          [ele?.name]: {
            ...ele?.fields,
            ...(ele?.optionalFields ?? {}),
          },
        };

        // PAN, BANK, DEMAT
        const dateCheckes = ['pan', 'bank', 'depository'].includes(ele.name);

        if (ele.isKYCComplete) {
          stepStatus = 1;
        } else {
          // Bypass Address using status as isKYCPendingVerification is getting false
          // due to database doesn't have aadhaar in case of KRA fetching details or digilocker consent not provided
          // Change due to following ticket: https://gripinvest.atlassian.net/browse/PT-16190
          if (ele?.name === 'address' && ele?.fields?.status === 2) {
            stepStatus = 2;
          } else {
            stepStatus = ele?.isKYCPendingVerification ? 2 : 0;
          }
        }

        /**
         * Check 1: Check for only pan, demat, and depository,
         * Check 2: When field is null
         * Check 3: if user has verified data status 1 for document ( because of new user)
         */
        let isExistingDataUser = false;

        if (
          dateCheckes &&
          ele?.fields?.status === 1 &&
          (!ele?.fields?.flag || investmentData?.isInvested)
        ) {
          isExistingDataUser = true;
        }

        // Total investment amount added to check if user is existing user
        return {
          status: stepStatus,
          name: ele?.name as KycStepType,
          isExistingData: isExistingDataUser,
        };
      }) as KycStepModel[];

      updateCompletedKycSteps([...completedSteps]);

      updateKycContextValue(kycContextStatus);
      setActiveStepLoader(false);

      const stepArr: string[] = completedSteps
        .filter((ele) => ele.status)
        .map((ele) => ele.name);

      const docModal = Cookie.get('docModal');
      if (stepArr.length === 0 && docModal !== 'hide') {
        setShowDocModal(true);
      }
    }
  };

  useEffect(() => {
    if (created_at) {
      fetchKycStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [created_at, investmentData]);

  useEffect(() => {
    clearTimeout(interVal);
    setShowLoader(true);

    const stepArr = completedKycSteps
      .filter((ele) => {
        //Allow only bank, depository, address, liveness to go next step without verification
        if (['bank', 'depository', 'address', 'liveness'].includes(ele?.name)) {
          return [1, 2].includes(Number(ele.status));
        }
        return ele.status === 1;
      })
      .map((ele) => ele.name);

    let activeStep = 3;
    if (!identityKycSteps.every((ele) => stepArr.includes(ele))) {
      activeStep = 0;
    } else if (!financialKycSteps.every((ele) => stepArr.includes(ele))) {
      activeStep = 1;
    } else if (!stepArr.includes('other')) {
      activeStep = 2;
    }

    if (completedKycSteps.length && completedKycSteps.every(isCompletedStep)) {
      handleKycActiveStep(3);
      setShowSuccessModal(true);
    } else {
      handleKycActiveStep(activeStep);
    }

    if (created_at && !activeStepLoader) {
      interVal = setTimeout(() => {
        setShowLoader(false);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedKycSteps]);

  useEffect(() => {
    updateKycContextValue({
      isMobile: isMobile,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    // On route change update kyc processing
    const onRouteChanged = () => {
      if (isError && kycProcessingData?.type === 'DIGILOCKER_CONSENT_ERROR') {
        dispatch(
          setKYCProcessing({
            isError: false,
            data: {},
          })
        );
      }
    };

    router.events.on('routeChangeComplete', onRouteChanged);
    window.addEventListener('load', onRouteChanged);
    return () => {
      router.events.off('routeChangeComplete', onRouteChanged);
      window.removeEventListener('load', onRouteChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // I'll back late button click event
  const handleModalClick = () => {
    setShowQuitModal(false);
    if (handleRedirection(gcCallbackUrl).includes('user-kyc')) {
      return router.push('/discover');
    }
    router.push(handleRedirection(gcCallbackUrl));
  };

  // Fetch comment count for the current step
  // If the API fails, it returns an empty object.
  async function fetchCommentCountSafely() {
    try {
      const countData = await fetchCommentsCount();
      return countData;
    } catch (error) {
      return {};
    }
  }

  // Returns the name of the first uncompleted step that is not 'pan'.
  // If no such step exists, it returns null.
  function getUncompletedStepName() {
    const sortArr = sortingEntryBannerArr(completedKycSteps);
    const step = sortArr.find((ele) => !ele.status && ele.name !== 'pan');
    return step?.name || null;
  }

  // Main function
  const isShowCommentBox = async () => {
    const stepName = getUncompletedStepName();

    const panStatus = completedKycSteps.find(
      (ele) => ele?.name === 'pan'
    )?.status;
    if (stepName && panStatus) {
      const countData = await fetchCommentCountSafely();
      const stepCount =
        Number(countData?.[kycStepCountMapping?.[stepName]]) ?? 0;
      return stepCount < 3;
    }

    return false;
  };

  const handleCloseButtonClick = async () => {
    const { query } = router.query;
    const redirectFetchViaGmail = query === 'fetchViaGmailClicked';
    if (redirectFetchViaGmail) {
      router.replace('/demat-processing');
      return;
    }
    const isShow = await isShowCommentBox();
    if (isShow) {
      dispatch(setOpenCommentBox(true));
    } else {
      setShowQuitModal(true);
    }
  };

  const renderLayoutBody = () => {
    if (showLoader) {
      return (
        <div
          className={`flex-column ${classes.Loader} ${
            showLoader ? '' : classes.FadeIn
          }`}
        >
          <CircularProgress size={30} />
        </div>
      );
    }

    return (
      <LayoutBody
        className={`${classes.LayoutBody} ${!showLoader ? classes.FadeIn : ''}`}
      />
    );
  };

  const renderKYCComponent = () => {
    return (
      <>
        <LayoutHeader handleCloseClick={handleCloseButtonClick} />
        <div className={`flex ${classes.Main}`}>
          <LayoutSidebar stepsArr={kycStepsArr} />
          {renderLayoutBody()}
        </div>
      </>
    );
  };

  const handleRenderKYC = () => {
    if (showSuccessModal) {
      return <KYCComplete />;
    }

    return renderKYCComponent();
  };

  return (
    <>
      <div className={classes.Layout}>
        <div className="containerNew">
          <div className={`flex-column ${classes.Wrapper}`}>
            {handleRenderKYC()}
          </div>
        </div>
      </div>
      <GenericModal
        showModal={showQuitModal}
        handleBtnClick={handleModalClick}
        lottieType="warning"
        title="Are you sure?"
        subtitle="No worries! Your progress so far would be saved. You can start right where you left off."
        btnText="I’ll come back later"
        btnVariant="Secondary"
        hideClose={false}
        handleModalClose={() => setShowQuitModal(false)}
      />
      <KycDocumentModal
        isShowModal={showDocModal}
        handleModalClose={() => {
          Cookie.set('docModal', 'hide');
          trackEvent('kyc_initiated');
          setShowDocModal(false);
        }}
      />
    </>
  );
};

export default Layout;
