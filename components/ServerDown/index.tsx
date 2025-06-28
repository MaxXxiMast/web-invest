import React, { useEffect } from 'react';

// components
import Image from '../primitives/Image';

// utils
import { trackEvent } from '../../utils/gtm';
import { GripLogo } from '../../utils/constants';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

// styles
import styles from './ServerDown.module.css';

const ServerDown = () => {
  useEffect(() => {
    trackEvent('server_down');
  }, []);

  return (
    <div>
      <div className={`flex justify-center items-center ${styles.header}`}>
        <Image
          src={GripLogo}
          layout="fixed"
          width={90}
          height={31}
          alt="Grip Logo"
          title="Grip Invest: Best Alternative Investment Platform in India"
        />
      </div>
      <div
        className={`${styles.container} flex-column justify-center items-center`}
      >
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/under-maintainance.svg`}
          layout="fixed"
          width={150}
          height={150}
          alt="Grip Logo"
          title="Grip Invest: Best Alternative Investment Platform in India"
        />
        <h1 className={styles.title}>Under Maintenance</h1>
        <p className={styles.description}>
          We&apos;re working behind the scenes to improve your experience.
          Please come back shortly.
        </p>
      </div>
    </div>
  );
};

export default ServerDown;
