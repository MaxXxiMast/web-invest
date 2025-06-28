import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { NextPage } from 'next';

import LedgerSkeleton from '../../skeletons/ledger-skeleton/LedgerSkeleton';
import Seo from '../../components/layout/seo';

import DownloadCasModal from '../../components/portfolio/DownloadCASModal';
import MaterialModalPopup from '../../components/primitives/MaterialModalPopup';
import Header from '../../components/common/Header';
import { AnnouncementCard } from '../../components/ledger/AnnouncementCard';
import { AllTransactions } from '../../components/ledger/AllTransaction';

import {
  GRIP_INVEST_BUCKET_URL,
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
} from '../../utils/string';
import { getFinancialYearList } from '../../utils/date';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

import { fetchAPI } from '../../api/strapi';
import { fetchLedger } from '../../api/ledger';

import { fetchWalletInfo } from '../../redux/slices/wallet';
import { RootState } from '../../redux';

import style from '../../styles/Ledger/Ledger.module.css';

const mapDispatchToProps = {
  fetchLedger,
  fetchWalletInfo,
};

const rowsPerPage = 5;

const mapStateToProps = (state: RootState) => ({
  notifications: state?.user?.notifications || [],
  pendingResignations: state?.user?.pendingResignations || [],
  walletSummary: state.wallet.walletSummary,
  userData: state.user.userData,
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
interface LedgerProps {
  pageData: any;
}

interface LedgerProps extends PropsFromRedux {}

const Ledger: NextPage = (props: LedgerProps) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [loader, setLoader] = useState(true);
  const [attentionLoading, setAttentionLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [attentionData, setAttentionData] = useState([]);
  const [allTxns, setAllTxns] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [esignAction, setEigntAction] = useState(false);
  const [vaultAction, setVaultAction] = useState(false);
  const [kycAction, setKycAction] = useState(false);
  const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);

  const userVan = props?.userData?.userVan;

  const seoData = props?.pageData?.filter(
    (item: any) => item?.__component === 'shared.seo'
  )?.[0];

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
    let notificaitonArr = [
      ...props?.notifications,
      ...props?.pendingResignations,
    ];
    if (notificaitonArr?.length) {
      setEigntAction(notificaitonArr?.some((el) => el?.assetID));
    }
  }, [props?.notifications, props?.pendingResignations]);

  useEffect(() => {
    if (props?.walletSummary?.amountInWallet < 0) {
      setVaultAction(true);
    }
  }, [props?.walletSummary]);

  useEffect(() => {
    if (props?.userData && props?.userData?.kycDone !== undefined) {
      setKycAction(!props?.userData?.kycDone);
    }
    if (props?.userData?.userID) {
    }
  }, [props?.userData]);

  useEffect(() => {
    fetchLedgerAndUpdateState(2, 0, 0);
    fetchLedgerAndUpdateState(rowsPerPage, 0, 1);
  }, []);

  useEffect(() => {
    if (userVan) props?.fetchWalletInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userVan]);

  const handlePageChange = (_event: any, pageNo: number) => {
    const skip = rowsPerPage * (pageNo - 1);
    setLoader(true);
    setPageNo(pageNo);
    fetchLedgerAndUpdateState(rowsPerPage, skip, 1);
  };

  const ledgerDescriptionText = () => (
    <div className={style.ledgerDescription}>
      {' '}
      Past investments, returns, and rewards from the vault are now included in
      My Transactions.
    </div>
  );
  const AllTransactionText = () =>
    attentionData?.length ? (
      <div className={style.ledgerTXNDescription}>
        Transactions will be re-initiated within 24 hours of resolving the
        reason of hold or failure. Please visit the notification center to
        resolve the issue.
      </div>
    ) : null;

  const goToVault = () => {
    window.open('/vault', '_self');
  };

  const renderAnnouncementCard = () => {
    if (!userVan) return null;
    return (
      <AnnouncementCard
        heading="Vault is transforming to My Transactions"
        subHeading="You can still visit the vault and download the vault usage statement."
        buttonName="Go to Vault"
        onButtonClick={goToVault}
      />
    );
  };

  const renderAttentionRequiredTable = () => {
    return attentionData?.length ? (
      <AllTransactions
        heading={'Attention Required'}
        image={`${GRIP_INVEST_BUCKET_URL}ledger/attention.svg`}
        className={style.attentionRequired}
        page={2}
        changePage={() => null}
        count={2}
        showPagination={false}
        tableData={attentionData}
        loader={false}
        isAttentionRequired={true}
        esignActionRequired={esignAction}
        vaultActionRequired={vaultAction}
        kycActionRequired={kycAction}
      />
    ) : null;
  };

  const renderTable = () => {
    return (
      <AllTransactions
        heading={'All Transactions'}
        className={style.allTxns}
        page={pageNo}
        count={totalCount}
        changePage={handlePageChange}
        showPagination
        tableData={allTxns}
        loader={loader}
        isAttentionRequired={false}
        handleDownload={() => setShowDownloadDrawer(true)}
      />
    );
  };

  const renderForDesktop = () => {
    return (
      <div className="containerNew">
        {ledgerDescriptionText()}
        <div className={style.divider} />
        <div className="flex">
          <div className={style.LedgerLeft}>
            {renderAttentionRequiredTable()}
            {AllTransactionText()}
            {renderTable()}
          </div>
          <div className={style.LedgerRight}>{renderAnnouncementCard()}</div>
        </div>
      </div>
    );
  };

  const renderForMobile = () => {
    return (
      <div className="containerNew">
        {ledgerDescriptionText()}
        {renderAnnouncementCard()}
        {renderAttentionRequiredTable()}
        {AllTransactionText()}
        {renderTable()}
      </div>
    );
  };

  const renderChild = () => {
    return isMobile ? renderForMobile() : renderForDesktop();
  };

  return (
    <>
      <Seo seo={seoData} />
      <Header pageName="My Transactions" hideLine={true} />
      {loader && attentionLoading ? <LedgerSkeleton /> : renderChild()}
      <MaterialModalPopup
        showModal={showDownloadDrawer}
        handleModalClose={() => setShowDownloadDrawer(false)}
        className={style.DownloadCasModal}
        isModalDrawer
      >
        <DownloadCasModal
          heading="Download Transaction Statement"
          financialYearList={getFinancialYearList('2021')}
          note="You will receive the transaction statement on your registered email
          address within 2 hours."
          statementType="ledger"
          closeModal={() => setShowDownloadDrawer(false)}
        />
      </MaterialModalPopup>
    </>
  );
};

export async function getServerSideProps() {
  try {
    const pageData = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/my-transactions',
        },
        populate: '*',
      },
      {},
      false
    );

    return {
      props: {
        pageData: pageData?.data?.[0]?.attributes?.pageData || [],
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

export default connector(Ledger);
