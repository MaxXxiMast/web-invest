import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import CustomSkeleton from '../primitives/CustomSkeleton/CustomSkeleton';

import { getDefaultFilter } from './utils/helperUtils';
import { trackEvent } from '../../utils/gtm';
import { generateAssetURL } from '../../utils/asset';
import { fetchAPI } from '../../api/strapi';
import classes from './FilterAndCompare.module.css';
import { urlify } from '../../utils/string';
import { processAssetData } from '../primitives/DealList/utils';

const DealListModal = dynamic(() => import('../primitives/DealList'), {
  ssr: false,
});
const FilterSection = dynamic(() => import('../primitives/FilterSection'), {
  ssr: false,
});
const ResultTable = dynamic(
  () => import('../primitives/ResultSection/ResultTable'),
  { ssr: false }
);

const SkeletonLoader = () => (
  <div className={classes.SkeletonWrapper}>
    <CustomSkeleton styles={{ height: 400, width: '100%' }} />
  </div>
);

const FilterAndCompare = ({ filterAndCompareData }) => {
  const defaultFilter = getDefaultFilter(
    filterAndCompareData?.irrOptions,
    filterAndCompareData?.tenureOptions
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isShowModal, setShowModal] = useState(false);
  const [dealData, setDealData] = useState(null);
  const [dealDataLoading, setDealDataLoading] = useState(true);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState([]);
  const [mainViewDeals, setMainViewDeals] = useState([]);
  const [selectedDealIndex, setSelectedDealIndex] = useState(0);

  const filters = [
    {
      filterLabel: 'IRR/YTM',
      filterOptions: filterAndCompareData?.irrOptions.map(
        (option) => option.label
      ),
    },
    {
      filterLabel: 'Tenure',
      filterOptions: filterAndCompareData?.tenureOptions.map(
        (option) => option.label
      ),
    },
  ];

  const trackFilterEvent = (eventName, extraData = {}) => {
    if (!selectedFilterOptions) return;
    const selectedIRR = selectedFilterOptions.find(
      (item) => item.filterLabel === 'IRR/YTM'
    );
    const selectedTenure = selectedFilterOptions.find(
      (item) => item.filterLabel === 'Tenure'
    );
    trackEvent(eventName, {
      returns: selectedIRR?.label,
      tenure: selectedTenure?.label,
      ...extraData,
    });
  };

  const getFilterOption = (filter: string, type: 'irr' | 'tenure') => {
    return filterAndCompareData?.[`${type}Options`]?.find(
      (option) => option.label === filter
    );
  };

  const updateFilterOption = (filters, label, filter, irr, tenure) => {
    return filters.map((item) =>
      item.filterLabel === label
        ? {
            ...item,
            label: filter,
            min: label === 'IRR/YTM' ? irr?.min : tenure?.min,
            max: label === 'IRR/YTM' ? irr?.max : tenure?.max,
          }
        : item
    );
  };

  const handleSelectedFilters = useCallback(
    (filter: string, label: string, filter2 = '', label2 = '') => {
      const irr = getFilterOption(filter, 'irr');
      const tenure = getFilterOption(filter, 'tenure');
      const irr2 = label2.length ? getFilterOption(filter2, 'irr') : null;
      const tenure2 = label2.length ? getFilterOption(filter2, 'tenure') : null;

      setSelectedFilterOptions((prev) => {
        prev = prev.length ? prev : defaultFilter;
        let updatedFilters = updateFilterOption(
          prev,
          label,
          filter,
          irr,
          tenure
        );
        if (label2.length) {
          updatedFilters = updateFilterOption(
            updatedFilters,
            label2,
            filter2,
            irr2,
            tenure2
          );
        }
        trackFilterEvent('discover_filter_changed', {
          returns: updatedFilters?.[0]?.label,
          tenure: updatedFilters?.[1]?.label,
        });
        getDeals(updatedFilters);
        return updatedFilters;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (
      searchParams.get('tenure-bracket') ||
      searchParams.get('return-bracket')
    ) {
      const returnBracket = filterAndCompareData?.irrOptions.find(
        (item) => urlify(item.label) === searchParams.get('return-bracket')
      );
      const tenureBracket = filterAndCompareData?.tenureOptions.find(
        (item) => urlify(item.label) === searchParams.get('tenure-bracket')
      );
      handleSelectedFilters(
        returnBracket?.label,
        'IRR/YTM',
        tenureBracket?.label ?? '',
        'Tenure'
      );
    } else {
      setSelectedFilterOptions(defaultFilter);
      getDeals(defaultFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectedDeal = useCallback(
    (dealData) => {
      if (dealData) {
        const updatedDeals = mainViewDeals.map((deal, index) =>
          index === selectedDealIndex ? dealData : deal
        );
        const sortedFilteredDeals = [...updatedDeals].sort(
          (a, b) => b.irr - a.irr
        );
        trackFilterEvent('filter_deal_changed', {
          assetName: dealData.name,
          assetIRR: dealData.irr,
          assetTenure: dealData.tenure,
        });
        setMainViewDeals(sortedFilteredDeals);
        setShowModal(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mainViewDeals, selectedDealIndex]
  );

  const handleResetFilter = useCallback(() => {
    trackEvent('reset_filter_clicked');
    getDeals(defaultFilter);
    setSelectedFilterOptions(defaultFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealData, defaultFilter]);

  const handleChangeDealModal = (flag, index) => {
    trackFilterEvent('filter_change_deal_clicked', {
      returns: selectedFilterOptions?.[0]?.label,
      tenure: selectedFilterOptions?.[1]?.label,
    });
    setShowModal(flag);
    setSelectedDealIndex(index);
  };

  const handleDealRedirection = (deal) => {
    localStorage.setItem('isFromDiscover', 'true');
    trackFilterEvent('filter_explore_button_clicked', {
      assetName: deal.name,
      assetIRR: deal.irr,
      assetTenure: deal.tenure,
    });
    const returnBracket = selectedFilterOptions.find(
      (item) => item.filterLabel === filters[0].filterLabel
    )?.label;
    const tenureBracket = selectedFilterOptions.find(
      (item) => item.filterLabel === filters[1].filterLabel
    )?.label;
    router.push(
      urlify(
        generateAssetURL(deal) +
          '?source=discover-filter&return-bracket=' +
          returnBracket +
          '&tenure-bracket=' +
          tenureBracket
      )
    );
  };

  const getDeals = async (filter) => {
    setDealDataLoading(true);
    const irr = filter.find((item) => item.filterLabel === 'IRR/YTM');
    const tenure = filter.find((item) => item.filterLabel === 'Tenure');
    const filterData = await fetchAPI(
      '/v3/assets/discovery/filter',
      {
        skip: 0,
        maxIrr: irr?.max,
        minIrr: irr?.min || 0,
        ...(tenure?.min && { minTenure: tenure?.min }),
        ...(tenure?.max && { maxTenure: tenure?.max }),
      },
      {},
      true
    );

    if (filterData?.data) {
      const processedData = filterData.data.map((asset) =>
        processAssetData(asset)
      );
      const sortedDeals = processedData.sort((a, b) => b.irr - a.irr);
      setDealData({ ...filterData, data: processedData });
      setMainViewDeals(sortedDeals);
      setDealDataLoading(false);
    }
  };

  return (
    <>
      <div className={classes.FilterAndCompareSection} id="FilterAndCompare">
        <span className={classes.FilterAndCompareHeading}>
          Compare And Filter Deal
        </span>

        {filters.map((filter) => (
          <FilterSection
            key={filter.filterLabel}
            options={filter.filterOptions}
            label={filter.filterLabel}
            setSelectedFilter={handleSelectedFilters}
            selectedFilters={
              selectedFilterOptions.find(
                (item) => item.filterLabel === filter.filterLabel
              )?.label
            }
            isCloseIcon={filter.filterLabel.includes('Tenure')}
            filterAndCompareData={filterAndCompareData}
          />
        ))}
        {!dealDataLoading && selectedFilterOptions.length ? (
          <ResultTable
            resetFilters={handleResetFilter}
            handleChangeDealModal={handleChangeDealModal}
            mainViewDeals={mainViewDeals}
            totalNumberOfDeals={dealData?.length}
            redirectToAsset={handleDealRedirection}
            filterAndCompareData={filterAndCompareData}
          />
        ) : (
          <SkeletonLoader />
        )}
      </div>
      {isShowModal && (
        <DealListModal
          onClose={setShowModal}
          isShowModal={isShowModal}
          handleSelectedDeal={handleSelectedDeal}
          selectedFilterOptions={selectedFilterOptions}
          totalNumberOfDeals={dealData?.length}
          mainViewDeals={mainViewDeals}
        />
      )}
    </>
  );
};

export default FilterAndCompare;
