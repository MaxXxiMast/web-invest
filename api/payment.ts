import { fetchAPI } from './strapi';

export const checkUpiValidation = (data: any) => {
  return fetchAPI(
    `/v3/orders/verify`,
    {},
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true,
    false,
    false,
    {},
    true,
    true
  );
};

export const getPaymentType = async (
  assetID: number | string,
  amount: number,
  transactionID?: string
) => {
  return fetchAPI(
    `/v3/rfq/exchange-details?amount=${amount}&assetID=${assetID}${
      transactionID ? `&transactionID=${transactionID}` : ''
    }`,
    {},
    {},
    true
  );
};

export const getPreVerifiedUPI = async () => {
  return fetchAPI('/v3/orders/upi-details', {}, {}, true);
};
