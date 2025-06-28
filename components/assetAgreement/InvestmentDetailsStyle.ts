import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

export const classes: any = getObjectClassNames({
  defaultBottomMargin: {
    paddingBottom: '16px !important',
  },
  investmentOverviewContainer: {
    width: 416,
    padding: '66px 36px 28px 36px',
    marginTop: -50,
    borderRadius: 12,
    background: '#FFFFFF',
    border: '1px solid #F1F1F1',
    position: 'relative',
    [mediaQueries.nonDesktop]: {
      marginTop: 20,
      width: '100%',
      padding: '20px 10px 0px 10px',
    },
    [mediaQueries.desktop]: {
      border: '1px solid #F1F1F1',
    },
  },
  dematAccountContainer: {
    border: '1px solid var(--gripMercuryThree, #e6e6e6)',
    borderRadius: 12,
    padding: '26px 36px 12px 36px',
    background: '#FAFAFD',
    fontSize: 15,
    [mediaQueries.nonDesktop]: {
      width: '100%',
      marginTop: '-18px',
      padding: '26px 20px 12px 20px',
    },
  },
  preTaxBondContainer: {
    width: 'max-content',
  },
  preTaxBond: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '24px',
    color: '#555770',
  },
  preTaxBondImage: {
    width: 13,
    height: 13,
    marginLeft: 6,
    paddingTop: 6,
  },
  dematAccountText: {
    opacity: 0.6,
  },
  extraMargin: {
    marginTop: 40,
    [mediaQueries.phone]: {
      marginTop: 28,
    },
  },
  investmentSplit: {
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: 400,
    lineHeight: '24px',
    color: '#282C3F',
    marginLeft: 12,
    [mediaQueries.phone]: {
      fontSize: 14,
    },
  },
  label: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '24px',
    color: '#555770',
  },
  postTaxContainer: {
    padding: '0px 12px 0px 12px',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    width: '108%',
  },
  preTax: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '24px',
    color: '#282C3F',
  },
  preTaxValue: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: '24px',
    color: '#282C3F',
  },
  aifPartnerContainer: {
    margin: '28px 0 0',
    flexDirection: 'column',
    [mediaQueries.phone]: {
      margin: '12px 0 0',
    },
  },
  image: {
    marginTop: 12,
    width: 66,
    height: 38,
    [mediaQueries.nonDesktop]: {
      width: 40,
      height: 24,
    },
  },
  sebiLabel: {
    color: '#A8A9BD',
    fontSize: 12,
    fontWeight: 400,
    lineHeight: '20px',
  },
  postTax: {
    padding: '12px 20px ',
    background: '#E5F1FF',
    borderRadius: 12,
    margin: '20px 0 0 0',
    width: '110%',
    [mediaQueries.phone]: {
      width: '100%',
    },
    '+ div': {
      marginTop: 20,
    },
  },
  divider: {
    height: 1,
    width: '120%',
    background: 'var(--gripWhiteLilac, #f7f7fc)',
    [mediaQueries.phone]: {
      width: '100%',
    },
  },
  walletTextContainer: { margin: '16px 0 0 0' },
  marginLeft: { marginLeft: 12 },
  bold: { fontWeight: 700, color: '#282C3F' },
  dividerNew: {
    borderTop: '1px solid #eaedf1',
    height: 1,
    width: '122%',
    marginTop: 16,
    [mediaQueries.phone]: {
      width: '115%',
    },
  },
  taxLine: {
    background: 'rgba(253, 172, 66, 0.1)',
    border: '1px solid #FDAC42',
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.03)',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '12px',
    lineHeight: '20px',
    fontWeight: 400,
    marginTop: 16,
    '> span': {
      fontWeight: 700,
    },

    alignItems: 'center',
    [mediaQueries.nonPhone]: {
      width: '110%',
    },
    [mediaQueries.phone]: {
      flexFlow: 'wrap',
      padding: '12px',
    },
  },
  margin: {
    marginTop: 16,
  },
  pretaxReturnSDIText: {
    fontSize: 14,
    lineHeight: '24px',
    fontFamily: 'var(--fontFamily)',
    fontWeight: 400,
    color: 'var(--gripLuminousGrey)',
  },
  pretaxReturnSDIAmount: {
    fontSize: 18,
    lineHeight: '24px',
    fontFamily: 'var(--fontFamily)',
    fontWeight: 700,
    color: 'var(--gripLuminousDark)',
  },
  pretaxReturnSDIContainer: {
    padding: '12px 20px',
    background: 'var(--gripLighterOne)',
    borderRadius: 12,
    [mediaQueries.nonPhone]: {
      width: '110%',
    },
    [mediaQueries.phone]: {
      marginTop: 12,
    },
  },
  noteText: {
    fontWeight: 700,
    lineHeight: '20px',
    fontSize: 12,
    color: 'var(--gripLuminousGrey)',
    marginRight: 8,
  },
  note: {
    fontWeight: 400,
    fontSize: 12,
    lineHeight: '20px',
    color: 'var(--gripLuminousGrey)',
  },
  noteContainer: {
    marginTop: 20,
    alignItems: 'baseline',
    [mediaQueries.nonPhone]: {
      width: 378,
    },
  },
  helperText: {
    fontSize: 12,
    lineHeight: '20px',
    color: 'var(--gripBlue)',
    textDecoration: 'underline',
    marginLeft: 8,
  },
  hyperLink: {
    textDecoration: 'underline',
    color: 'var(--gripBlue)',
    cursor: 'pointer',
  },
  bondNote: {
    marginRight: 10,
    fontWeight: '700',
    fontSize: 12,
    color: 'var(--gripLuminousGrey)',
  },
  bondNoteText: {
    fontWeight: 400,
    fontSize: 12,
    color: 'var(--gripLuminousGrey)',
  },
  preTaxInfoIcon: {
    width: '14px',
    padding: '7px 0px 0px 4px',
  },
});
