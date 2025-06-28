import React from 'react';
import Pagination from '@mui/material/Pagination';

// components
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';

// styles
import styles from './MyHoldings.module.css';

type props = {
  activePage?: number;
  totalPages?: number;
  totalEntries?: number;
  handlePageChange?: (event: React.ChangeEvent<unknown>, page: number) => any;
};

const MyHoldingsPagination = ({
  activePage = 1,
  totalPages = 1,
  totalEntries = 0,
  handlePageChange,
}: props) => {
  const isMobile = useMediaQuery();
  return (
    <div
      className={`${styles.Pagination} flex`}
      data-testid="MyHoldingsPagination"
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

export default MyHoldingsPagination;
