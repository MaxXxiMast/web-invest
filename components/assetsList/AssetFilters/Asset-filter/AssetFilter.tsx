import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '../../../../redux/slices/hooks';
import { RootState } from '../../../../redux/index';
// Components
import FilterButton from '../FilterButton/FilterButton';
import AssetFilters from '../FilterAssets';

// Hooks
import useHash from '../../../../utils/customHooks/useHash';
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';

// primitives
import SearchBox from '../../../primitives/SearchBox/SearchBox';

// Utils
import { isGCOrder } from '../../../../utils/gripConnect';
import { trackEvent } from '../../../../utils/gtm';
import {
  getActiveStateByHash,
  offerTypeArr as tabArr,
} from '../../../../utils/assetList';
import { filtersContant, sortOptions } from '../../AssetFilters/utils';
import { syncAssetFiltersToURL, parseAssetFiltersFromURL } from './utils';
import { isRenderedInWebview } from '../../../../utils/appHelpers';

// Redux
import { setSdiTabChangeCount } from '../../../../redux/slices/userConfig';
import {
  resetFiltersWithLoading,
  setShowFilterModal,
  setSortAndFilter,
  SortOption,
} from '../../../../components/assetsList/AssetFilters/AssetFilterSlice/assetFilters';

// Styles
import styles from './AssetFilter.module.css';

const initalState = {
  ytm: [],
  tenure: [],
  minInvestment: [],
  principalRepayment: [],
};

type Props = {
  searchText?: string;
  handlePastOfferSearchText: (search: string, err?: boolean) => void;
  totalDeals: number;
};

