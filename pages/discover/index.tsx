// NODE MODULES
import React, { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { NextPage } from 'next/types';
import { connect, useDispatch } from 'react-redux';
import { useSearchParams } from 'next/navigation';

// Components
import Seo from '../../components/layout/seo';

import SectionComponent from '../../components/discovery/SectionComponent/SectionComponent';
import VideoComponent from '../../components/primitives/VideoComponent/VideoComponent';
import ViewAllDeals from '../../components/discovery/ViewAllDeals/ViewAllDeals';
import AssetCardComponent from '../../components/primitives/AssetCardComponent/AssetCardComponent';
import InvestmentOptions from '../../components/discovery/InvestmentOptions/CardOptions/InvestmentOptions';
import KnowMore from '../../components/discovery/KnowMore';
// import TotalInvestmentCard from '../../components/discovery/TotalInvestmentCard/TotalInvestmentCard';
import NotificationCard from '../../components/discovery/NotificationCard/NotificationCard';

import PendingRequestNew from '../../components/discovery/pending-request-new/PendingRequestNew';
import { AmoBanner } from '../../components/discovery/AmoBanner';
import KycBanner from '../../components/kycBanner';

import FilterAndCompare from '../../components/FilterAndCompare';
import KnowYourInvestor from '../../components/discovery/KnowYourInvestor';

// Redux Slices
import { RootState } from '../../redux';
import {
  getPortfolioSummary,
  fetchUccStatus,
  userData,
  fetchPortfolioOverviewDiscover,
  fetchUserInfo,
} from '../../redux/slices/user';
import { setOpenPaymentModal } from '../../redux/slices/config';
import { setRFQPendingOrder } from '../../redux/slices/orders';

// Skeletons
import InvestmentOptionSkeleton from '../../skeletons/investment-option-skeleton/InvestmentOptionSkeleton';
import VideoSkeleton from '../../skeletons/videoSkeleton/VideoSkeleton';
import AssetCardSkeletonDiscovery from '../../skeletons/asset-card-skeleton-discover/AssetCardSkeletonDiscovery';

// Hooks
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { getMarketStatus } from '../../utils/marketTime';
import { useAppSelector } from '../../redux/slices/hooks';

// Utils
import {
  ProductSectionArr,
  getDetailsForPendingOrderEvent,
} from '../../utils/discovery';
import { trackEvent } from '../../utils/gtm';
import withLazyLoad from '../../utils/withLazyLoad';

import type { RFQPendingOrder } from '../../redux/types/rfq';

// APIS
import { callErrorToast, fetchAPI } from '../../api/strapi';
import { getPendingOrdersRfq } from '../../api/rfq';
import { getUserPortfolioCategoryCount } from '../../api/user';

// Contexts
import { GlobalContext } from '../_app';
import { DiscoverContext } from '../../contexts/discoverContext';

// Styles
import classes from './Discovery.module.css';

// DYNAMIC COMPONENTS
const MetricsSection = dynamic(
  () => import('../../components/common/MetricsSection'),
  {
    ssr: false,
  }
);

const LazyMetricsSection = withLazyLoad(MetricsSection);

const FAQSection = dynamic(() => import('../../components/common/FAQSection'), {
  ssr: false,
});
const LazyFAQSection = withLazyLoad(FAQSection);

const RMCard = dynamic(() => import('../../components/common/RMCard'), {
  ssr: false,
});
const LazyRMCard = withLazyLoad(RMCard);

const ArticleSection = dynamic(
  () => import('../../components/blog/ArticleSection'),
  {
    ssr: false,
  }
);

const LazyArticleSection = withLazyLoad(ArticleSection);

const LiveCards = dynamic(() => import('../../components/common/LiveCards'), {
  ssr: false,
});

const LazyLiveCards = withLazyLoad(LiveCards);

const ProductAssets = dynamic(
  () => import('../../components/discovery/ProductAssets'),
  {
    ssr: false,
  }
);

const BasedOnPersonalityDeals = dynamic(
  () => import('../../components/know-your-investor/BasedOnPersonalityDeals'),
  {
    ssr: false,
  }
);

const NotificationBannerMobile = dynamic(
  () => import('../../components/primitives/NotificationBannerMobile'),
  {
    ssr: false,
  }
);

const LazyProductAssets = withLazyLoad(ProductAssets);

type Props = {
  pageData?: any;
  userData?: userData;
  getPortfolioSummary: (
    assetStatus: string,
    dateRange: string,
    cb: any,
    isDiscovery: boolean
  ) => any;
  portfolio?: any;
  innerPageData?: any;
  setOpenPaymentModal: (value: boolean) => void;
  setRFQPendingOrder: (data: RFQPendingOrder) => void;
  fetchUccStatus: () => void;
  ratingScaleMapping?: any;
  filterAndCompareData?: any;
};

const Discovery: NextPage = (componentProps: Props) => {
  const [props, setLocalProps] = useState<any>({
    loading: true,
    pageData: { seo: {}, sections: {}, explainerVideos: {} },
  });

  const getData = async () => {
    const data = await getServerData();
    setLocalProps({ loading: false, ...data?.props });
  };

  const dispatch = useDispatch();

  const isMobileDevice = useMediaQuery();
  const searchParams = useSearchParams();

  const seo = props?.pageData?.seo;
  const explainerVideos = props?.pageData?.explainerVideos;
  const returnComparison = props?.pageData?.returnComparison;
  const returnComparisonTitle = props?.pageData?.returnComparisonTitle;
  const strapiInnerPageData = (props?.innerPageData as any[])?.filter(
    (ele) => ele?.keyValue === 'knowMore-amoBanner'
  )?.[0]?.objectData;

  const { enableDebartment } = useContext<any>(GlobalContext);

  const showImageSlide = isMobileDevice
    ? props?.pageData?.imageSlider?.mobileVisibility
    : props?.pageData?.imageSlider?.desktopVisibility;

  const [isLoading, setIsLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState([]);
  const portfolioData = useAppSelector(
    (state) => state.user?.portfolioDiscoverData
  );

  const { investmentData = {} } = useAppSelector(
    (state) => state.user?.userData
  );

  const isInvestedUser = portfolioData?.totalInvestmentAmount > 0;
  const [isPendingOrdersFetched, setIsPendingOrdersFetched] = useState(false);
  const [userInvestementData, setUserInvestementData] = useState<any>({
    isUserFDInvested: false,
    isUserOBPPInvested: false,
  });

  const marketTiming = useAppSelector((state) => state.config.marketTiming);
  const marketStatus = getMarketStatus(
    marketTiming?.marketStartTime,
    marketTiming?.marketClosingTime,
    marketTiming?.isMarketOpenToday
  );

  const isMarketClosed = ['closed', 'opens in'].includes(marketStatus);

  const preferencesData = useAppSelector((state) => state.user.preferences);
  const { customerPersonality = '' } = useAppSelector(
    (state: any) => state?.knowYourInvestor ?? {}
  );
  const accessData = useAppSelector((state) => state.access);
  const isUserFetchingAPI = useAppSelector(
    (state) => state.user.isUserFetching
  );

  const whatsAppToggle = preferencesData?.config?.whatsapp?.newdeals || false;
  const emailToggle = preferencesData?.config?.email?.newdeals || false;
  const smsToggle = preferencesData?.config?.sms?.newdeals || false;
  const isNotificationHidden = whatsAppToggle && emailToggle && smsToggle;

  const amoOrders = Array.isArray(pendingOrders)
    ? pendingOrders?.filter((order) => Boolean(order?.isAmo || 0))
    : [];
  const rfqGeneratedAMOOrders = Array.isArray(amoOrders)
    ? amoOrders?.filter((order) => Boolean(order?.rfqID || 0))
    : [];
  const inTimeRFQGeneratedOrders = Array.isArray(pendingOrders)
    ? pendingOrders?.filter(
        (order) => Boolean(order?.rfqID || 0) && !Boolean(order?.isAmo || 0)
      )
    : [];

  const discoverContextValue = {
    amo_orders_pending_pay:
      Number(amoOrders.length) - Number(rfqGeneratedAMOOrders.length),
    amo_orders_pending_pay_rfq: rfqGeneratedAMOOrders.length,
    market_open: !isMarketClosed,
    orders_pending_pay: inTimeRFQGeneratedOrders.length,
  };

  const FilterAndCompareElement = document.getElementById('FilterAndCompare');

  useEffect(() => {
    if (searchParams.get('focus') === 'filter') {
      window.scrollTo({
        top: FilterAndCompareElement?.offsetTop - (isMobileDevice ? 20 : 100),
        behavior: 'auto',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [FilterAndCompareElement]);

  // FUNCTION TO ADD WHITE BG TO HEADER FOR DISCOVERY PAGE
  useEffect(() => {
    const checkNavEle = () => {
      const navEle = document.getElementById('NavigationMain');
      if (navEle) {
        navEle.classList.add('WhiteBg');
        return () => {
          navEle.classList.remove('WhiteBg');
        };
      }
    };
    const timeoutId = setTimeout(checkNavEle, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    componentProps.fetchUccStatus();
    getPendingOrdersRfq('?filter[orderDate]=asc')
      .then((data) => {
        if (data && Array.isArray(data)) {
          setPendingOrders(data);
        }
        setIsPendingOrdersFetched(true);
      })
      .catch((err) => {
        callErrorToast(err?.message);
      });
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      componentProps?.portfolio?.totalInvestmentAmount != undefined &&
      isPendingOrdersFetched
    ) {
      trackEvent('view_discover_page', {
        ...getDetailsForPendingOrderEvent(pendingOrders),
        total_invested_amt: componentProps?.portfolio?.summary?.totalInvestment,
        market_open: !isMarketClosed,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isPendingOrdersFetched,
    componentProps?.portfolio?.totalInvestmentAmount,
  ]);

  // Fetch user details
  useEffect(() => {
    localStorage.removeItem('isFromAssetDetail');
    if (accessData?.userID && !isUserFetchingAPI) {
      dispatch(fetchUserInfo(accessData?.userID) as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderViewLiveDeals = (isMobile = false) => {
    return <ViewAllDeals variant={isMobile ? 'secondary' : 'primary'} />;
  };

  const renderAmoBanner = () => {
    return <AmoBanner bannerData={strapiInnerPageData?.amoBanner} />;
  };

  const renderKnowInvestment = () => {
    return <KnowYourInvestor />;
  };

  const renderSlideComponent = (ele: any, sectionId?: string) => {
    // ASSET SECTION CHECK

    if (ProductSectionArr.includes(sectionId)) {
      localStorage.setItem('isFromDiscover', 'true');
      return (
        <AssetCardComponent
          asset={ele}
          isPastDeal={sectionId === 'missedTopDeals'}
        />
      );
    }

    if (sectionId === 'explainerVideos') {
      const thumbnail = isMobileDevice
        ? ele?.mobileThumbnail?.data?.attributes?.url
        : ele?.desktopThumbnail?.data?.attributes?.url;

      return (
        <VideoComponent
          className={classes.ExplainerVideoComponent}
          link={ele?.videoUrl}
          videoDuration={ele?.videoDuration}
          videoTitle={ele?.videoTitle}
          autoPlayOnOpen={true}
          thumbnail={thumbnail}
          playIconWidth={38}
          playIconHeight={38}
          actionOverlayClassName={classes.ExplainerVideosActionOverlay}
        />
      );
    }

    if (sectionId === 'viewAllDeals') {
      return <ViewAllDeals />;
    }

    return null;
  };

  const handleDataFetch = async () => {
    setIsLoading(true);
    const userData = {
      ...userInvestementData,
    };

    if (!Object.keys(investmentData).length) {
      const userInvestmentData = await getUserPortfolioCategoryCount();
      userData.isUserFDInvested = userInvestmentData?.isUserFDInvested;
      userData.isUserOBPPInvested = userInvestmentData?.isUserOBPPInvested;
    } else {
      userData.isUserFDInvested = investmentData?.isUserFDInvested;
      userData.isUserOBPPInvested = investmentData?.isUserOBPPInvested;
    }
    setUserInvestementData(userData);
    setIsLoading(false);
  };

  useEffect(() => {
    if (componentProps?.userData?.userID) {
      handleDataFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentProps?.userData?.userID]);

  useEffect(() => {
    const controller = new AbortController();
    if (accessData?.userID) {
      const { signal } = controller;
      dispatch(fetchPortfolioOverviewDiscover(signal) as any);
    }

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessData?.userID]);

  const pendingPaymentEvent = (
    eventName: string,
    rfqPendingOrder: RFQPendingOrder
  ) => {
    const eventData = {
      asset_id: rfqPendingOrder?.assetID,
      asset_name: rfqPendingOrder?.assetName,
      amount: rfqPendingOrder?.amount,
      time_dealfail: rfqPendingOrder?.expireBy,
      assets_pending_pay: pendingOrders?.length,
      amo_order: Boolean(rfqPendingOrder?.isAmo || 0),
      rfq_generated: Boolean(rfqPendingOrder?.rfqID || 0),
    };
    trackEvent(eventName, eventData);
  };

  const onClickOnPendingRFQOrder = (rfqPendingOrder: RFQPendingOrder) => {
    pendingPaymentEvent('payment_from_discover', rfqPendingOrder);
    componentProps?.setRFQPendingOrder(rfqPendingOrder);
    componentProps?.setOpenPaymentModal(true);
  };

  const getPendingInvestment = () => {
    const slideCount = isMobileDevice ? 1.2 : 2.05;
    const spaceBetween = isMobileDevice ? 16 : 12;

    // Conditional render slider arrow
    let showNavigation =
      (pendingOrders.length > 2 && !isMobileDevice) ||
      (pendingOrders.length > 1 && isMobileDevice);

    const handleSlideComponent = (slideData) =>
      PendingRequestNew({
        ...slideData,
        isMarketClosed,
        handleClick: () => onClickOnPendingRFQOrder(slideData),
      });

    const allowTouchMove = isMobileDevice || pendingOrders.length > 2;

    return (
      <SectionComponent
        data={{ showInCard: true }}
        sectionKey={`SectionComponent__PendingInvestment`}
        handleSlideComponent={handleSlideComponent}
        key={`SectionComponent__PendingInvestment`}
        sliderDataArr={pendingOrders}
        sliderOptions={{
          slidesPerView: slideCount,
          spaceBetween: spaceBetween,
          allowTouchMove: allowTouchMove,
        }}
        showNewNavigation={showNavigation}
        className={classes.PendingRequestContentCard}
        navigationClassName={classes.NavigationClassName}
      />
    );
  };

  const renderPendingInvestmentContainer = () => {
    if (!pendingOrders.length) {
      return null;
    }

    return (
      <div
        className={`${classes.PendingInvestmentCard} ${
          isMobileDevice ? classes.MobilePendingContainer : ''
        }`}
      >
        <div>
          <div
            className={`flex items-center ${classes.PendingInvestmentHeader}`}
          >
            <div className={`${classes.WarningIconText}`}>
              <div className={classes.WarningIcon}>
                <span
                  className={`icon-danger-triangle ${classes.DangerTriangle}`}
                />
              </div>
              <h3 className={classes.PendingInvestmentTitle}>
                {`${pendingOrders.length} pending investment${
                  pendingOrders.length > 1 ? 's' : ''
                }`}
              </h3>
            </div>
            <div className={classes.PendingInvestmentHeaderMessage}>
              Attention Required
            </div>
          </div>
          {enableDebartment ? (
            <div>
              <div className={classes.PendingInvestmentSubTitle}>
                <span>
                  <span className={`icon-info ${classes.InfoIcon}`} />
                </span>
                As per SEBI guidelines, if you fail to make payment post order
                placement, you may be debarred from the debt market for up to 15
                days
              </div>
            </div>
          ) : null}
        </div>
        <div className={classes.CardContainerWithNavigation}>
          <div className={classes.CardContainer}>{getPendingInvestment()}</div>
        </div>
      </div>
    );
  };

  const getExplainerVideos = () => {
    if (!explainerVideos) {
      return null;
    }

    const sliderDataArr = [...explainerVideos?.videoLinks];
    const slideCount = isMobileDevice ? 1.6 : 3.05;
    const spaceBetween = isMobileDevice ? 16 : 15;
    return (
      <SectionComponent
        data={explainerVideos}
        sectionKey={`SectionComponent__ExplainerVideos`}
        handleSlideComponent={(slideData) =>
          renderSlideComponent(slideData, 'explainerVideos')
        }
        key={`SectionComponentExplainerVideos`}
        sliderDataArr={sliderDataArr}
        isSliderSection={true}
        sliderOptions={{
          slidesPerView: slideCount,
          spaceBetween: spaceBetween,
        }}
        isInvestedUser={isInvestedUser}
        isShowBlurEnd={!isMobileDevice}
        stylingClass={classes.DiscoverFirst}
      />
    );
  };

  const getKnowMore = () =>
    !isInvestedUser ? <KnowMore innerPageData={strapiInnerPageData} /> : null;

  // TODO: Hidden for temporary purpose
  // https://gripinvest.atlassian.net/browse/PT-29602
  // const getTotalInvestment = () => {
  //   if (isInvestedUser) {
  //     return <TotalInvestmentCard showImageSlide={showImageSlide} />;
  //   }
  //   return null;
  // };

  const renderDesktopSkeleton = () => {
    return (
      <>
        <div className={classes.leftSkeletonContainer}>
          <InvestmentOptionSkeleton />
          <VideoSkeleton />
          <AssetCardSkeletonDiscovery />
        </div>
        <div
          className={`flex-column ${classes.rightSkeletonContainer} ${classes.stickyWrapper}`}
        >
          <InvestmentOptionSkeleton isRightContainer />
        </div>
      </>
    );
  };

  const renderMobileSkeleton = () => {
    return (
      <>
        <InvestmentOptionSkeleton />
        <VideoSkeleton />
        <AssetCardSkeletonDiscovery />
      </>
    );
  };

  const renderSkeleton = () => {
    return (
      <div className={`${classes.PageWrapper} ${classes.SkeletonPageWrapper}`}>
        <div className="containerNew">
          {isMobileDevice ? renderMobileSkeleton() : renderDesktopSkeleton()}
        </div>
      </div>
    );
  };

  const renderMetricSection = () => {
    return !isInvestedUser ? <LazyMetricsSection /> : null;
  };

  const renderInvestmentOptions = () => {
    return <InvestmentOptions showImageSlide={showImageSlide} />;
  };

  const renderFilterAndCompare = () => {
    return (
      <FilterAndCompare filterAndCompareData={props?.filterAndCompareData} />
    );
  };

  const renderWealthManager = () => {
    return (
      <div className={classes.rmCardContainer}>
        <LazyRMCard />
      </div>
    );
  };

  const renderNotifications = () => {
    return isInvestedUser ? <NotificationCard /> : null;
  };

  const renderLiveTabs = () => {
    return !isInvestedUser ? (
      <LazyLiveCards
        comparisonData={returnComparison}
        title={returnComparisonTitle}
      />
    ) : null;
  };

  const renderKycBanner = () => {
    return (
      <div
        className={`${classes.kycBanner} ${
          pendingOrders.length > 0 ? classes.kycBannerNoTopMargin : ''
        }`}
      >
        <KycBanner
          isUserFDInvested={userInvestementData.isUserFDInvested}
          isUserOBPPInvested={userInvestementData.isUserOBPPInvested}
          isInvestmentDataLoaded
        />
      </div>
    );
  };

  const renderProducts = () => {
    return <LazyProductAssets />;
  };

  const renderBasedOnPersonalityProducts = () => {
    return <BasedOnPersonalityDeals />;
  };

  const renderDesktopView = () => {
    return (
      <div
        id="SidebarContainer"
        className={`
         ${classes.PageWrapper} ${
          !showImageSlide ? classes.WithOutSlidePageWrapper : ''
        } ${isInvestedUser ? 'InvestedUser' : 'NonInvestedUser'}
      `}
      >
        <div className={`containerNew`}>
          <div className={classes.leftContainer}>
            {renderKycBanner()}
            {/* INVESTEMENT OPTIONS SECTION */}
            {renderPendingInvestmentContainer()}
            {renderInvestmentOptions()}
            {renderFilterAndCompare()}
            {getExplainerVideos()}
            {renderBasedOnPersonalityProducts()}
            {/* STRAPI DRIVEN SECTIONS */}
            {renderProducts()}
            {renderLiveTabs()}
          </div>
          <div className={`${classes.rightContainer} ${classes.stickyWrapper}`}>
            {getKnowMore()}
            {/* {getTotalInvestment()} */}
            {renderViewLiveDeals()}
            {renderAmoBanner()}
            {renderKnowInvestment()}
          </div>
        </div>
        {renderMetricSection()}
        <div className={`containerNew ${classes.SecondContainer}`}>
          <div
            className={`${classes.BlogReferralContainer} ${classes.InvestedUserContainer}`}
          >
            <LazyArticleSection isInvestedUser={isInvestedUser} />
          </div>
        </div>
        <div
          className={`containerNew ${classes.SecondContainer} ${
            isNotificationHidden ? classes.SecondContainerNoNotification : ''
          }`}
        >
          <LazyFAQSection />
          {renderWealthManager()}
        </div>
        {renderNotifications()}
      </div>
    );
  };

  const renderMobileView = () => {
    return (
      <div
        className={`
         ${classes.PageWrapper} ${
          !showImageSlide ? classes.WithOutSlidePageWrapper : ''
        }
      `}
      >
        {renderPendingInvestmentContainer()}
        <div className={`containerNew ${classes.MobileContainer}`}>
          {renderKycBanner()}
          <NotificationBannerMobile />
          {getKnowMore()}
          {/* {getTotalInvestment()} */}
          {renderFilterAndCompare()}
          {renderLiveTabs()}
          {renderMetricSection()}
          {/* INVESTEMENT OPTIONS SECTION */}
          {renderInvestmentOptions()}
          {renderViewLiveDeals(true)}
          {getExplainerVideos()}
          {!customerPersonality ? renderKnowInvestment() : null}
          {renderBasedOnPersonalityProducts()}
          {customerPersonality ? renderKnowInvestment() : null}
          {/* STRAPI DRIVEN SECTIONS */}
          {renderProducts()}
          {renderAmoBanner()}
        </div>
        {/* {renderMetricSection()} */}

        <div className={`containerNew ${classes.BlogSectionMobile}`}>
          {renderWealthManager()}
          {renderNotifications()}
          <LazyArticleSection isInvestedUser={isInvestedUser} />
        </div>
        <div className={classes.FAQSectionMobile}>
          <LazyFAQSection />
        </div>
      </div>
    );
  };

  const handleMainRender = () => {
    return (
      <DiscoverContext.Provider value={discoverContextValue}>
        {isMobileDevice ? renderMobileView() : renderDesktopView()}
      </DiscoverContext.Provider>
    );
  };

  if (props.loading || isLoading) {
    return renderSkeleton();
  }

  return (
    <>
      <Seo seo={seo} />
      {handleMainRender()}
    </>
  );
};

export async function getServerData() {
  try {
    const [pageData, innerPageData, filterAndCompareData] = await Promise.all([
      fetchAPI('/discovery', {
        populate: {
          seo: '*',
          imageSlider: {
            populate: {
              slideImage: {
                populate: '*',
              },
            },
          },
          explainerVideos: {
            populate: {
              videoLinks: {
                populate: '*',
              },
            },
          },
          returnComparison: {
            populate: '*',
          },
        },
      }),
      fetchAPI('/inner-pages-data', {
        filters: {
          url: '/discovery',
        },
        populate: '*',
      }),
      fetchAPI('/inner-pages-data', {
        filters: {
          url: '/asset-filters-widget',
        },
        populate: '*',
      }),
    ]);

    return {
      props: {
        pageData: pageData?.data?.attributes,
        innerPageData: innerPageData?.data?.[0]?.attributes?.pageData,
        filterAndCompareData:
          filterAndCompareData?.data?.[0]?.attributes?.pageData?.[0]
            ?.objectData,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

const mapStateToProps = (state: RootState) => ({
  userData: state.user.userData,
  portfolio: state?.user?.portfolioDiscoverData,
});

const mapDispatchToProps = {
  getPortfolioSummary,
  setOpenPaymentModal,
  setRFQPendingOrder,
  fetchUccStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(Discovery);
