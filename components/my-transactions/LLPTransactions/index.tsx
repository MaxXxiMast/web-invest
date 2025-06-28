import { useEffect, useState } from 'react';

//Components
import { AnnouncementCard } from '../../ledger/AnnouncementCard';
import { AllTransactions } from '../../ledger/AllTransaction';
import { DownloadCASModal } from '../../portfolio';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';

//Utils
import {
  GRIP_INVEST_BUCKET_URL,
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
} from '../../../utils/string';
import { getFinancialYearList } from '../../../utils/date';

//API
import { fetchLedger } from '../../../api/ledger';

//Hooks
import { useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

//styles
import styles from './LLPTransactions.module.css';

const LLPTransactions = ({
  showDownloadDrawer = false,
  setShowDownloadDrawer,
}) => {
  const { userVan = '', kycDone = false } = useAppSelector(
    (state) => state.user?.userData
  );
  const { walletSummary } = useAppSelector((state) => state.wallet);
  const { notifications = [], pendingResignations = [] } = useAppSelector(
    (state) => state.user
  );
  const isMobile = useMediaQuery();

  const [loader, setLoader] = useState(true);
  const [attentionLoading, setAttentionLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [attentionData, setAttentionData] = useState([]);
  const [allTxns, setAllTxns] = useState([]);
  const [pageNo, setPageNo] = useState(1);

  const rowsPerPage = 5;
  const vaultAction = walletSummary?.amountInWallet < 0;
  const notificaitonArr = [...notifications, ...pendingResignations];
  const esignAction = notificaitonArr?.some((el) => el?.assetID);

  const fetchLedgerAndUpdateState = (
    limit: number,
    skip: number,
    isSuccessfulStatus: number
  ) => {
    fetchLedger(limit, skip, isSuccessfulStatus).then((val) => {
      const typeImageMapping = {
        return: `${GRIP_INVEST_BUCKET_URL}ledger/return.svg`,
        investment: `${GRIP_INVEST_BUCKET_URL}ledger/invest.svg`,
        reward: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}vault/GiftIcon.svg`,
      };
      const dataToUpdate = val?.data?.map((a: any) => ({
        id: a?.id,
        type: a?.type,
        subType: a?.subType,
        amount: a?.amount,
        status: a?.status,
        remarks: a?.remarks,
        description: a?.description,
        date: a?.createdAt,
        utr: a?.ledgerDetails?.utr,
        img: typeImageMapping[a?.subType],
        bankAccountNo: a?.ledgerDetails?.beneficaryAccountNo
          ? `In  xxxx${a?.ledgerDetails?.beneficaryAccountNo.substring(
              a?.ledgerDetails?.beneficaryAccountNo?.length - 4
            )}`
          : null,
      }));
      if (!isSuccessfulStatus) {
        setAttentionData(dataToUpdate);
        setAttentionLoading(false);
      } else {
        setTotalCount(val?.count);
        setAllTxns(dataToUpdate);
        setLoader(false);
      }
    });
  };

  useEffect(() => {
    fetchLedgerAndUpdateState(2, 0, 0);
    fetchLedgerAndUpdateState(rowsPerPage, 0, 1);
  }, []);

  const goToVault = () => {
    window.open('/vault', '_self');
  };

  const handlePageChange = (_event: any, pageNo: number) => {
    const skip = rowsPerPage * (pageNo - 1);
    setLoader(true);
    setPageNo(pageNo);
    fetchLedgerAndUpdateState(rowsPerPage, skip, 1);
  };

  const renderAnnouncementCard = () => {
    if (!userVan) return null;
    return (
      <AnnouncementCard
        heading="Vault is transforming to Vault/Transactions"
        subHeading="You can view the vault and download the vault history till July 1."
        buttonName="Go to Vault"
        onButtonClick={goToVault}
        isWideCard={!isMobile}
      />
    );
  };

  const renderAttentionRequiredTable = () => {
    return attentionData?.length ? (
      <AllTransactions
        heading={'Attention Required'}
        image={`${GRIP_INVEST_BUCKET_URL}ledger/attention.svg`}
        className={styles.attentionRequired}
        page={2}
        changePage={() => null}
        count={2}
        showPagination={false}
        tableData={attentionData}
        loader={attentionLoading}
        isAttentionRequired={true}
        esignActionRequired={esignAction}
        vaultActionRequired={vaultAction}
        kycActionRequired={Boolean(!kycDone)}
      />
    ) : null;
  };

  const AllTransactionText = () =>
    attentionData?.length ? (
      <div className={styles.ledgerTXNDescription}>
        Failed Transactions will be re-initiated within 24 hours of resolving
        the reason of hold or failure. Please visit notification centre to
        resolve the issue.
      </div>
    ) : null;

  const renderTable = () => {
    return (
      <AllTransactions
        heading={'All Transactions'}
        className={styles.allTxns}
        page={pageNo}
        count={totalCount}
        changePage={handlePageChange}
        showPagination
        tableData={allTxns}
        loader={loader}
        showRightSection={isMobile ? true : false}
      />
    );
  };
  return (
    <div className="flex-column gap-12 mt-12">
      {renderAnnouncementCard()}
      {renderAttentionRequiredTable()}
      {AllTransactionText()}
      {renderTable()}
      <MaterialModalPopup
        showModal={showDownloadDrawer}
        handleModalClose={() => setShowDownloadDrawer(false)}
        className={styles.DownloadCasModal}
        isModalDrawer
      >
        <DownloadCASModal
          heading="Download Transaction Statement"
          financialYearList={getFinancialYearList('2021')}
          note="You will receive the transaction statement on your registered email
          address within 2 hours."
          statementType="ledger"
          closeModal={() => setShowDownloadDrawer(false)}
        />
      </MaterialModalPopup>
    </div>
  );
};

export default LLPTransactions;
