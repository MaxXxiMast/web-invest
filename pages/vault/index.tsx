import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';

//components
import {
  AddMoneyCard,
  AutoWithdrawal,
  BalanaceCard,
  TransactionHistory,
  WithdrawlModal,
  FirstTimeInvestmentModal,
} from '../../components/vault';
import TransferBalanceModal from '../../components/vault/TransferBalanceModal';
import MobileDrawer from '../../components/primitives/MobileDrawer/MobileDrawer';
import Header from '../../components/common/Header';
import Seo from '../../components/layout/seo';
import TransactionPopup from '../../components/vault/transactionFailed';
import DownloadCasModal from '../../components/portfolio/DownloadCASModal';
import MaterialModalPopup from '../../components/primitives/MaterialModalPopup';
import Button, { ButtonType } from '../../components/primitives/Button';
import VaultSkeleton from '../../skeletons/vault-skeleton/VaultSkeleton';
import Image from '../../design-systems/components/Image';

//api
import { callErrorToast, callSuccessToast, fetchAPI } from '../../api/strapi';

//redux
import { RootState } from '../../redux';
import {
  addMoneyToWallet,
  clearSelectedTransaction,
  fetchWalletInfo,
  getWalletTransactions,
  retryPayment,
  updateAutoWithdrawal,
  withdrawAmountFromWallet,
} from '../../redux/slices/wallet';
import {
  fetchUserNotifications,
  getPanAadhaarDetails,
  getPortfolio,
} from '../../redux/slices/user';

//utils
import {
  getAutoWithdrawlErrorText,
  getTotalOrdersCheckStatus,
  getVaultToolipForWithdrawal,
  isUserInstitutional,
} from '../../components/vault/utils';
import { isKycUnderVerification, pendingStatuses } from '../../utils/user';
import { isValidWithdrawInput } from '../../utils/number';
import { getFinancialYearList } from '../../utils/date';
import { trackEvent } from '../../utils/gtm';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { loadCashfree } from '../../utils/ThirdParty/scripts';

//styles
import styles from '../../styles/Vault/Vault.module.css';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

