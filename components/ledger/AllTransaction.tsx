import dayjs from 'dayjs';
import Pagination from '@mui/material/Pagination';
import { useRouter } from 'next/router';
import Cookie from 'js-cookie';
import NoData from '../common/noData';
import Image from '../primitives/Image';
import { numberToCurrency } from '../../utils/number';
import { isMobile } from '../../utils/resolution';
import { ButtonType } from '../primitives/Button';
import LedgerTableSkeleton from '../../skeletons/ledger-table-skeleton/LedgerTable';
import styles from '../../styles/Ledger/AllTransactions.module.css';

const rowsPerPage = 5;
type AllTransactions = {
  heading: string;
  image?: string;
  className?: any;
  tableData?: any[];
  page: number;
  count: number;
  changePage: (_event: any, pageNo: number) => void;
  showPagination: boolean;
  loader: boolean;
  isAttentionRequired?: boolean;
  esignActionRequired?: boolean;
  vaultActionRequired?: boolean;
  kycActionRequired?: boolean;
  handleDownload?: () => void;
  showRightSection?: boolean;
};

const statusMapping = {
  onhold: 'On Hold',
  pending: 'In Process',
  failed: 'Failed',
  successful: 'Successful',
};

export const AllTransactions = (props: AllTransactions) => {
  const {
    className,
    heading,
    tableData,
    image,
    page = 1,
    count,
    changePage,
    showPagination,
    loader,
    isAttentionRequired = false,
    esignActionRequired = false,
    vaultActionRequired = false,
    kycActionRequired = false,
    handleDownload,
    showRightSection = true,
  } = props;
  const router = useRouter();
  const renderDate = (item: any) => {
    return <>{dayjs(item?.date).format('DD MMM YYYY, hh:mm A')} </>;
  };

  const renderRowLeftSide = (item: any) => (
    <div className={styles.TransactionItemDetails}>
      <h4 className="Heading4">{item?.description}</h4>
      <p className="TextStyle1">
        {renderDate(item)}
        {item?.utr && !isMobile() ? `• UTR ${item?.utr}` : null}
      </p>
      {['pending', 'successful'].indexOf(item?.status) === -1 ? (
        <div
          className={`${
            item?.status === 'failed' ? 'CancelLabel' : 'HoldLabel'
          }`}
        >
          {item?.remarks}
        </div>
      ) : null}
      {item?.utr && isMobile() ? (
        <p className="TextStyle1">UTR {item?.utr}</p>
      ) : null}
    </div>
  );
  const renderRowRightSide = (item: any) => (
    <div className={styles.TransactionItemAmount}>
      <span className={`Amount ${item?.type}`}>
        {item?.type === 'credit' ? '+ ' : '- '}
        &#8377;{numberToCurrency(item?.amount)}
      </span>
      {item.status !== 'successful' && (
        <>
          <br />
          <span
            className={`${
              item?.status === 'pending'
                ? 'InProcess'
                : item?.status === 'failed'
                ? 'CancelLabel'
                : 'HoldLabel'
            }`}
          >
            {statusMapping[item?.status]}
          </span>
        </>
      )}
      {item?.bankAccountNo && ['successful'].indexOf(item.status) > -1 ? (
        <>
          <br />
          <p className="TextStyle1">{item?.bankAccountNo}</p>
        </>
      ) : null}
    </div>
  );

  const handleActionClick = (type: string) => {
    if (type === 'vault') {
      router.push('/vault');
    } else if (type === 'KYC') {
      Cookie.set('redirectTo', '/my-transactions');
      router.push('/kyc');
    } else {
      if (isMobile()) {
        router.push('/notifications');
      }
      {
        document.getElementById('notificationBell').click();
      }
    }
  };

  const getTitleRightCss = () => {
    if (!vaultActionRequired || !esignActionRequired || !kycActionRequired) {
      return `${styles.TitleRight} ${styles.TitleRightMobile}`;
    }
    return styles.TitleRight;
  };

  const getTitleRight = () => {
    if (isAttentionRequired) {
      return (
        <div className={getTitleRightCss()}>
          {vaultActionRequired ? (
            <span onClick={() => handleActionClick('vault')}>Top-up Vault</span>
          ) : null}
          {esignActionRequired ? (
            <span onClick={() => handleActionClick('esign')}>
              Complete eSign
            </span>
          ) : null}
          {kycActionRequired ? (
            <span onClick={() => handleActionClick('KYC')}>Complete KYC</span>
          ) : null}
        </div>
      );
    }
    return (
      <div className={styles.TitleRightAllTransaction} onClick={handleDownload}>
        <span className={`icon-download ${styles.DownloadIcon}`} />
        <span className={`${styles.download}`}> Download Transactions</span>
      </div>
    );
  };

  const renderTableHeader = () => {
    return (
      <div
        className={`${styles.TitleSection} ${
          isAttentionRequired
            ? styles.TitleSectionAction
            : styles.AllTransactionRight
        }`}
      >
        <div className={styles.TitleLeft}>
          <div className={styles.heading}>
            {image ? (
              <Image
                src={image}
                alt="attention"
                layout={'fixed'}
                width={20}
                height={20}
                className={styles.image}
              />
            ) : null}{' '}
            {heading}
          </div>
        </div>
        {showRightSection ? getTitleRight() : null}
      </div>
    );
  };

  const renderTable = () => {
    return (
      <div className={`${styles.TransactionHistory} ${className}`}>
        {renderTableHeader()}

        {tableData.length ? (
          <div className={styles.TransactionHistoryTable}>
            <div className={styles.TransactionList}>
              <ul>
                {loader ? (
                  <div className={styles.padding}>
                    <LedgerTableSkeleton />
                  </div>
                ) : (
                  <>
                    {tableData.map((item) => {
                      return (
                        <li key={`item_${item?.id}` || `item_${item}`}>
                          <div className={styles.TransactionItem}>
                            <div className={styles.TransactionItemIcon}>
                              <div className={styles.ImageContainer}>
                                <div>
                                  <Image
                                    src={`${item?.img}`}
                                    alt="Reward"
                                  />
                                </div>
                              </div>
                            </div>
                            {renderRowLeftSide(item)}
                            {renderRowRightSide(item)}
                          </div>
                        </li>
                      );
                    })}
                  </>
                )}
              </ul>
            </div>
            {showPagination && Math.round(count / rowsPerPage) ? (
              <>
                <div className={styles.TablePagination}>
                  <div className={styles.PaginationLeft}>
                    <span className="TextStyle2">
                      Showing {page}-{Math.round(count / rowsPerPage)} from{' '}
                      {Math.round(count / rowsPerPage)} pages
                    </span>
                  </div>
                  <div className={styles.PaginationRight}>
                    <Pagination
                      onChange={changePage}
                      variant="outlined"
                      shape="rounded"
                      defaultPage={1}
                      page={page}
                      count={Math.round(count / rowsPerPage)}
                      siblingCount={isMobile() ? 0 : 1}
                      boundaryCount={1}
                    />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <>
            {loader ? (
              <div className={styles.padding}>
                <LedgerTableSkeleton />
              </div>
            ) : (
              <>
                <NoData
                  header={'No Transactions'}
                  subHeader={
                    'All your transactions will appear here as you invest and receive returns'
                  }
                  customButtonText={'Invest Now'}
                  customButtonAction={() => window.open('/assets', '_self')}
                  buttonType={ButtonType.Primary}
                />
                <br />
                <br />
                <br />
              </>
            )}
          </>
        )}
      </div>
    );
  };

  return renderTable();
};
