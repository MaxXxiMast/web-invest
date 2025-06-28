import { fetchAPI } from './strapi';

export const fetchWalletDetails = () => {
  return fetchAPI(`/v1/wallet`, {}, {}, true);
};

export const initiateWalletTxn = (
  amount: number,
  reason: string,
  userID: number
) => {
  return fetchAPI(
    `/v1/wallet/add`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        amount,
        reason,
        userID,
      }),
    },
    true
  );
};

export const retryWalletTxn = (transactionID: string) => {
  return fetchAPI(
    `/v1/wallet/retry/${transactionID}`,
    {},
    { method: 'POST' },
    true
  );
};

export const updateWallet = (obj: any) => {
  return fetchAPI(
    `/v1/wallet/update`,
    {},
    { method: 'POST', body: JSON.stringify(obj) },
    true
  );
};

export const withdrawAmount = (amount: number) => {
  return fetchAPI(
    `/v1/wallet/withdraw`,
    {},
    {
      method: 'POST',
      body: JSON.stringify({
        amount,
      }),
    },
    true
  );
};

export const downloadVaultRewards = (id: string) => {
  return fetchAPI(`/v1/interest/download?id=${id}`, {}, {}, true);
};

export const fetchWalletTransactions = (page?: number) => {
  page = page || 0;
  return fetchAPI(
    `/v2/wallet-transaction/transactions?page=${page}`,
    {},
    {},
    true
  );
};
