// Node Modules
import React, { useEffect, useState } from 'react';
import Cookie from 'js-cookie';
import { useRouter } from 'next/router';
import queryString from 'query-string';

// Components
import Seo from '../../layout/seo';
import InputFieldSet from '../../common/inputFieldSet';
import PreLoginMobileHeader from '../../common/PreLoginMobileHeader';
import LoginBackBtn from '../../common/LoginBackBtn';
import Button from '../../primitives/Button';
import GoogleAuth from './GoogleAuth';
import { GoogleOAuthProvider } from '../../../utils/googleOauth';

// Utils
import { isMobileOrEmail } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';

// API
import { callErrorToast } from '../../../api/strapi';
import { sendOtpApi } from '../../../api/login';

// Hooks
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Styles
import styles from './login.module.css';

// Text objects for login and signup
const loginText = {
  header: 'Login to Grip',
  bottom: "Don't have an account?",
  action: 'Sign up',
};

const signupText = {
  header: 'Create a Grip Account',
  bottom: 'Already have an account?',
  action: 'Login',
};

const LoginPage = (props: any) => {
  const router = useRouter();
  const isMobile = useMediaQuery();
  // TODO: Move the google Client ID fetching here, no need to call on each page
  const { googleClientId } = props;
  const [isLogin, setLogin] = useState(true);
  const [validInput, setValidInput] = useState(false);
  const [loginValue, setLoginValue] = useState('');
  const [loading, setLoading] = useState(false);

  const textContent = isLogin ? loginText : signupText;
  const placeHolder = 'Enter Mobile or Email';
  const seoData = props?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];

  useEffect(() => {
    const queryParams: any = queryString.parse(window.location.search);
    const { signup } = queryParams;

    if (signup) {
      setLogin(false);
    }
  }, []);

  useEffect(() => {
    if (Cookie.get('show_login_id_error')) {
      Cookie.remove('show_login_id_error');
      setTimeout(() => {
        callErrorToast('Couldn’t proceed. Please try again!');
      }, 500);
    }
    document.getElementById('loginInput')?.focus();
  }, [isLogin]);

  const sendLoginRudderStackEvent = (value = '') => {
    if (value) {
      const mode = isMobileOrEmail(value, false);
      trackEvent('login_signup_initiate', {
        mode,
        [mode]: value,
      });
    }
  };

  const validateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredValue = e.target.value;
    setLoginValue(enteredValue);
    if (isMobileOrEmail(enteredValue, false)) {
      Cookie.set('loginID', enteredValue);
      setValidInput(true);
    } else {
      setValidInput(false);
    }
  };

  const sendOtp = async () => {
    if (!validInput) return;

    try {
      if (loginValue.length < 5 || loginValue.length > 100) {
        callErrorToast('Enter a valid email address');
        return;
      }

      setLoading(true);

      const loginData = {
        loginID: loginValue,
        mobileCode: '91',
      };

      sendLoginRudderStackEvent(loginValue);

      await sendOtpApi(loginData);

      Cookie.set('loginID', loginValue);
      router.push('/login#verify-otp');
    } catch (err) {
      setLoading(false);
      trackEvent('login_signup_error', { err });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendOtp();
    }
  };

  const handleBackBtnClick = () => {
    if (isLogin) {
      window.open('/', '_self');
    } else {
      setLogin(!isLogin);
    }
  };

  return (
    <>
      <Seo seo={seoData} isPublicPage />
      <PreLoginMobileHeader
        isLoggedIn={false}
        handleBackClick={() => window.open('/', '_self', 'noopener')}
      />
      <div className={styles.container}>
        <div className={styles.LoginWrapper}>
          <div className={styles.LoginForm}>
            <div className={styles.inputContainer}>
              <div className={`${styles.loginText} ${styles.commonFont}`}>
                {textContent.header}
              </div>
              <GoogleOAuthProvider clientId={googleClientId?.value}>
                <GoogleAuth
                  socialLoginFeatureFlag={props?.socialLoginFeatureFlag}
                />
              </GoogleOAuthProvider>
              <div className={styles.margin}>
                <InputFieldSet
                  placeHolder={placeHolder}
                  label={placeHolder}
                  width={isMobile ? 'auto' : 400}
                  type="text"
                  onChange={validateInput}
                  value={loginValue}
                  onKeyPress={handleKeyPress}
                  inputId="loginInput"
                  className="CompactInput"
                />
              </div>
              <Button
                disabled={!validInput || loading}
                isLoading={loading}
                onClick={sendOtp}
                width="100%"
                onKeyDown={handleKeyPress}
                className={styles.loginButton}
              >
                Continue
              </Button>
            </div>
            <div className={`${styles.redirectionText} ${styles.commonFont}`}>
              {textContent.bottom}{' '}
              <span onClick={() => setLogin(!isLogin)}>
                {textContent.action} Now
              </span>
            </div>
            <LoginBackBtn
              btnTxt={isLogin ? 'Back to home' : 'Back to login'}
              className={styles.LoginBackBtn}
              handleClick={handleBackBtnClick}
            />
          </div>
        </div>
        <div>
          <p className="TextStyle2 BottomCopyright">
            © {new Date().getFullYear()} Grip Broking Private Limited.
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