const Vault: NextPage = (props: any) => {
  const isMobile = useMediaQuery();
  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false);
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [showAddMoneyDrawer, setShowAddMoneyDrawer] = React.useState(false);
  const [showDownloadDrawer, setShowDownloadDrawer] = React.useState(false);
  const [loader, setLoader] = React.useState(true);
  const [showFirstTimeInvestmentModal, setShowFirstTimeInvestmentModal] =
    React.useState(false);
  const didMount = useRef(false);
  const [localState, setLocalState] = React.useState({
    moneyAction: isMobile ? '' : 'add',
    showSelectPaymentMethod: false,
    showNeftDrawer: false,
    amount: '',
    withdrawamount: '',
    loading: false,
    showTxnConfirmation: false,
    showNeedHelpPopup: false,
    showDialog: false,
    showWithDrawConfirmation: false,
    withDrawConfirmationType: 'withdraw',
    pageNo: 1,
    autowithdrawal: props?.walletSummary?.autowithdrawal,
  });
  const [selectedChip, setSelectedChip] = React.useState('');
  const setState = (data: any) => {
    setLocalState({
      ...localState,
      ...data,
    });
  };

  const router = useRouter();
  const [userVan, setUserVan] = React.useState(true);

  useEffect(() => {
    const userData = props?.user?.userData;
    const fetchData = debounce(async () => {
      if (Number(userData?.userID)) {
        if (
          userData?.userVan &&
          (Boolean(userData?.investmentData?.['Leasing']?.investments) ||
            Boolean(userData?.investmentData?.['Inventory']?.investments))
        ) {
          setUserVan(userData?.userVan);
          await Promise.all([
            props.getPortfolio(),
            props.fetchWalletInfo(),
            props.getWalletTransactions(localState.pageNo),
            props.getPanAadhaarDetails(() => {}, false),
          ]).then(() => {
            setLoader(false);
          });
        } else {
          setUserVan(false);
        }
      }

      if (
        Object.keys(props.selectedTxn)?.length &&
        props.selectedTxn.isTxnSuccessful == 0
      ) {
        setState({
          showTxnConfirmation: true,
        });
      }
      didMount.current = true;
    }, 300);

    fetchData();

    return () => fetchData.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.user?.userData?.userID, props?.user?.userData?.investmentData]);

  useEffect(() => {
    let walletDetails = {};
    if (props?.userWalletTransactions?.list?.length > 0) {
      walletDetails = {
        last_txn_amount: props?.userWalletTransactions?.list?.[0]?.amount,
        last_txn_description: props?.userWalletTransactions?.list?.[0]?.reason,
        last_txn_timestamp:
          props?.userWalletTransactions?.list?.[0]?.transactionTime,
        last_txn_type: props?.userWalletTransactions?.list?.[0]?.type,
        last_txn_status: props?.userWalletTransactions?.list?.[0]?.status,
      };
    }
    trackEvent('vault_viewed', {
      vault_balance: props?.walletSummary?.amountInWallet,
      is_kyc_done: props?.user?.userData?.kycDone,
      is_autowithdrawl_on: props?.walletSummary?.autowithdrawal ?? false,
      ...walletDetails,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.user?.userData?.userID]);

  useEffect(() => {
    setState({
      autowithdrawal: props?.walletSummary?.autowithdrawal ?? false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.walletSummary.autowithdrawal]);

  const seoData = props?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];
  const withDrawText = props?.pageData?.filter(
    (item) =>
      item.__component === 'shared.key-value' && item.name == 'withdrawText'
  )[0]?.Value;
  const autowithDrawText = props?.pageData?.filter(
    (item) =>
      item.__component === 'shared.key-value' &&
      item.name == 'autoWithDrawlText'
  )[0]?.Value;

  const isInstitutionalUser = () => {
    const { userData, kycDetails } = props.user;
    const userPan = kycDetails?.pan?.docIDNo;
    const kycBankStatus = userData?.kycBankStatus;
    return (
      isUserInstitutional(userData, userPan) &&
      (kycBankStatus === 'verified' || kycBankStatus === 1)
    );
  };

  const allowWithdrawal = (isAutoWithdrawal?: boolean) => {
    const { user } = props;
    const { portfolio, userData } = user;
    const list = portfolio.list || [];
    let allowWithdraw = userData?.kycDone;
    const isInstitutional = isInstitutionalUser();
    if (isInstitutional) {
      allowWithdraw = isInstitutional;
    } else {
      for (const item of list) {
        if (allowWithdraw) {
          let portfolioItem = item;
          if (
            (portfolioItem?.hasLlp && !portfolioItem?.isEsigned) ||
            (portfolioItem?.hasResignation &&
              portfolioItem?.shouldResign &&
              !portfolioItem?.isResigned)
          ) {
            allowWithdraw = false;
          }
        } else {
          break;
        }
      }
    }

    if (allowWithdraw && !isAutoWithdrawal) {
      allowWithdraw = getTotalOrdersCheckStatus(
        props.user?.userData,
        props.walletSummary
      );
    }

    if (isInstitutional) {
      allowWithdraw = isInstitutional;
    } else if (
      props?.pendingResignations?.length ||
      props?.notifications?.length ||
      props?.pendingMcaEsign?.length
    ) {
      allowWithdraw = false;
    }
    return allowWithdraw;
  };

  const getAutowithdrawErrorText = () => {
    const { user, walletSummary } = props;
    if (props.walletSummary.autowithdrawal && !allowWithdrawal()) {
      return getAutoWithdrawlErrorText(user, walletSummary);
    } else if (!props.walletSummary.autowithdrawal && !allowWithdrawal(true)) {
      return 'Auto-withdrawal switch is disabled until you clear all the pending KYC & eSign related tasks in your notifications';
    }
  };

  const withdrawlChange = () => {
    setState({ autowithdrawal: !localState.autowithdrawal });
    props.updateAutoWithdrawal(!localState.autowithdrawal, () => {});
  };

  const onPageChange = (__event: any, page: number) => {
    setState({
      pageNo: page,
    });
    props.getWalletTransactions(page);
  };

  const getAddMoneyPayload = async (flag: boolean, data: any) => {
    if (flag) {
      if (data?.paymentSessionID) {
        await loadCashfree();
        const paymentInstance = new (window as any).Cashfree(
          data?.paymentSessionID
        );
        paymentInstance.redirect();
      } else if (data?.paymentLink) {
        window.open(data?.paymentLink, '_self');
      }
    } else {
      callErrorToast('Some error occured! Please try again');
    }
  };

  const proceedToAddMoney = () => {
    setState({
      loading: true,
    });

    // Rudderstack event `add_money_continue`
    trackEvent('add_money_continue', {
      is_autowithdrawal_on: localState.autowithdrawal,
      vault_balance: props?.walletSummary?.amountInWallet,
      selected_chip: selectedChip ? Number(selectedChip) : '',
      amount: Number(localState.amount),
    });

    props.addMoneyToWallet(
      localState.amount,
      'wallet-action',
      props.user.userData?.userID,
      getAddMoneyPayload
    );
  };

  const closeConfirmationDrawer = () => {
    props.clearSelectedTransaction();
    props.fetchWalletInfo();
    props.getWalletTransactions(localState.pageNo);
    closeDrawer();
  };
  const closeDrawer = () => {
    setState({
      moneyAction: '',
      showSelectPaymentMethod: false,
      showNeftDrawer: false,
      showTxnConfirmation: false,
    });
  };
  const retryTxn = () => {
    const txnInfo = props.selectedTxn;
    props.retryPayment(txnInfo.transactionID, (flag: boolean, data: any) => {
      if (flag) {
        window.open(data.paymentLink, '_self');
      } else {
        callErrorToast('Some error occured! Please try again');
      }
    });
  };

  const changeAmount = (value: string | number, chipSelected: boolean) => {
    if (value && Number(value) < 0) {
      return;
    }

    if (chipSelected) {
      setSelectedChip(String(value));
    } else {
      setSelectedChip('');
    }

    setState({
      amount: value,
    });
  };

  const confirmValidWithdrawalAmount: () => [boolean, string] =
    React.useCallback(() => {
      return isValidWithdrawInput(
        localState.withdrawamount,
        props.walletSummary,
        props.user.userData,
        isInstitutionalUser()
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localState.withdrawamount]);

  const postWithdrawProcess = (flag: boolean, response: any, cb?: any) => {
    if (!flag) {
      setState({
        withdrawamount: '',
      });
      cb?.(); // enable yes button in confirmation popup
      return;
    } else {
      callSuccessToast(response.data.msg);
    }
    setState({
      withdrawamount: '',
      loading: false,
      moneyAction: '',
      showWithDrawConfirmation: false,
    });
    setShowWithdrawModal(false);
    cb?.();
  };

  const initiateWithdrawRequest = (cb?: any) => {
    // Rudderstack event `withdrawal_requested`
    trackEvent('withdrawal_requested', {
      amount: localState.withdrawamount,
      is_autowithdrawal_on: localState.autowithdrawal,
      current_vault_balance: props?.walletSummary?.amountInWallet,
    });

    props.withdrawAmountFromWallet(
      localState.withdrawamount,
      (flag: boolean, response: any) => postWithdrawProcess(flag, response, cb)
    );
    props.fetchUserNotifications(props.user.userData?.userID);
  };

  const updateWithdrawlAmount = (value) => {
    if (value && Number(value) < 0) {
      return;
    }
    setState({
      withdrawamount: value,
    });
  };

  const getKycStatusToolTip = () => {
    return getVaultToolipForWithdrawal(props.user, props.walletSummary);
  };

  const setFocusOnAddMoney = () => {
    document.getElementById('AddmoneyInput')?.focus();
  };

  const getKycError = () => {
    const { kycPanStatus, kycAadhaarStatus, kycBankStatus } =
      props?.user?.userData || {};

    const userKYCPending =
      pendingStatuses.includes(kycPanStatus) ||
      pendingStatuses.includes(kycAadhaarStatus) ||
      pendingStatuses.includes(kycBankStatus);

    const userKYCUnderVerification = isKycUnderVerification(
      props?.user?.userData
    );
    if (userKYCPending) {
      return 'Please complete your KYC to add money in your Vault.';
    } else if (userKYCUnderVerification) {
      return 'Your KYC is under verification. You can add money once it is completed.';
    } else {
      return '';
    }
  };

  const onHandleTransferModal = () => {
    setShowTransferModal(true);
    setShowAddMoneyDrawer(false);
  };

  const handleAddMoneyBtnClick = (amount: number | null = null) => {
    if (
      !props?.user?.userData?.investmentData?.totalInvestments &&
      !showFirstTimeInvestmentModal
    ) {
      handleFirstTimeInvestmentModal(true);
    } else {
      if (amount < 0) {
        changeAmount(Math.abs(amount), false);
      }
      setFocusOnAddMoney();
      setShowAddMoneyDrawer(true);
      handleFirstTimeInvestmentModal(false);
    }
  };

  const handleFirstTimeInvestmentModal = (val: boolean) => {
    setShowFirstTimeInvestmentModal(val);
  };

  const renderDesktopAddMoneyCard = () => {
    if (props?.walletSummary?.amountInWallet >= 0) {
      return null;
    }
    return (
      <AddMoneyCard
        className={`${styles.AddMoneyCard} ${styles.DesktopMoneyCard}`}
        amount={localState.amount}
        onChange={changeAmount}
        onAddButtonClick={proceedToAddMoney}
        loading={localState.loading}
        errorText={getKycError()}
      />
    );
  };
  const renderMobileAddMoneyCard = () => {
    if (props?.walletSummary?.amountInWallet >= 0) {
      return null;
    }
    return (
      <MobileDrawer
        showFlyer={showAddMoneyDrawer}
        handleDrawerClose={() => setShowAddMoneyDrawer(false)}
      >
        <AddMoneyCard
          className={`${styles.AddMoneyCard} MobileMoneyCard`}
          amount={localState.amount}
          onChange={changeAmount}
          onAddButtonClick={proceedToAddMoney}
          handleTransferModal={onHandleTransferModal}
          errorText={getKycError()}
          loading={localState.loading}
        />
      </MobileDrawer>
    );
  };

  const handleDownload = () => {
    if (props.userWalletTransactions?.list?.length) {
      setShowDownloadDrawer(true);
    }
  };

  const BankingPartner = () => (
    <div className={`flex ${styles.BankingPartnerContainer}`}>
      <div className={styles.BankingPartnerText}>Banking Partner</div>
      <Image
        alt={'Banking Partner'}
        className={styles.BankingPartnerImage}
        src={`${GRIP_INVEST_BUCKET_URL}commons/yes-bank.svg`}
      />
    </div>
  );

  const onClickWidthrawBtn = () => {
    if (props.user?.userData?.userType === 'fraud') {
      callErrorToast(
        'Suspicious activity detected. Please contact us at invest@gripinvest.in'
      );
    } else {
      setShowWithdrawModal(true);
    }
  };

  const renderAddMoney = () => {
    return isMobile ? renderMobileAddMoneyCard() : renderDesktopAddMoneyCard();
  };

  const getVaultUI = () =>
    loader ? (
      <VaultSkeleton />
    ) : (
      <>
        <div className={styles.VaultLeft}>
          <AutoWithdrawal
            autoWithdrawl={localState.autowithdrawal}
            onWithdrawlChange={withdrawlChange}
            disabled={!allowWithdrawal(true)}
            autoWithdrawlText={autowithDrawText}
            getAutowithdrawErrorText={getAutowithdrawErrorText}
          />
          {isMobile ? BankingPartner() : null}
          <TransactionHistory
            className={styles.TransactionHistory}
            data={props.userWalletTransactions?.list}
            handleDownload={handleDownload}
            count={props.userWalletTransactions?.count}
            changePage={onPageChange}
            selectedPage={localState.pageNo}
          />
        </div>
        <div className={styles.VaultRight}>
          <BalanaceCard
            data={props?.walletSummary?.amountInWallet}
            handleWithdrawBtnClick={onClickWidthrawBtn}
            handleAddMoneyBtnClick={handleAddMoneyBtnClick}
            withDrawDisabledReason={getKycStatusToolTip()}
            className={styles.BalanaceCard}
            withdrawDisabled={!allowWithdrawal()}
          />
          {renderAddMoney()}
          {!Boolean(getKycError()) &&
            props?.walletSummary?.amountInWallet < 0 && (
              <p className="TextStyle1">
                Want to transfer via NEFT/RTGS/IMPS?{' '}
                <span onClick={() => setShowTransferModal(true)}>See How</span>
              </p>
            )}

          {!isMobile ? BankingPartner() : null}
        </div>
      </>
    );

  const DiscontinuedBanner = () => {
    return (
      <div className="containerNew">
        <div className={styles.vaultDiscontinuedBanner}>
          <div
            className={`flex items-center justify-between ${styles.mobileColumn}`}
          >
            <div
              className={`flex items-center justify-center ${styles.bannerContent} ${styles.mobileColumn}`}
            >
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}commons/wallet.svg`}
                alt="wallet_icon"
                className={styles.vaultIcon}
              />
              <div className="flex flex-column gap-12">
                <h2 className={styles.heading}>Vault has been discontinued!</h2>
                <p className={styles.description}>
                  Your Vault Statement is still available for download.
                </p>
              </div>
            </div>
            <Button
              width={'250px'}
              variant={ButtonType.Primary}
              className={styles.downloadButton}
              onClick={() => {
                router.push('/profile/mydocuments');
              }}
            >
              Download Vault Statement
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Seo seo={seoData} />
      {userVan ? (
        <>
          {!isMobile ? <Header pageName="My Vault" hideLine={true} /> : null}
          {localState.showTxnConfirmation ? (
            <TransactionPopup
              txn={props?.selectedTxn}
              retryClick={retryTxn}
              onClose={closeConfirmationDrawer}
            />
          ) : null}
          <div className={`${styles.marginTop} containerNew`}>
            <div className={styles.VaultContainer}>{getVaultUI()}</div>
          </div>

          <WithdrawlModal
            handleModalClose={(res: boolean) => setShowWithdrawModal(res)}
            showModal={showWithdrawModal}
            onWithDrawClick={initiateWithdrawRequest}
            onChange={updateWithdrawlAmount}
            withdrawamount={localState.withdrawamount}
            confirmWithdrawalAmount={confirmValidWithdrawalAmount}
            withdrawlText={withDrawText}
          />

          <TransferBalanceModal
            handleModalClose={(res: boolean) => setShowTransferModal(res)}
            showModal={showTransferModal}
            className={`${styles.WithdrawlModal} ${styles.TransferBalanceModal}`}
            walletSummary={props?.walletSummary}
            userData={props?.user.userData}
          />

          <MaterialModalPopup
            showModal={showDownloadDrawer}
            handleModalClose={() => setShowDownloadDrawer(false)}
            className={styles.DownloadCasModal}
            isModalDrawer
          >
            <DownloadCasModal
              heading="Download Vault Statement"
              financialYearList={getFinancialYearList('2021')}
              note="You will receive the vault statement on your registered email
          address within 2 hours."
              statementType="vault"
              closeModal={() => setShowDownloadDrawer(false)}
            />
          </MaterialModalPopup>
          <MaterialModalPopup
            showModal={showFirstTimeInvestmentModal}
            handleModalClose={() => handleFirstTimeInvestmentModal(false)}
            className={styles.DownloadCasModal}
            isModalDrawer
          >
            <FirstTimeInvestmentModal
              handleClose={() => handleFirstTimeInvestmentModal(false)}
              handleOkay={handleAddMoneyBtnClick}
            />
          </MaterialModalPopup>
        </>
      ) : (
        <DiscontinuedBanner />
      )}
    </>
  );
};

export async function getServerSideProps() {
  try {
    const pageData = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/vault',
        },
        populate: '*',
      },
      {},
      false
    );

    return {
      props: {
        pageData: pageData?.data?.[0]?.attributes?.pageData,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}
const mapStateToProps = (state: RootState) => ({
  walletSummary: state.wallet.walletSummary,
  userWalletTransactions: state.wallet.userWalletTransactions,
  walletLoading: state.wallet.walletLoading,
  user: state.user,
  selectedTxn: state.wallet.selectedTxn,
  loading: state.wallet.loading,
  pendingResignations: state.user.pendingResignations,
  pendingMcaEsign: state.user.pendingMcaEsign,
  notifications: state.user.notifications,
  kycDetails: state.user.kycDetails,
});

const mapDispatchToProps = {
  fetchWalletInfo,
  addMoneyToWallet,
  clearSelectedTransaction,
  retryPayment,
  updateAutoWithdrawal,
  withdrawAmountFromWallet,
  getPortfolio,
  fetchUserNotifications,
  getWalletTransactions,
  getPanAadhaarDetails,
};
export default connect(mapStateToProps, mapDispatchToProps)(Vault);
