import { fetchAPI } from './strapi';
import {
  CreateNonRFQOrderBody,
  CreateRFQOrderBody,
  PaymentProcessingBody,
} from '../redux/types/rfq';

export const completeOrder = (data: any) => {
  return fetchAPI(
    `/v1/order/order-status`,
    {},
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true
  );
};

export const retryPayment = (transactionID: string) => {
  return fetchAPI(
    `/v1/order/retry/${transactionID}`,
    {},
    { method: 'POST' },
    true
  );
};

export const getDocumentInfo = (orderID: number | string) => {
  return fetchAPI(`/v2/order-documents/llp/esign/${orderID}`, {}, {}, true);
};

export const getResignDoc = (orderID: number | string) => {
  return fetchAPI(
    `/v1/order/create-resign-document`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        orderID,
      }),
    },
    true
  );
};

export const verifyOrderEsignDocs = (data: any) => {
  return fetchAPI(
    `/v2/order-documents/llp/verify-esign/${data.assetID}`,
    {},
    { method: 'POST', body: JSON.stringify(data) },
    true
  );
};

export const verifyOrderResignDocs = (data: any) => {
  return fetchAPI(
    `/v1/order/verify-resign-document`,
    {},
    { method: 'POST', body: JSON.stringify(data) },
    true
  );
};

export const getMCADocumentInfo = (orderID: string) => {
  return fetchAPI(`/v2/user-documents/mca/${orderID}`, {}, {}, true);
};

export const getLLpDocumentsByOrderID = (orderID: string) => {
  return fetchAPI(`/v2/user-documents/llp-documents/${orderID}`, {}, {}, true);
};

export const verifyMcaDocs = (data: any) => {
  return fetchAPI(
    `/v2/user-documents/verify-mca-esign`,
    {},
    { method: 'POST', body: JSON.stringify(data) },
    true
  );
};

export const fetchOrderData = (orderID: string) => {
  return fetchAPI(`/v1/order/${orderID}`, {}, {}, true);
};

const createOrder = (
  endpoint: string,
  params: CreateNonRFQOrderBody | CreateRFQOrderBody,
  sendFullErr: boolean
) => {
  return fetchAPI(
    endpoint,
    {},
    { method: 'POST', body: JSON.stringify(params) },
    true,
    false,
    false,
    {},
    true,
    sendFullErr
  );
};

export const createNonRFQOrder = (
  params: CreateNonRFQOrderBody,
  sendFullErr = false
) => {
  return createOrder(`/v3/orders/initiate`, params, sendFullErr);
};

export const createRFQOrder = (
  params: CreateRFQOrderBody,
  sendFullErr = false
) => {
  return createOrder(`/v3/orders/initiate`, params, sendFullErr);
};

export const createRFQOrderWithExchange = (params: PaymentProcessingBody) => {
  return fetchAPI(
    `/v3/orders/rfq/initiate`,
    {},
    { method: 'POST', body: JSON.stringify(params) },
    true,
    params?.showToast
  );
};

export const fetchUtrNumber = (transactionID: number | string) => {
  return fetchAPI(`/v3/orders/${transactionID}/utr`, {}, {}, true, false);
};

export const fetchOrderStatusTransaction = (transactionID: number | string) => {
  return fetchAPI(
    `/v3/orders/${transactionID}/rfq/status`,
    {},
    {},
    true,
    false
  );
};

export const fetchOrderTransactionDetails = (filter: string) => {
  return fetchAPI(`/v3/orders/rfq/transaction-details${filter}`, {}, {}, true);
};

export const fetchAmoTransactionDetails = (filter: string) => {
  return fetchAPI(`/v3/orders${filter}`, {}, {}, true);
};

export const fetchOrderDetails = (transactionID: number | string) => {
  return fetchAPI(
    `/v3/orders/rfq?txnID=${transactionID}&rfqFields=rfqID,tradeNumber`,
    {},
    {},
    true
  );
};

export const completeOrderCashfree = (orderID: string) => {
  return fetchAPI(
    `/v3/orders/${orderID}/update-status`,
    {},
    {
      method: 'POST',
    },
    true,
    false
  );
};

export const completeOrderFD = (orderID: string, params: any) => {
  return fetchAPI(
    `/v3/orders/${orderID}/update-status`,
    {},
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    true,
    false
  );
};

export const fetchHighestIrrAssetSuggestion = () => {
  return fetchAPI(`/v3/assets/suggestion`, {}, {}, true, false);
};

export const fetchOrderStatusPgTransaction = (
  transactionID: number | string
) => {
  return fetchAPI(
    `/v3/orders?transactionID=${transactionID}`,
    {},
    {},
    true,
    false
  );
};

export const fetchSellOrderData = (securityID: number | string) => {
  return fetchAPI(`/v3/orders/sell/${securityID}`, {}, {}, true, false);
};

export const fetchXirr = (securityID: number | string, units: string) => {
  return fetchAPI(
    `/v3/orders/sell/getxirr/${securityID}`,
    { units: Number(units) },
    {},
    true,
    false
  );
};

export const fetchMoreInfo = (securityID: number | string) => {
  return fetchAPI(`/v3/portfolio/my-holdings-info/${securityID}`, {}, {}, true);
};

export const fetchTransactionInfo = (orderID: number | string) => {
  return fetchAPI(
    `/v3/portfolio/my-transactions-info/${orderID}`,
    {},
    {},
    true
  );
};

export const placeSellOrder = (securityID: number, units: number) => {
  return fetchAPI(
    '/v3/orders/sell-order',
    {},
    {
      method: 'POST',
      body: JSON.stringify({ securityID, units }),
    },
    true,
    false
  );
};
