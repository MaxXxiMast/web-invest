import { fetchAPI } from './strapi';

export const validateTwoFADOB = () => {
  return fetchAPI(`/v3/users/2fa`, {}, {}, true, false);
};
