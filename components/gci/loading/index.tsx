import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

import classes from './styles.module.css';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

const GciLoading = () => {
  const isMobile = useMediaQuery('(max-width: 992px)');

  return (
    <div className={classes.progressContainer}>
      <CircularProgress
        variant="determinate"
        thickness={2.5}
        size={isMobile ? 50 : 72}
        style={{ position: 'absolute' }}
        classes={{
          colorPrimary: classes.greyBar,
        }}
        value={100}
      />
      <CircularProgress
        disableShrink
        size={isMobile ? 50 : 72}
        thickness={2.5}
        classes={{
          colorPrimary: classes.progressBar,
          circle: classes.progressLength,
        }}
        value={30}
      />
    </div>
  );
};

export default GciLoading;
