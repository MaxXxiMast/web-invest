import React from 'react';
import styles from '../../styles/Referral/RefereeCard.module.css';

type Props = {
  data?: any;
  className?: any;
  iconBgColor?: any;
};

const RefereeCard = ({ data, className, iconBgColor = 'white' }: Props) => {
  return (
    <div className={`${styles.RefereeCard} ${className}`}>
      <div
        className={`${styles.CardIcon} Heading4 CardIcon`}
        style={{ backgroundColor: iconBgColor }}
      >
        {data.userName.split(' ')[0].charAt(0)}
        {data.userName.split(' ')[1].charAt(0)}
      </div>
      <div className={`${styles.CardDetails} CardDetails`}>
        <h3 className="Heading4">{data.userName}</h3>
        <p className={`TextStyle1 ${styles.EmailDetails}`}>{data.userEmail}</p>
      </div>
    </div>
  );
};

export default RefereeCard;
