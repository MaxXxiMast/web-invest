import { fetchAPI } from './strapi';

export const fetchLedger = (
  limit: number,
  skip: number,
  isSuccessfulStatus: number
) => {
  return fetchAPI(
    `/v3/ledger?limit=${limit}&skip=${skip}&showSuccessfulEntries=${isSuccessfulStatus}`,
    {},
    {},
    true
  );
};
