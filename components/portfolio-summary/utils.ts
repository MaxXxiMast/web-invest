import {
  numberToIndianCurrency,
  toCurrecyStringWithDecimals,
} from '../../utils/number';
import {
  OverviewBreakdownResponse,
  OverviewCard,
  OvreviewResponse,
  ReturnBreakdown,
} from './investment-overview/types';

export type InvestmentType =
  | 'Bonds, SDIs & Baskets'
  | 'High Yield FDs'
  | 'LLPs & CRE'
  | 'Startup Equity';

export const investmentTypes: InvestmentType[] = [
  'Bonds, SDIs & Baskets',
  'LLPs & CRE',
  'Startup Equity',
  'High Yield FDs',
];

const investmentTypesMappings = {
  'Bonds, SDIs & Baskets': ['bonds', 'sdi', 'XCase', 'Basket'],
  'High Yield FDs': ['highyieldfd'],
  'LLPs & CRE': ['leasing', 'inventory', 'commercial'],
  'Startup Equity': ['startupEquity'],
};

export const financialProductTypeMappings = {
  'Bonds, SDIs & Baskets': 'Bonds,SDI Secondary,Basket',
  'High Yield FDs': 'High Yield FDs',
  'LLPs & CRE': 'Lease Financing,Inventory Financing,Commercial Property',
};

export type UserInvestedTypeData = Partial<{
  bonds: number;
  sdi: number;
  leasing: number;
  inventory: number;
  commercial: number;
  startupEquity: number;
  highyieldfd: number;
  Basket: number;
}>;

export const productTypeKeyMappings = {
  Bonds: 'bonds',
  'SDI Secondary': 'sdi',
  'Lease Financing': 'leasing',
  'Inventory Financing': 'inventory',
  'Commercial Property': 'commercial',
  'Startup Equity': 'startupEquity',
  'High Yield FDs': 'highyieldfd',
  Basket: 'Basket',
};

export const getInvestmentStatus = (
  data: UserInvestedTypeData = {},
  investmentType: InvestmentType
) => {
  if (!data || !Object.keys(data).length) return false;
  //@TODO handdle if the data comes with number
  return investmentTypesMappings[investmentType]?.some(
    (key: string) => Number.isFinite(data[key]) && data[key] > 0
  );
};

export const handleValues = (
  amount = 0,
  isShortValue = false,
  isDecimal = false
) =>
  isShortValue
    ? `₹${toCurrecyStringWithDecimals(
        amount?.toFixed(isDecimal ? 2 : 0),
        2,
        true
      )}`
        ?.toString()
        ?.replaceAll(' ', '')
    : numberToIndianCurrency(amount?.toFixed(isDecimal ? 2 : 0));

export const getInvestmentOverview = (
  data: Partial<OvreviewResponse>,
  isMobile: boolean,
  investmentType: InvestmentType = investmentTypes[0],
  selectedFilter = 'all',
  isInvested = true
): OverviewCard[] => {
  const useShortHand =
    isMobile || Object.values(data).some((d: number) => d > 10000000);
  switch (investmentType) {
    case 'Bonds, SDIs & Baskets':
    case 'LLPs & CRE':
    case 'High Yield FDs':
      const expectedReturnLabel =
        investmentType === 'High Yield FDs'
          ? 'Maturity Amount'
          : 'Total Expected Returns';
      const returnsReceivedLabel =
        investmentType === 'High Yield FDs'
          ? 'Interest Earned'
          : 'Returns Received';

      let overviewData: OverviewCard[] = [
        {
          label: 'Amount Invested',
          value: handleValues(data?.totalInvestmentAmount, useShortHand),
          hideIcon: !Boolean(data?.totalInvestmentAmount),
          type: 'invested',
        },
        {
          label: isMobile ? 'Expected Returns' : expectedReturnLabel,
          value: handleValues(data?.totalExpectedReturns, useShortHand),
          hideIcon: !Boolean(data?.totalExpectedReturns),
          sublabel:
            investmentType === 'High Yield FDs'
              ? ''
              : 'Returns Received + Pending',
          type: 'expected',
        },
        {
          label: returnsReceivedLabel,
          value: handleValues(data?.totalReturnsReceived, useShortHand),
          hideIcon: !Boolean(data?.totalReturnsReceived),
          sublabel:
            investmentType === 'High Yield FDs'
              ? ''
              : 'of Total Expected Returns',
          isAccent: true,
          type: 'received',
        },
      ];
      if (
        (investmentType === 'Bonds, SDIs & Baskets' ||
          investmentType === 'High Yield FDs') &&
        selectedFilter === 'all' &&
        (!isInvested || (8 <= data?.xirr && data?.xirr <= 20))
      ) {
        overviewData = [
          ...overviewData,
          {
            label:
              investmentType === 'High Yield FDs' ? 'Avg Rate' : 'Pre-Tax XIRR',
            value: `${parseFloat((data?.xirr || 0).toFixed(1))}%`,
            hideIcon: true,
          },
        ];
      }
      return overviewData;

    case 'Startup Equity':
      return [
        {
          label: 'Amount Invested',
          value: handleValues(data?.totalInvestmentAmount, useShortHand),
          hideIcon: true,
          type: 'invested',
        },
        {
          label: 'Returns Received',
          value: 'On Exit',
          sublabel: 'of Total Expected Returns',
          hideIcon: true,
          type: 'received',
        },
      ];
  }
};

