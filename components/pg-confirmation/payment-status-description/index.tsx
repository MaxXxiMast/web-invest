import React, { useContext } from 'react';

// context
import { PendingPgOrderContext } from '../../../pages/pg-confirmation';

// utils
import { paymentStatusDescription } from './utils';

// styles
import styles from './PaymentStatusDescription.module.css';

const PaymentStatusReason = () => {
  const { paymentStatus } = useContext(PendingPgOrderContext);

  if (!paymentStatus || ['success', 'awaited'].includes(paymentStatus))
    return null;

  const { heading, subHeading, id } = paymentStatusDescription[paymentStatus];

  return (
    <div className={styles.container}>
      <p className={styles.heading}>{heading}</p>
      <ul className={styles.listStyle}>
        {subHeading.map((text: string) => (
          <li key={'reasons_' + id}>{text}</li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentStatusReason;
