import axios from 'axios';
import { fetchAPI } from './strapi';

export const fetchAssets = (filters?: {
  visibility?: number;
  status?: 'active' | 'upcoming' | 'past';
  recordCount?: number;
  marketPlace?: number;
}) => {
  return fetchAPI('/v3/assets', filters || {}, {}, true);
};

export const fetchAsset = (assetID: number | string) => {
  return fetchAPI(`/v3/assets/${assetID}`, {}, {}, true);
};

export const paymentScheduleData = (
  amount: number | string,
  assetID: number,
  isPreTax: boolean,
  investmentDate?: string
) => {
  const investmentDateparam = investmentDate
    ? `&investmentDate=${investmentDate}`
    : '';
  return fetchAPI(
    `/v3/assets/${assetID}/repaymentMetrics/data?amount=${amount}&isPreTax=${isPreTax}${investmentDateparam}`,
    {},
    {},
    true,
    true,
    false
  );
};

export const fetchVisualReturnData = (
  lotSize: number | string,
  assetID: number,
  isPreTax: boolean,
  format: string
) => {
  const blob = ['excel', 'pdf'].includes(format);
  return fetchAPI(
    `/v3/assets/repaymentmetric?assetID=${assetID}&lotSize=${lotSize}&format=${format}&isPreTax=${isPreTax}`,
    {},
    {},
    true,
    true,
    blob
  );
};

export const fetchVisualReturnFdData = ({
  payoutFrequency,
  assetID,
  investmentAmount,
  tenure,
  seniorCitizen,
  womenCitizen,
  format,
  signal = {},
}) => {
  const blob = format === 'pdf';
  return fetchAPI(
    `/v3/assets/fd/${assetID}/repaymentMetrics/${format}?investmentAmount=${investmentAmount}&tenure=${tenure}&payoutFrequency=${payoutFrequency}&seniorCitizen=${seniorCitizen}&womenCitizen=${womenCitizen}`,
    {},
    {
      signal,
    },
    true,
    false,
    blob
  );
};

export const fetchVisualReturnFdDataRedux = ({
  payoutFrequency,
  assetID,
  investmentAmount,
  tenure,
  seniorCitizen,
  womenCitizen,
  format,
}) => {
  const blob = format === 'pdf';
  return fetchAPI(
    `/v3/assets/fd/${assetID}/repaymentMetrics/${format}?investmentAmount=${investmentAmount}&tenure=${tenure}&payoutFrequency=${payoutFrequency}&seniorCitizen=${seniorCitizen}&womenCitizen=${womenCitizen}`,
    {},
    {},
    true,
    false,
    blob
  );
};

export const fileDownloadHandler = (apiUrl: string) => {
  return fetchAPI(apiUrl, {}, {}, true, false, true);
};

export const fetchScheduleOfPayment = (
  assetID: number | string,
  orderID?: string
) => {
  let url = `/v3/portfolio/${assetID}/repayment-schedule`;
  if (orderID) url = url + `?orderID=${orderID}`;
  return fetchAPI(url, {}, {}, true);
};

export function getOneTimeAgreements(spvType: number) {
  return fetchAPI(`/v2/spvs/aif-documents/${spvType}`, {}, {}, true);
}

export const fetchDiscoveryAsset = (
  userID: number | string,
  sectionKeys: string
) => {
  if (userID) {
    return fetchAPI(
      `/v3/assets/discovery?sections=${sectionKeys}&userID=${userID}`,
      {},
      {},
      true
    );
  } else {
    return null;
  }
};

export const fetchDiscoveryAssetsMoe = (
  userId: number | string,
  sectionKeys: string[]
) => {
  return axios.post(
    'https://sdk-03.moengage.com/v1/experiences/fetch',
    {
      identifiers: {
        customer_id: userId.toString(),
      },
      experience_key: sectionKeys,
    },
    {
      headers: {
        Authorization:
          'Basic S05FVFFFRDFWRjYxWVhORDhBRDhaU0ZROjRpTXdleWo5aXFVaWpKTEJzVFNLVk5pUg==',
        'MOE-APPKEY': 'KNETQED1VF61YXND8AD8ZSFQ',
      },
    }
  );
};

export const fetchPastAsset = (assetID: number | string) => {
  return fetchAPI(
    `/v3/assets/past/details/${assetID}`,
    {},
    {},
    true,
    false,
    false,
    {},
    false
  );
};

export const fetchTransactionsPortfolio = (
  assetID: number | string,
  orderStatus: number[]
) => {
  const query = orderStatus.join(',');
  return fetchAPI(`/v3/assets/${assetID}/orders?status=${query}`, {}, {}, true);
};

export const handleAssetCalculation = async (
  assetID: number | string,
  lotSize?: number
) => {
  return fetchAPI(
    `/v3/assets/${assetID}/header-calculation${
      lotSize && !isNaN(lotSize) ? `?amount=${lotSize}` : ''
    }`,
    {},
    {},
    true,
    false
  );
};

export const fetchDematAccInformation = async (assetID: number | string) => {
  return fetchAPI(
    `/v3/kyc/status?assetID=${assetID}&kycTypeFilter=depository`,
    {},
    {},
    true,
    false
  );
};

export const fetchDematAccInformationWithoutAssetID = async () => {
  return fetchAPI(
    `/v3/kyc/status?kycTypeFilter=depository`,
    {},
    {},
    true,
    false
  );
};

export const getFdMetadata = async (assetID: number | string) => {
  return fetchAPI(
    `/v3/assets/fd/${assetID}/calculation-metadata`,
    {},
    {},
    true,
    false
  );
};

export const fetchFDGraphData = async ({
  assetID,
  women,
  seniorCitizen,
  interestPayout,
}) => {
  return fetchAPI(
    `/v3/assets/fd/${assetID}/calculation`,
    {
      women,
      seniorCitizen,
      interestPayout,
    },
    {},
    true,
    false
  );
};

export const createFixerraUser = async () => {
  return fetchAPI(
    `/v3/users/create-fixerra-user`,
    {},
    { method: 'POST' },
    true,
    false
  );
};

export type OrderInitateBody = {
  assetID: number;
  amount: number;
  tenure: number;
  payout: string;
  isSeniorCitizen: boolean;
  isWomen: boolean;
  interestRate: number;
  maturityDate: string;
};

export const createFixerraOrderInitiate = async (body: OrderInitateBody) => {
  return fetchAPI(
    `/v3/orders/initiate`,
    {},
    { method: 'POST', body: JSON.stringify(body) },
    true,
    false
  );
};
