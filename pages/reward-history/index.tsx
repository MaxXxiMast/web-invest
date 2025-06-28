import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';

// UTILS
import { converToDateFormat } from '../../utils/date';
import { trackEvent } from '../../utils/gtm';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../utils/string';
import { numberToCurrency } from '../../utils/number';

// API's
import { fetchAPI } from '../../api/strapi';

// SLICES
import { RootState } from '../../redux';
import { fetchTransactionHistory } from '../../redux/slices/referral';
import { useAppDispatch } from '../../redux/slices/hooks';

// COMPONENTS
import { RewardHistoryTable } from '../../components/rewardHistory';
import NoData from '../../components/common/noData';
import MenuOptions from '../../components/common/menu';
import Button, { ButtonType } from '../../components/primitives/Button';
import Seo from '../../components/layout/seo';
import Header from '../../components/common/Header';
import { statuses, transactionStatusLabel } from '../../utils/referral';
import GripLoading from '../../components/layout/Loading';
import Image from '../../components/primitives/Image';

// STYLES
import styles from '../../styles/Referral/RewardHistory.module.css';

type TableData = {
  reward: {
    icon: any;
    amount: any;
    status: any;
  };
  rewardFor: {
    title: any;
    user: any;
    reason: string;
  };
  assetInvested: {
    code: any;
    status: any;
  };
  date: any;
  status: any;
};

const TableHeaders: any[] = [
  'Reward',
  'For',
  'Asset Invested',
  'Status',
  'On Date',
];

const RewardHistory: NextPage = (props: any) => {
  const isMobile = useMediaQuery();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  useEffect(() => {
    dispatch(fetchTransactionHistory(() => setLoading(false)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { transactionLogs = [], noData = {} } = props;
  const [activeFilter, setActiveFilter] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | Element>(null);
  const showNodata = transactionLogs.length ? false : true;
  const seoData = props?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];

  useEffect(() => {
    const { transactionLogs } = props;
    if (transactionLogs) {
      const smallInfinity = 9999999;
      const lastTransactionLog = transactionLogs.length
        ? transactionLogs[0]
        : {};
      const accumulativeResult = transactionLogs.reduce(
        (acc, cur) => {
          if (cur.amount < acc.minAmount) {
            acc.minAmount = cur.amount;
          }
          if (cur.amount > acc.maxAmount) {
            acc.maxAmount = cur.amount;
          }
          acc.totalAmount = acc.totalAmount + cur.amount;
          return acc;
        },
        { minAmount: smallInfinity, maxAmount: 0, totalAmount: 0 }
      );

      trackEvent('reward_history', {
        total_reward: accumulativeResult.totalAmount,
        max_reward: accumulativeResult.maxAmount,
        min_reward:
          accumulativeResult.minAmount === smallInfinity
            ? 0
            : accumulativeResult.minAmount,
        redemptions: transactionLogs.length,
        last_reward_amount: lastTransactionLog?.amount,
        last_reward_timestamp: lastTransactionLog?.createdAt,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const transactionHistory: TableData[] = transactionLogs.map(
    (transaction: any) => {
      let transactionStatus = statuses.find(
        (status) => status.id === transaction?.status
      );
      return {
        reward: {
          icon: transactionStatus.image,
          amount: `₹ ${numberToCurrency(transaction?.amount)}`,

          status: transactionStatus.label,
        },
        rewardFor: {
          title: transaction?.remarks,
          user: '',
          reason: transaction?.reason,
        },
        assetInvested: {
          code: transaction?.orders?.assetOrders?.name,
          status: transactionStatusLabel(Number(transaction?.status)),
        },

        status: transactionStatus.status,
        date: converToDateFormat(transaction?.updatedAt),
      };
    }
  );

  const redirectToRefer = () => {
    router.push('/referral');
  };
  const handleClick = (event: React.MouseEvent<Element>) => {
    setAnchorEl(event.currentTarget);
  };

  const menuChanged = (item) => {
    setActiveFilter(item);
  };
  const onMenuClose = () => {
    setAnchorEl(null);
  };
  const filterOptions = statuses.map((item) => item.status);

  let lastScrollPosition = 0;
  const handleScrollFunction = () => {
    if (window.innerWidth <= 767) {
      const rewardHistoryMobile = document.getElementById(
        'RewardHistoryMobile'
      );
      const MobileTabs = document.getElementById('MobileReferalHistoryTab');
      if (rewardHistoryMobile && MobileTabs) {
        if (window.scrollY > 1) {
          rewardHistoryMobile.classList.add('HideToTop');
          MobileTabs.classList.add('StickToTop');
          if (lastScrollPosition > window.scrollY) {
            rewardHistoryMobile.classList.remove('HideToTop');
            MobileTabs.classList.add('ExtraTopSpace');
            MobileTabs.classList.remove('StickToTop');
          } else {
            MobileTabs.classList.remove('ExtraTopSpace');
          }
        } else {
          rewardHistoryMobile.classList.remove('HideToTop');
          MobileTabs.classList.remove('StickToTop');
          MobileTabs.classList.remove('ExtraTopSpace');
        }
      }
      lastScrollPosition = window.scrollY;
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScrollFunction);
    return () => {
      window.removeEventListener('scroll', handleScrollFunction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Seo seo={seoData} />
      {loading ? (
        <GripLoading />
      ) : (
        <>
          {isMobile && (
            <Header
              className={styles.ReferalHeader}
              id="RewardHistoryMobile"
              pageName="Reward History"
            />
          )}

          <div className={styles.RewardHistory}>
            <div className="containerNew">
              <h1 className={`${styles.PageHeading} Heading1`}>
                <span onClick={() => router.back()}>
                  <Image
                    src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/rewardHistory/ArrowRight.svg`}
                    alt="ArrowRight"
                    width={18}
                    height={15}
                    layout={'intrinsic'}
                  />
                </span>
                <span className="Text">Reward History</span>
                <div className={styles.FilterBtn} onClick={handleClick}>
                  <span className="TextStyle1">Filter By</span>
                  <span className="icon-caret-down" />
                </div>
                <MenuOptions
                  options={filterOptions}
                  changeActiveFilter={menuChanged}
                  onClose={onMenuClose}
                  anchorElement={anchorEl}
                />
              </h1>
              {/* DESKTOP SECTION */}
              {showNodata ? (
                <div className={styles.NoDataDiv}>
                  <NoData
                    header={noData?.attributes?.header}
                    subHeader={noData?.attributes?.subHeader}
                  />
                  <Button
                    className={styles.RedirectBtn}
                    onClick={redirectToRefer}
                    variant={ButtonType.Primary}
                  >
                    Refer Now
                  </Button>
                </div>
              ) : (
                <RewardHistoryTable
                  data={transactionHistory}
                  headers={TableHeaders}
                  className={styles.DesktopTable}
                  rowsPerPage={5}
                  filter={activeFilter}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
const mapStateToProps = (state: RootState) => ({
  transactionLogs: state?.referral?.transactionLogs?.data,
});
const mapDispatchToProps = {};

export async function getServerSideProps({ params }: any) {
  try {
    const noData = await fetchAPI(
      '/no-data-pages',
      {
        filters: {
          url: '/reward-history',
        },
        populate: '*',
      },
      {},
      false
    );
    const pageData = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/referral',
        },
        populate: '*',
      },
      {},
      false
    );
    return {
      props: {
        noData: noData.data?.[0],
        pageData: pageData?.data?.[0]?.attributes?.pageData,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(RewardHistory);
