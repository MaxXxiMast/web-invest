import { encryptValue } from '../components/auth/login/utils';
import { callErrorToast, fetchAPI } from './strapi';

type SendOtpPayload = {
  loginID: string;
  mobileCode: string;
};

export const sendOtpApi = async (loginData: SendOtpPayload) => {
  const { loginID, mobileCode } = loginData;
  const publicKey = process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;
  if (!publicKey) {
    callErrorToast('Public Key is missing');
    return;
  }
  const encryptedLoginValue = await encryptValue(loginID, publicKey);
  if (!encryptedLoginValue) {
    callErrorToast('Encrypted Login Value is missing');
    return;
  }

  return fetchAPI(
    '/v3/users/request-otp',
    {},
    {
      method: 'post',
      body: JSON.stringify({ mobileCode, loginID: encryptedLoginValue }),
    },
    true,
    true,
    false,
    {},
    false
  );
};

export const verifyOtp = (loginData: any) => {
  return fetchAPI(
    '/v3/users/login',
    {},
    {
      method: 'post',
      body: JSON.stringify(loginData),
    },
    true,
    true,
    false,
    {},
    false
  );
};

export const socialLoginApi = (loginData: any) => {
  return fetchAPI(
    '/v3/users/social-login',
    {},
    {
      method: 'post',
      body: JSON.stringify(loginData),
    },
    true,
    true,
    false,
    {},
    false
  );
};
