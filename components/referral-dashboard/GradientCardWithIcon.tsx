import React from 'react';
import styles from '../../styles/Referral/GradientCardWithIcon.module.css';
import Image from '../primitives/Image';

type ReferralCard = {
  icon: any;
  title: string;
  subTitle: string;
};

type Props = {
  data?: ReferralCard;
  className?: any;
};

const GradientCardWithIcon = ({ data, className }: Props) => {
  return (
    <div className={`${styles.ReferralCard} ${className}`}>
      <div className={styles.CardContent}>
        <div className={styles.CardIcon}>
          <Image 
            src={data?.icon} 
            alt={data?.subTitle}
            layout={'intrinsic'}
            width={23}
            height={23}
          />
        </div>
        <h3 className={`Heading1`}>{data?.title}</h3>
        <p className={`TextStyle1`}>{data?.subTitle}</p>
      </div>
    </div>
  );
};

export default GradientCardWithIcon;
