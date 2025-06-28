// File: ReferralRewardCard.tsx
import React from 'react';
import { Image } from '../../design-systems/components';
import styles from '../../styles/Referral/EarnMoreReward.module.css';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

type Data = {
  id?: string | number;
  icon: string;
  brokerage: number;
  productType: 'Baskets' | 'SDIs' | string;
};

type Props = {
  data?: Data;
  className?: string;
};

const getDescriptionText = (productType: string): string => {
  return productType === 'Baskets'
    ? 'Depending on the composition of the Baskets between Bonds/ SDIs, the brokerage amount is 0.5-1.0% of the investment amount.'
    : productType === 'SDIs'
    ? 'Sellers usually pay Grip a brokerage of 1.0% of the investment amount'
    : 'Sellers usually pay Grip a brokerage of 0.5% of the investment amount';
};

const ReferralRewardCard = ({ data, className }: Props) => {
  if (!data) return null;

  const { icon, productType } = data;

  return (
    <div className={`${styles.ReferralRewardCard} ${className}`}>
      <div className={styles.CardContainer}>
        <div className={styles.CardIcon}>
          <Image src={`${GRIP_INVEST_BUCKET_URL}${icon}`} alt="Referral Icon" />
        </div>
        <div className={styles.CardContent}>
          <h4>{productType}</h4>
          <ul className={styles.bulletPoints}>
            <li>{"100% of brokerage."}</li>
            <li>{getDescriptionText(productType)}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReferralRewardCard;
