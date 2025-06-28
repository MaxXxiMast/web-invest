// Node Modules
import { useEffect, useRef, useState } from 'react';
import CryptoJS from 'crypto-js';
import { useGoogleLogin } from '../../../../utils/googleOauth';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { CircularProgress } from '@mui/material';

// Common Components
import InputFieldSet from '../../../common/inputFieldSet';
import StepTitle from '../../common/StepTitle';
import ErrorCard from '../../common/ErrorCard';
import DematIDExplanation from '../../common/DematIDExplanation';
import DematModal from '../../common/DematModal';
import AnimatedArrow from '../../../primitives/AnimatedArrow';
import Image from '../../../primitives/Image';
import LayoutFooter from '../../footer';
import AOFEsign from '../../nominee/AOFEsign';
import ErrorPopup from '../../common/ErrorPopup';
import KYCComplete from '../../common/KYCComplete';

// Custom Hooks
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../../../redux/slices/hooks';

// Contexts
import { useKycContext } from '../../../../contexts/kycContext';

// Utils
import {
  GRIP_INVEST_BUCKET_URL,
  isContainSpecialCharacters,
  isOnlyNumbersRegex,
} from '../../../../utils/string';
import {
  dematUnderVerificationMessage,
  getDPIDDetails,
  populateDematCards,
} from '../../utils/financialUtils';
import {
  DematAddDataModal,
  DematProcessResponseModel,
  ErrorCardType,
  ErrorModel,
} from '../../utils/models';
import {
  checkActiveStep,
  checkSkipActiveStep,
  isCompletedStep,
  popupBlockedError,
  trackKYCCheckpointEvt,
  trackKYCErrorEvt,
  trackKYCSuccessEvt,
} from '../../utils/helper';
import { modalsData } from '../../identity/pan/utils';
import { dematFormErrors } from '../demat/utils';
import {
  AOF_GENERATING_MODAL_TIMER,
  isSkipManualVerification,
  NomineeStatus,
} from '../../utils/NomineeUtils';
import { delay } from '../../../../utils/timer';
import {
  trackEvent,
  trackEventPostMessageToNativeOrFallback,
} from '../../../../utils/gtm';
import { isGCOrder } from '../../../../utils/gripConnect';
import { GripLogo } from '../../../../utils/constants';
import { handleGcRedirect, InvestmentDescription, isGmail } from './utils';
import { DematCard, initDematcardData } from '../../common/DematModal/utils';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../../../utils/appHelpers';
import { getOS } from '../../../../utils/userAgent';
import { handleRedirection } from '../../../CommentBox/utils';

//Primitives
import TooltipCompoent from '../../../primitives/TooltipCompoent/TooltipCompoent';
import { gmailStepsArr } from '../../../primitives/ParsingDocumentPopup/utils';
import Button, { ButtonType } from '../../../primitives/Button';

// APIs
import {
  aofVerify,
  eSignAOF,
  getECASFromGmail,
  getRetryCounts,
  handleKycStatus,
  handleVerifyDemat,
} from '../../../../api/rfqKyc';
import { callErrorToast, fetchAPI } from '../../../../api/strapi';

// Styles
import styles from './DematAdd.module.css';
import NeedHelpModal from '../../common/NeedHelpModal';

// Dynamic Imports
const GenericModal = dynamic(() => import('../../common/GenericModal'), {
  ssr: false,
});

// AOF Generating Loader
const AOFLoader = dynamic(() => import('../../nominee/AOFLoader'), {
  ssr: false,
});

// Multiple Demat Modal
const MultipleDematModal = dynamic(() => import('../MultipleDemat'), {
  ssr: false,
});

//Parsing Popup
const ParsingDocumentPopup = dynamic(
  () => import('../../../primitives/ParsingDocumentPopup'),
  {
    ssr: false,
  }
);

type Expirement = {
  showDematInGC: string;
  showDematInWeb: string;
  showDematInAndroid: string;
  showDematInIos: string;
};

const getDematNumber = (dpID = '', clientID = '') => {
  if (dpID && clientID) return `${dpID}${clientID}`;
  return '';
};

