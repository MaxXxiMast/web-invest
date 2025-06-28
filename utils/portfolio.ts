import dayjs from 'dayjs';
import { getMaturityDate, getMaturityMonths } from './asset';
import {
  financeProductTypeConstants,
  isAssetBasket,
  isAssetBonds,
  isAssetCommercialProduct,
  isAssetStartupEquity,
  isHighYieldFd,
  isSDISecondary,
} from './financeProductTypes';

import { numberToIndianCurrencyWithDecimals } from './number';
import { dateFormatter, formatDate } from './dateFormatter';

import { RFQPendingOrder } from '../redux/types/rfq';
import { getTenure } from '../components/fd-graph/utils';

export type InvestmentPortfolio = {
  bonds: number;
  sdi: number;
  leasing: number;
  inventory: number;
  commercial: number;
  startupEquity: number;
  highyieldfd: number;
};

export type PartialInvestmentPortfolio = Partial<InvestmentPortfolio>;

/**
 * Get Asset name from the esign document filename
 * @param filename name of the document for esign
 */
export const getAssetNameFromFilename = (filename: string = '') => {
  const fileDetails = filename?.split('_');
  return fileDetails[fileDetails.length - 1];
};

/**
 * ESIGN LOADING TIME - Setting it up for 10 sec
 */

export const ESIGN_LOADING_TIME = 10 * 1000;

/**
 * Function to genrate assetDetailInfo depending upon finance product type for portfolio page
 * @param portfolio
 * @returns {any} assetInfo
 */
export const getPortfolioAssetDetailInfo = (portfolio: any): any => {
  if (!portfolio) {
    return [];
  }

  let assetInfo: any = [
    {
      label: 'Yield To Maturity',
      suffix: '%',
      value: portfolio?.assetMappingData?.irr,
    },
    {
      label: '',
      suffix: `${portfolio?.tenure > 1 ? ' Months' : ' Month'}`,
      value: portfolio?.tenure,
    },
  ];
  if (isAssetCommercialProduct(portfolio?.assetDetails)) {
    assetInfo = [
      {
        label: 'Avg. Pre-Tax Yield',
        suffix: '%',
        value: portfolio?.assetMappingData?.irr,
      },
      {
        label: 'Target Pre-Tax IRR',
        suffix: '%',
        value: Number(
          portfolio?.assetMappingData?.targetPreTaxIRR ?? 0
        ).toFixed(2),
      },
    ];
  } else if (isAssetStartupEquity(portfolio?.assetDetails)) {
    assetInfo = [
      {
        label: '',
        value: portfolio?.assetMappingData?.fundingRound,
        suffix: null,
      },
      {
        label: '',
        value: portfolio?.assetMappingData?.leadInvestorName ?? 'Grip',
        suffix: null,
      },
    ];
  } else if (isAssetBonds(portfolio?.assetDetails)) {
    assetInfo = [
      {
        label: 'YTM',
        suffix: '%',
        value: Number(portfolio?.assetMappingData?.ytm ?? 0)?.toFixed(2),
      },
      {
        label: 'Coupon Rate',
        suffix: '%',
        value: portfolio?.assetMappingData?.couponRate,
      },
    ];
  } else if (isSDISecondary(portfolio?.assetDetails)) {
    assetInfo = [
      {
        label: 'Pre-Tax IRR',
        suffix: '%',
        value: portfolio?.assetMappingData?.irr,
      },
      {
        label: '',
        suffix: `${portfolio?.tenure > 1 ? ' Months' : ' Month'}`,
        value: portfolio?.tenure,
      },
    ];
  }
  return assetInfo;
};

export const upcommingReturnFilter = [
  { id: 'deal', label: 'Deal Wise' },
  { id: 'month', label: 'Month Wise' },
];

/**
 * Can be used later
 * Updated due to this: https://gripinvest.atlassian.net/browse/PT-25862
 */
// export const investmentFilterMapping = {
//   'Next 7 Days': '7days',
//   'Next 14 Days': '14days',
//   'This Month': 'thismonth',
//   'Next Month': 'nextmonth',
//   'Metrics Pending': 'metricsPending',
//   next8month: 'next8month',
// };

// Updated due to this ticket https://gripinvest.atlassian.net/browse/PT-15963
// Will update once backend api fixes
// export const filterInvestmentArr = [
//   // 'Next 7 Days',
//   // 'Next 14 Days',
//   'This Month',
//   'Next Month',
//   'Metrics Pending',
// ];

// ----------- RFQ Changes starts --------------

export type OrderStatus = 'completed' | 'pending' | 'initiated' | 'isAmo' | '';

export type StatusListArr = {
  name: string;
  date: string;
  status: OrderStatus;
};

export type showModaltype = 'TRANSACTION' | 'SCHEDULE' | 'DEAL' | null;
export type statusType =
  | 'PENDING'
  | 'INITIATED'
  | 'COMPLETE'
  | 'TRANSFER'
  | 'CONFIRMED'
  | 'unknown';

