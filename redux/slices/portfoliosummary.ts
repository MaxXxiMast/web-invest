import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InvestmentType } from '../../components/portfolio-summary/utils';
import { ReturnsJSON } from '../../components/portfolio-summary/my-returns/ReturnsTable/types';

type LeadOwner = {
  calendlyLink: string;
  imageUrl: string;
  firstName: string;
  lastName: string;
  designation: string;
  yoe: number;
  investments: number;
  mobileNo: string;
  email: string;
};

type InvestmentData = {
  preTaxIrr?: number;
  loader?: boolean;
  selectedAssetType?: InvestmentType;
  totalAmountInvested?: number;
  returns?: ReturnsJSON;
  interestBracket?: string | null;
  returnDistribution?: Record<string, unknown>;
  leadOwner?: LeadOwner | undefined;
};

const initialState: InvestmentData = {
  preTaxIrr: 0,
  loader: true,
  selectedAssetType: 'Bonds, SDIs & Baskets',
  totalAmountInvested: 0,
  returns: {
    count: 0,
    totalReturns: 0,
    data: [],
  },
  interestBracket: null,
  returnDistribution: {},
  leadOwner: undefined,
};

const portfolioSummarySlice = createSlice({
  name: 'portfolioSummary',
  initialState,
  reducers: {
    setPortfolioSummaryData: (state, action: PayloadAction<InvestmentData>) => {
      state.preTaxIrr = action.payload.preTaxIrr;
    },
    setPortfolioSummaryDataLoader: (
      state,
      action: PayloadAction<InvestmentData>
    ) => {
      state.loader = action.payload.loader;
    },
    setPortfolioSummaryProductTypeTab: (
      state,
      action: PayloadAction<InvestmentData>
    ) => {
      state.selectedAssetType = action.payload.selectedAssetType;
    },
    setTotalAmountInvested: (
      state,
      action: PayloadAction<{ totalAmountInvested: number }>
    ) => {
      state.totalAmountInvested = action.payload.totalAmountInvested;
    },
    setReturns: (state, action: PayloadAction<ReturnsJSON>) => {
      state.returns = action.payload;
    },
    setInterestBracket: (
      state,
      action: PayloadAction<{ interestBracket: string }>
    ) => {
      state.interestBracket = action.payload.interestBracket;
    },
    setReturnDistrubution: (
      state,
      action: PayloadAction<Record<string, unknown>>
    ) => {
      state.returnDistribution = action.payload;
    },
    setLeadOwner: (state, action: PayloadAction<LeadOwner>) => {
      state.leadOwner = action.payload;
    },
  },
});

export const {
  setPortfolioSummaryData,
  setPortfolioSummaryDataLoader,
  setPortfolioSummaryProductTypeTab,
  setTotalAmountInvested,
  setReturns,
  setInterestBracket,
  setReturnDistrubution,
  setLeadOwner,
} = portfolioSummarySlice.actions;

export default portfolioSummarySlice.reducer;
