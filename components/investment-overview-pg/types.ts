export type OrderInitateResponse = {
  transactionID: string;
  orderID: string;
  paymentLink?: string;
  paymentSessionID?: string;
  isPgURL?: boolean;
};
