import { fetchAPI } from './strapi';

export const getKYCTypes = () => {
  return fetchAPI('/v3/kyc/kyc-types', {}, {}, true);
};

export const getSpvDetails = () => {
  return fetchAPI('/v2/spv-details', {}, {}, true);
};
