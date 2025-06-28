//library
import React, { useEffect, useState } from 'react';

//component
import BarChart from '../common/BarChart';
import NoData from '../../common/noData';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

//utils
import { formatCashflowData, getDatesRange } from './utils';
import { numberToIndianCurrency } from '../../../utils/number';
import { trackEvent } from '../../../utils/gtm';
import { getCurrentFinancialYear } from '../../../utils/date';

//api and context
import { useAppSelector } from '../../../redux/slices/hooks';
import { getUserReturns } from '../../../api/portfolio';

//constants and types
import {
  financeProductTypeMappingsReturns,
  getFilters,
} from '../my-returns/ReturnsTable/constants';
import { GetUserReturnsParams } from '../my-returns/ReturnsTable/types';

//styles
import styles from './MyCashflow.module.css';

import SortBy from '../../primitives/SortBy/SortBy';

const MyCashflow = () => {
  // GET selectedAssetType
  const { selectedAssetType = 'Bonds, SDIs & Baskets' } = useAppSelector(
    (state) => state.portfolioSummary
  );

  const futureFilters = getFilters('upcoming');
  let upcomingFilters = [...futureFilters];
  upcomingFilters.splice(2, 1); //remove current FY
  const lastItem = upcomingFilters.pop(); // Remove the last item
  const pastFilters = getFilters('past', selectedAssetType);
  pastFilters.push(lastItem); //add to more filters

  const allFilters = [...upcomingFilters, ...pastFilters];

  const [selectedFilter, setSelectedFilter] = useState(allFilters[0]);
  const [isMoreClicked, setIsMoreClicked] = useState(false);

  const [avgReturns, setAvgReturns] = useState('₹0');
  const [cashflows, setCashflows] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  // GET UserID
  const { userID = '' } = useAppSelector((state) => state?.user?.userData);

  const commonEventData = {
    user_id: userID,
    asset_type: selectedAssetType,
    timestamp: new Date().toISOString(),
    widget_used: 'My Cashflow',
  };

  const handleFilter = (filter: string, isMoreClick = true) => {
    setSelectedFilter(filter);
    setIsMoreClicked(isMoreClick);

    if (isMoreClick) {
      const { startDate, endDate } = getDatesRange(filter);
      trackEvent('more_cashflow', {
        ...commonEventData,
        more_clicked_cashflow: true,
        range_selected: { selectedFilter: filter, startDate, endDate },
      });
    }
  };

  // Function to get the returns data from the API
  const getReturns = async (filter: string) => {
    const { startDate, endDate } = getDatesRange(filter, true);
    const type = futureFilters.includes(selectedFilter) ? 'upcoming' : 'past';

    try {
      setIsLoading(true);
      const params: GetUserReturnsParams = {
        startDate,
        endDate,
        type,
        financeProductType:
          financeProductTypeMappingsReturns[selectedAssetType].join(','),
      };
      const response = await getUserReturns(params);
      let returnsData = response?.data || [];

      //if current FY get Past Returns Data
      if (getCurrentFinancialYear() === selectedFilter) {
        const response = await getUserReturns({
          ...params,
          type: 'past',
        });
        const pastcurrentFYData = response?.data || [];

        returnsData = [...pastcurrentFYData, ...returnsData];
      }

      const formatData = formatCashflowData(returnsData, selectedFilter);

      const aggregatedData = Object.values(formatData);

      setCashflows(aggregatedData);

      const monthlyAvgReturn = numberToIndianCurrency(
        (response?.totalReturns / aggregatedData.length || 0).toFixed(0)
      );
      setAvgReturns(monthlyAvgReturn);

      trackEvent('portfolio_summary_date_range', {
        ...commonEventData,
        more_clicked_cashflow: isMoreClicked,
        range_selected: { selectedFilter: filter, startDate, endDate },
        avg_monthly_return: monthlyAvgReturn,
      });
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFilter && selectedAssetType) {
      getReturns(selectedFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, selectedAssetType]);

  const handleBodyContent = () => {
    if (isLoading) {
      return (
        <CustomSkeleton
          styles={{
            width: '100%',
            height: 300,
            margin: '2px 0',
          }}
        />
      );
    }
    if (cashflows?.length) {
      return (
        <>
          <BarChart data={cashflows} />
          {selectedAssetType === 'Bonds, SDIs & Baskets' ? (
            <div className={`${styles.sublabel}`}>
              *Weighted average values for All Time, inclusive of TDS
            </div>
          ) : null}
        </>
      );
    } else {
      return (
        <NoData
          showIcon
          header={''}
          subHeader={`No returns for ${selectedFilter}`}
        />
      );
    }
  };

  return (
    <div className={`flex-column ${styles.cashflowContainer}`}>
      <div className={'flex items-center justify-between gap-12'}>
        <div className={`flex ${styles.chipsArrContainerWrapper}`}>
          <div className={`flex ${styles.chipsArrContainer}`}>
            {allFilters?.slice(0, 3).map((filter, _idx) => (
              <div
                className={`${styles.filterChip} ${
                  filter === selectedFilter ? styles.selected : ''
                }`}
                key={`cashflow_chip_${filter}`}
                onClick={() => handleFilter(filter, false)}
              >
                {filter}
              </div>
            ))}
          </div>
          <SortBy
            filterName={'More'}
            data={allFilters?.slice(3)}
            handleFilterItem={handleFilter}
            mobileDrawerTitle="More"
            selectedValue={pastFilters.indexOf(selectedFilter)}
            className={`${styles.filterContainer} ${styles.filterChip} ${
              pastFilters.includes(selectedFilter) ? styles.selected : ''
            }`}
          />
        </div>
        <div className={`flex-column gap-2 ${styles.hideMobile}`}>
          <div className={styles.avgReturnTitle}>Avg. monthly returns*</div>
          <div className={styles.avgReturnValue}>{avgReturns}</div>
        </div>
      </div>
      {handleBodyContent()}
    </div>
  );
};

export default React.memo(MyCashflow);
