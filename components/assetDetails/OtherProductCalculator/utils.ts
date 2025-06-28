import {
  assetStatus,
  isFirstTimeInvestor,
  isValidInvestmentAmount,
} from '../../../utils/asset';

/**
 *
 * @param valueArr chips arr
 * @param maxAmount max investment amount
 * @returns chips arr based on max invesment amount
 */
const handleChipMaxValue = (
  valueArr: number[],
  remainingAmount: number,
  maxSingleTransaction: number
) => {
  const arr = [];

  // TO ADD CHIPS LESS THEN MAX INVESMENT AMOUNT
  valueArr.forEach((ele: number) => {
    if (ele < remainingAmount && ele < maxSingleTransaction) {
      arr.push(ele);
    }
  });

  // TO ADD EXTRA CHIP WITH MAX INVESTMENT AMOUNT
  if (
    arr.length < 3 &&
    (arr[arr.length - 1] < maxSingleTransaction ||
      arr[arr.length - 1] < remainingAmount)
  ) {
    if (remainingAmount < maxSingleTransaction) {
      arr.push(remainingAmount);
    } else {
      arr.push(maxSingleTransaction);
    }
  }
  return arr;
};

export const assetPriceChips = (amount: number) => {
  const chipArr = [];
  const chipGrpOne = [10000, 25000, 50000];
  const chipGrpTwo = [50000, 75000, 100000];
  const chipGrpThree = [100000, 200000, 300000];
  if (amount < 100000) {
    chipArr.push(...chipGrpOne);
  } else if (amount >= 100000 && amount <= 300000) {
    chipArr.push(...chipGrpTwo);
  } else {
    chipArr.push(...chipGrpThree);
  }
  return chipArr;
};

/**
 *
 * @param minInvestmentAmount
 * @param remainingAmount
 * @param maxAmount
 * @returns chips arr for asset
 */
export const experimentalChips = (
  minInvestmentAmount: number,
  remainingAmount: number,
  maxSingleTransaction: number
) => {
  let chipAmount = handleChipMaxValue(
    [minInvestmentAmount, 50000, 100000],
    remainingAmount,
    maxSingleTransaction
  );
  switch (true) {
    case minInvestmentAmount > 40000 && minInvestmentAmount <= 80000:
      return handleChipMaxValue(
        [minInvestmentAmount, 100000, 200000],
        remainingAmount,
        maxSingleTransaction
      );
    case minInvestmentAmount > 80000 && minInvestmentAmount <= 150000:
      return handleChipMaxValue(
        [minInvestmentAmount, 200000, 500000],
        remainingAmount,
        maxSingleTransaction
      );
    case minInvestmentAmount > 150000 && minInvestmentAmount <= 200000:
      return handleChipMaxValue(
        [minInvestmentAmount, 300000, 500000],
        remainingAmount,
        maxSingleTransaction
      );
    case minInvestmentAmount > 200000 && minInvestmentAmount <= 300000:
      return handleChipMaxValue(
        [minInvestmentAmount, 400000, 500000],
        remainingAmount,
        maxSingleTransaction
      );
    case minInvestmentAmount > 300000 && minInvestmentAmount <= 400000:
      return handleChipMaxValue(
        [minInvestmentAmount, 500000, 700000],
        remainingAmount,
        maxSingleTransaction
      );
    case minInvestmentAmount > 400000 && minInvestmentAmount <= 500000:
      return handleChipMaxValue(
        [minInvestmentAmount, 700000, 1000000],
        remainingAmount,
        maxSingleTransaction
      );
    case minInvestmentAmount > 500000:
      return handleChipMaxValue(
        [minInvestmentAmount, 1000000, 2000000],
        remainingAmount,
        maxSingleTransaction
      );
    default:
      return chipAmount;
  }
};

export const CRE_CALCULATOR_TOOLTIPS = {
  saleAsset: `Calculated on average asset value appreciation of underwritten CAGR over the hold period. The calculation excludes the impact of capital gains tax. Please note that this is an expected sale value of the asset, and actual sale timing may differ.`,
  netRental:
    "Net rental paid to the investor over the hold period, post operating expenses and fees (except originator's back-ended performance fee). The calculation excludes the impact of capital gains tax.",
};

