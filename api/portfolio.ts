import {
  OverviewBreakdownResponse,
  OvreviewResponse,
} from '../components/portfolio-summary/investment-overview/types';
import { financeProductTypeMappingsReturns } from '../components/portfolio-summary/my-returns/ReturnsTable/constants';
import type {
  GetUserReturnsParams,
  ReturnsJSON,
} from '../components/portfolio-summary/my-returns/ReturnsTable/types';

import { fetchAPI } from './strapi';

// types
import type { MyTransactionsResponse } from '../components/my-transactions/types';
import type { MyHoldingsApiResponse } from '../components/portfolio/my-holdings/types';
import { MY_HOLDINGS_SEARCH_LENGTH } from '../components/portfolio/my-holdings/utils';

export const getUserInvestmentTypeDetails = () => {
  return fetchAPI(`/v3/portfolio/financeProductType/count`, {}, {}, true);
};

/**
 * Fetches investment data based on the selected asset type and filter.
 * @param {string} selectedAssetType - The selected asset type from asset type filter.
 * @param {string} selectedFilter - The selected filter 'all' | 'active' | 'completed'.
 * @returns {Promise} A promise that resolves with the investment data.
 */
export const getUserInvestmentData = (
  selectedAssetType: string,
  selectedFilter: 'all' | 'active' | 'completed',
  signal = {}
): Promise<OvreviewResponse> => {
  const queryParams = `?financeProductType=${selectedAssetType}&assetType=${selectedFilter}`;

  return fetchAPI(
    `/v3/portfolio/investment-overview${queryParams}`,
    {},
    { signal },
    true,
    false
  );
};

/**
 * Fetches investment data based on the selected asset type and filter.
 * @param {string} selectedAssetType - The selected asset type from asset type filter.
 * @param {string} returnType - The selected overview card type for breakdown 'invested' | 'expected' | 'recieved'.
 * @param {string} selectedFilter - The selected filter 'all' | 'active' | 'completed'.
 * @returns {Promise} A promise that resolves with the overview breakdownData.
 */
export const getOverviewBreakdownData = async (
  selectedAssetType: string,
  returnType: 'invested' | 'expected' | 'recieved',
  selectedFilter: string
): Promise<OverviewBreakdownResponse> => {
  const assetTypeFilter =
    financeProductTypeMappingsReturns[selectedAssetType].join(',');

  const finalParams = {
    financeProductType: assetTypeFilter,
    returnType,
    assetType: selectedFilter,
  };

  return await fetchAPI(
    `/v3/portfolio/investment-summary`,
    { ...finalParams },
    {},
    true
  );
};

export const getUserReturns = ({
  startDate,
  endDate,
  type = 'upcoming',
  financeProductType,
}: GetUserReturnsParams): Promise<ReturnsJSON> => {
  const finalParams = {
    startDate,
    endDate,
    type,
    financeProductType,
  };

  return fetchAPI(`/v3/portfolio/my-returns-v2`, { ...finalParams }, {}, true);
};

/**
 * Fetches the return distribution data for the portfolio.
 * @returns {Promise} A promise that resolves with the return distribution data.
 */
export const getPortfolioReturnDistribution = async (): Promise<number[]> => {
  const res = await fetchAPI(`/v3/portfolio/return-distribution`, {}, {}, true);
  return res.returnDistribution;
};

export const getUserHoldingsCount = (data) => {
  const { financeProductType, orderStatus, search } = data;
  const params = {
    financeProductType,
    orderStatus,
    search: search?.length >= MY_HOLDINGS_SEARCH_LENGTH ? search : '',
  };

  return fetchAPI(`/v3/portfolio/my-holdings-count`, params, {}, true);
};
export const getUserHoldings = ({
  financeProductType = 'Bonds',
  limit = 4,
  skip = 0,
  search = '',
  orderStatus = 'active',
}): Promise<MyHoldingsApiResponse> => {
  let params = {
    financeProductType,
    limit,
    skip,
    search: search?.length >= MY_HOLDINGS_SEARCH_LENGTH ? search : '',
    orderStatus,
  };
  return fetchAPI(`/v3/portfolio/my-holdings`, params, {}, true);
};

export const getUserTransactionsCount = () => {
  return fetchAPI(`/v3/portfolio/my-transaction-count`, {}, {}, true);
};

export const getUserTransactions = ({
  orderType = 'ALL',
  skip = 0,
  limit = 4,
  financeProductType = 'Bonds',
  search = '',
}): Promise<MyTransactionsResponse> => {
  const params = {
    orderType,
    skip,
    limit,
    financeProductType,
    search,
  };
  return fetchAPI(`/v3/portfolio/my-transactions`, params, {}, true);
};

export const getUserTransactionAndReturns = ({ key, securityID }) => {
  return fetchAPI(
    `/v3/portfolio/my-holdings/${key}/${securityID}`,
    {},
    {},
    true
  );
};

export const returnsDownload = (
  securityID: number,
  type: 'statement' | 'returns' | 'transactions',
  downloadFormat: 'pdf' | 'excel'
) => {
  const params = {
    type,
    securityID,
    downloadFormat,
  };
  return fetchAPI(
    `/v3/portfolio/return-report/download`,
    params,
    {},
    true,
    true,
    true,
    { 'x-api-version': 1.2 }
  );
};
