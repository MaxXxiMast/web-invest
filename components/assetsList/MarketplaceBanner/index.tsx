import React from 'react';

// components
import Image from '../../primitives/Image';

// utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// styles
import styles from './MarketplaceBanner.module.css';

const MarketplaceBanner = ({ className = '' }) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}icons/productive-time.svg`}
        width={52}
        height={52}
        layout="intrinsic"
      />
      <p className={styles.text}>
        Discover Exclusive Deals by investors, for investors
      </p>
      <a href="/marketplace" className={`flex items-center ${styles.link}`}>
        Go to Marketplace
        <span className={`icon-caret-right ${styles.rightArrow}`} />
      </a>
    </div>
  );
};

export default MarketplaceBanner;
