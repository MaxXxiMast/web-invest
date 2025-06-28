import React, { useEffect } from 'react';
import Pagination from '@mui/material/Pagination';
import Image from '../primitives/Image';
import dayjs from 'dayjs';
import { numberToCurrency } from '../../utils/number';
import { isMobile } from '../../utils/resolution';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../utils/string';
import NoData from '../common/noData';
import styles from '../../styles/Vault/TransactionHistory.module.css';

type Props = {
  data?: TableData[];
  className?: any;
  rowsPerPage?: number;
  handleDownload?: any;
  count?: number;
  changePage?: (e: any, page: number) => void;
  selectedPage?: number;
};

type TableData = {
  title: any;
  date: any;
  time: any;
  amount: any;
  type: any;
  transactionType: any;
  transactionStatus: any;
};

const cancelledStyleLable = ['cancelled', 'failed', 'user_dropped'];
const TransactionHistory = ({
  data,
  className = '',
  rowsPerPage = 10,
  handleDownload = () => {},
  count = 1,
  changePage,
  selectedPage,
}: Props) => {
  const [tableArr, setTableArr] = React.useState<any>([]);
  const [page, setPage] = React.useState<any>(1);
  const [tableData, setTableData] = React.useState<any>([]);

  useEffect(() => {
    setPage(selectedPage);
    setTableData(data);
    setTableArr(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className={`${styles.TransactionHistory} ${className}`}>
      <div className={styles.TitleSection}>
        <div className={styles.TitleLeft}>
          <h3 className="Heading2">Vault Usage History</h3>
        </div>
        <div
          className={`${styles.TitleRight} ${
            data?.length ? '' : styles.greyScale
          }`}
          onClick={handleDownload}
        >
          <span className={`icon-download ${styles.DownloadIcon}`} />
          <span
            className={`${styles.download} ${
              data?.length ? '' : styles.greyScale
            }`}
          >
            {' '}
            Download Vault Statement
          </span>
        </div>
      </div>

      {tableData.length ? (
        <div className={styles.TransactionHistoryTable}>
          <div className={styles.TransactionList}>
            <ul>
              {tableData.map((item) => {
                return (
                  <li key={`item_${item?.id}` || `item_${item?.type}`}>
                    <div className={styles.TransactionItem}>
                      <div className={styles.TransactionItemIcon}>
                        <div className={styles.ImageContainer}>
                          {item.type === 'credit' &&
                            item.subType !== 'vault_rewards' && (
                              <>
                                <Image
                                  src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}vault/CreditIcon.svg`}
                                  alt="Credited Amount"
                                />
                              </>
                            )}
                          {item.type === 'debit' && (
                            <>
                              <Image
                                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}vault/debit.svg`}
                                alt="Debit Amount"
                              />
                            </>
                          )}
                          {item.type === 'credit' &&
                            item.subType == 'vault_rewards' && (
                              <>
                                <Image
                                  src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}vault/GiftIcon.svg`}
                                  alt="Reward"
                                />
                              </>
                            )}
                        </div>
                      </div>
                      <div className={styles.TransactionItemDetails}>
                        <h4 className="Heading4">{item.reason}</h4>
                        <p className="TextStyle1">
                          {dayjs(item.transactionTime).format('DD MMM YYYY')}{' '}
                          {item.transactionTime
                            ? ` • ${dayjs(item.transactionTime).format(
                                'hh:mm A'
                              )}`
                            : ''}
                        </p>
                      </div>
                      <div className={styles.TransactionItemAmount}>
                        <span className={`Amount ${item.type}`}>
                          &#8377;{numberToCurrency(item.amount)}
                        </span>
                        {item.status !== 'confirmed' && (
                          <>
                            <br />
                            <span
                              className={`${
                                cancelledStyleLable.includes(item.status)
                                  ? 'CancelLabel'
                                  : 'HoldLabel'
                              }`}
                            >
                              {item?.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          {tableData.length && tableArr.length ? (
            <>
              <div className={styles.TablePagination}>
                <div className={styles.PaginationLeft}>
                  <span className="TextStyle2">
                    Showing {page}-{Math.floor(count / rowsPerPage) + 1} from{' '}
                    {Math.floor(count / rowsPerPage) + 1} pages
                  </span>
                </div>
                <div className={styles.PaginationRight}>
                  <Pagination
                    onChange={changePage}
                    variant="outlined"
                    shape="rounded"
                    defaultPage={1}
                    page={page}
                    count={Math.floor(count / rowsPerPage) + 1}
                    siblingCount={isMobile() ? 0 : 1}
                    boundaryCount={1}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <NoData header={'No Data'} subHeader={''} />
      )}
    </div>
  );
};

export default TransactionHistory;
