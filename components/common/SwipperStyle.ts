import { mediaQueries, themeColors } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

export const sliderClasses: any = getObjectClassNames({
  sliderPagination: {
    display: 'flex',
    alignItems: 'center',
    width: 'unset !important',
    '& > span': {
      display: 'inline-block',
      padding: 2,
      backgroundColor: 'rgb(40 44 63 / 30%)',
      borderRadius: '50%',
      border: '2px solid #ffffff',
      cursor: 'pointer',
      transition: '0.3s ease-in-out',
    },
    '& > span + span': {
      marginLeft: 5,
    },
    [mediaQueries.nonPhone]: {
      justifyContent: 'center',
      zIndex: 2,
    },
  },
  navigationIcon: {
    width: 32,
    height: 32,
  },
  swiperButtons: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16.5,
    [mediaQueries.phone]: {
      marginBottom: 43,
    },
    [mediaQueries.nonPhone]: {
      marginTop: -20,
      gap: 70,
    },
  },
  swiperBullet: {
    width: 9,
    height: 9,
    margin: '0 2px !important',
    background: themeColors.gripBlack,
    opacity: 0.3,
    cursor: 'pointer',
  },
  swiperPaginationActiveBullet: {
    opacity: '1 !important',
    background: 'transparent',
    borderColor: `${themeColors.gripBlack} !important`,
    backgroundColor: 'unset !important',
  },
  buttonContainer: {
    cursor: 'pointer',
    [mediaQueries.nonPhone]: {
      zIndex: 20,
    },
  },
});
