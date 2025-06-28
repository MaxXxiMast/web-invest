import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from './string';

export type Icons = 'Whatsapp' | 'Facebook' | 'Twitter' | 'Mail';

export const socialMediaDeskTop: Record<string, any> = {
  Whatsapp: {
    id: 501,
    src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/Whatsapp.svg`,
    label: 'Whatsapp',
  },
  Facebook: {
    id: 502,
    src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/Facebook.svg`,
    label: 'Facebook',
  },
  Twitter: {
    id: 503,
    icon: 'icon-twitter-x',
    label: 'Twitter',
  },
};

export const socialMediaMobile: Record<string, any> = {
  Mail: {
    id: 401,
    src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/EmailIcon.svg`,
    label: 'Mail',
  },
  Facebook: {
    id: 402,
    src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/Facebook.svg`,
    label: 'Facebook',
  },
  Twitter: {
    id: 403,
    icon: 'icon-twitter-x',
    label: 'Twitter',
  },
};
