//Node Modules
import { useState } from 'react';
import Cookie from 'js-cookie';
import { useRouter } from 'next/router';

//Components
import Button from '../../primitives/Button';
import Image from '../../primitives/Image';
import { CircularProgress } from '@mui/material';

//Redux
import { useAppDispatch } from '../../../redux/slices/hooks';
import { authenticateSocialLoginRequest } from '../../../redux/slices/user';
import { createPersonalityOnAuthentication } from '../../../redux/slices/knowYourInvestor';

//Utils
import { verifyUserAndRedirect } from '../../../utils/login';
import { getUTMParams } from '../../../utils/utm';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';

// Hooks
import { useGoogleLogin } from '../../../utils/googleOauth';

//Styles
import styles from './GoogleAuth.module.css';

type Props = {
  socialLoginFeatureFlag: any;
};

const GoogleAuth = ({ socialLoginFeatureFlag = {} }: Props) => {
  const socialLoginFlags: any = socialLoginFeatureFlag?.value || '';
  const hasGoogle = socialLoginFlags.includes('google');
  const dispatch = useAppDispatch();

  const [googleLoading, setGoogleLoading] = useState(false);

  /*
   * Google Login functions
   */
  const router = useRouter();

  const handleCBOFKYI = (redirectURL: string) => {
    router.push(redirectURL);
  };

  const googleLoginSuccess = (userResponse: any) => {
    setGoogleLoading(false);
    Cookie.set('loginID', userResponse?.userData?.emailID);
    const data = verifyUserAndRedirect(
      userResponse,
      'google',
      'Continue with google'
    );
    const cb = () => handleCBOFKYI(data);
    dispatch(createPersonalityOnAuthentication(cb, cb));
  };

  const googleLoginFailed = (response) => {
    setGoogleLoading(false);
  };
  const googleLogin = useGoogleLogin({
    scope: 'email profile',
    onSuccess: (tokenResponse) => {
      setGoogleLoading(true);
      let utmParams = {};
      if (Cookie.get('utm')) {
        utmParams = getUTMParams();
      }
      dispatch(
        authenticateSocialLoginRequest(
          tokenResponse?.access_token,
          'google',
          utmParams,
          googleLoginSuccess,
          googleLoginFailed
        )
      );
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const renderLoader = (show) =>
    show ? (
      <CircularProgress size={20} className={styles.circularProgress} />
    ) : null;

  if (!hasGoogle) return null;

  const handleGoogleLoginClick = () => {
    trackEvent('login_signup_initiate', {
      mode: 'google',
      mobile: '',
      email: '',
    });
    googleLogin();
  };

  return (
    <>
      {/* GOOGLE SINGIN */}
      {hasGoogle && (
        <Button
          className={`${styles.socialButton}`}
          onClick={handleGoogleLoginClick}
          width="100%"
        >
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}login/google.svg`}
            alt="Linkedin"
            width={20}
            height={20}
            layout="fixed"
          />
          <div className={`${styles.socialText} ${styles.commonFont}`}>
            Continue with Google
          </div>
          {renderLoader(googleLoading)}
        </Button>
      )}

      <div className={`${styles.orTextDivider}`}>
        <span className={`${styles.orText}`}>OR</span>
      </div>
    </>
  );
};

export default GoogleAuth;
