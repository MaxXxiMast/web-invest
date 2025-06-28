import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { connect } from 'react-redux';
import {
  ReferralFriends,
  ReferralRewardCard,
} from '../../components/referral-dashboard';
import styles from '../../styles/Referral/ReferralDashboard.module.css';
import {
  fetchReferralDetails,
  getDashboardMetrics,
} from '../../redux/slices/referral';
import { useAppDispatch } from '../../redux/slices/hooks';
import { RootState } from '../../redux';
import { fetchAPI } from '../../api/strapi';
import Seo from '../../components/layout/seo';
import Header from '../../components/common/Header';
import GripLoading from '../../components/layout/Loading';
import { trackEvent } from '../../utils/gtm';
import ReferralProgramBreakBanner from '../../components/ReferEarn/ReferralProgramBreakBanner';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

const ApplyNowData = {
  title: ' Our Referral Program is on a break !',
  subTitle: ``,
  button: {
    clickUrl: '/referral-dashboard',
    label: 'My Dashboard',
  },
};

const ReferralDashboard: NextPage = (props: any) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [loading, setLoading] = useState(true);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchReferralDetails());
    dispatch(getDashboardMetrics(() => setLoading(false)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { dashboardMetrics } = props;
    if (dashboardMetrics) {
      trackEvent('referral_dashboard', {
        total_reward: dashboardMetrics.totalEarnings,
        redeemed: dashboardMetrics.redeemedEarnings,
        unlocked_reward:
          dashboardMetrics.totalEarnings === dashboardMetrics.redeemedEarnings
            ? 0
            : dashboardMetrics.unredeemedCreditBreakup
                .completedDealCreditAmount,
        locked_reward:
          dashboardMetrics.totalEarnings === dashboardMetrics.redeemedEarnings
            ? 0
            : dashboardMetrics.unredeemedCreditBreakup.pendingDebitAmount +
              dashboardMetrics.unredeemedCreditBreakup.liveDealCreditAmount,
        friends_registered: dashboardMetrics?.registered,
        friends_invested: dashboardMetrics?.invested,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.dashboardMetrics]);

  const { dashboardMetrics = {}, noData = {} } = props;
  const seoData = props?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];

  const isEsignPending = () => {
    return (
      props?.pendingResign?.length ||
      props?.notifications?.length ||
      props?.pendingMcaEsign?.length
    );
  };

  const mobileView = () => {
    return (
      <div className={styles.ReferralDashboardInner}>
        <div className={styles.ReferralDashboardRight}>
          <ReferralProgramBreakBanner
            data={ApplyNowData}
            className={styles.referralBreakMain}
            showButton={false}
          />
          <ReferralRewardCard
            data={{
              dashboardMetrics: props.dashboardMetrics,
              userData: props.user.userData,
              isEsignPending: isEsignPending(),
            }}
          />
        </div>
        <div className={styles.ReferralDashboardLeft}>
          <ReferralFriends data={dashboardMetrics} noData={noData} />
        </div>
      </div>
    );
  };
  const desktopView = () => {
    return (
      <div className={styles.ReferralDashboardInner}>
        <div className={styles.ReferralDashboardLeft}>
          <ReferralProgramBreakBanner
            data={{
              ...ApplyNowData,
            }}
            className={styles.referralBreakMain}
            showButton={false}
          />
          <ReferralFriends data={dashboardMetrics} noData={noData} />
        </div>
        <div className={styles.ReferralDashboardRight}>
          <ReferralRewardCard
            data={{
              dashboardMetrics: props.dashboardMetrics,
              userData: props.user.userData,
              isEsignPending: isEsignPending(),
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <Seo seo={seoData} />
      {loading ? (
        <GripLoading />
      ) : (
        <>
          <Header pageName="Referral Dashboard" />
          <div className={styles.ReferralDashboard}>
            <div className="containerNew">
              {isMobile ? mobileView() : desktopView()}
            </div>
          </div>
        </>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state?.user,
  dashboardMetrics: state?.referral?.dashboardMetrics,
  pendingMcaEsign: state?.user?.pendingMcaEsign,
  pendingResign: state?.user?.pendingResignations,
  notifications: state?.user?.notifications,
});
const mapDispatchToProps = {};

export async function getServerSideProps({ params }: any) {
  try {
    const noData = await fetchAPI(
      '/no-data-pages',
      {
        filters: {
          url: '/referral-dashboard',
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
          url: '/referral-dashboard',
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
export default connect(mapStateToProps, mapDispatchToProps)(ReferralDashboard);
