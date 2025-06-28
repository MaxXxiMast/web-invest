import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

export const classes: any = getObjectClassNames({
  mobileHeaderContainer: {
    padding: '100px 0px 20px 0px',
    [mediaQueries.desktop]: {
      maxWidth: '1250px',
    },
    [mediaQueries.phone]: {
      background: '#FFFFFF',
      boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.08)',
      padding: '16px 15px',
      position: 'sticky',
      top: 0,
      zIndex: 500,
    },
  },
  pointer: {
    cursor: 'pointer',
    zIndex: 2,
  },
  heading: {
    color: 'var(--gripLuminousDark)',
    fontSize: 28,
    lineHeight: '40px',
    fontWeight: 700,
    [mediaQueries.desktop]: {
      marginLeft: 12,
    },
    [mediaQueries.nonDesktop]: {
      fontSize: 18,
      lineHeight: '24px',
      marginLeft: 10,
      width: '100%',
      zIndex: 1,
    },
  },
  line: {
    borderBottom: '1px solid  #EAEDF1',
  },
});
