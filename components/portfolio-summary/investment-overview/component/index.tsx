// NODE MODULES
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

// Components
import TooltipCompoent from '../../../primitives/TooltipCompoent/TooltipCompoent';
import SortBy from '../../../primitives/SortBy/SortBy';
import InvestmentOverviewSkeleton from '../skeleton/InvestmentOverviewSkeleton';
import ZeroState from '../../zero-state';

// utils and constants
import {
  getInvestmentStatus,
  getInvestmentOverview,
  overviewFilter,
  getLabelForProductType,
} from '../../utils';
import { trackEvent } from '../../../../utils/gtm';
import { financeProductTypeMappingsReturns } from '../../my-returns/ReturnsTable/constants';

//context and api
import {
  OverviewBreakdownResponse,
  OverviewCard,
  OvreviewResponse,
} from '../types';
import { investmentData } from '../utils';

// Hooks
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';

// Redux Slices
import {
  setPortfolioSummaryData,
  setPortfolioSummaryDataLoader,
  setTotalAmountInvested,
} from '../../../../redux/slices/portfoliosummary';

// APIs
import {
  getOverviewBreakdownData,
  getUserInvestmentData,
} from '../../../../api/portfolio';
import { useAppSelector } from '../../../../redux/slices/hooks';

// Contexts
import { PortfolioContext } from '../../context';

//styles
import styles from './InvestmentOverview.module.css';

// Dynamic Import using nextjs
const OverviewModal = dynamic(() => import('../../common/OverviewModal'), {
  ssr: false,
});

