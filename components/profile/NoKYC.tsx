// NODE MODULES
import React from 'react';
import { useSelector } from 'react-redux';
import Cookie from 'js-cookie';
import { useRouter } from 'next/router';

// Utils
import { trackEvent } from '../../utils/gtm';

// Common Components
import Image from '../primitives/Image';
import Button from '../primitives/Button';

// Redux Slices
import { useAppDispatch } from '../../redux/slices/hooks';
import { setAccessDetails } from '../../redux/slices/access';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

// Styles
import styles from './NoKYC.module.css';

function NoKYC() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // GET UserID
  const { userID = '' } = useSelector(
    (state) => (state as any)?.user?.userData ?? {}
  );

  const handleOnClick = () => {
    Cookie.set('redirectTo', '/profile');
    dispatch(setAccessDetails({ selectedAsset: {} }));
    trackEvent('kyc_redirect', {
      page: 'profile',
      userID: userID,
      activeTab: 'nokyc',
    });
    router.push('/user-kyc');
  };

  return (
    <>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}icons/KycPendingProfile.svg`}
        layout={'fixed'}
        width={50}
        height={50}
        alt="No KYC"
      />
      <span className={styles.kycTitle}>
        {'Oops, please complete your KYC'}
      </span>
      <span className={styles.kycSub}>{'It will take just 60 seconds!'}</span>
      <div className={`${styles.actionContainer} ${styles.kycActionContainer}`}>
        <Button onClick={handleOnClick} className={styles.kycButton}>
          Let’s Do That
        </Button>
      </div>
    </>
  );
}

export default NoKYC;
