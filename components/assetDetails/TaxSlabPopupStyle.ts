import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

export const classes: any = getObjectClassNames({
  dialogTitle: {
    padding: '24px 24px 32px 24px',
    '& .MuiTypography-root': {
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    [mediaQueries.phone]: {
      padding: '32px 20px 12px 20px',
    },
  },
  consentMainDialog: {
    borderRadius: 12,
    [mediaQueries.nonPhone]: {
      width: '400px',
    },
  },
  drawerHeading: {
    zIndex: 21,
    backgroundColor: '#fff',
    padding: '5px 0px 0px',
  },
  contentContainer: {
    padding: '32px 0px',
    position: 'relative',
  },
  bottomHeading: {
    fontWeight: 800,
    fontSize: 20,
    lineHeight: '20px',
    [mediaQueries.phone]: {
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '24px',
    },
  },
  bottomDrawerClass: {
    position: 'fixed',
    bottom: 4,
    zIndex: 30,
    marginBottom: 10,
  },
  closeContainerClass: {
    zIndex: 50,
    position: 'fixed',
    backgroundColor: '#fff',
    width: 'calc(100% - 30px)',
  },
  topDrawerClass: {
    marginTop: 0,
  },
  contentText: {
    lineHeight: '20px',
    color: '#686b78',
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 400,
  },
  dialogContent: {
    [mediaQueries.nonPhone]: {
      padding: '20px 24px',
      '& > div > ol': {
        paddingInlineStart: 15,
      },
    },
  },
  headerText: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '28px',
    alignSelf: 'flex-start',
    fontFamily: 'var(--fontFamily)',
  },
  noteText: {
    marginTop: 28,
    backgroundColor: 'rgba(253, 172, 66, 0.1);',
    fontSize: 12,
    padding: 12,
    lineHeight: '20px',
    fontWeight: 400,
    borderRadius: 12,
    border: '1px solid #FDAC42',
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.03)',
    [mediaQueries.phone]: {
      marginTop: 38,
    },
    fontFamily: 'var(--fontFamily)',
  },
});
