import React from 'react';
import Pagination from '@mui/material/Pagination';

// utils
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// styles
import styles from './MyTransactions.module.css';

type props = {
  activePage?: number;
  totalPages?: number;
  totalEntries?: number;
  handlePageChange?: (event: React.ChangeEvent<unknown>, page: number) => any;
};

const MyTransactionsPagination = ({
  activePage = 1,
  totalPages = 1,
  totalEntries = 0,
  handlePageChange,
}: props) => {
  const isMobile = useMediaQuery();
  if (totalPages === 1) return null;
  return (
    <div
      className={`${styles.Pagination} flex`}
      data-testid="MyTransactionsPagination"
    >
      <span className={styles.PaginationText}>
        Showing {(activePage - 1) * 4 + 1}-
        {Math.min((activePage - 1) * 4 + 4, totalEntries)} from {totalEntries}{' '}
        entries
      </span>
      <Pagination
        onChange={handlePageChange}
        variant="outlined"
        shape="rounded"
        defaultPage={1}
        page={activePage}
        count={totalPages}
        siblingCount={isMobile ? 0 : 1}
        boundaryCount={1}
      />
    </div>
  );
};

export default MyTransactionsPagination;
