import { createContext } from 'react';

type InvestmentOverviewPGContextProps = Partial<{
  pageData: any;
  userKycDetails: Record<string, unknown>;
  asset: {
    assetID: number;
    name: string;
    financeProductType: string;
    isRfq: boolean;
    productCategory: string;
    productSubcategory: string;
    spvCategoryDetails: {
      spvCategoryPg: any[];
    };
  };
  lotSize: number;
  calculatedSDIData: {
    preTaxAmount: number | string;
    totalInterest: number;
    investmentAmount: number;
  };
  calculationDataBonds: any;
  assetCalculationData: any;
  isMarketOpen?: boolean;
}>;

export const InvestmentOverviewPGContext =
  createContext<InvestmentOverviewPGContextProps>({});
