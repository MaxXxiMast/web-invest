export type NEFTDetails = Partial<{
  bankName: string;
  ifscCode: string;
  accountNo: string;
  beneficiaryName: string;
}>;

export type PaymentDetails = Partial<{
  upiID: string;
  NeftDetails: NEFTDetails;
  accountNo: string;
  clientID: string;
  dpID: string;
  ifscCode: string;
}>;

export type PaymentResponseObject = Partial<{
  type: string;
  exchange: string;
  amount: number;
  assetDetails: {
    assetName: string;
    assetID: number;
  };
  paymentDetails: PaymentDetails;
}>;

export type RFQDealConfirmationModalProps = {
  open?: boolean;
  close: (isSuccess?: boolean, isMarketClosed?: boolean) => void;
};

export type PaymentTypes = 'upi' | 'netBanking' | 'offline' | undefined;
