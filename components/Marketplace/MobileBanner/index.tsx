// components
import FerrisWheel from '../FerrisWheel';

// styles
import styles from './MobileBanner.module.css';

const MobileBanner = () => {
  return (
    <div className={`flex-column items-center ${styles.container}`}>
      <FerrisWheel />
      <p className={styles.text}>
        Discover Exclusive Deals by investors, for investors
      </p>
    </div>
  );
};

export default MobileBanner;
