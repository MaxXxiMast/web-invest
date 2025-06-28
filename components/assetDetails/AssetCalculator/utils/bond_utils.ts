import { BONDS_TOOLTIPS } from '../../../../utils/bonds';
import { getTotalAmountPaybale } from '../../../../utils/investment';
import { numberToIndianCurrencyWithDecimals } from '../../../../utils/number';

import { AmountBreakdown } from '../types';

const bondsInvestedAmountBreakdown = [
  {
    label: 'Purchase Amount',
    id: 'purchasePrice',
    tooltip: '',
    modalLinkLabel: '',
    modalTitle: '',
    modalContent: '',
    decimals: 1,
  },
  {
    label: 'Brokerage Fees (0.50%)',
    id: 'brokerageFees',
    tooltip:
      'Brokerage is the fee Grip charges investors for facilitating Bond/ SDI investments. The brokerage amount is inclusive of 18% GST. The YTM displayed to investors is the net YTM after deducting these charges.',
    modalLinkLabel: '',
    modalTitle: '',
    modalContent: '',
    decimals: 1,
    isShowTooltip: true,
  },
  {
    label: 'Accrued Interest',
    id: 'accruedInterest',
    tooltip: '',
    modalLinkLabel: "What's it?",
    modalTitle: 'What is Accrued Interest?',
    modalContent: `The interest accrued on the bond between the last interest pay-out date and the date on which an investor purchases it from the seller. This accrued interest technically belongs to the seller but will be received by the investor on the next interest pay-out date. By paying this amount today the investor settles the interest due to the seller.`,
    isHTML: true,
    decimals: 1,
  },
  {
    label: 'Stamp Duty',
    id: 'stampDuty',
    tooltip: '',
    modalLinkLabel: '',
    modalTitle: '',
    modalContent: '',
    decimals: 1,
    isRound: true,
  },
];

const bondsPreTaxAmountBreakdown = [
  {
    label: 'Principal Amount',
    id: 'principalAmount',
    tooltip: `Principal is the amount that the issuer has borrowed and will repay at the time of maturity. <br/>
    Principal amount= (Face value of the bond)*(Number of bonds)`,
    decimals: 1,
  },
  {
    label: 'Total Interest',
    id: 'totalInterest',
    tooltip: '',
    decimals: 1,
  },
];

const bondsMldInvestedAmountBreakdown = [
  {
    label: 'Discounted Price',
    id: 'discountedPrice',
    tooltip: '',
    modalLinkLabel: "What's it?",
    modalTitle: 'What is Discounted Price?',
    modalContent: BONDS_TOOLTIPS?.MLD_DISCOUNTED_PRICE,
    strapiText: 'MLD_DISCOUNTED_PRICE',
    isHTML: true,
    decimals: 1,
  },
  {
    label: 'Stamp Duty',
    id: 'stampDuty',
    tooltip: '',
    modalLinkLabel: '',
    modalTitle: '',
    modalContent: '',
    decimals: 1,
    isRound: true,
  },
];

const bondsMldPreTaxAmountBreakdown = [
  {
    label: 'Redemption Price',
    id: 'redemptionPrice',
    tooltip: BONDS_TOOLTIPS?.MLD_REDEMPTION_PRICE,
    strapiText: 'MLD_REDEMPTION_PRICE',
    decimals: 1,
  },
];

const getAmountPayableToolTipText = (pageData: any, isMldAsset: boolean) => {
  if (isMldAsset) {
    return (
      pageData?.[0]?.objectData?.MLD_INVESTMENT_AMOUNT_BONDS ||
      BONDS_TOOLTIPS.MLD_INVESTMENT_AMOUNT_BONDS
    );
  }
  return (
    pageData?.[0]?.objectData?.INVESTMENT_AMOUNT_BONDS ||
    BONDS_TOOLTIPS.INVESTMENT_AMOUNT_BONDS
  );
};

