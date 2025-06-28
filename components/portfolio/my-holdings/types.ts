export type Holding = {
  securityID: number;
  logo: string;
  units: number;
  partialSold?: boolean;
  maturityDate: string;
  investedAmount: number;
  totalReturns: number;
  receivedReturns: number;
  xirr: number;
  availableSellDate: string | null;
  header: string;
  isin?: string | number;
  partnerName: string;
  status?: 'Withdrawn' | 'Matured' | 'Sold';
};

export type Holdings = Holding[];

export type MyHoldingsApiResponse = {
  data: Holdings;
};

export type MyHoldingsCount = {
  count?: number;
  id: string;
  key?: string;
  name: string;
  iconName: string;
  order: number;
};
