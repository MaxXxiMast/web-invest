import React from 'react';
import styles from '../../styles/Referral/StatusTag.module.css';
type Props = {
  status?: any;
  className?: any;
};
const StatusTag = ({ status, className }: Props) => {
  return (
    <span
      className={`${styles.StatusTagClass} TextStyle2 ${status} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusTag;