const getPreTaxReturnToolTipText = (pageData: any, isMldAsset = false) => {
  if (isMldAsset) {
    return (
      pageData?.[0]?.objectData?.MLD_PRE_TAX_RETURNS_BONDS ||
      BONDS_TOOLTIPS.MLD_PRE_TAX_RETURNS_BONDS
    );
  }
  return (
    pageData?.[0]?.objectData?.PRE_TAX_RETURNS_BONDS ||
    BONDS_TOOLTIPS.PRE_TAX_RETURNS_BONDS
  );
};

const updateBreakDownData = (
  amountBreakDown: AmountBreakdown[],
  pageData: any,
  singleLotCalculation: any,
  lotSize: number
) => {
  return amountBreakDown.map((ele) => {
    const defaultValue = ele?.modalContent ?? '';
    const strapiText = ele?.strapiText ?? '';

    const getFinalValue = (ele: AmountBreakdown) => {
      let value = (singleLotCalculation?.[ele?.id] ?? 0) * lotSize;
      if (ele?.isRound) {
        value = Math.round(value);
      }
      if (ele?.id === 'brokerageFees') {
        value = singleLotCalculation?.purchasePrice * 0.005 * lotSize;
      }
      return numberToIndianCurrencyWithDecimals(value);
    };

    return {
      ...ele,
      modalContent: strapiText
        ? pageData?.[0]?.objectData[strapiText]
        : defaultValue,
      value: getFinalValue(ele),
      tooltip: strapiText
        ? pageData?.[0]?.objectData[strapiText]
        : ele?.tooltip,
    };
  });
};

export const getAmountPaybaleContentBreakdownBonds = (
  pageData: any,
  singleLotCalculation: any,
  lotSize: number,
  isMldAsset: boolean
) => {
  // Amount Payable Breakdown
  const amountBreakDown = isMldAsset
    ? bondsMldInvestedAmountBreakdown
    : bondsInvestedAmountBreakdown;

  const amountPaybaleBreakDown = updateBreakDownData(
    amountBreakDown,
    pageData,
    singleLotCalculation,
    lotSize
  );

  // Pre-Tax Returns Breakdown
  const preTaxReturnsBreakDown = isMldAsset
    ? bondsMldPreTaxAmountBreakdown
    : bondsPreTaxAmountBreakdown;

  const preTaxReturnPaybaleBreakDown = updateBreakDownData(
    preTaxReturnsBreakDown,
    pageData,
    singleLotCalculation,
    lotSize
  );

  return {
    amountPaybaleBreakDown,
    preTaxReturnPaybaleBreakDown,
  };
};

export const bondCalculatorData = (
  singleLotCalculation: any,
  pageData: any,
  lotSize: number,
  isMldAsset = false
) => {
  const investmentAmount = getTotalAmountPaybale(
    singleLotCalculation?.investmentAmount,
    singleLotCalculation?.stampDuty,
    lotSize
  );
  const { preTaxReturnPaybaleBreakDown, amountPaybaleBreakDown } =
    getAmountPaybaleContentBreakdownBonds(
      pageData,
      singleLotCalculation,
      lotSize,
      isMldAsset
    );
  return {
    uniValue: 'Unit',
    hideHeaderData: isMldAsset,
    headerData: {
      label: 'Purchase Amount',
      value: `${numberToIndianCurrencyWithDecimals(
        singleLotCalculation?.purchasePrice
      )} / Unit`,
      tooltipData:
        pageData?.[0]?.objectData?.PRICE_PER_UNIT_BONDS ||
        BONDS_TOOLTIPS.PRICE_PER_UNIT_BONDS,
    },
    payableAmountBreakdown: {
      label: 'Amount Payable',
      tooltipText: getAmountPayableToolTipText(pageData, isMldAsset),
      uiValue: numberToIndianCurrencyWithDecimals(investmentAmount),
      numValue: investmentAmount,
      className: '',
      breakDownData: amountPaybaleBreakDown,
    },
    preTaxReturnsBreakdown: {
      label: 'Pre-Tax Returns',
      tooltipText: getPreTaxReturnToolTipText(pageData, isMldAsset),
      uiValue: numberToIndianCurrencyWithDecimals(
        singleLotCalculation?.preTaxReturns * lotSize
      ),
      numValue: singleLotCalculation?.preTaxReturns * lotSize,
      breakDownData: preTaxReturnPaybaleBreakDown,
    },
  };
};
