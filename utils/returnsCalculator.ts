const MonthlyRepayment = 'Monthly';
const QuarterlyRepayment = 'Quarterly';
const HalfYearlyRepayment = 'Half Yearly';
const YearlyRepayment = 'Yearly';

// Partner Types
const GP = 'gp';
const SP_PRE_TAX = 'sp_pre_tax';
const SP_POST_TAX = 'sp_post_tax';
const DP = 'dp';
const SP = 'sp';

// assetInvestmentAmount is the amount for which you want the calculations based on.
// Ex in UI, this is the amount that user plans to invest. Returns will be returned according to this amount.
// if not sent, investmentAmount in repaymentMetrics will be used to calculate rerturns
// For gp and dp, response will be of this form {
//         totalPreTaxAmount, -- includes assetSaleValue
//         totalPostTaxAmount, -- includes assetSaleValue
//         totalTaxAmount,
//         totalGripFee,
//         assetSaleValue,
//         userPayments
//     }
// For sp, we will two objects of above structure
//return {
//    spPreTaxReturns,
//    spPostTaxReturns
//}

const calculateReturns = (
  repaymentMetrics: any,
  partnerType: any,
  repaymentCycle: any,
  tenure: number,
  assetInvestmentAmount: number
) => {
  if (partnerType === GP || partnerType === DP) {
    const repaymentMetric: any =
      repaymentMetrics &&
      repaymentMetrics.filter(
        (repaymentMetrics: any) =>
          repaymentMetrics.partnerTaxType === partnerType
      );
    if (
      !repaymentMetric ||
      repaymentMetric.length === 0 ||
      !assetInvestmentAmount
    ) {
      return {};
    }
    return calculateReturnsForAMetric(
      repaymentMetric[0],
      repaymentCycle,
      tenure,
      assetInvestmentAmount
    );
  } else if (partnerType === SP) {
    let spPreTaxRepaymentMetric =
      repaymentMetrics &&
      repaymentMetrics.find(
        (repaymentMetric: any) => repaymentMetric.partnerTaxType === SP_PRE_TAX
      );
    let spPostTaxRepaymentMetric =
      repaymentMetrics &&
      repaymentMetrics.find(
        (repaymentMetric: any) => repaymentMetric.partnerTaxType === SP_POST_TAX
      );
    if (!spPreTaxRepaymentMetric && !spPostTaxRepaymentMetric) {
      return {};
    }

    const investmentAmount =
      (spPreTaxRepaymentMetric && spPreTaxRepaymentMetric.investmentAmount) ||
      (spPostTaxRepaymentMetric && spPostTaxRepaymentMetric.investmentAmount);

    if (spPreTaxRepaymentMetric) {
      spPreTaxRepaymentMetric = {
        ...spPreTaxRepaymentMetric,
        investmentAmount,
      };
    }
    if (spPostTaxRepaymentMetric) {
      spPostTaxRepaymentMetric = {
        ...spPostTaxRepaymentMetric,
        investmentAmount,
      };
    }

    const spPreTaxReturns = calculateReturnsForAMetric(
      spPreTaxRepaymentMetric,
      repaymentCycle,
      tenure,
      assetInvestmentAmount
    );
    const spPostTaxReturns = spPostTaxRepaymentMetric
      ? calculateReturnsForAMetric(
          spPostTaxRepaymentMetric,
          repaymentCycle,
          tenure,
          assetInvestmentAmount
        )
      : {};
    return {
      spPreTaxReturns,
      spPostTaxReturns,
    };
  }
};

