import dayjs from 'dayjs';
import { roundOff, numberToIndianCurrency } from './number';
import { replaceAll, urlify } from './string';
import {
  financeProductTypeConstants,
  isAssetStartupEquity,
} from './financeProductTypes';

type StatusValues = 'active' | 'past' | 'upcoming' | 'unknown';

export type validSections =
  | 'all'
  | 'bonds'
  | 'leasing'
  | 'inventory'
  | 'popular'
  | 'realEstate'
  | 'startupEquity'
  | 'sdi'
  | 'Baskets';

export const assetPaymentStatus = [
  'Confirmed',
  'Completed',
  'Ongoing',
  'Onhold',
  'Disabled',
  'Ongoing',
];

export const assetStatus = (asset: any): StatusValues => {
  return (asset?.assetStatus?.toLowerCase() ||
    asset?.status?.toLowerCase()) as StatusValues;
};

export const isFirstTimeInvestor = (userInfo: any) => {
  return !Boolean(userInfo?.investmentData?.totalInvestments);
};

/**
 *
 * @param maturityDate
 * @returns
 */
export const getMaturityMonths = (maturityDate = dayjs()) => {
  return Math.round((dayjs(maturityDate).diff(dayjs(), 'days') - 2) / 30.4);
};

export const getMaturityDate = (asset: any) => {
  return (
    asset?.assetMappingData?.calculationInputFields?.dateOfMaturity ||
    asset?.assetMappingData?.calculationInputFields?.maturityDate ||
    asset?.assetMappingData?.calculationInputFields?.maturity ||
    asset?.assetMappingData?.dateOfMaturity ||
    asset?.assetMappingData?.maturity ||
    asset?.assetMappingData?.maturityDate ||
    asset?.bonds?.maturityDate ||
    asset?.sdiSecondary?.maturityDate ||
    asset?.maturityDate
  );
};

export const committedInvestment = (asset: any, absolute?: boolean) => {
  // if the deal is startup Equity then show the only active
  const showActiveReturns =
    isAssetStartupEquity(asset) || assetStatus(asset) === 'active';

  // if status is active then calculation is based on collected amount and asset details
  if (showActiveReturns) {
    return Math.min(
      parseInt(
        roundOff(
          ((asset?.collectedAmount || 0) * 100) /
            (Number(asset?.totalAmount || 0) +
              Number(asset?.preTaxTotalAmount || 0))
        )
      ),
      absolute ? 5000 : 100
    );
  } else {
    // if the status is completed then calculation is based on returns
    if (!asset?.returnsToBePaid) {
      return 0;
    }
    return Math.min(
      parseInt(
        roundOff(
          ((asset?.totalReturnsAmount || 0) * 100) /
            (asset?.returnsToBePaid || 0)
        )
      ),
      absolute ? 5000 : 100
    );
  }
};

const cycleDict: any = {
  Monthly: 'Monthly Returns',
  Quarterly: 'Quarterly Returns',
  'Half Yearly': 'Half-Yearly Returns',
  Annually: 'Annual Returns',
  Yearly: 'Yearly Returns',
};

export const getRepaymentCycle = (asset: any) => {
  if (!asset?.repaymentCycle) {
    return 'Monthly Returns';
  }
  return cycleDict[asset?.repaymentCycle];
};

