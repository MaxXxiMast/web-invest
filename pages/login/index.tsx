//Node Modules
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

//Components
import LoginPage from '../../components/auth/login';
import VerifyOTP from '../../components/auth/verify-otp';

//Redux
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
import { fetchUserInfo } from '../../redux/slices/user';

//Utils
import { isUserLogged, isUserSignedUp } from '../../utils/user';
import { fetchAPI } from '../../api/strapi';
import { newRelicErrLogs, trackEvent } from '../../utils/gtm';
import { isMobileOrEmail } from '../../utils/string';
import { getSecret } from '../../api/secrets';

const AuthPage = (props: any) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userData);
  const isOTPRoute = router.asPath.includes('#verify-otp');

  useEffect(() => {
    const gcLoginErroCookie = sessionStorage.getItem('gcloginIdVal');
    if (gcLoginErroCookie) {
      newRelicErrLogs('Login_error_cookie_data', 'info', {
        gcLoginErroCookie,
      });
    }
    if (isUserSignedUp() === 'not-logged-in' && router.pathname !== '/login') {
      router.push('/login');
    } else if (isUserSignedUp() === 'not-signed-up') {
      router.push('/signup');
    } else if (isUserLogged()) {
      router.push('/discover');
    }
    const { userID } = user || {};

    if (userID) {
      dispatch(
        fetchUserInfo(userID, (data: any) => {
          if (data.emailID && data.mobileNo) {
            const redirectUrl = Cookies.get('redirectTo') || '/assets';
            router.push(redirectUrl);
            Cookies.remove('redirectTo');
          }
        })
      );
    }

    if (isOTPRoute) {
      let otpCount = parseInt(localStorage.getItem('otpCount') || '0', 10);
      otpCount += 1;
      localStorage.setItem('otpCount', otpCount.toString());

      const loginID = Cookies.get('loginID');
      const mode = isMobileOrEmail(loginID, false);

      trackEvent('login_signup_otp_sent', {
        otp_count: otpCount,
        verification_type: mode == 'email' ? 'email' : 'mobile',
        verification_step: 'primary',
        type: 'login',
        cta_text: 'Continue',
      });
      trackEvent('login_signup_page', {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOTPRoute]);

  return <div>{isOTPRoute ? <VerifyOTP /> : <LoginPage {...props} />}</div>;
};

export async function getServerSideProps() {
  try {
    const [pageData, socialLoginFeatureFlag, googleClientId] =
      await Promise.all([
        fetchAPI(
          '/inner-pages-data',
          {
            filters: { url: '/login' },
            populate: '*',
          },
          {},
          false
        ),
        fetchAPI(
          '/poQgjpmbbJsRfLNVPANsTLtW',
          {},
          {
            method: 'post',
            body: JSON.stringify({ key: 'feature_flags.social_login' }),
          },
          true,
          true,
          false,
          {},
          false
        ),
        getSecret('google.client_id'),
      ]);

    return {
      props: {
        pageData: pageData?.data?.[0]?.attributes?.pageData,
        socialLoginFeatureFlag,
        googleClientId,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

export default AuthPage;
