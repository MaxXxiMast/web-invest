// components
import Skeleton from '../Skeleton';
import NoData from '../../../common/noData';
import Table from '../../../primitives/Table';
import MyHoldingsPagination from '../Pagination';
import GripSelect from '../../../common/GripSelect';
import SearchBox from '../../../primitives/SearchBox/SearchBox';
import PortfolioFilter from '../../../portfolio-investment/PortfolioFilter';
import { LeasingInvestments } from '../../../portfolio-investment';

// utils
import { dealTypeOptions, getTableHeaders } from './utils';
import { headerMapping, hiddenProductTypes } from '../utils';

// redux
import { useAppSelector } from '../../../../redux/slices/hooks';

// styles
import styles from './MyHoldings.module.css';

// types
import { Holdings, MyHoldingsCount } from '../types';

type propsTypes = {
  dealType: string;
  setDealType: (e: any) => void;
  loading?: boolean;
  myHoldingsCount: MyHoldingsCount[];
  holdings: Holdings;
  activeProductType: string;
  handleProductType: (e: any) => void;
  page: number;
  totalPages: number;
  handlePageChange: (_e: any, page: number) => void;
  search: string;
  handleSearch: (e: any) => void;
  totalEntries: number;
  tabLoading?: boolean;
};

const Desktop = ({
  dealType,
  setDealType,
  loading = false,
  myHoldingsCount = [],
  holdings = [],
  activeProductType = 'Bonds',
  handleProductType = () => {},
  page = 1,
  totalPages = 1,
  handlePageChange = () => {},
  search = '',
  handleSearch = () => {},
  totalEntries = 0,
  tabLoading = false,
}: propsTypes) => {
  const user = useAppSelector((state) => state.user);
  const { portfolio } = user || {};
  let portfolioList = portfolio?.list?.length ? [...portfolio.list] : [];

  const renderTable = () => {
    const isHiddenProductType = hiddenProductTypes.includes(activeProductType);
    if (loading || tabLoading) {
      return (
        <Skeleton
          isFd={activeProductType === 'High Yield FDs'}
          isHiddenProductType={isHiddenProductType}
        />
      );
    }
    if (isHiddenProductType) {
      return (
        <LeasingInvestments
          dataId={activeProductType}
          key={activeProductType}
          portfolio={portfolioList.filter(
            (ele) => ele?.assetDetails?.financeProductType === activeProductType
          )}
          isHoldings
        />
      );
    }
    if (holdings.length === 0)
      return (
        <NoData
          header=""
          subHeader={
            dealType === 'active'
              ? 'No Active Investments'
              : 'No Past Investments'
          }
        />
      );
    return (
      <Table
        rows={holdings}
        headers={getTableHeaders(dealType, activeProductType, dealType)}
        className={styles.Table}
      />
    );
  };

  if (myHoldingsCount?.length === 0 && !tabLoading) {
    return (
      <NoData
        header=""
        subHeader={
          dealType === 'active'
            ? 'No Active Investments'
            : 'No Past Investments'
        }
      />
    );
  }

  return (
    <div
      className={styles.container}
      id="MyHoldingsDesktop"
      data-testid="MyHoldingsDesktop"
    >
      <PortfolioFilter
        isMobile={false}
        activeFilter={activeProductType}
        handleFilter={handleProductType}
        productTypes={myHoldingsCount}
        parentId="#MyHoldingsDesktop"
        isSticky={false}
        tabLoading={tabLoading}
      />
      <div className={styles.tableContainer}>
        <div className={styles.header}>
          <h2>{headerMapping[activeProductType]}</h2>
          {hiddenProductTypes.includes(activeProductType) ? null : (
            <div className={`flex ${styles.filter}`}>
              <SearchBox
                value={search}
                handleInputChange={handleSearch}
                placeHolder="Issuer name or ISIN"
                className={styles.searchBox}
              />
              <GripSelect
                value={dealType}
                onChange={setDealType}
                options={dealTypeOptions}
                showScrollbar={true}
                showPlaceholder={false}
                placeholder="Select Deal Type"
                classes={{
                  formControlRoot: styles.formControlRoot,
                  root: styles.selectRoot,
                  select: styles.select,
                  selectMenuIcon: styles.selectMenuIcon,
                }}
              />
            </div>
          )}
        </div>
        {renderTable()}
        {totalPages === 1 ? null : (
          <MyHoldingsPagination
            activePage={page}
            totalPages={totalPages}
            totalEntries={totalEntries}
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Desktop;
