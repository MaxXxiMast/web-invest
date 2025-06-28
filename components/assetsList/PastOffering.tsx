import React from 'react';
import RoundArrowRight from '../../components/assets/static/assetList/RoundArrowRight.svg';
import Image from '../primitives/Image';
import styles from '../../styles/PastOffering.module.css';

type Props = {
  data?: any;
  className?: any;
  setActivePage?: () => void;
  tabValue: string;
};
export const PastOffering = ({
  data,
  className,
  setActivePage,
  tabValue,
}: Props) => {
  return (
    <div
      className={`${styles.PastOffering} ${className}`}
      style={{
        background: tabValue === 'Past Offers' ? '#E6FAF3' : '#d7f7ff',
      }}
    >
      <h3>
        Checkout all our {tabValue !== 'Past Offers' ? 'past' : 'active'}{' '}
        offerings
      </h3>
      <div className={`${styles.CardFooter} flex`} onClick={setActivePage}>
        <span>View Now</span>
        <span className={styles.ThumIcon}>
          <Image src={RoundArrowRight} alt="ThumbIcon" />
        </span>
      </div>
    </div>
  );
};

export default PastOffering;
