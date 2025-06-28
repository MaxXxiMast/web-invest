import React, { useEffect } from 'react';
import Pagination from '@mui/material/Pagination';
import RefereeCard from './RefereeCard';
import StatusTag from './StatusTag';
import styles from '../../styles/Referral/ReferralTable.module.css';

type TableData = {
  userName: string;
  userEmail: string;
  registerDate: string;
  status: string;
  nudge: string;
  nudgeType: string;
  refereeUserID: string | number;
};

type TableProps = {
  data: TableData[];
  rowsPerPage: number;
  headers: any[];
  className?: any;
  filter?: any;
};

const bgColors = [
  '#E5F1FF',
  '#E6FAF3',
  '#ECF2FF',
  '#F9FAF4',
  '#D7F7FF',
  '#FFEBEB',
];
const ReferralTable = ({
  data,
  rowsPerPage,
  headers,
  className,
  filter,
}: TableProps) => {
  const filtersToExclude = ['all', ''];
  const tableArr: TableData[] = filtersToExclude.includes(
    filter.toString().toLowerCase()
  )
    ? data
    : data.filter((item) => item.status === filter.toString().toLowerCase());
  const [page, setPage] = React.useState(1);
  const [tableData, setTableData] = React.useState(
    tableArr?.slice(0, rowsPerPage)
  );
  useEffect(() => {
    const tableData: TableData[] = filtersToExclude.includes(
      filter.toString().toLowerCase()
    )
      ? data
      : data.filter((item) => item.status === filter.toString().toLowerCase());
    setTableData(tableData?.slice(0, rowsPerPage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
    if (rowsPerPage > 0) {
      const newArr = tableArr?.slice(
        (newPage - 1) * rowsPerPage,
        (newPage - 1) * rowsPerPage + rowsPerPage
      );
      setTableData(newArr);
    }
  };

  function tablePageCount(totalCount: number, perPageItem: number) {
    return totalCount < perPageItem ? 1 : Math.ceil(totalCount / perPageItem);
  }

  return (
    <>
      <div className={`${className}`}>
        <table className={`${styles.ReferralTable} ${className}`}>
          <thead>
            <tr>
              {headers.map((item: any) => {
                return (
                  <th key={`item__${item}`} className="TextStyle2">
                    {item}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {tableData.map((item: any, index: number) => {
              return (
                <tr key={`item__${item}`}>
                  <td>
                    <RefereeCard data={item} iconBgColor={bgColors[index]} />
                  </td>
                  <td className="TextStyle1">{item.registerDate}</td>
                  <td>
                    <StatusTag status={item.status} />
                  </td>
                  <td className="TextStyle1">
                    <div className={styles.Nudge}>
                      {/* {item.nudgeType === 'text' ? (
                        <>{item.nudge}</>
                      ) : (
                        <>
                          <div
                            className={styles.NudgeLink}
                            onClick={() =>
                              dispatch(handleRemindNow(item?.refereeUserID))
                            }
                          >
                            <img
                              src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/referralDashboard/Nudge.svg`}
                              alt="Nudge"
                            />
                            <span className="TextStyle2">Nudge</span>
                          </div>
                        </>
                      )} */}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={styles.TablePagination}>
          <div className={styles.PaginationLeft}>
            <span className="TextStyle2">
              Showing {page}-{tablePageCount(tableArr.length, rowsPerPage)} from{' '}
              {tablePageCount(tableArr.length, rowsPerPage)} pages
            </span>
          </div>
          <div className={styles.PaginationRight}>
            <Pagination
              onChange={(event, val) => handleChangePage(event, val)}
              variant="outlined"
              shape="rounded"
              defaultPage={1}
              page={page}
              count={tablePageCount(tableArr.length, rowsPerPage)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferralTable;
