import { fetchAPI } from './strapi';

export const getSignatureToken = () => {
  return fetchAPI(
    `/v3/kyc/signature/sdk-details`,
    {},
    {},
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const signatureUpload = (requestID: string) => {
  return fetchAPI(
    `/v3/kyc/signature/${requestID}/post-process`,
    {},
    { method: 'POST' },
    true,
    false,
    false,
    {},
    true,
    true
  );
};
