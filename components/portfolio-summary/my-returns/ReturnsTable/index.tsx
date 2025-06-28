// NODE MODULES
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

// Components
import FilterTab from '../../../primitives/FilterTab';
import Table from '../../../primitives/Table';
import SortBy from '../../../primitives/SortBy/SortBy';
import DownloadReturns from '../DownloadReturns';
import ReturnsTableMobile from '../ReturnsTableMobile';
import ReturnsOverview from '../ReturnsOverview';
import NoData from '../../../common/noData';
import ReturnsTableSkeleton from './skeleton/ReturnsTableSkeleton';
import TablePagination from '../../../primitives/TablePagination';

// Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

// API
import { getUserReturns } from '../../../../api/portfolio';

// Redux
import { setReturns } from '../../../../redux/slices/portfoliosummary';

// Utils
import {
  fdHeaders,
  inArrearsHeaders,
  pastHeaders,
  upcomingHeaders,
} from './utils';
import {
  ROWS_PER_PAGE,
  financeProductTypeMappingsReturns,
  getDatesForAPI,
  getFilters,
  getKeyFromLabel,
  tabArr,
} from './constants';
import { ButtonType } from '../../../primitives/Button';
import { trackEvent } from '../../../../utils/gtm';

// Types
import type { MyReturnsType } from './types';

// Styles
import styles from './ReturnsTable.module.css';

