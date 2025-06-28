import dayjs from 'dayjs';

// components
import Status from '../Status';
import Skeleton from '../Skeleton';
import PartialSold from '../ParitalSold';
import NoData from '../../../common/noData';
import ActionMenu from '../../../action-menu';
import Image from '../../../primitives/Image';
import MyHoldingsPagination from '../Pagination';
import GripSelect from '../../../common/GripSelect';
import SearchBox from '../../../primitives/SearchBox/SearchBox';
import PortfolioFilter from '../../../portfolio-investment/PortfolioFilter';
import { LeasingInvestments } from '../../../portfolio-investment';

// utils
import {
  numberToIndianCurrency,
  roundOff,
  toCurrecyStringWithDecimals,
} from '../../../../utils/number';
import { getMaturityMonthsForHolding, hiddenProductTypes } from '../utils';
import { dealTypeOptions } from './utils';
import { useAppSelector } from '../../../../redux/slices/hooks';

// types
import { Holding, Holdings, MyHoldingsCount } from '../types';

// styles
import styles from './MyHoldings.module.css';

const assetCard = (
  asset: Holding,
  dealType: string,
  activeProductType: string
) => {
  return (
    <div className={styles.assetCard} key={asset.securityID}>
      <div className="flex items-center justify-between">
        {asset?.logo ? (
          <Image
            src={asset.logo}
            alt="asset-icon"
            height={36}
            width={100}
            layout="intrinsic"
          />
        ) : (
          <div
            className={`flex items-center justify-center ${styles.partnerName}`}
          >
            {asset.partnerName}
          </div>
        )}
        <div className="flex items-center gap-10">
          <Status status={asset.status} />
          <ActionMenu
            type={'holdings'}
            securityID={asset?.securityID}
            lockInDate={asset?.availableSellDate}
            logo={asset?.logo}
            units={asset?.units}
            xirr={asset?.xirr}
            maturityDate={asset?.maturityDate}
            assetName={asset?.isin ?? asset?.header}
            activeProduct={activeProductType}
            dealType={dealType}
          />
        </div>
      </div>
      {asset?.header ? <p className={styles.desc}>{asset?.header}</p> : null}
      {dealType === 'active' && (
        <div className={`flex items-center ${styles.progressContainer}`}>
          <div className={styles.progressBar}>
            <span
              style={{
                width: `${
                  (asset?.receivedReturns / asset?.totalReturns) * 100
                }%`,
              }}
            />
          </div>
          <span className={styles.progress}>
            ₹{toCurrecyStringWithDecimals(asset?.receivedReturns, 1, true)} of ₹
            {toCurrecyStringWithDecimals(asset?.totalReturns, 1, true)}
          </span>
        </div>
      )}
      <div
        className={`flex items-center justify-between ${styles.dataContainer}`}
      >
        <div className="flex-column">
          <span className={styles.value}>
            {numberToIndianCurrency(asset.investedAmount)}
          </span>
          <span className={styles.label}>{asset.units} unit(s) </span>
        </div>
        <div className="flex-column items-center">
          <span className={styles.value}>
            {asset?.xirr > 0 ? `${roundOff(asset?.xirr, 1)}%` : '-'}
          </span>
          <span className={styles.label}>YTM</span>
        </div>
        <div className="flex-column items-end">
          {dealType === 'active' ? (
            <>
              <span className={styles.value}>
                {getMaturityMonthsForHolding(dayjs(asset.maturityDate))}
              </span>
              <span className={styles.label}>Tenure Left</span>
            </>
          ) : (
            <>
              <span className={styles.value}>
                ₹{roundOff(asset?.totalReturns, 1)}
              </span>
              <span className={styles.label}>Total Returns</span>
            </>
          )}
        </div>
      </div>
      <div className={styles.partialSoldDiv}>
        <PartialSold
          securityID={asset?.securityID}
          assetName={asset?.isin}
          show={asset.partialSold}
        />
      </div>
    </div>
  );
};

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
  tabLoading?: boolean;
};

const Mobile = ({
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
          isMobile
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

    return holdings.map((asset) =>
      assetCard(asset, dealType, activeProductType)
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
      id="MyHoldingsMobile"
      data-testid="MyHoldingsMobile"
    >
      <PortfolioFilter
        isMobile={true}
        activeFilter={activeProductType}
        handleFilter={handleProductType}
        productTypes={myHoldingsCount}
        parentId="#MyHoldingsMobile"
        mobileTopPosition={43.5}
      />
      {hiddenProductTypes.includes(activeProductType) ? null : (
        <div className={`flex ${styles.header}`}>
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
      <div className={styles.table} data-testid="table">
        {renderTable()}
      </div>
      {totalPages === 1 ? null : (
        <MyHoldingsPagination
          activePage={page}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Mobile;
