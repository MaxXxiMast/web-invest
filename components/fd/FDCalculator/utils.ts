import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import { AmountBreakdown } from '../Breakdown/types';

export const fdAmountBreakdown = [
  {
    label: 'Principal Amount',
    id: 'discountedPrice',
    tooltip: '',
    isHTML: true,
    decimals: 1,
  },
  {
    label: 'Total Interest',
    id: 'stampDuty',
    tooltip: '',
    modalLinkLabel: '',
    modalTitle: '',
    modalContent: '',
    decimals: 1,
  },
];

const updateBreakDownData = (
  amountBreakDown: AmountBreakdown[],
  pageData: any,
  breakDownAmount: number[]
) => {
  return amountBreakDown.map((ele, index) => {
    const defaultValue = ele?.modalContent ?? '';
    const strapiText = ele?.strapiText ?? '';

    const getFinalValue = (ele: AmountBreakdown) => {
      let value = breakDownAmount?.[index] ?? 0;
      if (ele?.isRound) {
        value = Math.round(Number(value));
      }
      return numberToIndianCurrencyWithDecimals(value);
    };

    return {
      ...ele,
      modalContent: strapiText
        ? pageData?.[0]?.objectData[strapiText]
        : defaultValue,
      value: getFinalValue(ele),
      tooltip: strapiText ? pageData?.[0]?.objectData[strapiText] : ele?.tooltip,
    };
  });
};

const getAmountPaybaleContentBreakdown = (pageData: any, breakDownAmount) => {
  const preTaxReturnPaybaleBreakDown = updateBreakDownData(
    fdAmountBreakdown,
    pageData,
    breakDownAmount
  );

  return {
    preTaxReturnPaybaleBreakDown,
  };
};

type FdCalculationData = {
  pageData: any;
  preTaxReturn: string | number;
  breakDownAmount: number[];
};

export const fdCalculatorData = ({
  pageData,
  preTaxReturn = 0,
  breakDownAmount,
}: FdCalculationData) => {
  const { preTaxReturnPaybaleBreakDown } = getAmountPaybaleContentBreakdown(
    pageData,
    breakDownAmount
  );
  // TODO: FD Calcualtion
  return {
    label: 'Pre-Tax Returns',
    uiValue: numberToIndianCurrencyWithDecimals(preTaxReturn),
    breakDownData: preTaxReturnPaybaleBreakDown,
  };
};

type AvailableOptions = {
  defaultChecked: boolean;
  enabled: boolean;
  render: boolean;
};

export type ExtraInterestRate = {
  seniorCitizen: AvailableOptions;
  women: AvailableOptions;
};

export type FdRepaymentMetric = {
  date: string;
  amount: number;
  tds: number;
  interest: number;
};

export type FixerraRepaymentResponse = {
  productInterest: string;
  totalPayout: number;
  totalMaturityAmount: number;
  maturityDate: string;
  repaymentMetric: FdRepaymentMetric[];
};
