import { useState } from 'react';
import dayjs from 'dayjs';

// components
import Skeleton from '../Skeleton';
import OrderType from '../OrderType';
import NoData from '../../common/noData';
import Image from '../../primitives/Image';
import MyHoldingsLink from '../MyHoldingsLink';
import GripSelect from '../../common/GripSelect';
import MyTransactionsPagination from '../Pagination';
import SearchBox from '../../primitives/SearchBox/SearchBox';
import PortfolioFilter from '../../portfolio-investment/PortfolioFilter';
import LLPTransactions from '../LLPTransactions';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';
import PopoverBuySell from '../../portfolio/popover-buysell/PopoverBuySell';

// utils
import { dealTypeOptions } from '../utils';
import { numberToIndianCurrency, roundOff } from '../../../utils/number';

// types
import type {
  MyTransaction,
  MyTransactions,
  MyTransactionsCount,
} from '../types';

// styles
import styles from './MyTransactions.module.css';
import popoverStyles from '../../portfolio/popover-buysell/PopoverBuySell.module.css';

// data
import ActionMenu from '../../action-menu';

const formatDate = (date: Date | string | null): string => {
  if (!date) return '-';
  return dayjs(date).format('D MMM YYYY, h:mm A');
};

const OrderTypeWithTooltip = ({ asset }: { asset: MyTransaction }) => {
  const getTooltipContent = () => {
    if (!asset.timestamps) return null;

    const orderPlacedDate = formatDate(asset.timestamps.orderPlaced);

    if (asset.orderType.toUpperCase() === 'BUY') {
      return (
        <PopoverBuySell
          orderPlacedDate={orderPlacedDate}
          processingStatus={asset.orderStatus}
          transferLabel="Security Transfer"
          transferValue={formatDate(asset?.timestamps?.securityTransfer)}
        />
      );
    } else if (asset.orderType.toUpperCase() === 'SELL') {
      return (
        <PopoverBuySell
          orderPlacedDate={orderPlacedDate}
          processingStatus={asset.orderStatus}
          transferLabel="Money Transfer"
          transferValue={formatDate(asset?.timestamps?.orderSettlementDate)}
        />
      );
    }

    return null;
  };

  return (
    <TooltipCompoent
      toolTipText={getTooltipContent()}
      placementValue="top"
      additionalStyle={{
        ToolTipStyle: popoverStyles.ToolTipPopUp,
        ParentClass: popoverStyles.TooltipPopper,
        ArrowStyle: popoverStyles.ArrowToolTip,
      }}
    >
      <OrderType
        type={asset.orderType}
        status={asset.orderStatus}
        statusNumber={asset?.status}
        transfer={
          asset?.orderType.toLocaleUpperCase() === 'SELL'
            ? asset?.timestamps?.orderSettlementDate
            : asset?.timestamps?.securityTransfer
        }
      />
    </TooltipCompoent>
  );
};

const renderYTMOrPending = (asset) => {
  if (asset?.orderStatus === 'pending' || asset?.status === 0) {
    return <div className={styles.mobPending}>Pending</div>;
  }

  return (
    <span className={styles.value}>
      {asset?.ytm > 0 ? `${roundOff(asset?.ytm, 2)}%` : '-'}
    </span>
  );
};

const assetCard = (asset: MyTransaction) => {
  const formattedDate = dayjs(asset.transactionDate).format('D MMM YYYY');
  return (
    <div className={styles.assetCard} key={asset.orderID}>
      <div className="flex items-center justify-between">
        <Image
          src={asset.logo}
          alt="asset-icon"
          height={50}
          layout="intrinsic"
        />
        <div className="flex items-center">
          <ActionMenu
            type={'transactions'}
            orderID={asset?.orderID}
            transactionLogo={asset?.logo}
            assetName={asset?.isin ?? asset?.header}
            orderType={asset?.orderType}
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-12">
        <div className="flex-column">
          <span className={styles.value}>
            {asset?.amount ? (
              numberToIndianCurrency(asset?.amount)
            ) : (
              <span className={styles.mobPending}>Pending</span>
            )}
          </span>
          <span className={styles.label}>{asset.units} units</span>
        </div>
        <div className="flex-column items-center">
          {renderYTMOrPending(asset)}
          <span className={`flex justify-center items-center ${styles.label}`}>
            YTM/XIRR{' '}
            <div className={styles.tooltipDiv}>
              <TooltipCompoent
                toolTipText={
                  'YTM applies to Buy transactions, while XIRR applies to Sell transactions.'
                }
              >
                <span
                  className={`icon-info`}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--gripBlue, #00357c)',
                  }}
                />
              </TooltipCompoent>
            </div>
          </span>
        </div>
        <div className="flex-column items-end">
          <span className={styles.value}>
            {asset?.orderType === 'SELL' ? '-' : asset.holdingPeriod}
          </span>
          <span className={styles.label}>Tenure</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-12">
        <span className={styles.date}>Ordered on {formattedDate}</span>
        <OrderTypeWithTooltip asset={asset} />
      </div>
    </div>
  );
};

type props = {
  loading?: boolean;
  transactions?: MyTransactions;
  activeProduct?: string;
  search?: string;
  handleSearch?: (search: string) => void;
  handleProductChange?: (product: string) => void;
  transactionsCount?: MyTransactionsCount;
  page?: number;
  totalPages?: number;
  handlePageChange?: (event: any, page: number) => void;
  orderType?: string;
  handleOrderType?: (event: any) => void;
  tabLoading?: boolean;
};

const Mobile = ({
  loading = false,
  transactions = [],
  search = '',
  handleSearch = () => {},
  activeProduct = 'Bonds',
  handleProductChange = () => {},
  transactionsCount = [],
  page = 1,
  totalPages = 1,
  handlePageChange = () => {},
  orderType = 'ALL',
  handleOrderType = () => {},
  tabLoading = false,
}: props) => {
  const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);

  const renderTable = (orderType: string) => {
    if (loading || tabLoading) {
      return <Skeleton isMobile />;
    }
    if (transactions.length === 0)
      return (
        <NoData
          header=""
          subHeader={'You have not made any transactions yet.'}
        />
      );

    return transactions.map((asset) => assetCard(asset));
  };
  if (transactionsCount?.length === 0 && !tabLoading)
    return (
      <NoData header="" subHeader={'You have not made any transactions yet.'} />
    );

  return (
    <div
      className={styles.container}
      id="MyTransactions"
      data-testid="MyTransactionsMobile"
    >
      <PortfolioFilter
        isMobile={true}
        activeFilter={activeProduct}
        handleFilter={handleProductChange}
        productTypes={transactionsCount}
        parentId="#MyTransactions"
        mobileTopPosition={45.5}
      />
      {activeProduct !== 'Leasing & Inventory' ? (
        <div className={`flex ${styles.header}`}>
          <SearchBox
            value={search}
            handleInputChange={handleSearch}
            placeHolder="Search"
            className={styles.searchBox}
          />
          <GripSelect
            value={orderType}
            onChange={handleOrderType}
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
      ) : null}
      <MyHoldingsLink />
      {activeProduct === 'Leasing & Inventory' ? (
        <LLPTransactions
          setShowDownloadDrawer={setShowDownloadDrawer}
          showDownloadDrawer={showDownloadDrawer}
        />
      ) : (
        <>
          <div className={styles.table} data-testid="table">
            {renderTable(orderType)}
          </div>
          <MyTransactionsPagination
            activePage={page}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default Mobile;
