import {
  GRIP_INVEST_BUCKET_URL,
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
} from './string';

export const getEnv = (): 'development' | 'production' => {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
    return 'development';
  }
  return 'production';
};

export const getLibraryKeys = () => {
  return {
    gtm: 'GTM-59N75NB',
  };
};

export const innerPagesWithNav = [
  '/assets',
  '/referral',
  '/resources',
  '/chat',
  '/portfolio',
  '/vault',
  '/discover',
  '/gci-payment-processing',
  '/gci-postpayment-processing',
  '/rfq-payment-processing',
  '/marketplace',
];

export const innverPagesMobileWithFooter = ['/assets', '/referral'];
export const innerPagesMobileHeaderRouteNameMapping = {
  '/referral': 'Refer',
  '/assets': 'Invest',
  '/vault': 'Vault',
  '/portfolio': 'Portfolio',
  '/marketplace': 'Marketplace',
};

export const GripLogo = `${GRIP_INVEST_BUCKET_URL}commons/grip_logo.svg`;

export const GripBlogLogo = `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}/Blog_Logo_106b6532f7.svg`;

export const allowWithoutLogin = [
  '/',
  '/grip',
  '/about-us',
  '/terms-and-conditions',
  '/terms-and-conditions/experian',
  '/risk-terms',
  '/privacy-policy',
  '/faq',
  '/retry-payment',
  '/order-confirmation',
  '/payment-processing',
  '/partners',
  '/how-to-invest',
  '/referral',
  '/terms-and-conditions/escrow',
  '/terms-and-conditions/referral',
  '/raise-capital',
  '/transparency',
  '/grip-icons',
];

const hideFooterPages = [
  '/gci-payment-processing',
  '/gci-postpayment-processing',
  '/gci',
  '/rfq-payment-processing',
  '/payment-processing',
  '/demat-processing',
];

export const innerPagesWithoutNav = [
  '/rfq-payment-processing',
  '/user-kyc',
  '/payment-processing',
  '/persona-results',
  '/demat-processing',
];

export const persistRouteArr = [
  'assetdetails',
  'user-kyc',
  'kyc',
  'assetagreement',
];

export const pagesToShowTwoFA = [
  '/discover',
  '/assets',
  '/profile',
  '/portfolio',
  '/vault',
  '/auto-investment',
  '/preferences',
  '/referral',
  '/reward-history',
  '/referral-dashboard',
  '/my-transactions',
  '/login',
  '/verify-otp',
];

export const routesFornavigationToStickOnScroll = ['assetdetails'];

export const checkInAllowedSubRoutes = (path: string) => {
  return hideFooterPages.some((el: string) => path.startsWith(el));
};
