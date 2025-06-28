import type { Dayjs } from 'dayjs';

type FinancialFieldForTyping = Partial<{
  thirdPartyLogo: string;
}>;

export type FinancialProduct = {
  assetID: number;
  badges: string;
  collectedAmount: number | null;
  category: string;
  desc: string;
  financeProductType: string;
  productCategory: string;
  productSubcategory: string;
  header: string;
  postTaxYield: string;
  reducedTransactionAmount: number | null;
  startDate: string;
  tenure: string;
  overallDealCompletionPercentage: number;
  totalReturnsAmount: number;
  investmentInto: string;
  name: string;
  paymentStatus: number;
  assetMappingData: {
    tenure: number;
    irrCutout: number | null;
    tenureType: string;
    maxInterest: number;
    maxTxnAmount: number;
    minTxnAmount: number;
    minAmountCutout: number | null;
    compoundingFrequency: string;
    preTaxYtm: number;
    maturityDate: Dayjs;
    couponRate: number;
    couponInterestReturnFrequency: string;
    ratedBy: string;
    rating: string;
    calculatedFaceValue: number; // ??
    minNoOfLots: number;
    additionalCharges: number;
    interestReturnFrequency: string;
    calculationMethod: string;
    dateOfIssuance: string; // Assuming this is in 'YYYY-MM-DD' format
    dateOfMaturity: Dayjs; // Assuming this is in 'YYYY-MM-DD' format
    firstPayout: number;
    irr: number;
    rbir: number;
    faceValue: number;
    purchasePrice: number;
    couponPrincipalPaymentFrequency: string;
  };
  fundingDetails: any | null;
  sdiDetails: Record<string, unknown>;
  assetStatus: string;
  amount: string;
  partnerIDs: string;
  assetPartnersCount: number;
  filename: string;
  filepath: string;
  partnerLogo: string;
  partnerName: string;
  returnsType: string;
  irr: number;
  spvID: number;
  spvType: string;
  categoryID: number;
  isRfq: boolean;
  preTaxCollectedAmount: number;
  preTaxMinAmount: number;
  preTaxTotalAmount: number;
  preTaxTotalMaxAmount: number;
  minAmount: number;
  totalAmount: number;
  totalMaxAmount: number;
  minInvestmentAmount: number;
} & FinancialFieldForTyping;