/**
 * gives prefill amount which we show to users by default
 * @param {object}data - should contain asset  and user details
 * @returns {string | number}
 */
export const getAssetPrefillInvestmentAmount = (data: any) => {
  const { asset, user, toggle = true } = data;
  if (
    !asset ||
    !user ||
    !Object.keys(user).length ||
    !Object.keys(asset).length
  ) {
    return '';
  }
  let preTax = !toggle;
  if (
    ['Commercial Property', 'Startup Equity'].indexOf(
      asset.financeProductType
    ) > -1
  ) {
    preTax = true;
  }

  let initialAmount = asset.minAmount;
  let totalMaxAmount = asset.totalMaxAmount;
  let collectedAmt = asset.collectedAmount - asset.preTaxCollectedAmount;
  let minAmount = asset.minAmount;

  if (preTax) {
    if (asset.lastOrderType === 'gp') {
      initialAmount = asset.minAmount;
    } else {
      totalMaxAmount = asset.preTaxTotalMaxAmount;
      collectedAmt = asset.preTaxCollectedAmount;
      minAmount = asset.preTaxMinAmount;
      initialAmount = asset.preTaxMinAmount;
    }
  } else if (!preTax && asset.lastOrderType === 'sp') {
    totalMaxAmount = asset.preTaxTotalMaxAmount;
    collectedAmt = asset.preTaxCollectedAmount;
    minAmount = asset.preTaxMinAmount;
    initialAmount = asset.preTaxMinAmount;
  }

  if (!preTax) {
    if (asset.reducedTransactionAmount && isFirstTimeInvestor(user)) {
      initialAmount = asset.reducedTransactionAmount;
    }
  }

  const remainingAmount = totalMaxAmount - collectedAmt;
  if (minAmount > remainingAmount) {
    initialAmount = remainingAmount > 0 ? remainingAmount : minAmount;
  }

  return initialAmount;
};

export const preTaxValues = (props: any) => {
  return (
    (props.userData && props.userData?.partnerType === 'sp' && !props.toggle) ||
    (props.user && props.user.partnerType === 'sp' && !props.toggle) ||
    ['Commercial Property', 'Startup Equity'].indexOf(
      props?.asset?.financeProductType
    ) > -1
  );
};

/**
 * check for invest now button visibility depending upon certain conditions
 * @param {object}data - should contain asset , amount and user details
 * @returns {boolean}
 */
export const showInvestmentButton = (data: any): boolean => {
  if (
    !data ||
    !data.asset ||
    !data.user ||
    !Object.keys(data?.asset).length ||
    !data?.amount ||
    !Object.keys(data?.user).length
  ) {
    return false;
  }

  const isPreTaxCompleted =
    Number(data.asset.preTaxTotalMaxAmount) <=
    Number(data.asset.preTaxCollectedAmount);
  const isPostTaxCompleted =
    Number(data.asset.collectedAmount) -
      Number(data.asset.preTaxCollectedAmount) >=
    Number(data.asset.totalMaxAmount);
  const [valid] = isValidInvestmentAmount(
    data.asset,
    parseInt(data.amount),
    preTaxValues(data),
    isFirstTimeInvestor(data.user)
  );
  const isActiveDeal = assetStatus(data.asset) === 'active';
  if (!isActiveDeal) {
    return false;
  }

  if (!valid) {
    return false;
  }
  if (!isPreTaxCompleted && !isPostTaxCompleted) {
    return true;
  }
  if (isPreTaxCompleted && !isPostTaxCompleted && data.toggle) {
    return true;
  }
  if (isPostTaxCompleted && !isPreTaxCompleted && !data.toggle) {
    return true;
  }
  if (data.user?.partnerType !== 'sp' && !isPostTaxCompleted) {
    return true;
  }

  return false;
};