const getAmountSplitAcrossRepaymentPeriod = (
  condensedAmountString: any,
  tenure: number,
  repaymentPeriodInMonths: number,
  amountMultiplicator: any,
  repaymentCycle: string
) => {
  const amountSplitAcrossRepaymentPeriod = [];
  const condensedAmountArray: any[] = condensedAmountString.split(',');
  const periodOfEachAmountInCondensedValue =
    repaymentCycle === 'One Time'
      ? 1
      : Math.floor(tenure / condensedAmountArray.length) || 1;

  // Decimal tenure allowed only for one time repayment cycle
  const isOneTime = repaymentCycle === 'One Time';
  const properRepaymentPeriod = isOneTime ? 1 : repaymentPeriodInMonths;
  for (
    let i: number = 0;
    i < (isOneTime ? properRepaymentPeriod : tenure);
    i = Number(i) + Number(properRepaymentPeriod)
  ) {
    amountSplitAcrossRepaymentPeriod.push(
      (condensedAmountArray[
        Math.floor(i / periodOfEachAmountInCondensedValue)
      ] *
        properRepaymentPeriod *
        amountMultiplicator) /
        periodOfEachAmountInCondensedValue
    );
  }
  return amountSplitAcrossRepaymentPeriod;
};

const calculateReturnsForAMetric = (
  repaymentMetric: any,
  repaymentCycle: any,
  tenure: number,
  assetInvestmentAmount: number
) => {
  const { investmentAmount, leaseRental, assetSaleValue, tax, gripFee } =
    repaymentMetric;
  const repaymentPeriodInMonths = getRepaymentPeriodInMonths(
    repaymentCycle,
    tenure
  );

  const amountMultiplicator = assetInvestmentAmount
    ? assetInvestmentAmount / investmentAmount
    : 1;

  const leaseRentalArray = getAmountSplitAcrossRepaymentPeriod(
    leaseRental || '0',
    tenure,
    repaymentPeriodInMonths,
    amountMultiplicator,
    repaymentCycle
  );
  const taxArray = getAmountSplitAcrossRepaymentPeriod(
    tax || '0',
    tenure,
    repaymentPeriodInMonths,
    amountMultiplicator,
    repaymentCycle
  );
  const gripFeeArray = getAmountSplitAcrossRepaymentPeriod(
    gripFee || '0',
    tenure,
    repaymentPeriodInMonths,
    amountMultiplicator,
    repaymentCycle
  );

  const userPayments: any = [];
  let assetSaleValueForAssetInvestmentAmount = assetInvestmentAmount
    ? assetSaleValue * amountMultiplicator
    : assetSaleValue;
  let totalPreTaxAmount = assetSaleValueForAssetInvestmentAmount;
  let totalPostTaxAmount = assetSaleValueForAssetInvestmentAmount;
  let totalTaxAmount = 0;
  let totalGripFee = 0;

  leaseRentalArray.forEach((preTaxAmount, index) => {
    const tax = taxArray[index];
    const gripFee = gripFeeArray[index];
    const postTaxAmount = preTaxAmount - tax;

    totalPreTaxAmount += preTaxAmount;
    totalPostTaxAmount += postTaxAmount;
    totalTaxAmount += tax;
    totalGripFee += gripFee;
    userPayments.push({
      postTaxAmount,
      preTaxAmount,
      tax,
      gripFee,
    });
  });

  // totalPreTaxAmount and totalPostTaxAmount contains assetSaleValue
  // userpayments array pre and post tax amounts donot include assetSaleValue
  return {
    totalPreTaxAmount,
    totalPostTaxAmount,
    totalTaxAmount,
    totalGripFee,
    assetSaleValue: assetSaleValueForAssetInvestmentAmount,
    userPayments,
    returnsCalculatedForInvestedAmount: assetInvestmentAmount
      ? assetInvestmentAmount
      : investmentAmount,
  };
};
const getRepaymentPeriodInMonths = (repaymentCycle: any, tenure: any) => {
  return repaymentCycle === MonthlyRepayment
    ? 1
    : repaymentCycle === QuarterlyRepayment
    ? 3
    : repaymentCycle === HalfYearlyRepayment
    ? 6
    : repaymentCycle === YearlyRepayment
    ? 12
    : parseFloat(tenure);
};

export { calculateReturns, getRepaymentPeriodInMonths };
