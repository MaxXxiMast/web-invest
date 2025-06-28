export type RFQPendingOrder = {
  transactionID: string;
  orderDate: string;
  assetID: number;
  amount: number;
  expireBy: string;
  assetName: string;
  partnerLogo: string;
  isAmo?: boolean;
  rfqID?: number | string;
  amoLink?: string;
  amoStartDate?: string;
  amoExpireBy?: string;
};

export type CreateRFQOrderBody = {
  assetID: number;
  amount: number;
  units: number;
  upiID: string;
  bankingName: string;
  utmParams: any;
  isAmo?: boolean;
  paymentMethod?: number;
};

export type CreateNonRFQOrderBody = {
  assetID: number;
  amount: number;
  walletAmount: number;
  preTax: boolean;
  utmParams: any;
  source: string;
  units: number;
  unitPrice: number;
};

export type PaymentProcessingBody = {
  paymentMethod: string;
  transactionID: string;
  upiID?: string;
  raiseMandate?: boolean;
  showToast?: boolean;
};
