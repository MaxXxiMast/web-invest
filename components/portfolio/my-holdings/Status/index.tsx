import React from 'react';

// styles
import styles from './MyHoldings.module.css';

const Status = ({ status }) => {
  if (!status) {
    return null;
  }
  return (
    <div className={`flex justify-center`} data-testid="MyHoldingsStatus">
      <span className={` ${styles.status} ${status?.toLowerCase() || ''}`}>
        {status === 'Matured' ? 'Completed' : status}
      </span>
    </div>
  );
};

export default Status;