export const overviewFilter = {
  'All Deals': 'all',
  'Active Deals': 'active',
  'Completed Deals': 'past',
};

const ColorsByType = {
  'Corporate Bonds': '#00357c',
  LeaseX: '#F9BE81',
  LoanX: '#3E7BFA',
  InvoiceX: '#FDBC86',
  BondX: '#146345',
  'Startup Equity': '#14B8A6',
  'Commercial Property': '#3B82F6',
  Leasing: '#52A4F9',
  Inventory: '#F58676',
  Others: '#00CAF1',
  NBFC: '#00357c',
  default: '#CCCCCC',
};

export const getReturnBreakdown = (data: ReturnBreakdown[]) => {
  if (!data.length) {
    return [
      {
        label: 'Others',
        value: 100,
      },
    ];
  }

  const sum = data?.reduce((a, c) => Number(a) + (Number(c.amount) || 0), 0);

  if (sum === 0) return [];

  const getPercentage = (ele: any) => {
    const percentage = ((ele / sum) * 100).toFixed(1);

    return `${percentage}%`;
  };

  let formattedData = data.map((ele: any) => ({
    label: ele.type,
    value: ele.amount,
    subLabel: `${handleValues(ele.amount)}(${getPercentage(ele.amount)})`,
    color: ColorsByType?.[ele.type] || ColorsByType.default,
  }));
  return formattedData.sort((a, b) =>
    a.value > b.value ? -1 : a.value < b.value ? 1 : 0
  );
};

type BreakdownDataType = {
  label: string;
  value: unknown;
  isAccent?: boolean;
  sublabel?: string;
};

export const getBreakDownData = (
  type: string,
  data: Partial<OverviewBreakdownResponse>,
  selectedAssetType: InvestmentType,
  totalInvestedAmount = 0
): BreakdownDataType[] => {
  switch (type) {
    case 'invested':
      return [
        {
          label: 'Total Amount Invested',
          value: handleValues(data?.totalInvestmentAmount),
          isAccent: true,
        },
        {
          label: 'Assets invested in',
          value: data?.noOfAssets || 0,
        },
      ];
    case 'expected':
      const finalExpected = [
        {
          label: 'Total expected returns',
          value: handleValues(data?.totalExpectedReturns),
          isAccent: true,
        } as BreakdownDataType,
      ];
      if (selectedAssetType === 'LLPs & CRE') {
        return finalExpected;
      }
      finalExpected.push(
        ...[
          {
            label: 'Expected Interest',
            value: handleValues(data?.interest || 0),
          },
          {
            label: 'Total Principal',
            value: handleValues(data?.principal || 0),
          },
        ]
      );
      return finalExpected;
    case 'received':
      const returnsPercentage = (
        (data?.totalReturnsReceived / totalInvestedAmount) * 100 || 0
      ).toFixed(1);

      const finalReceived = [
        {
          label: 'Returns Received',
          value: handleValues(data?.totalReturnsReceived),
          sublabel: `${returnsPercentage}% of invested amount`,
          isAccent: true,
        } as BreakdownDataType,
      ];
      if (selectedAssetType === 'LLPs & CRE') {
        return finalReceived;
      }

      finalReceived.push(
        ...[
          {
            label: 'Interest Received',
            value: handleValues(data?.interest || 0),
          },
          {
            label: 'Principal Received',
            value: handleValues(data?.principal || 0),
          },
        ]
      );
      return finalReceived;
  }
};

export const getMostInvestmentCategory = (currentInvestmentIRR: number) => {
  if (currentInvestmentIRR >= 8 && currentInvestmentIRR < 11) {
    return '8-11%';
  } else if (currentInvestmentIRR >= 11 && currentInvestmentIRR < 14) {
    return '11-14%';
  } else if (currentInvestmentIRR >= 14) {
    return '14% and above';
  } else {
    return null;
  }
};

export const getLabelForProductType = (productType: string) => {
  if (productType === 'High Yield FDs') {
    return 'FDs';
  }
  return productType;
};
