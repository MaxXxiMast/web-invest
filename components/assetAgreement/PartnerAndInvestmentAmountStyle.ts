import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

export const classes: any = getObjectClassNames({
  partnerContainer: {
    width: 384,
    borderRadius: 12,
    padding: 8,
    zIndex: 20,
    background: '#FFFFFF',
    [mediaQueries.nonDesktop]: {
      width: '100%',
      border: '1px solid var(--gripMercuryThree, #e6e6e6)',
    },
    [mediaQueries.desktop]: {
      border: '1px solid var(--gripMercuryThree, #e6e6e6)',
    },
  },
  partnerImage: {
    maxWidth: 100,
    maxHeight: 70,
    paddingTop: 0,
  },
  bondPartnerImage: {
    maxWidth: 84,
    maxHeight: 40,
    margin: 'auto',
  },
  partnershipText: {
    [mediaQueries.phone]: {
      paddingLeft: 8,
    },
    [mediaQueries.nonPhone]: {
      padding: '16px 0 0 8px',
    },
  },
  investmentImage: {
    width: 40,
    height: 40,
    marginLeft: -20,
    marginRight: 20,
    zIndex: 20,
  },
  investmentContainer: {
    padding: '14px 28px',
    borderRadius: 8,
    [mediaQueries.phone]: {
      padding: '26px 24px',
      width: '120%',
    },
  },
  investmentText: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '24px',
    color: '#555770',
  },
  investmentAmount: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: '28px',
    color: '#282C3F',
    alignSelf: 'center',
    whiteSpace: 'nowrap',
  },
  CardHeaderFlag: {
    alignSelf: 'center',
  },
  inventory: {
    background: 'var(--inventory)',
  },
  realEstate: {
    background: 'var(--realEstate)',
  },
  startupEquity: {
    background: 'var(--startupEquity)',
  },
  leasing: {
    background: 'var(--leasing)',
  },
  bonds: {
    background: 'var(--bonds)',
  },
  sdi: {
    background: 'var(--sdiSecondary)',
    padding: '14px 27px 14px 15px',
    marginRight: 2,
  },
  unitText: {
    fontSize: 12,
    lineHeight: '20px',
    marginTop: 4,
    color: '#555770',
  },
});
