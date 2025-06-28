import { Pagination } from '@mui/material';
import { handleExtraProps } from '../../../utils/string';
import { ROWS_PER_PAGE } from '../../portfolio-summary/my-returns/ReturnsTable/constants';

type TablePaginationProps = {
  page?: number;
  totalCount: number;
  onPageChange: (pageNo: number) => void;
  rowsPerPage?: number;
  className?: string;
  siblingCount?: number;
};

export default function TablePagination({
  page = 1,
  totalCount,
  onPageChange,
  rowsPerPage = ROWS_PER_PAGE,
  className = '',
  siblingCount = 1,
}: TablePaginationProps) {
  const getPageNoSectionUI = () => {
    let pageFirstLimit = page * rowsPerPage - rowsPerPage + 1;
    let pageLastLimit = page * rowsPerPage;
    if (pageLastLimit > totalCount) {
      pageLastLimit = totalCount;
    }

    return (
      <span className="TextStyle2">
        {`Showing ${pageFirstLimit}-${pageLastLimit} from ${totalCount} entries`}
      </span>
    );
  };

  const tablePageCount = () => {
    return totalCount < rowsPerPage ? 1 : Math.ceil(totalCount / rowsPerPage);
  };

  const changePage = (event: any, pageNo: number) => {
    onPageChange(pageNo);
  };

  return (
    <div className={`TablePagination ${handleExtraProps(className)}`}>
      <div className={`PaginationLeft`}>{getPageNoSectionUI()}</div>
      <div className={`PaginationRight`}>
        <Pagination
          onChange={changePage}
          variant="outlined"
          shape="rounded"
          defaultPage={1}
          page={page}
          count={tablePageCount()}
          boundaryCount={1}
          siblingCount={siblingCount}
        />
      </div>
    </div>
  );
}
