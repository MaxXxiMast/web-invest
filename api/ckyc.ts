import { fetchAPI } from './strapi';

export const updateCkycStatus = () => {
  return fetchAPI('/v2/users/c-kyc', {}, {}, true, false);
};
