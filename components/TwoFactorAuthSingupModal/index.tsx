// NODE MODULES
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

// Components
import InputFieldSet from '../common/inputFieldSet';
import Button from '../primitives/Button';
import Image from '../primitives/Image';
import MaterialModalPopup from '../primitives/MaterialModalPopup';
import ProfileImage from '../primitives/Navigation/ProfileImage';
import NeedHelpPopup from '../2fa/NeedHelpPopup';

// APIs
import { validateTwoFADOB } from '../../api/TwoFA';
import { getSecret } from '../../api/secrets';

// Hooks
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';

// Redux Slices
import {
  logout,
  setIsDOBVerifiedTwoFAModal,
  setLoggingOutDetail,
  setShowTwoFAModal,
} from '../../redux/slices/user';
import { setAccessDetails } from '../../redux/slices/access';
import { createPersonalityOnAuthentication } from '../../redux/slices/knowYourInvestor';

// Utils
import { newRelicErrLogs, trackEvent } from '../../utils/gtm';
import { redirectUser } from '../../utils/login';
import { maskedEmail, GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { isGCOrder } from '../../utils/gripConnect';

// Styles
import styles from './TwoFactorAuthSignupModal.module.css';

const TwoFactorAuthSingupModal = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [dob, setDob] = useState('');
  const [error, setError] = useState({ message: '', counter: 3 });
  const [showNeedHelpModal, setShowNeedHelpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secretKey, setSecretKey] = useState<any>({});
  const { showTwoFAModal, userData } = useAppSelector((state) => state.user);
  const { gcData } = useAppSelector((state) => state.gcConfig);
  const modalOpenRef = useRef(false);
  const isValidDob = (dob) => /^\d{0,8}$/.test(dob);

  const validateDob = (dob) => {
    if (!isValidDob(dob)) {
      return 'Invalid format.';
    }
    return '';
  };

  function isSpecialKey(event) {
    const specialKeys = [8, 9, 13, 37, 39, 46]; // Added 46 for delete key
    const numpadKeys = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105]; // Numpad keys 0-9

    // Check if Ctrl or Command key is pressed and handle Ctrl+A/Cmd+A (Select All)
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.keyCode === 65 || event.keyCode === 86)
    ) {
      return true;
    }

    return (
      specialKeys.includes(event.keyCode) || numpadKeys.includes(event.keyCode)
    );
  }

  const handleChange = (e, type) => {
    const charCode = e.which ? e.which : e.keyCode;
    if ((charCode < 48 || charCode > 57) && !isSpecialKey(e)) {
      e.preventDefault();
      return false;
    }

    let value = e.target.value;
    if (type === 'change' && isValidDob(value)) {
      if (!Number.isNaN(Number(value))) {
        setDob(value);
        setError({ ...error, message: '' });
      }
    }

    if (
      e.key === 'Enter' &&
      isValidDob(value) &&
      !Number.isNaN(Number(value))
    ) {
      handleSubmit();
    }
  };

  const onError = (isLogoutButton = false) => {
    dispatch(setShowTwoFAModal(false));
    if (!isLogoutButton) {
      dispatch(setLoggingOutDetail(true));
    }
    Cookies.remove('storedTime2FA');
    dispatch(setAccessDetails({ accessToken: '' }));
    newRelicErrLogs('Login_error_Redirect_From_2FA_Modal', 'info', {
      externalUserId: gcData?.userData?.userID,
      userId: userData?.userID,
    });
    dispatch(
      logout({
        redirect: '/login',
        isAutoLogout: !isLogoutButton,
        externalUserId: gcData?.userData?.userID ?? '',
        pageSection: '2FA',
      })
    );
    setTimeout(() => {
      dispatch(setLoggingOutDetail(false));
    }, 2000);
  };

  const handlePersonalityCB = (redirectURL: string) => {
    router.push(redirectURL);
  };

  const sha256 = (stringToSign: string) => {
    const hash = CryptoJS.SHA256(stringToSign);
    return CryptoJS.enc.Base64.stringify(hash);
  };

  const calculateRemainingTime = (currentDate: string): number | undefined => {
    const cookies = Cookies.get('storedTime2FA');
    if (cookies) {
      return Number(currentDate) - Number(cookies);
    }
    return undefined;
  };

  const trackSubmitEvent = (remainingTime: number | undefined) => {
    trackEvent('2FA_submit', {
      page_name: `2FA_welcome_screen`,
      page_section: `User clicks on button of the pop-up`,
      userId: userData?.userID ?? '',
      externalUserId: gcData?.userData?.userID ?? '',
      remainingTimeToAppear: remainingTime || '',
    });
  };

  const validateDobHash = async (encryptData: any) => {
    const stringToSign = secretKey?.value + dob;
    const hashDigest = sha256(stringToSign);
    return hashDigest === encryptData?.key;
  };

  const handleSuccessfulLogin = async () => {
    trackEvent('2FA_Login', {
      page_name: `2FA_welcome_screen`,
      page_section: `User clicks on button of the pop-up`,
      result: 'Success',
      DOB_entered: dayjs(dob, 'DDMMYYYY').format('DD/MM/YYYY'),
    });
    Cookies.set('storedTime2FA', new Date().getTime().toString(), {
      expires: 7,
    });
    dispatch(setShowTwoFAModal(false));
    dispatch(setIsDOBVerifiedTwoFAModal(true));

    // Redirect user to discover page only when on verify-otp page
    if (['/login', '/login#verify-otp'].includes(router.pathname)) {
      const redirectURL = redirectUser(userData?.emailID, userData?.mobileNo);

      const cb = () => {
        handlePersonalityCB(redirectURL);
      };

      dispatch(createPersonalityOnAuthentication(cb, cb));
    }
    setLoading(false);
  };

  const handleFailedLogin = async () => {
    if (error.counter === 1) {
      trackEvent('login_signup_error', { err: 'Count exceeded' });
      onError();
    } else {
      setError({
        message: 'Incorrect DOB',
        counter: --error.counter,
      });
      trackEvent('2FA_Login', {
        page_name: `2FA_welcome_screen`,
        page_section: `User clicks on button of the pop-up`,
        result: 'Failure',
        DOB_entered: dayjs(dob, 'DDMMYYYY').format('DD/MM/YYYY'),
      });
    }

    setLoading(false);
  };

  const handleError = (e: any) => {
    trackEvent('login_signup_error', { err: e });
    if (error.counter === 1) {
      dispatch(setShowTwoFAModal(false));
    }
    onError();
    setLoading(false);
  };

  const handleSubmit = async () => {
    const currentDate = new Date().getTime().toString();
    let remainingTime = calculateRemainingTime(currentDate);

    trackSubmitEvent(remainingTime);

    /**
     * Validate DOB
     * Logic changed to resolve VAPT issue
     * Now we are validating DOB on client side with encrypted key
     * If DOB is correct then we are sending request to server
     * If DOB is incorrect then we are showing error message
     * If user enters incorrect DOB 3 times then we are logging out user from client side as server side validation is not possible
     */

    const validationError = validateDob(dob);
    try {
      if (validationError) {
        setError({
          message: validationError,
          counter: --error.counter,
        });
      } else {
        setLoading(true);
        const encryptData = await validateTwoFADOB();
        const isDobValid = await validateDobHash(encryptData);

        if (isDobValid) {
          await handleSuccessfulLogin();
        } else {
          await handleFailedLogin();
        }
      }
    } catch (e) {
      handleError(e);
    }
  };

  const handleNeedHelp = () => {
    trackEvent('button_clicked', {
      page_name: `2FA_Helpbox`,
      page_section: `2FA Screen opens-up HelpBox`,
      cta_text: 'Need help?',
    });
    setShowNeedHelpModal(true);
  };

  const handleLogoutClick = () => {
    trackEvent('button_clicked', {
      page_name: `2FA_welcome_screen`,
      page_section: `User clicks on button of the pop-up`,
      cta_text: 'Log out',
    });
    onError(true);
  };

  const handleNeedHelpClose = (flag) => {
    setShowNeedHelpModal(flag);
  };

  const getSecretKey = async () => {
    const secretKey = await getSecret('2fa.secret_key');
    setSecretKey(secretKey);
  };

  useEffect(() => {
    trackEvent('2FA_Pop_Up', {
      page_name: `2FA_welcome_screen`,
    });
    getSecretKey();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById('2FASignupInput');
      if (element) {
        element.focus();
        element.click();
        window.scrollTo(0, 0);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const isDisabled = () => {
    return !(dob && dob.length === 8 && isValidDob(dob));
  };

  const renderBody = () => {
    return (
      <div className={`flex-column flex_wrapper `}>
        <div className={`flex_wrapper ${styles.twoFacAuthWrapper}`}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}commons/authentication.svg`}
            width={16}
            height={16}
            layout="fixed"
            alt="2 Factor Authentication"
          />
          <span className={styles.twoFacAuthContent}>
            2 Factor Authentication
          </span>
        </div>
        <div>
          <ProfileImage size={63} />
        </div>
        <div className={`flex-column ${styles.UserDetailsContainer}`}>
          <h2>Welcome, {userData?.firstName}</h2>
          <p className={styles.userMessageWrapper}>
            {maskedEmail(userData?.emailID || '')}
          </p>
        </div>
        {/* <div>
          <p className={styles.userMessageWrapper}>
            To enhance the security of your account, login by entering your date
            of birth
          </p>
        </div> */}
        <div className={styles.inputWrapper}>
          <InputFieldSet
            showClear
            autoFocus
            placeHolder={'DDMMYYYY'}
            label="Enter your DOB as on PAN (DDMMYYYY)"
            width={'100%'}
            type="number"
            onChange={(e) => handleChange(e, 'change')}
            value={dob}
            onKeyPress={(e) => handleChange(e, 'keydown')}
            inputId={'2FASignupInput'}
            error={!!error.message}
            otherProps={{
              pattern: '[0-9]*',
              type: 'number',
              inputMode: 'numeric',
            }}
            isShowPlaceHolder
          />
          {error?.message && (
            <div
              className={`flex items-center justify-between ${styles.m9} ${styles.errorWrapper}`}
            >
              <div>
                <span className={styles.errorMessageWrapper}>
                  {error?.message}
                </span>
                <button className={styles.link} onClick={handleNeedHelp}>
                  <span>Need help?</span>
                </button>
              </div>
              <span
                className={styles.warningWrapper}
              >{`Attempts left: ${error?.counter}/3`}</span>
            </div>
          )}
        </div>

        <Button
          isLoading={loading}
          disabled={isDisabled() || loading}
          onClick={handleSubmit}
          width={'100%'}
          className={styles.Button}
        >
          Proceed
        </Button>
        {!isGCOrder() ? (
          <div className={`flex_wrapper`}>
            <span className={styles.confirmationText}>Not you?</span>
            <button className={styles.link} onClick={handleLogoutClick}>
              Log out
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <MaterialModalPopup
        isModalDrawer
        hideClose
        isKeyboardScroll
        showModal={showTwoFAModal}
        className={styles.TwoFactorAuthModal}
        bodyClass={styles.MainClass}
        drawerRootExtraClass={styles.DrawerRootExtraClass}
      >
        {renderBody()}
      </MaterialModalPopup>
      <NeedHelpPopup
        handleClose={handleNeedHelpClose}
        showNeedHelpModal={showNeedHelpModal}
      />
    </>
  );
};

export default TwoFactorAuthSingupModal;