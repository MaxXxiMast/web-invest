export type OvreviewResponse = {
  totalInvestmentAmount: number;
  totalExpectedReturns: number;
  totalReturnsReceived: number;
  xirr: number;
};

export type OverviewCard = {
  label: string;
  value: string;
  sublabel?: string;
  isAccent?: boolean;
  type?: string;
  hideIcon?: boolean;
};

export type ReturnBreakdown = {
  type: string;
  amount: number;
};

export type OverviewBreakdownResponse = {
  xirr: number;
  financeProductTypeOrCombined: string;
  totalInvestmentAmount?: number;
  totalReturnsReceived?: number;
  totalExpectedReturns?: number;
  interest?: number;
  principal?: number;
  noOfAssets: number;
  returnBreakdown: ReturnBreakdown[];
};

export type ReturnTypeOverviewModal = 'invested' | 'expected' | 'recieved';