const DematAdd = () => {
  const router = useRouter();
  const isMobile = useMediaQuery();

  const { updateCompletedKycSteps, completedKycSteps, kycValues } =
    useKycContext();
  const dematData: any = kycValues?.depository ?? {};

  const [formData, setFormData] = useState<Partial<DematAddDataModal>>({
    dematID: getDematNumber(dematData?.dpID, dematData?.clientID),
  });
  const [formErrors, setFormErrors] = useState<Partial<DematAddDataModal>>({});

  const [dematCardError, setDematCardError] = useState<Partial<ErrorModel>>();
  const [selectedModalData, setSelectedModalData] = useState<DematCard | null>(
    null
  );
  const [cardsDataMap, setCardsDataMap] = useState<DematCard[]>([]);

  const [showLoading, setShowLoading] = useState(false);
  const [isFooterDisabled, setIsFooterDisabled] = useState(false);
  const [isFooterLoading, setIsFooterLoading] = useState(false);

  // Multiple Demat Modal
  const [showMultipleDemat, setShowMultipleDemat] = useState(false);

  const [showFetchModal, setShowFetchModal] = useState(false);
  const [isApiResponse, setIsApiResponse] = useState(false);

  // AOF Related States and Variabels
  const [isEsignPending, setEsignPending] = useState(
    checkSkipActiveStep(completedKycSteps, 'depository') &&
      !checkActiveStep(completedKycSteps, 'aof')
  );
  const [signLoading, setSignLoading] = useState(false);
  const [showAOFLoader, setShowAOFLoader] = useState(false);
  const [status, setStatus] = useState(NomineeStatus.progress);
  const [showPopupError, setShowPopupError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dematOcrResponse, setDematOcrResponse] = useState<any>();
  const [dematVerified, setDematVerified] = useState(false);
  const [showEcasUploadBtn, setShowEcasUploadBtn] = useState(true);
  const [showGmailScreen, setShowGmailScreen] = useState(true);
  const [disableGmailScreen, setDisableGmailScreen] = useState(false);
  const [isDematScreenDecided, setIsDematScreenDecided] = useState(false);
  const [authorizationFailedCounter, setAuthorizationFailedCounter] =
    useState(0);
  const [experimentData, setExperimentData] = useState<Expirement>();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const hasTrackedCheckpointRef = useRef(false);
  const hasTrackedHelpSectionRef = useRef(false);

  const isEsignShow =
    completedKycSteps.length && completedKycSteps.every(isCompletedStep);

  const firstName =
    useAppSelector((state) => state?.user?.userData.firstName) || '';
  const lastName =
    useAppSelector((state) => state?.user?.userData?.lastName) || '';
  const emailID =
    useAppSelector((state) => state?.user?.userData?.emailID) || '';
  const gcCallbackUrl =
    useAppSelector((state) => state?.gcConfig?.gcData?.gcCallbackUrl) || '';

  const isInReactNative = isRenderedInWebview();
  const isGC = isGCOrder();
  const gciConfigID = useAppSelector(
    (state) => state.gcConfig.gcData?.gciConfigID
  );

  const mobileFlag =
    (experimentData?.showDematInAndroid && getOS() === 'Android') ||
    (experimentData?.showDematInIos && getOS() === 'iOS');

  const isGmailScreenAllowed = isGC
    ? experimentData?.showDematInGC || gciConfigID == 9
    : (isInReactNative && mobileFlag) ||
      (!isInReactNative && experimentData?.showDematInWeb);

  const { query } = router.query;
  const redirectFetchViaGmail = query === 'fetchViaGmailClicked';

  const [errType, setErrorType] =
    useState<Partial<ErrorCardType>>('underVerification');

  const dematDetails = completedKycSteps.find(
    (step) => step.name === 'depository'
  );

  const bankDetails = completedKycSteps.find((step) => step.name === 'bank');
  const isBankUnderVF = bankDetails?.status === 2;
  const [help_section_shown, setHelp_Section_Shown] = useState(0);

  const dematCards = async () => {
    try {
      const pageData = await fetchAPI(
        '/inner-pages-data',
        {
          filters: {
            url: '/demat-cards',
          },
          populate: {
            pageData: {
              populate: populateDematCards,
            },
          },
        },
        {},
        false
      );

      const experimentData = pageData?.data?.[0]?.attributes?.pageData?.find(
        (obj) => obj.keyValue === 'dematGmailScreenExperiment'
      )?.objectData;

      setExperimentData(experimentData);

      const cardsData: DematCard[] =
        pageData?.data?.[0]?.attributes?.pageData?.[0]?.DematCards ?? [];
      const dematCardsData: DematCard[] = cardsData?.map((card) => ({
        title: card.title,
        icon: card?.icon,
        widthIcon: card?.widthIcon,
        showOnMobile: card.showOnMobile,
        showOnDesktop: card.showOnDesktop,
        isDesktopAccordian: card.isDesktopAccordian,
        modalType: card.modalType,
        modalTitle: card.modalTitle,
        subHeader: card.subHeader,
        subHeaderImg: card?.subHeaderImg,
        modalContent: card?.modalContent ?? [],
        cardID: card?.cardID,
      }));

      setCardsDataMap([...initDematcardData, ...dematCardsData]);
    } catch (err) {
      console.log(err);
      trackKYCErrorEvt({
        module: 'depository',
        error_type: 'api_error',
        error_heading: err.type ? err.type : err,
        error_payload: err,
        error_message: err?.message ?? err,
      });
    }
  };

  const decryptData = (
    encryptedData: string,
    secretKey: string
  ): object | null => {
    try {
      const bytes = CryptoJS?.AES?.decrypt(encryptedData, secretKey);
      const decryptedString = bytes?.toString(CryptoJS.enc.Utf8);

      postMessageToNativeOrFallback('', {
        decryptedString: decryptedString,
      });

      return JSON.parse(decryptedString); // Convert string back to object
    } catch (error) {
      console.error('Error during decryption:', error);
      postMessageToNativeOrFallback('', {
        error: `error while token decryption ${error}`,
      });
      return null;
    }
  };

  const handleMessage = async () => {
    await delay(1000);
    const localItem = localStorage.getItem('DematGoogleAuth');
    postMessageToNativeOrFallback('', {
      localItem,
    });
    const decryptedKey = decryptData(localItem, 'Grip-Invest@2024');
    postMessageToNativeOrFallback('', {
      decryptedKey,
    });

    if (decryptedKey) {
      const { serviceCode, environment, platform } = decryptedKey as any;
      fetchDematFromGmail(serviceCode, environment, platform);
      postMessageToNativeOrFallback('', {
        'from the postmessage demat DematGoogleAuth ': '',
        serviceCode,
        environment,
        platform,
        decryptedaccessToken: (decryptedKey as any)?.accessToken,
      });
    } else {
      GoogleOnError('Error in fetching token');
      postMessageToNativeOrFallback('', {
        error: 'error while calling DematGoogleAuth event',
      });
    }
  };

  useEffect(() => {
    window.addEventListener('DematGoogleAuth', handleMessage);
    return () => {
      window.removeEventListener('DematGoogleAuth', handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

useEffect(() => {
  const currentStep = isEsignPending || isEsignShow ? 'aof' : 'depository';

  if (!hasTrackedCheckpointRef.current) { // Track checkpoint only once
    hasTrackedCheckpointRef.current = true;
    trackKYCCheckpointEvt(currentStep);

    if (isRenderedInWebview()) {
      postMessageToNativeOrFallback('kycEvent', {
        kycStep: currentStep,
      });
    }
  }

  // Set demat under verification error
  if (dematDetails?.status === 2) {
    setDematCardError({
    ...dematUnderVerificationMessage,
  });
    setErrorType('underVerification');
  }

  dematCards();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  useEffect(() => {
    const LAYOUT_SIDEBAR = document.getElementById('LAYOUT_SIDEBAR');
    if (LAYOUT_SIDEBAR) {
      if (isEsignPending || isEsignShow) {
        LAYOUT_SIDEBAR.classList.add('HIDE');
      } else {
        LAYOUT_SIDEBAR.classList.remove('HIDE');
      }
      return () => {
        LAYOUT_SIDEBAR.classList.remove('HIDE');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEsignPending]);

  useEffect(() => {
    handleScreen(query !== 'dematManual' && isGmail(emailID));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleEcasUploadBtnVisibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dematVerified, showMultipleDemat]);

  const handleEcasUploadBtnVisibility = async () => {
    try {
      const res = await getRetryCounts();
      const { kycDepositoryProcess, eCasEmailCount } = res || {};
      const allowToShowGmailScreen = eCasEmailCount < 3;
      // Show Gmail Screen if user has not tried fetching from Gmail 3 times
      if (!allowToShowGmailScreen) {
        setShowGmailScreen(false);
      } else if (showGmailScreen) {
        if (!redirectFetchViaGmail && query !== 'dematManual') {
          setShowGmailScreen(isGmail(emailID));
        }
      }
      await delay(500);
      setIsDematScreenDecided(true);
      setDisableGmailScreen(!allowToShowGmailScreen);
      setShowEcasUploadBtn(kycDepositoryProcess < 3);
      return res;
    } catch (err) {
      setShowEcasUploadBtn(false);
      await delay(500);
      setIsDematScreenDecided(true);
      console.error('>>>Err>>>', err);
      return {};
    }
  };

  const handleFooterClick = async () => {
    if (!isFooterDisabled) {
      setIsFooterLoading(true);
      if (!verifyFormData()) return;
      setShowLoading(true);
      handleVerifyDemat({ dematAccountNumber: formData.dematID })
        .then(async (response) => {
          trackKYCSuccessEvt('cmr', {
            dematID: formData.dematID,
            manual_verification: response?.status === 2,
          });
          await delay(1000);
          setShowLoading(false);
          let showPending = true;

          if (isBankUnderVF) {
            showPending = false;
          }

          setEsignPending(showPending);
          await openDigioSignature(response);
        })
        .catch(async (err) => {
          setIsFooterLoading(false);

          if (formData.dematID.toUpperCase().startsWith('IN')) {
            const statusResponse = await handleKycStatus();
            // CHECK IF DEMAT WENT UNDER VERIFICATION
            if (
              statusResponse?.kycTypes.filter(
                (t: any) => t.name === 'depository'
              )[0].fields.status === 2
            ) {
              // UNDER VERIFICATION

              updateCompletedKycSteps({ name: 'depository', status: 2 });
              trackKYCSuccessEvt('cmr', {
                dematID: formData.dematID,
                manual_verification: true,
              });
              return;
            } else {
              setDematCardError(dematFormErrors[err?.type]);
              setErrorType(dematFormErrors[err?.type]?.type);
            }
          }
          trackKYCErrorEvt({
            module: 'demat',
            error_type: 'api_error',
            error_heading: err.type ? err.type : err,
            error_payload: err,
            error_message: err?.message ?? err,
          });
          setShowLoading(false);
        });
    }
  };

  useEffect(() => {
    if (formData?.dematID) {
      verifyFormData();
    } else {
      setIsFooterDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  //@TODO handle direct fetch via gmail screen
  useEffect(() => {
    if (redirectFetchViaGmail) {
      setShowGmailScreen(true);
      setTimeout(() => googleLoginFn(), 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectFetchViaGmail]);

  const verifyFormData = () => {
    let errorMsg = '';
    let isError = false;
    const dematNo = formData?.dematID ?? '';

    if (dematNo.length) {
      // No special characters and spaces allowed in the value
      const hasSpecialChar = isContainSpecialCharacters.test(dematNo);

      // Only Number after first two characters
      const dematCheckForNumeric = dematNo?.slice(2);
      const isOnlyNumbers = isOnlyNumbersRegex.test(dematCheckForNumeric);

      if (hasSpecialChar) {
        errorMsg = dematFormErrors.specialChar;
        isError = true;
      } else if (dematCheckForNumeric && !isOnlyNumbers) {
        errorMsg = dematFormErrors.dematIDError;
      } else {
        isError = false;
        errorMsg = '';
      }
    }
    isError = Boolean(errorMsg);
    if (isError) {
      setIsFooterDisabled(true);
    } else {
      setIsFooterDisabled(dematNo.length !== 16);
    }

    setFormErrors({ dematID: errorMsg });
    return !isError;
  };

  const handleChangeEvent = (event: any) => {
    const dematNo = event?.target?.value?.replace(/ /g, '') ?? '';

    if (dematNo?.length <= 16) {
      setFormData({ ...formData, [event?.target?.id]: dematNo });
    }
  };

  const handleUploadCB = async (
    type: 'error' | 'success',
    data?: unknown,
    file: File = null,
    method?: string
  ) => {
    const startTime = performance.now();
    const responseData = data as DematProcessResponseModel;
    const retryRes = await handleEcasUploadBtnVisibility();
    if (method === 'demat_statement') {
      trackEvent('Demat_Statement_Uploaded', {
        attempt_number: retryRes?.kycDepositoryProcess,
        is_max_attempt_reached: retryRes?.kycDepositoryProcess >= 3,
      });
    }
    if (type === 'success') {
      //Manual Verification
      if (responseData?.status === 2) {
        // what if there is only one demat account
        if (!redirectFetchViaGmail) {
          updateCompletedKycSteps({ name: 'depository', status: 2 });
        } else {
          localStorage.setItem('dematStatus', 'success');
          router.replace('/demat-processing');
        }
      } else if (Number(responseData.retryCount) > 3) {
        // GO to landing page
        callErrorToast(
          "You've used all your tries. Please type your DP ID and Client ID manually."
        );
      } else if (responseData?.ocrResponse?.length === 1) {
        if (responseData?.ocrResponse?.[0]) {
          try {
            const { dpID, clientID, brokerName, dematName, dpName } =
              responseData?.ocrResponse?.[0];
            const dematAccountNumber = getDematNumber(dpID, clientID);
            const uploadDAta = {
              dematAccountNumber,
              brokerName,
              dematName,
              dpName,
              isECas: true,
            };
            await handleVerifyDemat(uploadDAta);
            setDematVerified(true);
            await delay(2000);
            setDematVerified(false);
            const endTime = performance.now();
            const timeTaken = endTime - startTime;
            trackEvent('Demat_parsed', {
              demat_accounts: [responseData?.ocrResponse[0]?.dpID],
              no_of_demat_parsed: 1,
              timeTaken,
            });
            trackEvent('kyc_cmr_added', {
              module: 'depository',
              dematID: dpID,
              manual_verification: responseData?.status === 2,
              broker_name: brokerName,
              dp_name: dematName,
              method,
            });
            if (!redirectFetchViaGmail) {
              updateCompletedKycSteps({ name: 'depository', status: 2 });
            } else {
              localStorage.setItem('dematStatus', 'success');
              router.replace('/demat-processing');
            }
          } catch (e) {
            console.error('Demat add api failed', e);
            setDematCardError(dematFormErrors[e?.type]);
            setErrorType(dematFormErrors[e?.type]?.type);
          }
        }
      } else {
        const dpName = responseData?.ocrResponse?.map((item) => item.dpName);
        setDematOcrResponse(responseData?.ocrResponse);
        setShowMultipleDemat(true);
        trackEvent('Demat_parsed', {
          demat_accounts: dpName,
          no_of_demat_parsed: responseData?.ocrResponse?.length,
        });
      }
    } else {
      setDematCardError(data);
      setIsFooterDisabled(false);
      trackKYCErrorEvt({
        module: 'depository',
        error_type: responseData?.type ? responseData?.type : 'api_error',
        error_heading: responseData.heading ? responseData.heading : '',
        error_payload: responseData,
        error_message: responseData?.message ?? '',
      });
    }
  };

  const renderNSDLLoadingIcon = () => {
    return (
      <div className={styles.LoadingCntnr}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/nsdl.svg`}
          alt="NSDL Logo"
          width={91}
          height={53}
          layout="fixed"
        />
        <AnimatedArrow />
        <Image
          src={GripLogo}
          alt="Grip"
          width={83}
          height={30}
          layout="fixed"
        />
      </div>
    );
  };

  const renderStepTitle = () => {
    return (
      <div className={styles.StepTitleHeader}>
        <StepTitle text="Add Your Existing Demat Account" />
      </div>
    );
  };

  const renderDematIDExplanation = () => {
    // show Desktop Accordian
    return (
      <div className={`${styles.AccordionWrapper} flex-column`}>
        {cardsDataMap
          ?.filter(
            (card) =>
              card?.cardID === 'DematMeans' || card?.cardID === 'NoDemat'
          )
          ?.map((card) => (
            <DematIDExplanation
              key={card?.title}
              modalData={card}
              isAccordian={true}
              feedback={submitFeedback}
              backButtonClick={() => {}}
            />
          ))}
      </div>
    );
  };

  const handleAuthorizationFailed = () => {
    callErrorToast('Please enter your Demat number manually or try again.');
    handleScreen(false);
  };

  const fetchDematFromGmail = async (
    code: string,
    environment = 'dev',
    platform = 'web'
  ) => {
    try {
      const payload = { code };
      if (platform !== 'web') {
        payload['environment'] = environment;
        payload['client'] = platform;
      }
      setShowFetchModal(true);
      postMessageToNativeOrFallback('', {
        auhCode: code,
      });
      const res = await getECASFromGmail(payload);

      postMessageToNativeOrFallback('', {
        ECASFromGmail: res,
        code: code,
      });

      setIsApiResponse(true);
      if (Array.isArray(res) && res?.length) {
        const updatedRes = { ocrResponse: res };
        handleUploadCB('success', updatedRes, null, 'auto_fetch');
      }
    } catch (error) {
      postMessageToNativeOrFallback('', {
        auhCode: code,
        errorInApi: error,
      });
      if (redirectFetchViaGmail) {
        localStorage.setItem('dematStatus', 'failure');
        router.replace('/demat-processing');
        return;
      }
      setShowFetchModal(false);
      if (error?.type === 'ECAS_AUTHORIZATION_FAILED') {
        if (authorizationFailedCounter >= 1) {
          handleAuthorizationFailed();
        } else {
          setAuthorizationFailedCounter((prev) => prev + 1);
          handleUploadCB('error', error);
        }
      } else {
        const { eCasEmailCount } =
          (await handleEcasUploadBtnVisibility()) ?? {};
        const errMsg =
          eCasEmailCount >= 3
            ? "We couldn't retrieve your demat number, and your attempts are exhausted. Please enter it manually."
            : "We couldn't retrieve your demat number. Please enter your demat number manually or try again.";
        callErrorToast(errMsg);
        trackEvent('kyc_error', {
          module: 'depository',
          error_heading: errMsg ?? '',
          error_type: error?.type ?? '',
          error_payload: error,
        });
        handleScreen(false);
        handleUploadCB('error', error);
      }
    }
  };

  const GoogleScope = 'https://www.googleapis.com/auth/gmail.readonly';

  const GoogleRedirectUri = `${window.location.origin}/user-kyc`;

  const GoogleOnSuccess = (tokenResponse) => {
    postMessageToNativeOrFallback('', {
      'google on suceess called for this': JSON.stringify(tokenResponse),
    });
    fetchDematFromGmail(tokenResponse?.code);
  };

  const GoogleOnError = (error) => {
    postMessageToNativeOrFallback('', {
      error,
    });
    if (redirectFetchViaGmail) {
      localStorage.setItem('dematStatus', 'failure');
      router.replace('/demat-processing');
      return;
    }
    if (authorizationFailedCounter >= 1) {
      handleAuthorizationFailed();
    } else {
      handleUploadCB('error', {
        type: 'ECAS_AUTHORIZATION_FAILED',
        heading: 'Authorization Failed!',
        message: `We're sorry, It looks like something went wrong. Please check your details and try again.`,
      });
      setAuthorizationFailedCounter((prev) => prev + 1);
    }
    console.log('>>>error', error);
  };

  const googleLoginFn = useGoogleLogin({
    scope: GoogleScope,
    flow: 'auth-code',
    redirect_uri: GoogleRedirectUri,
    onSuccess: GoogleOnSuccess,
    onError: GoogleOnError,
  });

  const handleAutoFetchBtn = async () => {
    trackEvent('fetch_via_email', {
      module: 'depository',
      emailID: emailID,
    });
    trackEvent('Demat_Page_Switch', {
      switched_to: 'auto fetch',
      switch_nature: 'automated',
    });
    if (!isGC) {
      postMessageToNativeOrFallback('fetch_gmail_auto_verification', {});
    }
    if (isGC && isRenderedInWebview() && !redirectFetchViaGmail) {
      try {
        const data = await handleGcRedirect();
        const redirectUrl = await data.text();
        localStorage.setItem('dematStatus', redirectUrl);
        router.replace('/demat-processing');
      } catch (error) {
        console.log(error);
      }
    } else {
      googleLoginFn();
    }
  };

  const handleScreen = (flag) => {
    setShowGmailScreen(flag);
    setFormErrors({});
    setDematCardError({});
    setFormData({});
  };

  const handleLocateDemat = () => {
    setSelectedModalData(
      cardsDataMap.find((card) => card?.cardID === 'DematWithBroker')
    );
  };
  const RenderGmailTextUI = () => {
    return (
      <div className={`flex ${styles.GmailCta}`}>
        <span>Auto-fetch via </span>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/GmailIcon.svg`}
          width={18}
          height={36}
          layout="fixed"
          alt="Forward"
        />
        <span> Gmail</span>
      </div>
    );
  };
  const RenderGmailUI = () => {
    return (
      <>
        <div className={`flex-column   ${styles.MainContainer} `}>
          {renderStepTitle()}
          <span className={styles.SubHeading}>{InvestmentDescription}</span>
          {isMobile ? (
            <>
              <Button width={'auto'} onClick={handleAutoFetchBtn}>
                {RenderGmailTextUI()}
              </Button>
              {!redirectFetchViaGmail ? (
                <Button
                  variant={ButtonType.BorderLess}
                  onClick={() => handleScreen(false)}
                  compact
                  width={'auto'}
                >
                  Enter Manually
                </Button>
              ) : null}
            </>
          ) : null}

          <div>
            {isMobile ? (
              <LayoutFooter
                showButtons={false}
                showMsg={false}
                renderOnlyButton={true}
                CustomComponent={RenderQuickHelp}
              />
            ) : (
              <LayoutFooter
                footerLinkJSX={RenderGmailTextUI()}
                subLink={!redirectFetchViaGmail ? 'Enter Manually' : ''}
                SubLinkClick={() => handleScreen(false)}
                showMsg={false}
                renderOnlyButton={true}
                handleBtnClick={handleAutoFetchBtn}
                CustomComponent={RenderQuickHelp}
              />
            )}
          </div>
        </div>
        {renderDematIDExplanation()}
      </>
    );
  };

  const submitFeedback = async () => {
    setSelectedModalData(null);
    trackEvent('need_grip_assistance', {
      type: 'No Demat',
      comment: 'Lead Gen - Do not have a demat account',
      module: 'depository',
      CTA: 'Need Grip Assistance',
    });
    setOpenSuccessModal(true);
  };

  const [needHelpPopup, setNeedHelpPopup] = useState(false);

  const handleCardClick = (card) => {
    setNeedHelpPopup(false);
    setSelectedModalData(card);
    if (card?.cardID === 'NoDemat') {
      trackEvent('dont_have_demat', {
        type: 'No Demat',
        comment: 'Lead Gen - Do not have a demat account',
        module: 'depository',
        CTA: 'Dont have grip account',
      });
    }
  };
  const RenderQuickHelp = () => {
    return (
      <div className={`flex-column ${styles.QuickHelpContainer}`}>
        <Button
          variant={ButtonType.BorderLess}
          width={'100%'}
          onClick={() => {
            trackEvent('Need_Help_button_clicked', {
              help_section_shown: help_section_shown + 1,
            });
            setHelp_Section_Shown((prev) => prev + 1);
            setNeedHelpPopup(true);
          }}
        >
          <div
            className={`flex_wrapper ${
              showGmailScreen ? styles.NeedHelpBtnGmail : styles.NeedHelpBtn
            }`}
          >
            <span>Need Help?</span>
          </div>
        </Button>
      </div>
    );
  };

  const renderComponents = () => {
    if (dematCardError && Object.keys(dematCardError).length) {
      return (
        <ErrorCard
          showBtn
          showBottomInfo={false}
          type={errType}
          data={{
            title: dematCardError.heading ?? `Try Again`,
            message:
              dematCardError.message ??
              `We're sorry, it looks like something went wrong. Please check your details and try again.`,
          }}
          buttonText="Try again"
          buttonVariant={errType === 'error' ? 'Secondary' : 'Primary'}
          onClickButton={() => {
            handleScreen(showGmailScreen ? isGmail(emailID) : false);
          }}
          icon={errType !== 'error' ? 'icons/DangerTriangle.svg' : null}
          trackPayloadDetails={{
            module: 'demat',
            error_type: dematCardError?.type,
            error_payload: dematCardError,
          }}
        />
      );
    }

    if (showGmailScreen && isGmailScreenAllowed) {
      return <RenderGmailUI />;
    }

    return (
      <>
        <div className={`flex-column  ${styles.MainContainer}`}>
          {renderStepTitle()}
          <span className={styles.SubHeading}>{InvestmentDescription}</span>
          <div>
            <InputFieldSet
              name="dematID"
              placeHolder={'Enter 16 Digit Demat no./BO ID'}
              label="Enter 16 Digit Demat no./BO ID"
              type="text"
              error={!!formErrors.dematID}
              errorMsg={formErrors.dematID}
              inputId={'dematID'}
              onChange={handleChangeEvent}
              value={formData?.dematID}
              className={styles.InputFieldSet}
            >
              {getDPIDDetails(formData?.dematID) ? (
                <div className={styles.DPIDImage}>
                  <Image
                    src={getDPIDDetails(formData?.dematID)}
                    width={28}
                    height={28}
                    layout="fixed"
                    alt="Demat/BO ID Image"
                  />
                </div>
              ) : null}
            </InputFieldSet>
          </div>

          {/*When the error message appears, the layout will remain unchanged */}
          {/* {formErrors.dematID ? null : <span className={styles.Gap} />} */}
          <div className={`flex ${styles.UploadBtnContainer}`}>
            {showEcasUploadBtn ? null : (
              <TooltipCompoent
                placementValue={isMobile ? 'top' : 'left'}
                toolTipText={
                  'Maximum attempts reached. Please enter your DP ID and Client ID Manually.'
                }
              >
                <span className={`icon-info ${styles.InfoIcon}`} />
              </TooltipCompoent>
            )}
            <button
              onClick={handleLocateDemat}
              className={`${styles.LocateDemat} ${isMobile ? 'mt-16' : ''}`}
            >
              Find your Demat number?
            </button>
          </div>
          <div className={isMobile ? '' : 'mt-16'}>
            <LayoutFooter
              footerLinkText={'Verify'}
              showMsg={false}
              subLink={isGmailScreenAllowed ? 'Fetch Demat via Gmail' : ''}
              SubLinkClick={() => handleScreen(true)}
              isSubLinkDisable={disableGmailScreen}
              renderOnlyButton={true}
              isFooterBtnDisabled={isFooterDisabled}
              isLoading={isFooterLoading}
              handleBtnClick={handleFooterClick}
              CustomComponent={RenderQuickHelp}
            />
          </div>
        </div>

        {renderDematIDExplanation()}
      </>
    );
  };

  // AOF Functions Start

  // AOF Generating modal to be removed
  const closeAOFLoader = async () => {
    setShowAOFLoader(false);
    await delay(AOF_GENERATING_MODAL_TIMER);
  };

  const handleAOFResponse = async (digio_doc_id: string, dematStatus: any) => {
    setShowSuccessModal(true);
    setStatus(NomineeStatus.progress);

    aofVerify(digio_doc_id)
      .then(async (res) => {
        if (res) {
          updateCompletedKycSteps([
            { name: 'depository', status: dematStatus },
            { name: 'aof', status: 1 },
          ]);
        }

        const messageData = {
          signatory_name: `${firstName} ${lastName}`,
        };
        if (isRenderedInWebview() && !isGC) {
          const trackingData = await trackEventPostMessageToNativeOrFallback();
          postMessageToNativeOrFallback('kyc_aof_signed', {
            ...trackingData,
            messageData,
          });
        } else {
          trackEvent('kyc_aof_signed', messageData);
        }
      })
      .catch((error) => {
        trackKYCErrorEvt({
          module: 'aof',
          error_heading:
            error?.statusCode === 422
              ? NomineeStatus.signMismatch.title
              : NomineeStatus.technicalError.title,
          error_type: 'aof_verify_error',
          error_payload: JSON.stringify(error),
        });
        if ([422].includes(error?.statusCode)) {
          setStatus(NomineeStatus.signMismatch);
        } else {
          setStatus(NomineeStatus.technicalError);
        }
      })
      .finally(() => {
        setSignLoading(false);
      });
  };

  const handleOnEsignCancel = async () => {
    setShowSuccessModal(false);
  };

  const handlePopupError = async () => {
    setShowPopupError(true);
    const data = popupBlockedError('eSign');
    trackKYCErrorEvt({
      module: 'aof',
      error_heading: data.title,
      error_type: 'popup_blocked_error',
      error_payload: data,
    });
  };

  // To handle GC redirection for AOF sign based on digio redirection flow
  useEffect(() => {
    const digioDocId = (router?.query?.digio_doc_id || '').toString();
    const status = (router?.query?.status || '').toString();
    const isMobileApp = Cookies.get('webViewRendered');
    const isGCSignatureFlow = isGCOrder();
    if (
      digioDocId &&
      (isGCSignatureFlow || isMobileApp) &&
      status === 'success'
    ) {
      handleAOFResponse(digioDocId, dematDetails.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.digio_doc_id]);

  const openDigioSignature = async (finalDematResponse?: any) => {
    setSignLoading(true);
    setTimeout(() => setSignLoading(false), 5000);
    // Open generating modal
    setShowAOFLoader(true);
    try {
      //call status api to ensure all docs verified, if not show docs error
      const KycStatus = await handleKycStatus();
      if (KycStatus) {
        const pendingDocs = (KycStatus?.kycTypes || [])?.filter(
          (doc: any) =>
            !isSkipManualVerification(doc) &&
            !doc.isKYCComplete &&
            doc?.isKYCPendingVerification
        );

        if (pendingDocs?.length) {
          const docsError = { ...NomineeStatus.verifyError };
          const updatedVerifyError = {
            ...docsError,
            title: docsError.title.replace(
              '<Doc Name>',
              pendingDocs.map((d: any) => d?.name.toUpperCase()).join(', ')
            ),
          };
          closeAOFLoader();
          setStatus(updatedVerifyError);
          setShowSuccessModal(true);
          trackKYCErrorEvt({
            module: 'aof',
            error_heading: updatedVerifyError.title,
            error_type: 'kyc_docs_pending',
            error_payload: JSON.stringify(pendingDocs),
          });
          return;
        } else if (
          !checkActiveStep(completedKycSteps, 'aof') &&
          bankDetails.status === 1
        ) {
          // For AOF Check, the bank should be verified
          const res = await eSignAOF();
          if (res) {
            const { did, identifier, tokenID } = res;
            trackKYCSuccessEvt('aof', {
              signatory_name: `${firstName} ${lastName}`,
              emailID: identifier,
            });
            await closeAOFLoader();
            PubSub.publish('openDigio', {
              type: 'signature',
              subType: 'aof',
              openDigioModal: true,
              data: {
                did,
                identifier,
                tokenID,
              },
              redirectTo: `${window.location.pathname}`,
              onEsignDone: (data: any) =>
                handleAOFResponse(
                  data?.digio_doc_id,
                  finalDematResponse?.status || 1
                ),
              onEsignCancel: () => handleOnEsignCancel(),
              onPopupError: () => handlePopupError(),
              captureDigioEvents: (e: any) => {
                trackKYCErrorEvt({
                  module: 'aof',
                  error_heading: e?.event ? e?.event : 'digio activities',
                  error_type: 'aof_digio_error',
                  error_payload: JSON.stringify(e),
                });
              },
            });
          }
        } else {
          updateCompletedKycSteps([
            { name: 'depository', status: finalDematResponse?.status || 1 },
          ]);
        }
      }
    } catch (error) {
      console.error(error);
      trackKYCErrorEvt({
        module: 'aof',
        error_heading: NomineeStatus.technicalError.title,
        error_type: 'aof_init_error',
        error_payload: JSON.stringify(error),
      });
      closeAOFLoader();
      await delay(500);
      setShowSuccessModal(true);
      setStatus(NomineeStatus.technicalError);
      setSignLoading(false);
    }
  };

  const handleOnClickModal = async () => {
    if (['success', 'failureRedirection'].includes(status.status)) {
      router.push('/discover');
    } else if (status.status === 'failureMismatch') {
      setShowSuccessModal(false);
      await openDigioSignature();
    } else {
      setShowSuccessModal(false);
      setTimeout(() => {
        setSignLoading(false);
      }, 300);
    }
  };

  const handleSubmitMultipleDemat = async (data: any) => {
    const { dpID, clientID, brokerName, dematName, dpName } = data;
    const dematAccountNumber = getDematNumber(dpID, clientID);
    const uploadDAta = {
      dematAccountNumber,
      brokerName,
      dematName,
      dpName,
      isECas: true,
    };
    setShowMultipleDemat(false);

    try {
      await handleVerifyDemat(uploadDAta);
      setDematVerified(true);
      await delay(2000);
      setDematVerified(false);
      if (!redirectFetchViaGmail) {
        updateCompletedKycSteps({ name: 'depository', status: 2 });
      } else {
        localStorage.setItem('dematStatus', 'success');
        router.replace('/demat-processing');
      }
      trackEvent('kyc_cmr_added', {
        module: 'depository',
        dematID: dpID,
        manual_verification: false,
        broker_name: brokerName,
        dp_name: dematName,
        method: 'auto_fetch',
      });
    } catch (err) {
      setDematCardError(dematFormErrors[err?.type]);
      setErrorType(dematFormErrors[err?.type]?.type);
      console.error('Demat add api failed', err);
    }
  };

  // Multiple Demat Modal when click on close button and click here of not in list
  const onHandleCloseMultipleDemat = () => {
    setShowMultipleDemat(false);
  };

  const onClickNoDemat = () => {
    setOpenSuccessModal(false);
    let redirectionURL = '/discover';
    if (isGC) {
      redirectionURL = handleRedirection(gcCallbackUrl);
    }
    setTimeout(() => router.push(redirectionURL), 200);
  };

  if (showPopupError) {
    const data = popupBlockedError('eSign');
    return (
      <div className={styles.FormContainer}>
        <p className={styles.Title}> Add Nominee</p>
        <ErrorPopup
          data={data}
          handleBtnClick={() => {
            setShowPopupError(false);
            trackEvent('error_cta_clicked', data);
          }}
        />
      </div>
    );
  }

  // IF Bank is under manual VF
  if (bankDetails.status === 2 && dematDetails.status) {
    return <KYCComplete />;
  }

  if (isEsignPending || isEsignShow) {
    return (
      <>
        <AOFEsign handleEsign={openDigioSignature} loading={signLoading} />
        <GenericModal
          showModal={showSuccessModal}
          lottieType={status.lottieType}
          title={status.title}
          subtitle={status.subtitle}
          icon={status.icon}
          btnText={status.btnText}
          handleBtnClick={handleOnClickModal}
          isModalDrawer
          drawerExtraClass={styles.Modal}
        />
        <AOFLoader open={showAOFLoader} />
      </>
    );
  }
  // AOF Functions End

  if (!isDematScreenDecided) {
    return (
      <div className={`flex-column ${styles.Loader}`}>
        <CircularProgress size={30} />
      </div>
    );
  }

  return (
    <>
      <div className={styles.Stepper}>
        {/* <StepIndicator
          stepText={'Other'}
          activeStep={3}
          totalSteps={4}
          icon="commons/othersFD.svg"
        /> */}
      </div>
      <div className={`flex justify-between ${styles.Wrapper}`}>
        {renderComponents()}
      </div>

      <DematModal
        modalData={selectedModalData}
        onCloseModal={() => setSelectedModalData(null)}
        isMobile={isMobile}
        feedback={submitFeedback}
        onBackClick={() => {
          setNeedHelpPopup(true);
          setSelectedModalData(null);
        }}
      />
      <NeedHelpModal
        showModal={needHelpPopup}
        modalData={cardsDataMap}
        onClose={() => setNeedHelpPopup(false)}
        onCardClick={handleCardClick}
      />

      {/* NSDL GRIP Verifying */}
      <GenericModal
        showModal={showLoading}
        title={modalsData.demat.title}
        subtitle={modalsData.demat.subTitle}
        customIcon={renderNSDLLoadingIcon}
      />
      {/* Demat Verifying */}
      <GenericModal
        showModal={dematVerified}
        title={'Demat details Verified'}
        subtitle={'Taking you to the next step...'}
        icon={'check-circle.svg'}
      />
      <MultipleDematModal
        showModal={showMultipleDemat}
        onClose={onHandleCloseMultipleDemat}
        onSubmit={handleSubmitMultipleDemat}
        dematOcrResponse={dematOcrResponse}
      />
      <ParsingDocumentPopup
        showModal={showFetchModal}
        title="Processing your Demat Statement"
        isApiResponse={isApiResponse}
        setShowFetchModal={setShowFetchModal}
        setIsApiResponse={setIsApiResponse}
        stepsArr={gmailStepsArr}
      />
      <GenericModal
        showModal={openSuccessModal}
        lottieType={'completed'}
        title={'Your issue has been raised'}
        subtitle={
          'We are sorry for the inconvenience. We are looking into this and will send an update to your registered email id from support@gripinvest.in'
        }
        icon={'check-circle.svg'}
        btnText={'Okay'}
        handleBtnClick={onClickNoDemat}
        wrapperExtraClass={styles.successModal}
      />
    </>
  );
};

export default DematAdd;