export default function ReturnsTable() {
  const router = useRouter();
  const dispatch = useDispatch();

  // GET selectedAssetType
  const {
    selectedAssetType = 'Bonds, SDIs & Baskets',

    returns: { data: tableData = [] },
    totalAmountInvested,
  } = useAppSelector((state) => state.portfolioSummary);

  const totalCount = tableData?.length || 0;

  // GET UserID
  const { userID = '' } = useAppSelector((state) => state?.user?.userData);

  // State for Upcoming, Past and Arrears
  const [selectedType, setSelectedType] = useState<MyReturnsType>('upcoming');

  // State for filyer according to the selected type
  const [allSelectedFilters, setAllSelectedFilters] = useState([]);

  // State for the selected filter from the filter list of the selected type
  const [selectedFilter, setSelectedFilter] = useState('');

  // Loader when the data is being fetched
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(1);

  const isArrears = selectedType === 'arrears';

  // Function to update the filter list according to the selected type
  const updateFilter = () => {
    const filters = getFilters(selectedType, selectedAssetType);

    setAllSelectedFilters(filters);
    if (filters.length > 0) {
      setSelectedFilter(filters[0]);
    }
  };

  // Function to get the returns data from the API
  const getReturns = async () => {
    setIsLoading(true);

    const { startDate, endDate } = getDatesForAPI(selectedFilter, isArrears);
    try {
      const response = await getUserReturns({
        startDate,
        endDate,
        type: selectedType,
        financeProductType:
          financeProductTypeMappingsReturns[selectedAssetType].join(','),
      });
      dispatch(setReturns(response));
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedType !== 'arrears') {
      updateFilter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  // API call to get the returns data for the selected type: arrears
  useEffect(() => {
    if (selectedType === 'arrears') {
      setPage(1);
      getReturns();
      setSelectedFilter('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  // API call to get the returns data for the selected type: upcoming, past
  useEffect(() => {
    if (selectedFilter && selectedType && selectedAssetType) {
      setPage(1);
      getReturns();
    }

    return () => {
      dispatch(setReturns({ count: 0, totalReturns: 0, data: [] }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, selectedAssetType]);

  // Function to handle the change of the tab
  const handleTabChangeCB = async (value: string) => {
    const finalKey = getKeyFromLabel(value);

    trackEvent('portfolio_summary_tab_selection', {
      user_id: userID,
      asset_type: selectedAssetType,
      return_type: finalKey,
      timestamp: new Date().toISOString(),
    });

    setSelectedType(finalKey);
  };

  // Function to handle the change of the filter
  const handleFilterEle = (ele: string) => {
    trackEvent('portfolio_summary_date_range', {
      range_selected: ele,
      timestamp: new Date().toISOString(),
      asset_type: selectedAssetType,
      user_id: userID,
      widget_used: 'my_returns',
    });
    setSelectedFilter(ele);
  };

  // Function to render the filters
  const renderFilters = () => {
    if (isArrears) {
      return null;
    }

    return (
      <SortBy
        filterName={selectedFilter}
        data={allSelectedFilters}
        handleFilterItem={handleFilterEle}
        mobileDrawerTitle="Select Option"
        selectedValue={allSelectedFilters.indexOf(selectedFilter)}
        className={styles.FilterContainer}
      />
    );
  };

  const getHeaders = () => {
    const isFD = selectedAssetType === 'High Yield FDs';

    if (isFD) {
      return fdHeaders;
    }

    if (isArrears) {
      return inArrearsHeaders(selectedAssetType);
    }

    if (selectedType === 'past') {
      return pastHeaders(selectedAssetType);
    }

    return upcomingHeaders(selectedAssetType);
  };

  const getMobileFilterHeading = () => {
    if (isArrears) {
      return null;
    }

    let heading = 'Upcoming';

    if (selectedType === 'past') {
      heading = 'Past';
    }

    return `${heading} Returns for`;
  };

  const renderMobileFilters = () => {
    return (
      <div
        className={`items-align-center-row-wise ${styles.MobileFilterContainer}`}
      >
        <span className={styles.TextStyle14}>{getMobileFilterHeading()}</span>
        {renderFilters()}
      </div>
    );
  };

  const renderLoader = (className: string) => {
    return <ReturnsTableSkeleton className={className} />;
  };

  const renderNoDataComponent = (className: string) => {
    let label = `No ${selectedType} returns`;
    if (selectedType === 'arrears') {
      label = 'Nothing to show at the moment';
    }
    return (
      <NoData
        showIcon={false}
        header={label}
        subHeader=""
        buttonType={ButtonType.Primary}
        customButtonText={`${selectedType === 'arrears' ? '' : 'Invest More'}`}
        customButtonAction={handleNoDataOnClick}
        className={className}
      />
    );
  };

  const renderMobileTable = () => {
    if (isLoading) {
      return renderLoader(styles.MobileVisible);
    }

    if (!tableData.length) {
      return renderNoDataComponent(styles.MobileVisible);
    }

    return (
      <>
        <ReturnsOverview selectedType={selectedType} />
        <div className={styles.ReturnsTableMobile}>
          <ReturnsTableMobile
            isShowRemark={isArrears}
            onPageChange={changePage}
            pageNo={page}
            selectedType={selectedType}
          />
        </div>
      </>
    );
  };

  const renderMobileLayout = () => {
    return (
      <div className={styles.MobileLayoutContainer}>
        {renderMobileFilters()}
        {renderMobileTable()}
      </div>
    );
  };

  const changePage = (pageNo: number) => {
    setPage(pageNo);
    trackEvent('portfolio_summary_navigation_arrows', {
      user_id: userID,
      asset_type: selectedAssetType,
      timestamp: new Date().toISOString(),
      widget_used: 'my_returns',
      amount_invested: totalAmountInvested,
    });
  };

  const handleNoDataOnClick = () => {
    router.push('/assets');
  };

  const renderDesktopTable = () => {
    if (isLoading) {
      return renderLoader(styles.DesktopVisible);
    }

    if (!tableData.length) {
      return renderNoDataComponent(styles.DesktopVisible);
    }

    const renderTablePagination = () => {
      return (
        <TablePagination
          rowsPerPage={ROWS_PER_PAGE}
          totalCount={totalCount}
          onPageChange={changePage}
          className={styles.DesktopVisible}
          page={page}
        />
      );
    };

    return (
      <>
        <Table
          rows={tableData.slice(
            (page - 1) * ROWS_PER_PAGE,
            page * ROWS_PER_PAGE
          )}
          headers={getHeaders()}
          className={styles.Table}
        />
        {renderTablePagination()}
      </>
    );
  };

  return (
    <div className={'flex-column'}>
      <FilterTab
        tabArr={tabArr.filter(
          (ele) =>
            selectedAssetType !== 'High Yield FDs' || ele !== 'In-arrears'
        )}
        id={'ReturnsTable'}
        handleTabChangeCB={handleTabChangeCB}
        className={`flex ${styles.FilterTab}`}
      >
        <div className={`flex ${styles.FiltersContainer}`}>
          {renderFilters()}
          <DownloadReturns />
        </div>
      </FilterTab>
      {renderDesktopTable()}
      {renderMobileLayout()}
    </div>
  );
}
