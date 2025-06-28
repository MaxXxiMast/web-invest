import dayjs from 'dayjs';
import { numberToIndianCurrency, roundOff } from '../../../utils/number';
import Image from '../../primitives/Image';
import OrderType from '../OrderType';
import { MyTransaction } from '../types';
import styles from '../../portfolio/popover-buysell/PopoverBuySell.module.css';
import ActionMenu from '../../action-menu';
import PopoverBuySell from '../../portfolio/popover-buysell/PopoverBuySell';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';

const OrderTypeWithTooltip = ({ item }: { item: MyTransaction }) => {
  const formatDate = (date: Date | string | null): string => {
    if (!date) return '-';
    return dayjs(date).format('D MMM YYYY, h:mm A');
  };

  const getTooltipContent = () => {
    if (!item.timestamps) return null;

    const orderPlacedDate = formatDate(item.timestamps.orderPlaced);

    if (item.orderType.toUpperCase() === 'BUY') {
      return (
        <PopoverBuySell
          orderPlacedDate={orderPlacedDate}
          processingStatus={item.orderStatus}
          transferLabel="Security Transfer"
          transferValue={formatDate(item?.timestamps?.securityTransfer)}
        />
      );
    } else if (item.orderType.toUpperCase() === 'SELL') {
      return (
        <PopoverBuySell
          orderPlacedDate={orderPlacedDate}
          processingStatus={item.orderStatus}
          transferLabel="Money Transfer"
          transferValue={formatDate(item?.timestamps?.orderSettlementDate)}
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
        ToolTipStyle: styles.ToolTipPopUp,
        ParentClass: styles.TooltipPopper,
        ArrowStyle: styles.ArrowToolTip,
      }}
    >
      <OrderType
        type={item.orderType}
        status={item?.orderStatus}
        statusNumber={item?.status}
        transfer={
          item?.orderType === 'SELL'
            ? item?.timestamps?.orderSettlementDate
            : item?.timestamps?.securityTransfer
        }
      />
    </TooltipCompoent>
  );
};

// Table headers
const icon = {
  key: '',
  label: 'Security',
  customRow: (item: MyTransaction) => {
    return (
      <Image src={item.logo} alt="asset-icon" height={50} layout="intrinsic" />
    );
  },
  style: {
    width: 170,
  },
};
const investment = {
  key: '',
  label: 'Amount',
  customRow: (item: MyTransaction) => {
    return (
      <div className="flex-column items-center">
        <span className={styles.investment}>
          {item.amount ? (
            numberToIndianCurrency(item.amount)
          ) : (
            <span className={styles.AmountPending}>Amt Pending</span>
          )}
        </span>
        <span className={styles.units}>{item.units} units</span>
      </div>
    );
  },
};

const type = {
  key: '',
  label: 'Type',
  customRow: (item: MyTransaction) => {
    return <OrderTypeWithTooltip item={item} />;
  },
  style: {
    width: 100,
  },
};

export const getTableHeaders = (activeProduct: string) => {
  return [
    icon,
    investment,
    {
      key: '',
      label: (
        <div
          className={`flex justify-center items-center ${styles.toolTipDiv}`}
        >
          <span>YTM/XIRR</span>
          <TooltipCompoent
            toolTipText={
              'YTM applies to Buy transactions, while XIRR applies to Sell transactions.'
            }
          >
            <span
              className="icon-info"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--gripBlue, #00357c)',
              }}
            />
          </TooltipCompoent>
        </div>
      ),
      customRow: (item: MyTransaction) => {
        if (item?.orderStatus === 'pending' || item?.status === 0) {
          return (
            <div className={`flex-column items-center ${styles.YTMPending}`}>
              <span>YTM</span>
              <span> Pending</span>
            </div>
          );
        }
        return (
          <span>{item?.ytm > 0 ? `${roundOff(item?.ytm, 2)}%` : '-'}</span>
        );
      },
    },

    {
      key: '',
      label: 'Tenure',
      customRow: (item: MyTransaction) => {
        return (
          <span>{item?.orderType === 'SELL' ? '-' : item.holdingPeriod}</span>
        );
      },
    },
    {
      key: '',
      label: 'Transaction Date',
      customRow: (item: MyTransaction) => {
        const formattedDate = dayjs(item.transactionDate).format('D MMM YYYY');
        return <span>{formattedDate}</span>;
      },
    },
    type,
    {
      key: '',
      label: '',
      customRow: (item: MyTransaction) => (
        <ActionMenu
          type={'transactions'}
          orderID={item?.orderID}
          transactionLogo={item?.logo}
          orderType={item?.orderType}
          activeProduct={activeProduct}
          assetName={item?.isin ?? item?.header}
        />
      ),
    },
  ];
};
