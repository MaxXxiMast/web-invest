import { orderBy } from 'lodash';

export const breakDownHash = (hash: string) => {
  const [_, main, sub = ''] = hash.split('#');
  return { main, sub };
};

export const getSortedDeals = (dealsToShow: any = []) => {
  let sortedDeals: any = [];
  sortedDeals = orderBy(dealsToShow, 'irr', 'desc');
  sortedDeals = sortedDeals.sort((a: any, b: any) => {
    const dateA = new Date(
      a.assetMappingData.dateOfMaturity || a.assetMappingData.maturityDate
    ).getTime();
    const dateB = new Date(
      b.assetMappingData.dateOfMaturity || b.assetMappingData.maturityDate
    ).getTime();
    return dateA - dateB; // ascending order
  });
  sortedDeals = orderBy(sortedDeals, 'minInvestmentAmount', 'asc');
  return sortedDeals;
};
