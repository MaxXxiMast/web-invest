import { PaymentProcessingBody } from '../redux/types/rfq';
import { UPI_POLLING_INTERVAL_IN_SECONDS } from '../utils/rfq';
import { fetchAPI } from './strapi';

export const fetchMarketTiming = () => {
  return fetchAPI('/v3/rfq/market/timings', {}, {}, true);
};

export const getPendingOrdersRfq = (filter = '') => {
  return fetchAPI(`/v3/orders/pending${filter}`, {}, {}, true);
};

export const getRFQPaymentProcessingURL = async (
  transactionID: string,
  showToast: boolean = true
) => {
  return fetchAPI(
    `/v3/orders/rfq/payment`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        transactionID: transactionID,
      }),
    },
    true,
    showToast
  );
};

export const retryRFQPayment = async (body: PaymentProcessingBody) => {
  return fetchAPI(
    `/v3/orders/rfq/retry-payment`,
    {},
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    true
  );
};

export const updateUTRForTransaction = async (
  transactionID: string,
  data: {}
) => {
  return fetchAPI(
    `/v3/orders/${transactionID}/utr`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        ...data,
      }),
    },
    true
  );
};

export const getUPIApprovalStatus = async (transactionID: string) => {
  return fetchAPI(
    `/v3/orders/${transactionID}/rfq/upi-status?poolMaxTime=${UPI_POLLING_INTERVAL_IN_SECONDS}&poolAttemptDelay=5`,
    {},
    {},
    true,
    false
  );
};
