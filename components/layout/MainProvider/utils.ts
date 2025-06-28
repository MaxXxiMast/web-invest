const allowSubRoutesWithoutLogin: any = [
  '/faq',
  '/invest',
  '/terms-and-conditions',
  '/external',
  '/gci',
];

export const checkInAllowedSubRoutesPlatform = (path: string) => {
  return allowSubRoutesWithoutLogin.some((el: string) => path.startsWith(el));
};

export const allowWithoutLogin = [
  '/',
  '/grip',
  '/login',
  '/about-us',
  '/verify-otp',
  '/signup',
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
  '/linkedin',
  '/gci-payment-processing',
  '/gci-postpayment-processing',
  '/gci/esign',
  '/obpp-processing',
  '/grip-icons',
  '/persona-results',
];

export const generateTempUserID = () => {
  let navigator_info = window.navigator;
  let screen_info = window.screen;
  let uid = navigator_info.mimeTypes.length.toString();
  uid += navigator_info.userAgent.replace(/\D+/g, '');
  uid += navigator_info.plugins.length;
  uid += screen_info.height || '';
  uid += screen_info.width || '';
  uid += screen_info.pixelDepth || '';
  uid += navigator_info.platform.replace(/\D+/g, '');
  let hash = 0;
  if (uid.length === 0) {
    return hash;
  }
  for (let i = 0; i < uid.length; i++) {
    let char = uid.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};
