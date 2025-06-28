import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

import Button from '../primitives/Button';
import Image from '../primitives/Image';

import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../utils/string';

import styles from '../../styles/Investment/Retry.module.css';

const Retry = (props: any) => {
  return (
    <div className={styles.MainContainer}>
      <div className={styles.Container}>
        <Image
          src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/retry.svg`}
          width={100}
          height={100}
          layout="fixed"
          alt="retry"
        />
        <span className={styles.errorHeading}>Sorry.....</span>
        <span className={styles.errorReason}>{props?.text}</span>
      </div>
      <div className={`${styles.Container}  ${styles.secondContainer}`}>
        {!props?.loadingRetry ? (
          <Button width={'max-content'} onClick={props.retryClick}>
            <div className={styles.buttonContainer}>
              Please Retry
              <Image
                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/forwardIcon.svg`}
                width={20}
                height={20}
                layout="fixed"
                alt="forwardIcon"
              />
            </div>
          </Button>
        ) : (
          <CircularProgress size={24} />
        )}
        <span className={styles.skipText} onClick={props?.gotoAssets}>
          Back to home
        </span>
      </div>
    </div>
  );
};

export default Retry;
