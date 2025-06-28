import Cookie from 'js-cookie';

import { identifyClarityUser } from './clarity';
import MoengageWebServices from './ThirdParty/moengage/moengage';
import { trackEvent, trackUser } from './gtm';
import { isMobileOrEmail } from './string';

const urlToRedirectToAssets = [
  '/',
  '/partners',
  '/how-to-invest',
  '/about-us',
  '/faq',
];

export const successOTPRudderStackEvent = (
  userData: {
    emailID?: string;
    mobileNo?: string;
    mobileCode?: number;
  },
  cta_text?: any
) => {
  const { emailID, mobileNo, mobileCode } = userData;
  const loginID = Cookie.get('loginID') || '';
  // Existing or new user
  const type = emailID && mobileNo ? 'login' : 'signup';
  const mode = isMobileOrEmail(loginID, false);

  trackEvent('login_signup_otp_verify', {
    type,
    login_mode: mode,
    email: type === 'login' ? emailID : mode === 'email' ? loginID : '',
    mobile: type === 'login' ? mobileNo : mode === 'mobile' ? loginID : '',
    mobile_code:
      type === 'login' ? mobileCode : mode === 'mobile' ? mobileCode : '',
    cta_text: cta_text ? cta_text : 'Proceed',
    verification_step: type == 'login' ? 'primary' : 'secondary',
  });
};

export const verifyUserAndRedirect = (
  userResponse: any = null,
  mode: any = null,
  cta_text: any = null
) => {
  const {
    emailID,
    mobileCode,
    mobileNo,
    userID,
    firstName,
    lastName,
    is2faRequired,
  } = userResponse.userData;

  successOTPRudderStackEvent(
    {
      emailID,
      mobileNo,
      mobileCode,
    },
    cta_text
  );

  // Abort OTP detection

  if (emailID) {
    identifyClarityUser(emailID);
  }
  trackUser(userID);
  try {
    const params = {
      firstName: firstName,
      lastName: lastName,
      email: emailID,
      mobileCode: `${mobileCode}`,
      mobileNo: mobileNo,
    };
    window['rudderanalytics']?.identify(String(userID), params);
    MoengageWebServices.transformUserIdentityEvent(params);
  } catch (e) {
    console.log(e, 'error');
  }
  let redirectTo: string;
  const redirectedUrl = '/discover';
  if (emailID && mobileNo) {
    if (!is2faRequired) {
      redirectTo = Cookie.get('redirectTo') || redirectedUrl;
      if (urlToRedirectToAssets.indexOf(redirectTo) > -1) {
        redirectTo = redirectedUrl;
      }
      Cookie.remove('redirectTo');
      if (!mode) {
        const loginID = Cookie.get('loginID');
        mode = isMobileOrEmail(loginID, false);
      }
      trackEvent('User Logged In', {
        login_mode: mode,
        email: emailID,
        mobile: mobileNo,
        landed_page: redirectTo,
      });
    }
  } else {
    redirectTo = '/signup';
  }

  return redirectTo;
};

const publicDynamicPagesSubRoutes = ['/assetdetails'];

export const checkInAllowedDynamicSubRoutes = (path: string) => {
  return publicDynamicPagesSubRoutes.some((el: string) => path.includes(el));
};

export const getDataFromJWTToken = (token: string) => {
  if (!token) return {};
  return JSON.parse(Buffer.from(token?.split('.')?.[1], 'base64').toString());
};

export const redirectUser = (emailID = '', mobileNo = '') => {
  let redirectTo: string;
  const redirectedUrl = '/discover';
  if (emailID && mobileNo) {
    redirectTo = Cookie.get('redirectTo') || redirectedUrl;
    if (urlToRedirectToAssets.indexOf(redirectTo) > -1) {
      redirectTo = redirectedUrl;
    }
    Cookie.remove('redirectTo');

    const loginID = Cookie.get('loginID');
    const mode = loginID ? isMobileOrEmail(loginID, false) : null;
    trackEvent('User Logged In', {
      login_mode: mode,
      email: emailID,
      mobile: mobileNo,
      landed_page: redirectTo,
    });
  } else {
    redirectTo = '/signup';
  }

  return redirectTo;
};