/*
  Example -
  minAmount: 20,000
  maxAmount: 50,000
  totalAmount: 5,00,000
  collectedAmount: 4,60,000
*/
export const isValidInvestmentAmount = (
  asset: any,
  enteredAmount: number,
  preTax?: boolean,
  isFirstTimeInvestor = false
): [boolean, string, number, boolean] => {
  if (!asset) {
    return [false, ``, 0, false];
  }
  let {
    minAmount,
    maxAmount,
    preTaxMinAmount,
    preTaxMaxAmount,
    collectedAmount,
    preTaxTotalMaxAmount,
    totalMaxAmount,
    preTaxCollectedAmount,
    reducedTransactionAmount,
    financeProductType,
  } = asset;

  if (preTax) {
    minAmount = preTaxMinAmount;
    maxAmount = preTaxMaxAmount;
    collectedAmount = preTaxCollectedAmount;
    totalMaxAmount = preTaxTotalMaxAmount;
  } else {
    collectedAmount = collectedAmount - preTaxCollectedAmount;
  }

  if (reducedTransactionAmount && isFirstTimeInvestor && !preTax) {
    minAmount = reducedTransactionAmount;
  }

  const remainingAmount = totalMaxAmount - collectedAmount;
  const amountArray = [minAmount, Math.min(maxAmount, remainingAmount)].sort(
    function (a, b) {
      return a - b;
    }
  );
  if (
    remainingAmount <= 0 &&
    financeProductType !== financeProductTypeConstants.startupEquity
  ) {
    return [
      false,
      `${
        preTax ? 'Pre-Tax' : 'Post-Tax'
      } raise is complete, you can invest in ${
        !preTax ? 'Pre-Tax' : 'Post-Tax'
      }`,
      remainingAmount,
      false,
    ];
  }
  if (remainingAmount <= minAmount) {
    if (enteredAmount === remainingAmount) {
      return [true, 'Payment Allowed', enteredAmount, false];
    }
    return [
      false,
      `Commitment allowed ${numberToIndianCurrency(remainingAmount)}`,
      remainingAmount,
      true,
    ];
  }
  if (enteredAmount > remainingAmount) {
    return [
      false,
      `The amount should be between ${numberToIndianCurrency(
        amountArray[0]
      )} and ${numberToIndianCurrency(amountArray[1])}`,
      0,
      false,
    ];
  }
  if (enteredAmount >= minAmount && enteredAmount <= maxAmount) {
    return [true, `Payment allowed`, remainingAmount, false];
  }
  return [
    false,
    `The amount should be between ${numberToIndianCurrency(
      amountArray[0]
    )} and ${numberToIndianCurrency(amountArray[1])}`,
    0,
    false,
  ];
};

export const generateAssetURL = (asset: any): string => {
  if (!asset || Object.keys(asset).length < 1) {
    return '';
  }
  const { category, assetID } = asset;
  let partnerName = asset?.partnerName || asset?.partner?.name;
  let name = asset?.name || asset?.assetName;
  return urlify(
    `/assetdetails/${partnerName}/${category}/${name}/${assetID}`.toLowerCase()
  );
};

export const generateAgreementURL = (asset: any, amount: number): string => {
  return replaceAll(
    `${generateAssetURL(asset)}?amount=${amount}`,
    'assetdetails',
    'assetagreement'
  );
};

export const backToAggrementURL = ({
  assetID,
  name,
  category,
  partnerName,
  amount,
}) => {
  const url = generateAgreementURL(
    {
      assetID: assetID,
      name: name,
      category: category,
      partnerName: partnerName,
    },
    amount
  );
  return url;
};

export const getTxnID = (orderID: string) => {
  return orderID?.split('-')[0].toUpperCase();
};

/**
 *
 * @param asset // asset details
 * @param preTax  // in case of preTax toggle is selected , so that the numbers can be calculated on the basis of preTax calculations
 * @returns
 */
export const absoluteCommittedInvestment = (asset: any, preTax?: boolean) => {
  if (preTax) {
    return parseInt(
      roundOff(
        ((asset.preTaxCollectedAmount || 0) * 100) / asset.preTaxTotalAmount
      )
    );
  }
  // collected amount includes both preTax and postTax
  return parseInt(
    roundOff(
      ((asset.collectedAmount || 0) * 100) /
        (Number(asset.totalAmount || 0) + Number(asset.preTaxTotalAmount || 0))
    )
  );
};

export const isAssetAIF = (asset: any) => {
  return isAifDeal(Number(asset.spvType));
};

export const isAssetSpvParentAIF = (asset: any) => {
  return asset?.spvCategoryDetails?.spvParent?.id === 2;
};

export const isAifDeal = (spvType: number) => {
  const aifSpvTypes = [3, 5, 7];
  return aifSpvTypes.includes(spvType);
};

export const isMldProduct = (asset: any) => {
  if (!asset) {
    return false;
  }
  return asset.categoryID === 7;
};

/**
 * Check if the asset url is valid or not
 * @param asset asset details
 */

export const isInValidAssetUrl = (asset: any, urlAssetName = '') => {
  const { name } = asset;
  return urlify(name) !== urlAssetName?.toLowerCase();
};

/**
 * Asset Partners name for an asset
 */

export const getAssetPartnersName = (asset: any): string => {
  const { assetPartners = [] } = asset;

  if (assetPartners?.length) {
    return assetPartners
      ?.map((partner) => partner?.tblpartner?.name)
      .toString();
  } else {
    return '';
  }
};