const AssetFilter = ({
  handlePastOfferSearchText,
  searchText,
  totalDeals,
}: Props) => {
  const { hash, updateHash } = useHash();
  const isMobile = useMediaQuery();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { offerType: activeTab } = getActiveStateByHash(hash);

  const showSearchBox = () => {
    return activeTab.title === 'Past Offers' && !isMobile;
  };

  const { sortOption, filters, hasAppliedFilters, showFilterModal } =
    useAppSelector((state: RootState) => state.assetFilters);

  const [sortOptionState, setSortOptionState] = useState<SortOption>(
    sortOptions[0].value as SortOption
  );
  const [filtersState, setFiltersState] = useState<any>(initalState);

  const isOpening = !showFilterModal;
  useEffect(() => {
    if (showFilterModal && hasAppliedFilters) {
      // sync filters with redux state
      setSortOptionState(sortOption);
      setFiltersState(filters);
    }
  }, [showFilterModal, hasAppliedFilters]);

  useEffect(() => {
    if (!showFilterModal) {
      // reset local state to initial state when modal is closed
      setFiltersState(initalState);
      setSortOptionState(sortOptions[0].value as SortOption);
    }
  }, [showFilterModal]);
  const filteredAssets = useAppSelector(
    (state: RootState) => state.assetFilters.filteredDeals
  );
  const tabChangeEvent = (ele = '') => {
    if (ele === activeTab.title) return;

    let tabName = tabArr[1];
    if (activeTab === tabArr[1]) {
      tabName = tabArr[0];
    }
    localStorage.setItem('isFromAssetDetail', 'true');
    const tabVal =
      tabName.title === 'Past Offers' ? '#past_offering#bonds' : '#active';
    updateHash(tabVal);
    if (isMobile) {
      const element = document.getElementById('SidebarLinks');
      if (element) element.scrollLeft = 0;
    }

    if (tabName.title === 'Past Offers') {
      trackEvent('asset_list_interaction', {
        functionality: 'navigate_to_past_deals',
        page_name: 'Past_Deals',
        application_type: isMobile
          ? isRenderedInWebview()
            ? 'mweb'
            : 'mobile_app'
          : 'desktop',
        switch_position: 'Past',
      });
    } else if (tabName.title === 'Active Offers') {
      trackEvent('asset_list_interaction', {
        functionality: 'back_to_asset_list',
        page_name: 'Asset_List',
        application_type: isMobile
          ? isRenderedInWebview()
            ? 'mweb'
            : 'mobile_app'
          : 'desktop',
        filters_retained: hasAppliedFilters ? 'true' : 'false',
        switch_position: 'Active',
      });
    } else {
      trackEvent('Assets Tab Switch', { tab: tabName });
    }

    dispatch(setSdiTabChangeCount(0));
  };

  const handleSortChange = (selectedValue: SortOption) => {
    setSortOptionState(selectedValue);

    trackEvent('sort_and_filter_interaction', {
      functionality: 'option_selected',
      sort_option: selectedValue,
      page_name: 'Asset_List',
      close_method: 'null',
      application_type: isMobile
        ? isRenderedInWebview()
          ? 'mweb'
          : 'mobile_app'
        : 'desktop',
    });
  };

  const handleFilterChange = (
    filterKey: keyof typeof filtersState,
    selectedValues: string[]
  ) => {
    const updatedFilters = { ...filtersState, [filterKey]: selectedValues };
    const previousValues = filtersState[filterKey] || [];
    const isDeselecting = previousValues.length > selectedValues.length;

    // Remove empty filter key
    if (!selectedValues.length) {
      delete updatedFilters[filterKey];
    }
    setFiltersState(updatedFilters);

    const changedValues = selectedValues.filter(
      (val) => !previousValues.includes(val)
    );

    changedValues.forEach((val) => {
      trackEvent('sort_and_filter_interaction', {
        functionality: 'option_selected',
        filter_category: filterKey,
        filter_option: val,
        action: isDeselecting ? 'deselect' : 'select',
        selected_filters: updatedFilters,
        close_method: 'null',
        page_name: 'Asset_List',
        application_type: isMobile
          ? isRenderedInWebview()
            ? 'mweb'
            : 'mobile_app'
          : 'desktop',
      });
    });
  };

  const toggleFilterPopup = () => {
    dispatch(setShowFilterModal(isOpening));

    trackEvent('sort_and_filter_interaction', {
      functionality: isOpening ? 'open' : 'close',
      page_name: 'Asset_list',
      close_method: 'null',
      application_type: isMobile
        ? isRenderedInWebview()
          ? 'mweb'
          : 'mobile_app'
        : 'desktop',
    });
  };

  const handleReset = () => {
    dispatch(resetFiltersWithLoading());
    router.push(
      {
        pathname: router.pathname,
        query: {},
      },
      `${router.pathname}`,
      { shallow: true }
    );

    trackEvent('sort_and_filter_interaction', {
      functionality: 'reset',
      page_name: 'Asset_list',
      close_method: 'reset',
      application_type: isMobile
        ? isRenderedInWebview()
          ? 'mweb'
          : 'mobile_app'
        : 'desktop',
    });
  };

  const handleApply = () => {
    const { ytm, tenure, minInvestment, principalRepayment } =
      filtersState ?? {};
    if (
      sortOptionState == 'relevance' &&
      !ytm?.length &&
      !tenure?.length &&
      !minInvestment?.length &&
      !principalRepayment?.length
    ) {
      dispatch(resetFiltersWithLoading());
      router.push('/assets', undefined, {
        shallow: true,
      });
      return null;
    }
    dispatch(setSortAndFilter(sortOptionState, filtersState));

    trackEvent('asset_list_interaction', {
      functionality: 'filter_status_displayed',
      page_name: 'Asset_List',
      application_type: isMobile
        ? isRenderedInWebview()
          ? 'mweb'
          : 'mobile_app'
        : 'desktop',
    });
    syncAssetFiltersToURL(router, {
      assetFilters: {
        sortOption: sortOptionState,
        filters: filtersState,
      },
    } as RootState);

    trackEvent('sort_and_filter_interaction', {
      functionality: 'apply',
      page_name: 'Asset_List',
      application_type: isMobile
        ? isRenderedInWebview()
          ? 'mweb'
          : 'mobile_app'
        : 'desktop',
      applied_filters: filtersState,
      selected_filters: filtersState,
      selected_filter_count: Object.values(filtersState).flat().length,
      close_method: 'apply',
    });
    trackEvent('sort_and_filter_interaction', {
      functionality: 'selection_count_updated',
      page_name: 'Asset_List',
      application_type: isMobile
        ? isRenderedInWebview()
          ? 'mweb'
          : 'mobile_app'
        : 'desktop',
      deals_shown: filteredAssets.length,
      total_deals: totalDeals,
      close_method: 'apply',
    });
  };

  return (
    <div
      className={`${styles.FilterMain} ${!isMobile ? 'containerNew' : ''} ${
        styles.AssetListFilter
      } sticky_desktop`}
      id="AssetFilter"
    >
      <div
        className={
          isMobile
            ? styles.filterContainer
            : 'flex items-center justify-between'
        }
      >
        <div className={styles.FilterInner}>
          <div className={styles.FilterLeft}>
            {!isGCOrder() && (
              <ul className={styles.AssetFilterList}>
                {tabArr.map((ele) => (
                  <li
                    key={ele?.id}
                    onClick={() => tabChangeEvent(ele?.title)}
                    className={`TextStyle1 ${
                      activeTab === ele ? styles.ActiveTab : ''
                    }`}
                  >
                    {isMobile ? ele?.title.replace(' Offers', '') : ele.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {!isGCOrder() && showSearchBox() && (
          <SearchBox
            value={searchText}
            handleInputChange={handlePastOfferSearchText}
          />
        )}
        {activeTab?.title !== 'Past Offers' && (
          <FilterButton
            setShowFilters={toggleFilterPopup}
            isFilterApplied={hasAppliedFilters}
            isMobile={isMobile}
          />
        )}

        <AssetFilters
          sortOptionState={sortOptionState}
          handleSortChange={handleSortChange}
          filtersState={filtersState}
          handleFilterChange={handleFilterChange}
          showModal={showFilterModal}
          handleModalClose={toggleFilterPopup}
          handleResetBtn={handleReset}
          handleApplyBtn={handleApply}
        />
      </div>
    </div>
  );
};

export default AssetFilter;
