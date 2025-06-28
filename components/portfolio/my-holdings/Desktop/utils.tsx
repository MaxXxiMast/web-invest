// libraries
import dayjs from 'dayjs';

// components
import Status from '../Status';
import PartialSold from '../ParitalSold';
import ActionMenu from '../../../action-menu';
import Image from '../../../primitives/Image';

// utils
import {
  numberToIndianCurrency,
  roundOff,
  toCurrecyStringWithDecimals,
} from '../../../../utils/number';
import { getMaturityMonthsForHolding } from '../utils';

// styles
import styles from './MyHoldings.module.css';

// types
import { Holding } from '../types';

export const dealTypeOptions = [
  {
    value: 'active',
    labelKey: 'Active Investments',
  },
  {
    value: 'past',
    labelKey: 'Completed Investments',
  },
];

const returns = {
  key: '',
  label: 'Expected Return',
  customRow: (item: Holding) => {
    return (
      <div className="flex-column items-center">
        <div className="flex-column items-center">
          <div className={styles.progressBar}>
            <span
              style={{
                width: `${(item.receivedReturns / item.totalReturns) * 100}%`,
              }}
            />
          </div>
          <span className={styles.progressNumbers}>
            ₹{toCurrecyStringWithDecimals(item.receivedReturns, 1, true)} of ₹
            {toCurrecyStringWithDecimals(item.totalReturns, 1, true)}
          </span>
        </div>
      </div>
    );
  },
  style: {
    width: 210,
  },
};

const status = {
  key: '',
  label: 'Status',
  customRow: (item: Holding) => {
    return <Status status={item.status} />;
  },
  style: {
    width: 150,
  },
};

const icon = {
  key: '',
  label: 'Security',
  customRow: (item: Holding) => {
    return (
      <div className="flex-column items-start">
        {item?.partialSold ? (
          <PartialSold
            show={item.partialSold}
            securityID={item?.securityID}
            assetName={item?.isin ?? item?.header}
          />
        ) : null}
        <div className="">
          {item?.logo ? (
            <Image
              src={item.logo}
              alt="asset-icon"
              height={36}
              width={100}
              layout="intrinsic"
            />
          ) : (
            <div
              className={`flex items-center justify-center ${styles.partnerName}`}
            >
              {item.partnerName}
            </div>
          )}
        </div>
        <span className={styles.desc}>{item.header}</span>
      </div>
    );
  },
  style: {
    width: 250,
  },
};

const investment = {
  key: '',
  label: 'Investment',
  customRow: (item: Holding) => {
    return (
      <div className="flex-column items-center">
        <span>{numberToIndianCurrency(item.investedAmount)}</span>
        <span className={styles.units}>{item.units} unit(s)</span>
      </div>
    );
  },
};

export const getTableHeaders = (
  activeFilter: string,
  activeProduct: string,
  dealType: string
) => {
  if (activeFilter === 'active') {
    return [
      icon,
      investment,
      {
        key: '',
        customRow: (item: Holding) => {
          return item?.xirr > 0 ? <span>{roundOff(item.xirr, 1)}%</span> : '-';
        },
        label: 'YTM',
      },
      {
        key: '',
        label: 'Tenure Left',
        customRow: (item: Holding) => {
          return (
            <span>{getMaturityMonthsForHolding(dayjs(item.maturityDate))}</span>
          );
        },
      },
      returns,
      {
        key: '',
        label: '',
        customRow: (item: Holding) => (
          <ActionMenu
            type={'holdings'}
            securityID={item?.securityID}
            lockInDate={item?.availableSellDate}
            logo={item?.logo}
            units={item?.units}
            xirr={item?.xirr}
            filter={activeFilter}
            assetName={item?.isin ?? item?.header}
            maturityDate={item?.maturityDate}
            activeProduct={activeProduct}
            dealType={dealType}
          />
        ),
      },
    ];
  } else {
    return [
      icon,
      investment,
      {
        key: 'xirr',
        customRow: (item: Holding) => {
          return item?.xirr > 0 ? <span>{roundOff(item.xirr, 1)}%</span> : '-';
        },
        label: 'XIRR',
      },
      {
        key: 'totalReturns',
        label: 'Total Returns',
        customRow: (item: Holding) => {
          return <span>{numberToIndianCurrency(item?.totalReturns)}</span>;
        },
      },
      status,
      {
        key: '',
        label: '',
        customRow: (item: Holding) => (
          <ActionMenu
            type={'holdings'}
            securityID={item?.securityID}
            lockInDate={item?.availableSellDate}
            logo={item?.logo}
            units={item?.units}
            xirr={item?.xirr}
            filter={activeFilter}
            assetName={item?.isin ?? item?.header}
            maturityDate={item?.maturityDate}
            activeProduct={activeProduct}
          />
        ),
      },
    ];
  }
};