export const isPastDate = (date) => {
  const dayFormat = 'DD/MMM/YYYY HH:mm:ss';
  const todayDate = new Date(dayjs().tz('Asia/calcutta').format(dayFormat));
  const inputDate = new Date(dayjs(date).format(dayFormat));
  // Check if the input date is less than today's date
  return inputDate.getTime() < todayDate.getTime();
};

export function getStatus(
  enumValue: number,
  date: any,
  isRfq: number
): statusType {
  const statusMap = {
    0: 'PENDING', //Payment Pending
    7: 'INITIATED', // Payment Processing for Non-RFQ
    8: 'TRANSFER', // Payment Completed (Transfer Initiated)
    1: 'COMPLETE', // Security Transfer Completed
  };
  if (enumValue === 7) return 'CONFIRMED'; // 7: Payment confirmed if RFQ Deal
  return statusMap[enumValue] || 'unknown';
}

export const handleInvestmentDetails = (portfolio: any) => {
  // Bonds card properties
  let dataArr = [
    {
      label: 'Invested',
      value: `${numberToIndianCurrencyWithDecimals(
        Number(portfolio?.txns?.[0]?.orderAmount || 0)
      )}`,
      suffix: '',
      hideInMobile: false,
      mobileOrder: 1,
    },
    {
      label: 'Expected Returns',
      value: `${numberToIndianCurrencyWithDecimals(
        Number(portfolio?.txns?.[0]?.expectedReturns)
      )}`,
      suffix: '',
      hideInMobile: false,
      mobileOrder: 3,
    },
    {
      label: 'YTM',
      value: Number(portfolio?.assetMappingData?.preTaxYtm ?? 0)?.toFixed(2),
      suffix: '%',
      hideInMobile: false,
      mobileOrder: 2,
    },
    {
      label: 'Unit(s)',
      value: portfolio?.txns?.[0]?.noOfUnits || 0,
      suffix: '',
      hideInMobile: true,
      mobileOrder: 4,
    },
    {
      label: 'Tenure',
      value: portfolio?.tenure,
      suffix: `${portfolio?.tenure > 1 ? ' Months' : ' Month'}`,
      hideInMobile: true,
      mobileOrder: 5,
    },
  ];

  // SDI secondary card properties
  if (isSDISecondary(portfolio?.assetDetails)) {
    dataArr = [
      {
        label: 'Invested',
        value: `${numberToIndianCurrencyWithDecimals(
          Number(portfolio?.txns?.[0]?.orderAmount || 0)
        )}`,
        suffix: '',
        hideInMobile: false,
        mobileOrder: 1,
      },
      {
        label: 'Expected Returns',
        value: `${numberToIndianCurrencyWithDecimals(
          Number(portfolio?.txns?.[0]?.expectedReturns || 0)
        )}`,
        suffix: '',
        hideInMobile: false,
        mobileOrder: 2,
      },
      {
        label: 'YTM',
        value: Number(
          (portfolio?.assetMappingData?.irr ||
            portfolio?.assetMappingData?.preTaxYtm) ??
            0
        ).toFixed(2),
        suffix: '%',
        hideInMobile: false,
        mobileOrder: 3,
      },
      {
        label: 'Lots(s)',
        value: portfolio?.txns?.[0]?.noOfUnits || 0,
        suffix: '',
        hideInMobile: true,
        mobileOrder: 4,
      },
      {
        label: 'Tenure',
        value: portfolio?.tenure,
        suffix: `${portfolio?.tenure > 1 ? ' Months' : ' Month'}`,
        hideInMobile: true,
        mobileOrder: 5,
      },
    ];
  }

  // Basket Card Properties
  if (isAssetBasket(portfolio?.assetDetails)) {
    dataArr = [
      {
        label: 'Invested',
        value: `${numberToIndianCurrencyWithDecimals(
          Number(portfolio?.txns?.[0]?.orderAmount || 0)
        )}`,
        suffix: '',
        hideInMobile: false,
        mobileOrder: 1,
      },
      {
        label: 'Expected Returns',
        value: `${numberToIndianCurrencyWithDecimals(
          Number(portfolio?.txns?.[0]?.expectedReturns || 0)
        )}`,
        suffix: '',
        hideInMobile: false,
        mobileOrder: 2,
      },
      {
        label: 'YTM',
        value: Number(
          (portfolio?.assetMappingData?.irr ||
            portfolio?.assetMappingData?.preTaxYtm) ??
            0
        ).toFixed(2),
        suffix: '%',
        hideInMobile: false,
        mobileOrder: 3,
      },
      {
        label: 'Unit(s)',
        value: portfolio?.txns?.[0]?.noOfUnits || 0,
        suffix: '',
        hideInMobile: true,
        mobileOrder: 4,
      },
      {
        label: 'Tenure',
        value: getMaturityMonths(getMaturityDate(portfolio)),
        suffix: `${
          getMaturityMonths(getMaturityDate(portfolio)) > 1
            ? ' Months'
            : ' Month'
        }`,
        hideInMobile: true,
        mobileOrder: 5,
      },
    ];
  }

  // FD card properties
  if (isHighYieldFd(portfolio?.assetDetails)) {
    const tenure = getTenure(portfolio?.tenure);
    dataArr = [
      {
        label: 'Invested',
        value: `${numberToIndianCurrencyWithDecimals(
          Number(portfolio?.txns?.[0]?.orderAmount || 0)
        )}`,
        suffix: '',
        hideInMobile: false,
        mobileOrder: 1,
      },
      {
        label: 'Expected Returns',
        value: `${numberToIndianCurrencyWithDecimals(
          Number(portfolio?.txns?.[0]?.expectedReturns || 0)
        )}`,
        suffix: '',
        hideInMobile: false,
        mobileOrder: 2,
      },
      {
        label: 'Rate',
        value: portfolio?.rate || 0,
        suffix: '%',
        hideInMobile: false,
        mobileOrder: 3,
      },
      {
        label: 'Tenure',
        value: tenure,
        suffix: ``,
        hideInMobile: true,
        mobileOrder: 5,
      },
    ];
  }

  return dataArr;
};

