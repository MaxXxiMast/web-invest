import { useEffect, useState } from 'react';

// components
import Skeleton from '../Skeleton';
import NoData from '../../common/noData';
import Table from '../../primitives/Table';
import MyHoldingsLink from '../MyHoldingsLink';
import GripSelect from '../../common/GripSelect';
import SearchBox from '../../primitives/SearchBox/SearchBox';
import PortfolioFilter from '../../portfolio-investment/PortfolioFilter';
import MyTransactionsPagination from '../Pagination';
import LLPTransactions from '../LLPTransactions';

// Utils
import { getTableHeaders } from './utils';
import { dealTypeOptions } from '../utils';
import { trackEvent } from '../../../utils/gtm';

// types
import { MyTransactions, MyTransactionsCount } from '../types';

// styles
import styles from './MyTransactions.module.css';

type props = {
  loading?: boolean;
  transactions?: MyTransactions;
  activeProduct?: string;
  search?: string;
  totalOrders?: number;
  handleSearch?: (search: string) => void;
  handleProductChange?: (product: string) => void;
  transactionsCount?: MyTransactionsCount;
  page?: number;
  totalPages?: number;
  handlePageChange?: (event: any, page: number) => void;
  orderType?: string;
  handleOrderType?: (event: any) => void;
  tabLoading?: boolean;
};

const Desktop = ({
  loading = false,
  transactions = [],
  search = '',
  totalOrders = 0,
  handleSearch = () => {},
  activeProduct = 'Bonds',
  handleProductChange = () => {},
  transactionsCount = [],
  page = 1,
  totalPages = 1,
  handlePageChange = () => {},
  orderType = 'ALL',
  handleOrderType = () => {},
  tabLoading = false,
}: props) => {
  const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);
  const [hasFiredEvent, setHasFiredEvent] = useState(false);

  useEffect(() => {
    if (!hasFiredEvent && transactionsCount.length > 0) {
      const eventBody = transactionsCount.reduce((acc, product) => {
        acc[product?.id.toLocaleLowerCase()] = product.count;
        return acc;
      }, {});
      trackEvent('view_transactions_page', eventBody);
      setHasFiredEvent(true);
    }
  }, [transactionsCount, hasFiredEvent]);

  const renderTable = (orderType: string) => {
    if (loading || tabLoading) {
      return <Skeleton />;
    }
    if (transactions.length === 0) {
      return (
        <NoData
          header=""
          subHeader={'You have not made any transactions yet.'}
        />
      );
    }
    return (
      <Table
        rows={transactions}
        headers={getTableHeaders(activeProduct)}
        className={styles.Table}
      />
    );
  };

  const handleDownload = () => {
    setShowDownloadDrawer(true);
  };

  if (transactionsCount?.length === 0 && !tabLoading) {
    return (
      <NoData header="" subHeader={'You have not made any transactions yet.'} />
    );
  }

  return (
    <div
      className={`${styles.container} flex items-start`}
      id="MyTransactions"
      data-testid="MyTransactionsDesktop"
    >
      <div>
        <PortfolioFilter
          isMobile={false}
          isSticky={false}
          activeFilter={activeProduct}
          handleFilter={handleProductChange}
          productTypes={transactionsCount}
          parentId="#MyTransactions"
        />
        <MyHoldingsLink activeFilter={activeProduct} />
      </div>
      <div className={styles.tableContainer}>
        <div className={styles.header}>
          <h2>{activeProduct}</h2>
          {activeProduct !== 'Leasing & Inventory' ? (
            <div className={`flex ${styles.filter}`}>
              <SearchBox
                value={search}
                handleInputChange={handleSearch}
                placeHolder="Search.."
                className={styles.searchBox}
              />
              <GripSelect
                value={orderType}
                onChange={handleOrderType}
                options={dealTypeOptions}
                showScrollbar={true}
                showPlaceholder={false}
                placeholder="Select Deal Type"
                classes={{
                  formControlRoot: styles.formControlRoot,
                  root: styles.selectRoot,
                  select: styles.select,
                  selectMenuIcon: styles.selectMenuIcon,
                }}
              />
            </div>
          ) : (
            <div
              className={styles.TitleRightAllTransaction}
              onClick={handleDownload}
            >
              <span className={`icon-download ${styles.DownloadIcon}`} />
              <span className={`${styles.download}`}>
                {' '}
                Download Transactions
              </span>
            </div>
          )}
        </div>

        {activeProduct === 'Leasing & Inventory' ? (
          <LLPTransactions
            setShowDownloadDrawer={setShowDownloadDrawer}
            showDownloadDrawer={showDownloadDrawer}
          />
        ) : (
          <>
            {renderTable(orderType)}
            <MyTransactionsPagination
              activePage={page}
              totalPages={totalPages}
              totalEntries={totalOrders}
              handlePageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Desktop;
