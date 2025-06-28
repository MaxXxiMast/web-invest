import { fetchAPI } from './strapi';

export const getSecret = (key: string) => {
  return fetchAPI(
    '/poQgjpmbbJsRfLNVPANsTLtW',
    {},
    {
      method: 'post',
      body: JSON.stringify({ key }),
    },
    true,
    true,
    false,
    {},
    false
  );
};