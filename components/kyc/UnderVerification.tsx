import React, { useEffect } from 'react';

import LinearProgress from '@mui/material/LinearProgress';

import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';

import Image from '../primitives/Image';

const classes: any = getObjectClassNames({
  mainContainer: {
    background: '#E6FAF3',
    border: '1px solid #02C988',
    boxSizing: 'border-box',
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    padding: 16,
    width: '42%',
    [mediaQueries.phone]: {
      padding: '16px 16px 14px',
      width: '100%',
      position: 'absolute',
    },
  },
  mainMessage: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '28px',
    color: '#282C3F',
    [mediaQueries.phone]: {
      fontSize: 14,
      lineHeight: '24px',
    },
  },
  subMessage: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: '24px',
    color: '#555770',
    [mediaQueries.phone]: {
      fontSize: 10,
      lineHeight: '20px',
    },
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  linearProgress: {
    width: '100%',
    height: 2,
    '.MuiLinearProgress-barColorPrimary': {
      backgroundColor: '#00B8B7',
    },
  },
});

type MyProps = {
  name: string;
};

function UnderVerification(props: MyProps) {
  const { name } = props;
  const [progress, setProgress] = React.useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress > 100 ? 1000 : prevProgress + 20
      );
    }, 800);
    return () => clearInterval(timer);
  }, []);
  return progress < 100 ? (
    <div className={`flex ${classes.mainContainer}`}>
      <div className={classes.image}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}home-v2/under_verification_internal.svg`}
          alt={'under verification'}
        />
      </div>
      <div className='flex-column'>
        <div
          className={classes.mainMessage}
        >{`${name} Under Verification!`}</div>
        <div
          className={classes.subMessage}
        >{`${name} sent to internal team for verification`}</div>
        <LinearProgress
          variant="determinate"
          value={progress}
          className={classes.linearProgress}
        />
      </div>
    </div>
  ) : null;
}

export default UnderVerification;
