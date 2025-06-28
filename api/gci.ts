import { fetchAPI } from './strapi';

export const getPGUrl = async (token: string) => {
  return fetchAPI(
    `/v3/orders/gci-redirect?token=${token}`,
    {},
    {
      method: 'GET',
    },
    true
  );
};

export const getPostPGUrl = async (params: URLSearchParams) => {
  return fetchAPI(
    `/v3/orders/post-payment?${new URLSearchParams(params).toString()}`,
    {},
    {
      method: 'GET',
    },
    true
  );
};

export const getEsignParams = async (token: string) => {
  return fetchAPI(
    `/v3/esign/upload/agreement-pdfs?token=${token}`,
    {},
    {
      method: 'GET',
    },
    true
  );
};

export const verifyEsign = async (params: any) => {
  return fetchAPI(
    `/v3/esign/verify`,
    {},
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    true
  );
};

export const fetchEsignRedirectUrl = async (token: any) => {
  return fetchAPI(
    `/v3/esign/redirect/url?token=${token}`,
    {},
    {
      method: 'GET',
    },
    true
  );
};
