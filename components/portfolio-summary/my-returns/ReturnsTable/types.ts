export type ReturnsData = {
  dateOfReturn: string;
  assetName: string;
  assetImage: string;
  partnerName: string;
  assetID: number;
  category: string;
  financeProductType: string;
  llpName: string;
  comments: string;
  status: string;
  returnsSplit: Record<string, unknown>;
  noOftotalReturns: number;
  noOfCompletedReturns: number;
  amount: number;
  tdsAmount: number;
  noOfReturn: number;
};

export type ReturnsJSON = {
  count: number;
  totalReturns: number;
  data: ReturnsData[];
};

export type MyReturnsType = 'upcoming' | 'past' | 'arrears';

/**
 * Represents the parameters for fetching user returns.
 * @typedef {Object} GetUserReturnsParams
 * @property {string} startDate - The start date of the returns to fetch. Format: 'YYYY-MM-DD'. (mandatory)
 * @property {string} endDate - The end date of the returns to fetch. Format: 'YYYY-MM-DD'. (mandatory)
 * @property {MyReturnsType} type - The type of returns to fetch. Default is upcoming.
 * @property {number} pageNo - The page number for pagination. Default is 1.
 * @property {number} [limit=5] - The maximum number of rows to fetch per page. Default is 5.
 */
export type GetUserReturnsParams = {
  startDate: string;
  endDate: string;
  type: MyReturnsType;
  financeProductType: string;
};
