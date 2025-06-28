// NODE MODULES
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookie from 'js-cookie';

// Compoennts
import Seo from '../../layout/seo';
import PreLoginMobileHeader from '../../common/PreLoginMobileHeader';
import LoginBackBtn from '../../common/LoginBackBtn';
import InputFieldSet from '../../common/inputFieldSet';
import Button from '../../primitives/Button';

// APIS
import { sendOtpApi } from '../../../api/login';
import { authenticate } from '../../../redux/slices/user';
import { createPersonalityOnAuthentication } from '../../../redux/slices/knowYourInvestor';

// Hooks
import { useAppDispatch } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Utils
import {
  callSuccessToast,
  fetchAPI,
  callErrorToast,
} from '../../../api/strapi';
import { getUTMParams } from '../../../utils/utm';
import { verifyUserAndRedirect } from '../../../utils/login';
import { isMobileOrEmail } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';

// Styles
import styles from './otp.module.css';

const VerifyOTP = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery();

  const loginID = Cookie.get('loginID') || '';
  const otpPlaceholder = 'Enter OTP';

  const [seconds, setSeconds] = useState(59);
  const [otpValue, setotpValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpDetected, setOtpDetected] = useState(false);

  const [localProps, setLocalProps] = useState<any>({
    loading: true,
    pageData: [],
  });

  const getData = async () => {
    const data = await getServerData();
    setLocalProps({ loading: false, pageData: data?.props?.pageData });
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if ('OTPCredential' in window && isMobile) {
      const ac = new AbortController();

      (navigator.credentials as any)
        .get({
          otp: { transport: ['sms'] },
          signal: ac.signal,
        })
        .then((otp: any) => {
          // Conditions to match an OTP
          if (otp?.code?.length === 4 && !Number.isNaN(Number(otp?.code))) {
            // Set OTP Value
            setotpValue(otp?.code);
            // Update when otp is detected
            setOtpDetected(true);
            verifyOtp(otp?.code);
            ac.abort();
          }
        })
        .catch((err: any) => {
          ac.abort();
        });
    }
    const ele = document.getElementById(otpPlaceholder);
    if (ele) {
      ele.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        clearInterval(timeInterval);
      }
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [seconds]);

  useEffect(() => {
    if (otpDetected) {
      verifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpDetected]);

  const otpFailed = (error: any) => {
    setLoading(false);
  };

  const handleRedirectionRouter = (redirectURL: string) => {
    router.push(redirectURL);
  };

  const onSuccessVerifyOTP = (
    userResponse: any = null,
    mode: any = null,
    cta_text: any = null
  ) => {
    const redirectURL = verifyUserAndRedirect(userResponse, mode, cta_text);
    const cb = () => {
      handleRedirectionRouter(redirectURL);
    };
    dispatch(createPersonalityOnAuthentication(cb, cb));
  };

  const verifyOtp = (otp?: string) => {
    setLoading(true);
    let utmParams = {};
    if (Cookie.get('utm')) {
      utmParams = getUTMParams();
    }

    const mobileCode = '91'; //props.userLocation && props.userLocation.calling_code;
    otpValue.length === 4 &&
      dispatch(
        authenticate(
          loginID,
          otp || otpValue,
          mobileCode,
          utmParams,
          onSuccessVerifyOTP,
          otpFailed
        )
      );

    trackEvent('login_signup_page', {
      page: 'secondary',
    });
  };

  const handleKeyPress = (e: any, type: string) => {
    let value = e.target.value;
    if (type === 'keyDown' && e.key === 'Enter' && otpValue.length === 4) {
      verifyOtp();
    } else if (type === 'change' && value.length < 5) {
      if (!Number.isNaN(Number(value))) {
        setotpValue(value);
      }
    }
  };

  const resendOtp = () => {
    let otpCount = parseInt(localStorage.getItem('otpCount') || '0', 10);
    otpCount += 1;
    localStorage.setItem('otpCount', otpCount.toString());

    const loginID = Cookie.get('loginID');
    const mode = isMobileOrEmail(loginID, false);

    trackEvent('login_signup_otp_sent', {
      otp_count: otpCount,
      verification_type: mode == 'email' ? 'email' : 'mobile',
      verification_step: 'primary',
      type: 'login',
      cta_text: 'Resend OTP',
    });
    if (loginID.length < 5 || loginID.length > 100) {
      callErrorToast('Enter a valid email address');
      return;
    }

    setOtpDetected(false);
    seconds === 0 &&
      sendOtpApi({ loginID, mobileCode: '91' }).then(() =>
        callSuccessToast('Otp Sent Successfully')
      );
    setSeconds(60);

    setotpValue('');
  };

  const counterString = () => {
    let secondsString =
      seconds < 10
        ? `0${seconds}`
        : (seconds % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    return Math.floor(seconds / 60) + ':' + secondsString;
  };
  const seoData = localProps?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];

  const handleBackClick = () => router.push('/login');

  const resendOtpUI = () => {
    {
      if (seconds !== 0) {
        return (
          <div className={styles.resendCounter}>
            {' '}
            Resend OTP in {counterString()} seconds
          </div>
        );
      } else {
        return (
          <div
            className={`${styles.resendText} ${styles.commonFont}`}
            style={{ opacity: seconds === 0 ? '100%' : '50%' }}
          >
            Resend OTP
          </div>
        );
      }
    }
  };

  const handleClickChange = () => {
    let changePriCount = parseInt(
      localStorage.getItem('changePriCount') || '0',
      10
    );
    changePriCount += 1;
    localStorage.setItem('changePriCount', changePriCount.toString());

    const loginID = Cookie.get('loginID');
    const mode = isMobileOrEmail(loginID, false);
    trackEvent('email_phone_change', {
      changed: mode == 'email' ? 'email' : 'mobile',
      change_count: changePriCount,
      verification_step: 'primary',
    });
    router.push('/login');
  };
  return (
    <>
      <Seo seo={seoData} isPublicPage />
      <PreLoginMobileHeader
        isLoggedIn={false}
        handleBackClick={handleBackClick}
      />
      <div className={`${styles.container}`}>
        <div className={styles.OtpWrapper}>
          <div className={`${styles.inputContainer}`}>
            <div className={`${styles.loginText}  ${styles.commonFont}`}>
              Enter OTP to verify
            </div>
            <div className={`${styles.loginDetails}  ${styles.commonFont}`}>
              Enter 4 digit OTP sent to you on{' '}
              <span className={`${styles.commonFont} ${styles.loginIDText}`}>
                {loginID}{' '}
              </span>
              <span
                className={`${styles.changeLink}`}
                onClick={handleClickChange}
              >
                Change{' '}
              </span>
            </div>
            <div className={styles.margin}>
              <InputFieldSet
                placeHolder={otpPlaceholder}
                label="OTP"
                width={'100%'}
                maxLength={4}
                type="number"
                onChange={(e: any) => handleKeyPress(e, 'change')}
                value={otpValue}
                onKeyPress={(e: any) => handleKeyPress(e, 'keyDown')}
                className={'CompactInput'}
              />
            </div>
            <div
              className={styles.resendDiv}
              style={{
                cursor: seconds === 0 ? 'pointer' : 'not-allowed',
              }}
              onClick={resendOtp}
            >
              {resendOtpUI()}
            </div>

            <Button
              disabled={otpValue.length !== 4 || loading}
              isLoading={loading}
              onClick={() => verifyOtp()}
              width={'100%'}
              className={styles.loginButton}
            >
              Proceed
            </Button>
            <LoginBackBtn
              btnTxt="Back to login"
              handleClick={() => router.push('/login')}
            />
          </div>
          <p className={`BottomCopyright TextStyle2`}>
            © {new Date().getFullYear()} Grip Broking Private Limited.
          </p>
        </div>
      </div>
    </>
  );
};

async function getServerData() {
  try {
    const pageData = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/verify-otp',
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

export default VerifyOTP;
