import { fetchAPI } from './strapi';

export const fetchUser = () => {
  const path = `/v3/users`;
  return fetchAPI(path, {}, {}, true, true, false, { 'x-api-version': 1.2 });
};

export const sendAltOtp = (data: any) => {
  const path = '/v3/users/alt-otp';
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

export const updateUserApi = (
  userID: string | number,
  data: any,
  newUser?: boolean
) => {
  const path = newUser ? '/v3/users/create-profile' : `/v1/users/${userID}`;
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

export const getUserKYCConsent = () => {
  const path = `/v2/users/kyc-details`;
  return fetchAPI(path, {}, {}, true);
};

export const getBankDetails = (userID: number | string) => {
  return fetchAPI(`/v1/users/bank/${userID}`, {}, {}, true);
};

export const getUserPortfolio = (type, limit, offset) => {
  return fetchAPI(
    `/v3/portfolio/my-investments?type=${type}&limit=${limit}&offset=${offset}`,
    {},
    {},
    true,
    true,
    false,
    { 'X-Api-Version': 1.2 }
  );
};

export const getUserPortfolioCategoryCount = () => {
  return fetchAPI(`/v3/portfolio/category-count`, {}, {}, true);
};

export const getCKYCDetails = () => {
  return fetchAPI(`/v3/users/ckyc`, {}, {}, true);
};

export const getUserNotifications = (userID: number | string) => {
  return fetchAPI(`/v1/users/${userID}/notifications`, {}, {}, true);
};

export const initateAgreementEsign = (formID: string, amount: number) => {
  return fetchAPI(
    `/v2/user-documents/agreement-pdfs?formID=${formID}&amount=${amount}`,
    {},
    {},
    true
  );
};

export const verifyAgreementEsign = (params: any) => {
  return fetchAPI(
    `/v2/user-documents/verify-esign`,
    {},
    {
      method: 'post',
      body: JSON.stringify(params),
    },
    true
  );
};

export const verifyAifAgreement = (params: any) => {
  return fetchAPI(
    `/v2/user-documents/verify-aif-agreement`,
    {},
    {
      method: 'post',
      body: JSON.stringify(params),
    },
    true
  );
};

export const getAifAgreements = () => {
  return fetchAPI(`/v2/user-documents/aif-agreements/`, {}, {}, true);
};

export const createAifAgreements = (params: any) => {
  return fetchAPI(
    `/v2/user-documents/create-${
      params.type === 'aif_agreement' ? 'aif' : 'anicut'
    }-agreement`,
    {},
    {
      method: 'post',
      body: JSON.stringify(params),
    },
    true
  );
};

export const fetchUserPreferences = (token: string) => {
  return fetchAPI(`/v3/users/preferences`, {}, {}, true);
};

export const fetchUserDetails = () => {
  return fetchAPI(`/v3/users/amo-details`, {}, {}, true);
};

export const fetchLeadOwnerDetails = (attributes) => {
  return fetchAPI(
    '/v3/users/lead-owner?attributes=' + attributes,
    {},
    {},
    true
  );
};

export const updateUserPreferences = (
  data: any,
  token: string,
  showtoast = true
) => {
  return fetchAPI(
    `/v3/users/preferences`,
    {},
    {
      method: 'put',
      body: JSON.stringify(data),
    },
    true,
    showtoast
  );
};

/**
 * Update KYC Details for user
 * @param params
 * @param kycType
 * @returns
 */
export async function addKyc(params: any, kycType: string) {
  const path = `/v1/kyc/add/${kycType}`;

  return fetchAPI(
    path,
    {},
    {
      method: 'post',
      body: JSON.stringify(params),
    },
    true
  );
}

/**
 *
 * @param assetStatus status of assets to fetch
 * @param dateRange date range of assets to fetch
 * @returns data from API
 */

export const getUserPortfolioSummary = (
  assetStatus: string,
  dateRange: string,
  upcomingReturnType: string,
  isDiscovery = false,
  financeProductType = ''
) => {
  const params: any = {
    status: assetStatus,
    dateRange,
    aggregateBy: upcomingReturnType,
    forDiscovery: isDiscovery,
    financeProductType,
  };
  return fetchAPI(`/v3/portfolio/summary`, params, {}, true);
};

export const verifyAIFOrderEsign = (params: any) => {
  return fetchAPI(
    '/v2/user-documents/verify-order-esign',
    {},
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    true
  );
};

export const generateDownloadStatementRequest = (data: any) => {
  const path = `/v2/users/statement`;
  return fetchAPI(
    path,
    {},
    {
      method: 'put',
      body: JSON.stringify(data),
    },
    true
  );
};

/**
 * Delete CMR doc
 * @param userID
 * @returns
 */
export async function deleteCMRDoc(type: string, userID: string | number) {
  const path = `/v1/kyc/delete/${userID}`;
  return fetchAPI(
    path,
    {},
    {
      method: 'post',
      body: JSON.stringify({ type }),
    },
    true
  );
}

export const addDepositoryAPI = (data: any) => {
  const path = `/v1/kyc/add/depository`;
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

export const moveInvestmentDocuments = (params: any) => {
  return fetchAPI(
    `/v2/order-documents/llp/update-documents/${params.assetID}`,
    {},
    {
      method: 'post',
      body: JSON.stringify(params),
    },
    true
  );
};

export const getUserUccStatus = () => {
  return fetchAPI(`/v3/users/ucc-status`, {}, {}, true);
};

export const addComment = (params: { comment: string; type: string }) => {
  return fetchAPI(
    `/v3/kyc/feedback`,
    {},
    {
      method: 'post',
      body: JSON.stringify({
        moduleName: params.type,
        issue: params.comment,
      }),
    },
    true
  );
};

export const fetchCommentsCount = () => {
  return fetchAPI(`/v3/kyc/feedback/count`, {}, {}, true, false);
};

type DebartmentDetails = {
  isDebarred: boolean;
  debarredDetails: {
    from: string;
    till: string;
    reason: string;
  };
};

export const fetchUserDebarmentDetails = (): Promise<DebartmentDetails> => {
  return fetchAPI(`/v3/users/debarred-details`, {}, {}, true, false);
};

export const escalatePaymentIssue = (transactionID: string) => {
  return fetchAPI(
    `/v3/misc/support-email`,
    {
      transactionID,
    },
    {
      method: 'post',
    },
    true
  );
};
