// components
import Header from '../../components/common/Header';
import MyTransactions from '../../components/my-transactions';

// styles
import styles from './MyTransactions.module.css';

const TransactionsPage = () => {
  return (
    <div>
      <Header
        pageName="My Transactions"
        hideLine={true}
        className={styles.header}
      />
      <div className="containerNew">
        <MyTransactions />
      </div>
    </div>
  );
};

export default TransactionsPage;
