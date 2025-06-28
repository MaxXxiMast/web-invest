export const mediaQueries = {
  xs: '@media (max-width: 420px)',
  sm: '@media (min-width: 421px) and (max-width: 767px)',
  small: '@media (max-width: 767px)',
  md: '@media (min-width: 768px) and (max-width: 991px)',
  lg: '@media (min-width: 992px) and (max-width: 1266px)',
  xl: '@media (min-width: 1267px) and (max-width: 1900px)',
  xxl: '@media (min-width: 1901px)',
  smallMobile: '@media (max-width: 360px)',
  phone: '@media (max-width: 767px)',
  tablet: '@media (min-width: 768px) and (max-width: 1024px)',
  smallTablet: '@media (min-width: 768px) and (max-width: 967px)',
  largeTablet: '@media (min-width: 968px) and (max-width: 1024px)',
  desktop: '@media (min-width: 1024px)',
  nonDesktop: '@media (max-width: 1024px)',
  nonPhone: '@media (min-width: 768px)',
  nonSmallTablet: '@media (min-width: 968px)',
  isSmallTablet: '@media (max-width: 967px)',
  largeDesktop: '@media (min-width: 1441px)',
  smallDesktop: '@media (min-width: 1200px) and (max-width:1439px)',
  iphone: '@media (min-width: 390px) and (max-width: 410px)',
  s20: '@media (min-width: 411px) and (max-width: 420px)',
};

export const gridMediaQueries = {
  xs: '@media (min-width: 0px)',
  sm: '@media (min-width: 421px)',
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 992px)',
  xl: '@media (min-width: 1267px)',
  xxl: '@media (min-width: 1901px)',
};

const gripGreen = {
  DEFAULT: '#00b8b7',
  LIGHTER: '#e8f1ed',
};

const darkBlue = {
  DEFAULT: '#0d1724',
};

const grey = {
  DEFAULT: '#b5b5b5',
};

const gray = {
  DEFAULT: 'gray',
};

export const colors = {
  DangerRed: '#a94442',
  FailureRed: '#d0021b',
  SuccessGreen: '#5fa60e',
  WarnYellow: '#ffae56',
  InfoBlue: '#33cde7',
  Default: '#68738b',
  GripBlue: '#00357c',
  LumiousGrey: '#555770',
  GreyExtra: 'var(--gripWhiteLilac, #f7f7fc)',
  LighterSeven: '#FFF7EC',
  LighterFour: '#f9faf4',
  GripLighter: '#F1ECFF',
  Water: '#D7F7FF',
  Honeydew: '#E6FAF3',
};

// Colors used in creating the overall theme of the component
export const themeColors = {
  primary: gripGreen,
  secondary: darkBlue,
  danger: colors.DangerRed,
  failure: colors.FailureRed,
  success: colors.SuccessGreen,
  warn: colors.WarnYellow,
  info: colors.InfoBlue,
  default: colors.Default,
  defaultColor: colors.Default, // Because sometimes default is a keyword (e.g. for button)
  grey,
  gray,
  gripBlue: colors.GripBlue,
  gripYellow: '#F29132',
  gripRed: '#FB5A4B',
  gripBlack: '#282C3F',
  gripGrey: '#686B78',
};

export const fontSizes = {
  xxxs: '9px',
  xxs: '11px',
  xxsPlus: '12px',
  xs: '14px',
  xsm: '16px',
  sm: '18px',
  md: '22px',
  lg: '28px',
  xl: '40px',
  xxl: '48px',
  xxxl: '64px',
  xxxxl: '70px',
};

export const fontWeights = {
  light: 100,
  regular: 300,
  normal: 400,
  semiBold: 500,
  bold: 600,
  ultraBold: 700,
  ultraMaxBold: 800,
  maxBold: 900,
};

export const getStylePlaceholder = (styles = {}) => {
  return {
    ...styles,
    [mediaQueries.xs]: {},
    [mediaQueries.sm]: {},
    [mediaQueries.md]: {},
    [mediaQueries.lg]: {},
    [mediaQueries.xl]: {},
    [mediaQueries.xxl]: {},
  };
};
