import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

export const classes: any = getObjectClassNames({
  dialogWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    [mediaQueries.phone]: {
      padding: 16,
      height: '80%',
    },
    [mediaQueries.nonPhone]: {
      height: 'auto',
      minHeight: 150,
      width: 450,
    },
  },
  dialogIcon: {
    height: 72,
    width: 72,
    marginBottom: 36,
  },
  dialogMainTitle: {
    fontWeight: 700,
    fontSize: 20,
    lineHeight: '28px',
    color: '#282C3F',
    marginBottom: 8,
  },
  dialogSubHeading: {
    fontWeight: 400,
    fontSize: 12,
    lineHeight: '20px',
    color: '#686B78',
    textAlign: 'center',
    marginBottom: 32,
    [mediaQueries.phone]: {
      marginBottom: 32,
    },
    [mediaQueries.nonPhone]: {
      width: '80%',
    },
  },
  submitButtonText: {
    minWidth: '352px',
  },
  specialHeadingText: {
    fontWeight: 600,
    color: '#282C3F',
  },
  textButton: {
    fontWeight: 800,
    fontSize: 14,
    color: '#00357C',
    lineHeight: '14px',
    cursor: 'pointer',
    marginBottom: 20,
  },
  dialogDetailsContainer: {
    [mediaQueries.nonPhone]: {
      minHeight: 244,
      minWidth: 400,
      marginTop: 0,
    },
  },
  modalContentClass: {
    width: 'auto',
    img: {
      marginBottom: 28,
    },
  },
  connectNow: {
    [mediaQueries.nonPhone]: {
      margin: '0px 0px 32px 0px',
    },
    maxWidth: 'fit-content',
    cursor: 'pointer',
  },
});
