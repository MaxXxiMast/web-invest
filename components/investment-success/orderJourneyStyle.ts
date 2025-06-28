import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

export const classes: any = getObjectClassNames({
  orderJourneytitle: {
    fontWeight: 700,
    fontSize: 20,
    color: '#282C3F',
    [mediaQueries.nonPhone]: {
      marginBottom: 20,
    },
    [mediaQueries.phone]: {
      marginLeft: 20,
      fontSize: 18,
    },
  },
  stepLabelRoot: {
    [mediaQueries.phone]: {
      flexDirection: 'row !important',
      position: 'relative',
    },
  },
  stepLabel: {
    [mediaQueries.phone]: {
      marginTop: 'unset !important',
      padding: '6px 0px',
    },
  },
  stepRoot: {
    [mediaQueries.phone]: {
      marginTop: 'unset',
      width: 'calc(100% - 11px )',

      '&::before': {
        borderLeft: '1px dashed #E3E3E3',
        position: 'absolute',
        content: "''",
        top: -13,
        left: 9,
        height: 47,
      },
    },
  },
  completedStepRoot: {
    [mediaQueries.phone]: {
      '&::before': {
        borderLeft: '1px dashed #02c988 !important',
        position: 'absolute',
        content: "''",
        top: 0,
        left: 9,
        height: 0,
      },
    },
  },
});
