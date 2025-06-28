// NODE MODULES
import React, { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Components
import InvestmentOverview from './investment-overview/component';
import BannerSlider from './common/Banner';
import AssetTypeFilter from './asset-type-filter/component';
import PortfolioPerformance from './portfolio-performance/component';
import AssetSlider from './asset-slider/component';
import Testimonials from './testimonials/component';
import PortfolioBookCall from './book-call/component';
import ReturnDistribution from './return-distribution';
import ReturnsTable from './my-returns/ReturnsTable';
import MyCashflow from './my-cashflow';
import DownloadReturns from './my-returns/DownloadReturns';

// Utils
import {
  getInvestmentStatus,
  investmentTypes,
  productTypeKeyMappings,
  UserInvestedTypeData,
} from './utils';

//APIs
import {
  getPortfolioReturnDistribution,
  getUserInvestmentTypeDetails,
} from '../../api/portfolio';

//Redux
import {
  setInterestBracket,
  setPortfolioSummaryDataLoader,
  setReturnDistrubution,
} from '../../redux/slices/portfoliosummary';
import { fetchUccStatus } from '../../redux/slices/user';
import { fetchAndSetAssets } from '../../redux/slices/assets';

// Hooks
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

// Contexts
import { PortfolioContext } from './context';

// Utils
import { isGCOrder } from '../../utils/gripConnect';

// Styles
import styles from './portfolio.module.css';

// DYNAMIC COMPONENTS
const FAQList = dynamic(() => import('./portfolio-faqs/component'), {
  ssr: false,
});

const NotificationBannerMobile = dynamic(
  () => import('../primitives/NotificationBannerMobile'),
  {
    ssr: false,
  }
);

const UserPortfolio = () => {
  const dispatch = useAppDispatch();
  const [userInvestedTypes, setUserInvestedTypes] =
    useState<UserInvestedTypeData>({});
  const [isInvested, setInvested] = useState(false);
  const [confirmedOrdersInBondsAndSDIs, setConfirmedOrdersInBondsAndSDIs] =
    useState(false);

  const { selectedAssetType = 'Bonds, SDIs & Baskets' } = useAppSelector(
    (state) => state?.portfolioSummary
  );

  const summaryGCConfig = useAppSelector(
    (state) =>
      state?.gcConfig?.configData?.themeConfig?.pages?.portfolio?.summary
  );

  const isGC = isGCOrder();
  const isBondSdiTab = selectedAssetType === investmentTypes[0];
  const isLlpTab = selectedAssetType === investmentTypes[1];
  const isFdTab = selectedAssetType === investmentTypes[3];

  // GC CONFIG
  const isShowBookCall = isGC ? summaryGCConfig?.rmCard : true;
  const isShowBanners = isGC ? summaryGCConfig?.bottomBanners : true;
  const isShowReturnDristbtn = isGC
    ? summaryGCConfig?.portfolioReturnDistribution
    : true;

  const { pageData = [] } = useContext(PortfolioContext);

  const isMobile = useMediaQuery();

  const sliderData =
    ((pageData as any[]) || [])
      .find((ele) => ele?.__component === 'shared.image-slider')
      ?.slideImage?.map((img) => ({
        img_src: img?.desktopURL?.data?.attributes?.url || '',
        alternativeText: img?.altText || '',
        clickUrl: img?.clickUrl || '',
      })) ?? [];

  // Fetch UCC Status
  useEffect(() => {
    dispatch(fetchUccStatus() as any);
    dispatch(fetchAndSetAssets());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //GET USER INVESTMENT TYPE
  const getUserInvestmentType = async () => {
    const data: any = await getUserInvestmentTypeDetails();
    if (data) {
      const newData: any = {};
      for (let key in productTypeKeyMappings) {
        newData[productTypeKeyMappings?.[key]] = data[key] || 0;
      }
      setUserInvestedTypes(newData);
    } else {
      setUserInvestedTypes({
        bonds: 0,
        sdi: 0,
        leasing: 0,
        inventory: 0,
        commercial: 0,
        startupEquity: 0,
        highyieldfd: 0,
        Basket: 0,
      });
    }
  };

  // GET USER INTEREST BRACKET
  const getUserInterestBracket = async () => {
    const data = await getPortfolioReturnDistribution();
    if (data?.length) {
      setConfirmedOrdersInBondsAndSDIs(true);
      let interestBrackets = {
        '8to11': 0,
        '11to14': 0,
        '14andAbove': 0,
      };
      data.forEach((ele) => {
        if (ele >= 8 && ele < 11) {
          interestBrackets['8to11'] += 1;
        } else if (ele >= 11 && ele < 14) {
          interestBrackets['11to14'] += 1;
        } else if (ele >= 14) {
          interestBrackets['14andAbove'] += 1;
        }
      });
      const interestBracket = Object.keys(interestBrackets).reduce((a, b) =>
        interestBrackets[a] > interestBrackets[b] ? a : b
      );
      dispatch(setInterestBracket({ interestBracket }));
      dispatch(setReturnDistrubution({ interestBrackets }));
    }
  };

  useEffect(() => {
    dispatch(setPortfolioSummaryDataLoader({ loader: true }));
    (async () => {
      await Promise.all([
        getUserInvestmentType(),
        getUserInterestBracket(),
      ]).then(() => {
        dispatch(setPortfolioSummaryDataLoader({ loader: false }));
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedAssetType && userInvestedTypes) {
      setInvested(
        getInvestmentStatus(userInvestedTypes, selectedAssetType) &&
          (selectedAssetType !== 'Bonds, SDIs & Baskets' ||
            confirmedOrdersInBondsAndSDIs)
      );
    }
  }, [selectedAssetType, userInvestedTypes, confirmedOrdersInBondsAndSDIs]);

  const getPortfolioPerformance = () => {
    const isShowPerformance = isGC
      ? summaryGCConfig?.portfolioPerformance
      : true;

    if (!isShowPerformance) return null;

    return (
      <>
        <h3 className={styles.title} data-automation="performance-title">
          Portfolio Performance
        </h3>
        <PortfolioPerformance />
      </>
    );
  };

  return (
    <div className={styles.PortfolioSummary}>
      <AssetTypeFilter userInvestedTypes={userInvestedTypes} />
      <div className={styles.PortfolioPageMain}>
        <div className={styles.PortfolioPageLeft}>
          <InvestmentOverview userInvestedTypes={userInvestedTypes} />
          <NotificationBannerMobile pageName="portfolio" subPage="summary" />
          {isInvested ? (
            <div className={styles.mt35}>
              {isBondSdiTab ? getPortfolioPerformance() : null}
              {isLlpTab || isFdTab ? (
                <>
                  <h3
                    className={styles.title}
                    data-automation="my-cashflow-title"
                  >
                    My Cashflow
                  </h3>
                  <MyCashflow />
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className={styles.PortfolioPageRight}>
          {isShowBanners ? (
            <BannerSlider
              sliderDataArr={sliderData}
              className={styles.Banner}
            />
          ) : null}
        </div>
      </div>
      {isBondSdiTab || isFdTab ? (
        <>
          {isInvested ? (
            <>
              {isFdTab ? null : isShowReturnDristbtn ? (
                <>
                  {/* Portfolio Return Distribution section */}
                  <div className={`flex-column width100 ${styles.mt35}`}>
                    <h3
                      className={styles.title}
                      data-automation="portfolio-return-distribution-title"
                    >
                      Portfolio Return Distribution
                    </h3>
                    <div
                      className={`flex width100 ${styles.flexWrapMobile} ${styles.greyBorder}`}
                    >
                      <div className={styles.PortfolioPageLeft}>
                        <ReturnDistribution />
                      </div>
                      <div className={styles.PortfolioPageRight}>
                        <AssetSlider />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {/* MY CASHFLOW SECTION */}
              <div className={`flex-column ${styles.mt35}`}>
                {isFdTab ? null : (
                  <h3
                    className={styles.title}
                    data-automation="my-cashflow-title"
                  >
                    My Cashflow
                  </h3>
                )}
                <div className={`flex width100  ${styles.flexWrapMobile}`}>
                  {isFdTab ? null : (
                    <div className={styles.PortfolioPageLeft}>
                      <MyCashflow />
                    </div>
                  )}
                  <div className={styles.PortfolioPageRight}>
                    {isFdTab ? null : isShowBookCall ? (
                      <PortfolioBookCall showInMobile={false} />
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                className={`flex width100 ${styles.mt35} ${styles.flexWrapMobile}`}
              >
                <div className={styles.PortfolioPageLeft}>
                  {getPortfolioPerformance()}
                </div>
                <div className={styles.PortfolioPageRight}>
                  <AssetSlider />
                </div>
              </div>
              <div className={`width100 ${styles.mt35}`}></div>
            </>
          )}
        </>
      ) : null}

      {/* MY RETURN SECTION COMPONENT */}
      {isInvested && selectedAssetType !== 'Startup Equity' ? (
        <>
          <div
            className={`flex-column width100 ${styles.mt35} ${styles.flexWrapMobile}`}
          >
            <div className="flex justify-between">
              <h3 className={styles.title} data-automation="my-returns-title">
                My Returns
              </h3>
              <div className={styles.DisplayOnMobile}>
                <DownloadReturns />
              </div>
            </div>
            <ReturnsTable />
          </div>
        </>
      ) : null}

      <div
        className={`flex width100 ${styles.FAQLayoutContainer} ${styles.flexWrapMobile}`}
      >
        <div className={styles.PortfolioPageLeft}>
          <div
            data-automation="test"
            className={`flex-column width100 ${styles.gap80}`}
          >
            {isBondSdiTab && !isInvested ? <Testimonials /> : null}
            {isShowBanners ? (
              <BannerSlider
                sliderDataArr={sliderData}
                className={`flex ${styles.DisplayOnMobile}`}
                sliderId="PortfolioSliderPaginationMobile"
              />
            ) : null}
            <FAQList />
          </div>
        </div>
        <div className={styles.PortfolioPageRight}>
          {(isInvested && !isLlpTab && !isFdTab && !isMobile) ||
          !isShowBookCall ? null : (
            <PortfolioBookCall />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPortfolio;
