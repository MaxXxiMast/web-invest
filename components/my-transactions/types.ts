export type MyTransaction = {
  logo: string;
  header: string;
  isin?: string | number;
  orderID: number;
  units: number;
  amount: number;
  ytm: number;
  holdingPeriod: number;
  transactionDate: string;
  orderType: string;
  status: number;
  orderStatus: string;
  timestamps?: {
    orderPlaced: Date | null;
    payment: Date | null;
    securityTransfer: Date | null;
    transferInitiatedDate: Date | null;
    orderSettlementDate: Date | null;
  };
};

export type MyTransactions = MyTransaction[];

export type MyTransactionsResponse = {
  totalOrders: number;
  data: MyTransactions;
};

export type MyTransactionsCount = {
  id: string;
  name: string;
  key: string;
  iconName: string;
  order: number;
  count: number;
  hideCount?: boolean;
}[];
