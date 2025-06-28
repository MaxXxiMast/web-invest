import { fetchAPI } from './strapi';

export const createOrUpdateUserKYCConsent = (data: any) => {
  const path = `/v2/user-kyc`;
  return fetchAPI(
    path,
    {},
    {
      method: 'post',
      body: JSON.stringify(data),
    },
    true
  );
};

export const startBankKYC = (data: any) => {
  const path = '/v2/kyc/bank';
  return fetchAPI(
    path,
    {},
    {
      method: 'post',
      body: JSON.stringify(data),
    },
    true,
    false
  );
};

export const verifyIFSCCode = async (ifscCode: string) => {
  return fetchAPI(`/v2/kyc/verify-ifsc/${ifscCode}`, {}, {}, true, false);
};
