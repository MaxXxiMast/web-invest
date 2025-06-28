import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

export const classes: any = getObjectClassNames({
  buttonContainer: {
    marginTop: 32,
    width: '100%',
    [mediaQueries.phone]: {
      marginLeft: 0,
      padding: '8px 20px 24px 20px',
      background: '#FFFFFF',
      boxShadow: '0px -14px 94px rgba(0, 0, 0, 0.05)',
      width: '100%',
      position: 'fixed',
      bottom: 0,
      left: 0,
      borderTop: '1px solid  var(--gripWhiteLilac, #f7f7fc)',
    },
  },
  bondButtonContainer: {
    marginTop: '0px !important',
  },
  newOrderIcon: {
    width: 12,
    height: 12,
    marginLeft: 16,
    color: '#fff',
  },
  value: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: '28px',
    letterSpacing: '0em',
    textAlign: 'left',
    color: '#282C3F',
    whiteSpace: 'nowrap',
    [mediaQueries.phone]: {
      fontSize: 16,
    },
  },
  label: {
    color: '#555770',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '24px',
    whiteSpace: 'nowrap',
  },
  bottomText: {
    marginTop: 16,
    [mediaQueries.desktop]: {
      width: '100%',
    },
    color: '#555770',
    fontWeight: 400,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: '20px',
    '> a': {
      textDecoration: 'underline',
    },
  },
  rightContainer: { width: 'calc(50% - 75px)', padding: '32px 0' },
  dematAccountContainer: {
    border: '1px solid var(--gripMercuryThree, #e6e6e6)',
    borderRadius: 12,
    padding: '30px 36px 12px 36px',
    background: '#FAFAFD',
    marginTop: '-18px',
    fontSize: '15px',
    [mediaQueries.desktop]: {
      width: 416,
    },
  },
  dematAccountText: {
    opacity: 0.6,
  },
  gateWayLoaderContainer: {
    zIndex: 12,
    [mediaQueries.phone]: {
      position: 'fixed',
      bottom: 45,
    },
  },
  gatewayLoadingModal: {
    [mediaQueries.phone]: {
      height: '220px',
    },
  },
  gateWayLoader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 24,
  },
  gateWayLoaderText: {
    fontWeight: 700,
    fontSize: 20,
    margin: 'auto',
    color: '#282C3F',
    lineHeight: '28px',
    textAlign: 'center',
    [mediaQueries.desktop]: {
      width: '52%',
    },
    [mediaQueries.phone]: {
      width: '72%',
      fontSize: 18,
      lineHeight: '24px',
    },
  },
  mobileViewContainer: {
    [mediaQueries.phone]: {
      paddingBottom: 200,
      paddingTop: 20,
    },
  },
  paddingWallet: {
    padding: '12px 18px',
    border: '1px solid var(--gripMercuryThree, #e6e6e6)',
    borderRadius: 12,
  },
  marginLeft: { marginLeft: 12 },
  bold: { marginLeft: 4, fontWeight: 700, color: 'var(--gripLuminousDark)' },
  phoneStickyButton: {
    margin: '10px 0 0 0',
  },
  redirectionNoticeContainer: {
    background: 'var(--yellowOrangeAlpha)',
    padding: '10px',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '11px',
    marginTop: '20px',
    [mediaQueries.desktop]: {
      marginBottom: '10px',
    },
    [mediaQueries.phone]: {
      marginTop: '20px',
    },
  },
  redirectionNoticeText: {
    color: 'var(--gripLuminousDark)',
    fontSize: '12px',
    fontWeight: 400,
    paddingRight: '10px',
    marginLeft: '16px',
  },
  eSignPending: {
    marginLeft: '16px',
  },
});