export const getSlideData = (portfolio): RFQPendingOrder => {
  // const { assetID, assetName, partnerLogo } = portfolio;
  // const { transactionID, orderDate, amount, expiresBy } = portfolio || {};

  const { assetID, assetName } = portfolio?.assetDetails;
  const partnerLogo = portfolio?.partner?.logo;
  const amount = portfolio?.txns?.[0]?.orderAmount || portfolio?.amount || {};
  const { transactionID, orderDate, expiresBy } =
    portfolio?.txns?.[0] || portfolio || {};

  return {
    transactionID,
    orderDate,
    assetID,
    amount,
    expireBy: expiresBy,
    assetName,
    partnerLogo,
  };
};

const getStatusStatus = (currentStatus: string) => {
  if (currentStatus === 'TRANSFER' || currentStatus === 'CONFIRMED') {
    return 'completed';
  } else if (currentStatus === 'INITIATED') {
    return 'initiated';
  } else {
    return 'pending';
  }
};

export const getOrderStatus = (portfolio): any => {
  const { isRfq, isAmo, assetDetails } = portfolio || {};

  const {
    orderDate,
    status,
    lastUpdatedAt,
    createdAt,
    paymentGatewayID,
    paymentMethod,
    orderDateDetail,
  } = portfolio?.txns?.[0] || {};

  const { securityTransferDate, transferInitiatedDate } = orderDateDetail || {};

  const currentStatus = getStatus(status, transferInitiatedDate, isRfq);
  const { financeProductType } = assetDetails || {};
  const isNonRfqSdi =
    financeProductType === financeProductTypeConstants?.sdi && !isRfq;

  const payment = {
    name: 'Payment',
    date: dateFormatter({
      dateTime: lastUpdatedAt,
      timeZoneEnable: true,
      dateFormat: formatDate,
    }),
    status: getStatusStatus(currentStatus),
  };

  const order = {
    name: isAmo ? 'AMO Placed' : 'Order Placed',
    date: dateFormatter({
      dateTime: isAmo ? createdAt : orderDate,
      timeZoneEnable: true,
      dateFormat: formatDate,
    }),
    status: isAmo ? 'isAmo' : 'completed',
  };

  const securitiesTransfer = {
    name: 'Securities Transfer',
    date: isNonRfqSdi
      ? 'Upto 5 working days'
      : 'by ' +
        dateFormatter({
          dateTime: securityTransferDate,
          timeZoneEnable: true,
          dateFormat: 'DD MMM YYYY, hh:mm A',
        }),
    status: currentStatus === 'COMPLETE' ? 'completed' : '',
  };

  const transferInitiation = {
    name:
      currentStatus === 'TRANSFER'
        ? 'Transfer Initiated'
        : 'Transfer Initiation',
    date:
      'by ' +
      dateFormatter({
        dateTime: transferInitiatedDate,
        timeZoneEnable: true,
        dateFormat: `DD MMM YYYY${
          currentStatus === 'TRANSFER' ? '' : ', hh:mm A'
        }`,
      }),
    status: currentStatus === 'TRANSFER' ? 'completed' : '',
  };

  if (paymentGatewayID) {
    // PAYMENT METHOD => 0: '', 1: NET_BANKING, 2: UPI, 3: CREDIT_CARD, 4: DEBIT_CARD, 5: N/A, 6: NEFT
    if (paymentMethod === 6) {
      return [order, payment, securitiesTransfer];
    }
    return [payment, order, securitiesTransfer];
  }

  return [order, payment, transferInitiation, securitiesTransfer];
};

// ----------- RFQ Changes ends --------------
