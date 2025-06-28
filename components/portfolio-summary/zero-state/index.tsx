import React from 'react';
import { useRouter } from 'next/router';
import Button, { ButtonType } from '../../primitives/Button';
import { useAppSelector } from '../../../redux/slices/hooks';

import styles from './ZeroState.module.css';

const ZeroState = () => {
  const router = useRouter();

  const isKYCCompleted = useAppSelector(
    (state) => state.user.kycConfigStatus?.default?.isFilteredKYCComplete
  );
  const isKycPending = !isKYCCompleted;

  const handleRedirection = () => {
    const url = isKycPending ? '/user-kyc' : '/assets';
    router.push(url);
  };

  return (
    <div
      className={`flex-column justify-center items-center ${styles.zeroContainer}`}
    >
      <div className={styles.overlayLogo}>
        <span className={`icon-lock ${styles.Lock}`} />
      </div>

      <h3 className={styles.title}>Start Your Investment Journey!</h3>
      <Button variant={ButtonType.Primary} onClick={handleRedirection}>
        {isKycPending ? 'Proceed to KYC' : 'Explore Deals'}
      </Button>
    </div>
  );
};

export default ZeroState;
