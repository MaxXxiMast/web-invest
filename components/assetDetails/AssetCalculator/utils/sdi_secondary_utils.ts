import { getTotalAmountPaybale } from '../../../../utils/investment';
import { numberToIndianCurrencyWithDecimals } from '../../../../utils/number';
import { SDISECONDARY_TOOLTIPS } from '../../../../utils/sdiSecondary';

import { AmountBreakdown } from '../types';

const sdiSecPreTaxAmountBreakdown = [
  {
    label: 'Purchase Amount',
    id: 'principalAmount',
    tooltip: `Principal is the amount that the issuer has borrowed and will repay at the time of maturity. <br/>
    Principal amount= (Face value of the SDI)*(Number of lots)`,
    strapiText: 'PRINCIPAL_AMOUNT_SDISECONDARY',
    decimals: 1,
  },
  {
    label: 'Total Interest',
    id: 'totalInterest',
    tooltip: '',
    decimals: 1,
  },
];

const sdiSecInvestedAmountBreakdown = (totalAdditionalCharges = 0) => {
  const defaultValues: any = [
    {
      label: 'Purchase Amount',
      id: 'purchasePrice',
      tooltip: '',
      modalLinkLabel: '',
      modalTitle: '',
      modalContent: '',
      decimals: 1,
      displayOrder: 1,
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
      strapiText: 'ACCRUED_INTEREST_SDISECONDARY',
      displayOrder: 3,
    },
    {
      label: 'Stamp Duty',
      id: 'stampDuty',
      tooltip: '',
      modalLinkLabel: '',
      modalTitle: '',
      modalContent: '',
      decimals: 1,
      displayOrder: 4,
      isRound: true,
    },
  ];
  if (totalAdditionalCharges > 0) {
    const value = {
      label: 'Premium',
      id: 'totalAdditionalCharges',
      tooltip: '',
      modalLinkLabel: "What's it?",
      modalTitle: 'What is Premium?',
      modalContent: `The purchase amount is the market price determined by the seller depending on the market environment and perceived risk of the Instrument. If the Purchase amount > Principal Outstanding, then security is trading at a premium.`,
      isHTML: true,
      decimals: 1,
      strapiText: 'PREMIUM_SDISECONDARY',
      displayOrder: 2,
    };
    defaultValues.push(value);
  } else if (totalAdditionalCharges < 0) {
    const value = {
      label: 'Discount',
      id: 'totalAdditionalCharges',
      tooltip: '',
      modalLinkLabel: "What's it?",
      modalTitle: 'What is Discount?',
      modalContent: `The purchase amount is the market price determined by the seller depending on the market environment and perceived risk of the Instrument. If the Purchase amount < Principal Outstanding, then security is trading at a discount.`,
      isHTML: true,
      decimals: 1,
      strapiText: 'DISCOUNT_SDISECONDARY',
      displayOrder: 2,
    };
    defaultValues.push(value);
  }
  return defaultValues.sort(
    (a: any, b: any) => a.displayOrder - b.displayOrder
  );
};

const getAmountPayableToolTipText = (pageData: any) => {
  return (
    pageData?.[0]?.objectData?.INVESTMENT_AMOUNT_SDISECONDARY ||
    SDISECONDARY_TOOLTIPS.INVESTMENT_AMOUNT_SDISECONDARY
  );
};

const getPreTaxReturnToolTipText = (pageData: any) => {
  return (
    pageData?.[0]?.objectData?.PRE_TAX_RETURNS_SDISECONDARY ||
    SDISECONDARY_TOOLTIPS.PRE_TAX_RETURNS_SDISECONDARY
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
    const isShowTooltip = Boolean(ele?.tooltip);

    const getFinalValue = (ele: AmountBreakdown) => {
      let value = singleLotCalculation?.[ele?.id] * lotSize || 0;
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
      isShowTooltip,
    };
  });
};

export const getAmountPaybaleContentBreakdown = (
  pageData: any,
  singleLotCalculation: any,
  lotSize: number
) => {
  // Amount Payable Breakdown
  const amountBreakDown = sdiSecInvestedAmountBreakdown(
    singleLotCalculation?.totalAdditionalCharges * lotSize
  );

  const amountPaybaleBreakDown = updateBreakDownData(
    amountBreakDown,
    pageData,
    singleLotCalculation,
    lotSize
  );

  // Pre-Tax Returns Breakdown

  const preTaxReturnPaybaleBreakDown = updateBreakDownData(
    sdiSecPreTaxAmountBreakdown,
    pageData,
    singleLotCalculation,
    lotSize
  );

  return {
    amountPaybaleBreakDown,
    preTaxReturnPaybaleBreakDown,
  };
};

export const sdiSecondaryCalculatorData = (
  singleLotCalculation: any,
  pageData: any,
  lotSize: number
) => {
  const investmentAmount = getTotalAmountPaybale(
    singleLotCalculation?.investmentAmount,
    singleLotCalculation?.stampDuty,
    lotSize
  );

  const { preTaxReturnPaybaleBreakDown, amountPaybaleBreakDown } =
    getAmountPaybaleContentBreakdown(pageData, singleLotCalculation, lotSize);
  return {
    uniValue: 'Lot',
    headerData: {
      label: 'Purchase Amount',
      value: `${numberToIndianCurrencyWithDecimals(
        singleLotCalculation?.purchasePrice
      )} / Lot`,
      tooltipData:
        pageData?.[0]?.objectData?.PRICE_PER_UNIT_SDISECONDARY ||
        SDISECONDARY_TOOLTIPS.PRICE_PER_UNIT_SDISECONDARY,
    },
    payableAmountBreakdown: {
      label: 'Amount Payable',
      tooltipText: getAmountPayableToolTipText(pageData),
      uiValue: numberToIndianCurrencyWithDecimals(investmentAmount),
      numValue: investmentAmount,
      className: '',
      breakDownData: amountPaybaleBreakDown,
    },
    preTaxReturnsBreakdown: {
      label: 'Pre-Tax Returns',
      tooltipText: getPreTaxReturnToolTipText(pageData),
      uiValue: numberToIndianCurrencyWithDecimals(
        singleLotCalculation?.preTaxReturns * lotSize
      ),
      numValue: singleLotCalculation?.preTaxReturns * lotSize,
      breakDownData: preTaxReturnPaybaleBreakDown,
    },
  };
};