const InvestmentOverview = ({ userInvestedTypes = {} }) => {
  const dispatch = useDispatch();
  const { loader = true, selectedAssetType = 'Bonds, SDIs & Baskets' } =
    useSelector((state: any) => state?.portfolioSummary);

  const isMobile = useMediaQuery('(max-width: 992px)');
  const isInvested = getInvestmentStatus(userInvestedTypes, selectedAssetType);
  const showOverlay = !isInvested;

  const dealFilter = Object.keys(overviewFilter) ?? [];
  const [selectedFilter, setSelectedFilter] = useState(dealFilter[0]);
  const [selectedOveriew, setSelectedOverview] = useState<any>();

  const [overviewData, setOveriewData] = useState<OverviewCard[]>([]);
  const [breakdownData, setBreakdownData] = useState<
    Partial<OverviewBreakdownResponse>
  >({});

  const { pageData = [] } = useContext(PortfolioContext);

  // GET UserID
  const { userID = '' } = useAppSelector((state) => state?.user?.userData);

  const tooltipData = useMemo(
    () =>
      ((pageData as any[]) || []).filter(
        (ele) => ele?.keyValue === 'summary-tooltip'
      )[0]?.objectData?.tooltipData || {},
    [pageData]
  );

  const getTooltip = (label: string) => {
    const tooltipText = tooltipData[label] || '';
    return tooltipText;
  };

  const getOverviewData = async (signal: any) => {
    // Join keys for asset type filter
    const assetTypeFilter =
      financeProductTypeMappingsReturns[selectedAssetType]?.join(',');
    const dealType = overviewFilter[selectedFilter];

    let userInvestmentData: Partial<OvreviewResponse> = {};

    try {
      //get investment Data and format accordingly
      userInvestmentData = await getUserInvestmentData(
        assetTypeFilter,
        dealType,
        signal
      );
      trackEvent('portfolio_summary_landing', {
        invested_amount: userInvestmentData?.totalInvestmentAmount || 0,
        userXIRR: userInvestmentData?.xirr || 0,
      });
      trackEvent('portfolio_summary_deal_filter', {
        dealtype_filter_selected: dealType,
        timestamp: new Date().toISOString(),
        asset_type: selectedAssetType,
        deal_amount: userInvestmentData?.totalInvestmentAmount || 0,
        'user id': userID,
      });
    } catch (error) {
      console.log(error);
      //if api fails show empty data in chips as per filters applied
    } finally {
      // format response data for overview section
      const overviewData = isInvested
        ? userInvestmentData
          ? userInvestmentData
          : {} // 0 values if API fails
        : investmentData; // use default values for overlay if user not invested
      const getOverview = getInvestmentOverview(
        overviewData,
        isMobile,
        selectedAssetType,
        dealType,
        isInvested
      );
      setOveriewData(getOverview);
      if (dealType === 'all') {
        dispatch(
          setPortfolioSummaryData({
            preTaxIrr: userInvestmentData?.xirr || 0,
          })
        );
      }
      dispatch(
        setTotalAmountInvested({
          totalAmountInvested: userInvestmentData?.totalInvestmentAmount || 0,
        })
      );
      dispatch(setPortfolioSummaryDataLoader({ loader: false }));
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    if (Object.keys(userInvestedTypes).length) {
      dispatch(setPortfolioSummaryDataLoader({ loader: true }));
      getOverviewData(signal);
    }

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssetType, isMobile, userInvestedTypes, selectedFilter]);

  useEffect(() => {
    const getBreakdownData = async () => {
      const dealType = overviewFilter[selectedFilter];
      const overviewBreakdown = await getOverviewBreakdownData(
        selectedAssetType,
        selectedOveriew?.type,
        dealType
      );
      setBreakdownData(overviewBreakdown);
      trackEvent('portfolio_summary_detailed_drilldown', {
        dealtype_filter_selected: dealType,
        timestamp: new Date().toISOString(),
        asset_type: selectedAssetType,
        counter_type: selectedOveriew?.label,
        counter_amount: selectedOveriew?.value,
        'user id': userID,
      });
    };

    if (selectedOveriew) {
      getBreakdownData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOveriew]);

  useEffect(() => {
    setSelectedFilter(dealFilter[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssetType]);

  if (loader || Boolean(!overviewData?.length))
    return <InvestmentOverviewSkeleton isMobile={isMobile} />;

  const handleCardClick = (showModal: boolean, card: any) => {
    if (showModal) {
      setBreakdownData(undefined);
      setSelectedOverview(card);
    }
  };

  const handleOverviewModal = () => {
    setSelectedOverview(undefined);
  };

  return (
    <div
      className={`${styles.container} ${
        showOverlay ? styles.overlayContainer : ''
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className={styles.title}>
          {showOverlay
            ? 'Portfolio Summary'
            : `${getLabelForProductType(selectedAssetType)} Overview`}
        </h3>

        {!showOverlay ? (
          <SortBy
            filterName={selectedFilter}
            data={dealFilter}
            handleFilterItem={(ele: string) => setSelectedFilter(ele)}
            isMobileDrawer={true}
            mobileDrawerTitle="Select Option"
            selectedValue={dealFilter.indexOf(selectedFilter)}
            className={styles.filter}
          />
        ) : null}
      </div>
      <div
        className={`flex ${
          overviewData?.length <= 3
            ? `justify-start ${styles.cardsWrapper}`
            : 'justify-between'
        } items-start ${styles.cards}`}
      >
        {overviewData.map((card: any, _idx) => (
          <>
            <div
              className={`flex-column justify-start gap-6 ${styles.card} ${
                card.hideIcon ? '' : styles.showModal
              }`}
              key={`${card.label}`}
              onClick={(e: any) => {
                if (e.target.id === 'investment-overview-tooltip') return;
                handleCardClick(!card.hideIcon, card);
              }}
            >
              <div className={`flex items-center gap-6 ${styles.label}`}>
                <span>{card.label}</span>{' '}
                {!!getTooltip(card?.label) && (
                  <TooltipCompoent
                    toolTipText={getTooltip(card?.label)}
                    additionalStyle={{
                      ToolTipStyle: styles.ToolTipPopUp,
                      ArrowStyle: styles.ArrowToolTip,
                      ParentClass: styles.TooltipPopper,
                    }}
                    checkOnScrollTooltip
                  >
                    <span
                      className={`icon-info ${styles.InfoIcon}`}
                      id="investment-overview-tooltip"
                    />
                  </TooltipCompoent>
                )}
              </div>
              <div
                className={`flex items-center gap-6 ${styles.value} ${
                  card.isAccent ? styles.accentValue : ''
                }`}
                onClick={() => handleCardClick(!card.hideIcon, card)}
              >
                {card.value}
                {!card?.hideIcon && (
                  <span className={`icon-caret-right ${styles.CaretRight}`} />
                )}
              </div>
              <div className={styles.sublabel}>{card.sublabel}</div>
            </div>
            {overviewData?.length - 1 !== _idx && (
              <div className={styles.separator}></div>
            )}
          </>
        ))}

        {showOverlay ? (
          <>
            <div className={styles.overlay}></div>
            <div className={`flex justify-center ${styles.zeroStateOverlay}`}>
              <ZeroState />
            </div>
          </>
        ) : null}
      </div>
      <OverviewModal
        selectedOveriew={selectedOveriew}
        isVerticalLayout={isMobile}
        handleOverviewModal={handleOverviewModal}
        breakdownData={breakdownData}
        filterName={selectedFilter}
      />
    </div>
  );
};

export default InvestmentOverview;
