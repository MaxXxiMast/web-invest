import { mediaQueries } from '../../utils/designSystem';
import { getObjectClassNames } from '../../utils/designUtils';

export const classes: any = getObjectClassNames({
  submitButton: {
    // Button Properties
    backgroundColor: '#00B8B7',
    borderRadius: 6,
    // Text properties
    cursor: 'pointer',

    '& .MuiButton-root': {
      backgroundColor: '#00B8B7',
    },

    [mediaQueries.phone]: {
      borderRadius: 6,
      fontSize: 14,
      lineHeight: 'unset',
      width: '50%',
    },
  },
  dialogButton: {
    ':hover': {
      backgroundColor: '#00B8B7',
    },
    [mediaQueries.phone]: {
      width: '90%',
    },
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 800,
    padding: '10px 14px',
    textTransform: 'capitalize',
    lineHeight: '16px',
    [mediaQueries.phone]: {
      padding: '10px 26px',
    },
  },
  specialHeadingText: {
    fontWeight: 800,
    color: '#282C3F',
    [mediaQueries.nonPhone]: {
      color: 'var(--gripEbonyClay, #292c3e)',
      lineHeight: '24px',
    },
    [mediaQueries.phone]: {
      lineHeight: '28px',
      fontSize: 20,
    },
  },
  dialogTitle: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #C4C4C4',
    padding: '32px 20px 20px 32px',
    '& .MuiTypography-root': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    [mediaQueries.phone]: {
      padding: '32px 20px 8px',
    },
  },
  consentMainDialog: {
    [mediaQueries.nonPhone]: {
      width: '80%',
    },
  },
  bottomActionsClass: {
    borderTop: '1px solid #C4C4C4',
    justifyContent: 'center',
    padding: '12px 0',
  },
  headingText: {
    [mediaQueries.phone]: {
      color: '#686B78',
      fontWeight: 400,
      fontSize: 12,
      lineHeight: '20px',
    },
  },
  drawerHeading: {
    borderBottom: '1px solid #EAEDF1',
    position: 'fixed',
    zIndex: 21,
    backgroundColor: '#fff',
    padding: '32px 20px 8px',
  },
  bottomDiv: {
    position: 'fixed',
    bottom: 0,
    boxShadow: '3px 4px 25px 0 rgba(0, 0, 0, 0.06)',
    border: 'solid 1px #eaedf1',
    padding: '15px 20px 32px',
    height: 115,
    width: '105%',
    justifyContent: 'center',
    backgroundColor: '#fff',
    zIndex: 21,
    marginLeft: -20,
  },
  investButton: {
    width: '-webkit-fill-available',
    minWidth: 155,
    maxWidth: 260,
    padding: '15px 31px',
    borderRadius: 6,
    zIndex: 22,
    backgroundColor: '#00b8b7',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: 900,
  },
  contentContainer: {
    height: 450,
    overflowY: 'scroll',
    padding: '12px 15px',
    position: 'relative',
    top: 90,
    marginBottom: 200,
    [mediaQueries.phone]: {
      '& > div > ol': {
        paddingInlineStart: 15,
      },
    },
  },
  mainDrawerClass: {
    [mediaQueries.phone]: {
      padding: 0,
      overflowY: 'hidden',
    },
  },
  topHeading: {
    fontWeight: 800,
    fontSize: 20,
    lineHeight: '28px',
    color: '#282C3F',
  },
  bottomHeading: {
    fontWeight: 400,
    fontSize: 12,
    lineHeight: '20px',
    color: '#686B78',
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
  },
  topDrawerClass: {
    marginTop: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: '24px',
    color: 'var(--gripEbonyClay, #292c3e)',
    [mediaQueries.phone]: {
      fontSize: 14,
    },
  },
  dialogContent: {
    [mediaQueries.nonPhone]: {
      padding: '20px 32px',
      '& > div > ol': {
        paddingInlineStart: 15,
      },
    },
  },
  removeTitleBorder: {
    borderBottom: 'unset',
  },
  headingIcon: {
    marginRight: 12,
  },
});
