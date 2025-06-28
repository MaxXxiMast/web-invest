// utils
import { getStatus } from './utils';
// styles
import styles from './MyTransactions.module.css';

const OrderType = ({
  type = 'BUY',
  status = 'Pending',
  statusNumber = 0,
  transfer,
}) => {
  return (
    <div
      className="flex-column items-end"
      data-testid="MyTransactionsOrderType"
    >
      <span className={`${styles.type} ${type?.toLowerCase() || ''}`}>
        {type?.toLowerCase()}
        <span
          className={`${styles.dot} ${
            type === 'BUY' ? styles.buyDot : styles.sellDot
          }`}
        ></span>
      </span>

      {statusNumber === 1 && transfer ? (
        <span className={styles.status}>Order Settled</span>
      ) : (
        <span className={styles.status}>{getStatus(status, type)}</span>
      )}
    </div>
  );
};

export default OrderType;
