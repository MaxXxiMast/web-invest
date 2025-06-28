import React from 'react';
import RoundArrowRight from '../../components/assets/static/assetList/RoundArrowRight.svg';
import Image from '../primitives/Image';
import styles from '../../styles/PastOffering.module.css';

type Props = {
  data?: any;
  className?: any;
};
export const PastOffering = ({ data, className }: Props) => {
  return (
    <div
      className={`${styles.PastOffering} ${className}`}
      style={{
        background: '#D7F7FF',
      }}
    >
      <h3>Checkout all your past investments</h3>
      <div className={`${styles.CardFooter} flex`}>
        <span>View Now</span>
        <span className={styles.ThumIcon}>
          <Image src={RoundArrowRight} alt="ThumbIcon" />
        </span>
      </div>
    </div>
  );
};

export default PastOffering;
