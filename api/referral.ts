import { fetchAPI } from './strapi';

export const fetchDashboardMetrics = () => {
  return fetchAPI(`/v1/referrals`, {}, {}, true);
};

export const sendReferralInvite = (data: any) => {
  return fetchAPI(
    `/v1/referrals/sendReferral`,
    {},
    { method: 'POST', body: JSON.stringify({ ...data }) },
    true
  );
};

export const sendReminder = (userId: string | number) => {
  return fetchAPI(
    `/v1/referrals/sendNudge`,
    {},
    { method: 'POST', body: JSON.stringify({ userIDs: [userId] }) },
    true
  );
};

export const redeem = () => {
  return fetchAPI(`/v1/referrals/redeem`, {}, { method: 'POST' }, true);
};

export const fetchLogsByUser = () => {
  return fetchAPI(`/v1/referrals/getTransactionHistory`, {}, {}, true);
};

export const fetchReferrralRules = () => {
  return fetchAPI(`/v1/referral/rule`, {}, {}, true);
};
