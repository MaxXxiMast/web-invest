import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

export const kycFormClasses: any = getObjectClassNames({
  uploadButton: {
    margin: 'unset',
    [mediaQueries.nonPhone]: {
      height: 60,
      width: '45%',
    },
    [mediaQueries.phone]: {
      height: '52px',
      padding: '14px 16px',
    },
  },
  arrowForward: {
    width: 15,
    height: 15,
    color: '#fff',
  },
  profilePhotoWrapper: {
    marginRight: 'unset',
  },
  Tooltip: {
    display: 'inline-block',
    verticalAlign: 'middle',
    width: 12,
    height: 12,
  },
  uploadProfileMainContainer: {
    borderRadius: '50%',
    margin: 'unset',
    justifyContent: 'center',
    border: 'none',
    boxShadow: 'unset',
    background: 'var(--gripWhiteLilac, #f7f7fc)',
    height: 140,
    maxWidth: 140,
    [mediaQueries.phone]: {
      height: 76,
      maxWidth: 76,
    },
  },
  imageContainerClass: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    [mediaQueries.phone]: {
      width: 32,
      height: 32,
    },
  },
  photoContainer: {
    [mediaQueries.nonPhone]: {
      width: '30%',
    },
    alignItems: 'flex-start',
  },
  photoText: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: '24px',
    color: '#282C3F',
    marginTop: 12,
    textAlign: 'center',
    width: '58%',
    [mediaQueries.phone]: {
      marginTop: 8,
      width: '75%',
    },
  },
  form: {
    width: '100%',
  },
  subTitlePresentForm: {
    marginTop: 32,
  },
  fields: {
    [mediaQueries.nonPhone]: {
      gap: 20,
    },
    [mediaQueries.phone]: {
      display: 'flex',
      flexDirection: 'column',
      rowGap: 20,
    },
  },
  fieldsContainer: {
    display: 'flex',
    [mediaQueries.phone]: {
      flexDirection: 'column',
    },
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '40%',
    height: 56,
    [mediaQueries.phone]: {
      width: '100%',
    },
  },
  radioTitle: {
    fontFamily: 'var(--fontFamily) !important',
    fontWeight: 700,
    fontSize: 14,
    lineHeight: '24px',
    color: '#282C3F',
  },
  radioButtonWrapper: {
    width: '100%',
    flexDirection: 'column',
  },
  radioButtonGroup: {
    flexDirection: 'row',
  },
  clickableText: {
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  title: {
    fontFamily: 'var(--fontFamily)',
    fontWeight: 600,
    fontSize: 18,
    lineHeight: '28px',
    color: '#282c3f',
    marginBottom: 20,
  },
  subTitle: {
    fontFamily: 'var(--fontFamily)',
    fontWeight: 600,
    fontSize: 18,
    lineHeight: '28px',
    color: '#282c3f',
    marginBottom: 20,
  },
  otherDetails: {
    [mediaQueries.nonPhone]: {
      flexDirection: 'column',
    },
  },
  selectwrapper: {
    [mediaQueries.phone]: {
      '>div': {
        paddingTop: 11.5,
        paddingBottom: 11.5,
        paddingLeft: 16,
      },
    },
  },
  selectLabel: {
    [mediaQueries.phone]: {
      top: '50%',
      transform: 'translateY(-50%)',
      left: 16,
    },
  },
  cameraIcon: {
    position: 'relative',
    left: 52,
    top: -30,
    [mediaQueries.nonPhone]: {
      left: 108,
      top: -40,
    },
  },
  afterUploadProfile: {
    height: 140,
    width: 140,
    [mediaQueries.phone]: {
      height: 76,
      width: 76,
    },
  },
  otherDetailsComponents: {
    width: '70%',
  },
  failedContainer: {
    alignItems: 'center',
    [mediaQueries.phone]: {
      marginBottom: 10,
    },
  },
  description: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: '24px',
  },
  descriptionWithTitle: {
    marginTop: '-16px',
  },
  HintData: {
    marginBottom: 20,
    marginTop: 0,
  },
  cmrFieldsPre: {
    marginRight: 'auto',
    [mediaQueries.desktop]: {
      maxWidth: 360,
      flexDirection: 'column',
    },
  },
  CMRForm: {
    justifyContent: 'space-between',
    [mediaQueries.phone]: {
      flexDirection: 'column',
    },
  },
  CMRPostUploadForm: {
    maxWidth: '360px',
    width: '100%',
    [mediaQueries.phone]: {
      maxWidth: '100%',
    },
  },
  CMRuploadBtn: {
    width: '100% !important',
  },
  hintTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    [mediaQueries.desktop]: {
      maxWidth: 360,
    },
    '> span': {
      color: '#00357C',
      textDecoration: 'underline',
      alignItems: 'center',
      cursor: 'pointer',
    },
  },
  FieldHintModal: {
    [mediaQueries.desktop]: {
      maxWidth: '400px !important',
    },
  },
  ErrorBottom: {
    display: 'flex',
    padding: '22px 12px 12px 12px',
    width: '100%',
    border: '1px solid var(--gripMercuryThree, #e6e6e6)',
    borderRadius: '0 0 8px 8px',
    justifyContent: 'center',
    gap: 12,
    borderTop: 'none',
    marginTop: -12,
    span: {
      '&:first-child': {
        fontWeight: 600,
      },
      '&:not(:first-child)': {
        color: 'var(--gripLuminousGrey)',
      },
      a: {
        color: 'var(--gripBlue)',
        textDecoration: 'underline',
      },
    },
    [mediaQueries.phone]: {
      flexDirection: 'column',
      gap: 4,
    },
  },
  BtnGrp: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    gap: 16,
    [mediaQueries.desktop]: {
      marginLeft: 67,
    },
    [mediaQueries.phone]: {
      marginTop: 6,
      gap: 8,
      flexDirection: 'column',
    },
  },
  CMLCardBtn: {
    [mediaQueries.phone]: {
      width: '100% !important',
    },
  },
  failedWrap: {
    marginTop: 0,
    height: 'auto',
    padding: 16,
    [mediaQueries.phone]: {
      padding: 12,
    },
  },
  BtnSepeator: {
    color: 'var(--gripLuminousGrey)',
  },
  failContent: {
    marginLeft: 8,
  },
  failTitle: {
    fontSize: 16,
    lineHeight: '28px',
    fontWeight: 600,
    [mediaQueries.phone]: {
      fontSize: 14,
      lineHeight: '20px',
    },
  },
  failSubTitle: {
    fontSize: 12,
    lineHeight: '20px',
    [mediaQueries.phone]: {
      fontSize: 11,
      lineHeight: '16px',
    },
  },
  circularProgress: {
    color: 'var(--gripBlue)',
    height: '20px',
    marginRight: 8,
  },
});
