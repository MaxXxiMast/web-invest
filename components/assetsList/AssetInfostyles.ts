import { getObjectClassNames } from '../utils/designUtils';
import { mediaQueries } from '../utils/designSystem';

export const classes: any = getObjectClassNames({
  value: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: '28px',
    color: '#282C3F',
    textAlign: 'center',
    textTransform: 'capitalize',
    [mediaQueries.xs]: {
      fontWeight: 600,
      fontSize: 16,
      lineHeight: '24px',
    },
  },
  label: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '24px',
    color: '#555770',
    textAlign: 'center',
    [mediaQueries.xs]: {
      fontSize: 12,
      lineHeight: '20px',
    },
  },
  assetInfo: {
    minHeight: 60,
    marginRight: 16,
    [mediaQueries.nonPhone]: {
      marginRight: 0,
    },
    [mediaQueries.phone]: {
      '&:last-child': { marginRight: 0 },
    },
  },
  modalText: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '24px',
    textDecoration: 'underline',
    color: 'var(--gripBlue)',
    [mediaQueries.phone]: {
      fontSize: 12,
      lineHeight: '18px',
    },
    cursor: 'pointer',
  },
});
