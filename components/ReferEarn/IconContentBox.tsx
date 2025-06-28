import React from 'react';
import { Image } from '../../design-systems/components';
import styles from '../../styles/Referral/IconContentBox.module.css';
import { useAppSelector } from '../../redux/slices/hooks';

type Data = {
  icon: any;
  stepNumber: number;
  title: string;
  description: string;
  amount?: any;
  id?: any;
  referralRuleKey?: string;
};

type Props = {
  data?: Data;
  className?: any;
  refereeMultiplier?: any;
  referralMultiplier?: any;
};

const IconContentBox = ({ data, className }: Props) => {
  const referralRules = useAppSelector((state) => state.referral.referralRules);

  return (
    <div className={`${styles.IconContentBox} ${className}`}>
      <div className={styles.Icon}>
        <Image
          src={data?.icon.src}
          alt={data?.title}
          width={120}
          height={120}
        />
      </div>
      <div className={`${styles.StepNumber} text-center`}>
        <span className={` TextStyle1`}>Step {data?.stepNumber}</span>
        <h3 className="Heading1">
          {data?.title} {data?.amount?.(referralRules, data.referralRuleKey)}
        </h3>
        <p className="Heading4">{data?.description}</p>
      </div>
    </div>
  );
};

export default IconContentBox;
