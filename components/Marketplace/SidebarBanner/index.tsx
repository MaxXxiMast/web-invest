import React from 'react';

// components
import FerrisWheel from '../FerrisWheel';

// styles
import styles from './SidebarBanner.module.css';

const SidebarBanner = () => {
  return (
    <div className={styles.container}>
      <div className={styles.wheel}>
        <FerrisWheel />
        <p className={styles.text}>
          Discover Exclusive Deals by investors, for investors
        </p>
      </div>
    </div>
  );
};

export default SidebarBanner;
