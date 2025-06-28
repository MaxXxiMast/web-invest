import store from '../../../redux';
import { getMaturityDate, getMaturityMonths } from '../../../utils/asset';
import {
  isAssetBondsMF,
  isHighYieldFd,
} from '../../../utils/financeProductTypes';
import { isAssetBasket } from '../../../utils/financeProductTypes';

export const sortConstant = {
  relevance: 'relevance',
  ytm_desc: 'ytm-high-to-low',
  tenure_asc: 'tenure-low-to-high',
  investment_asc: 'investment-low-to-high',
  rating_desc: 'rating-high-to-low',
};

export const sortOptions = [
  { label: 'Relevance (Default)', value: sortConstant.relevance },
  { label: 'YTM: High to Low', value: sortConstant.ytm_desc },
  { label: 'Tenure: Low to High', value: sortConstant.tenure_asc },
  { label: 'Min Investment: Low to High', value: sortConstant.investment_asc },
  { label: 'Rating: High to Low', value: sortConstant.rating_desc },
];
export const filtersContant = {
  'Below 10%': 'below-10%',
  '10-12%': '10-12%',
  'Above 12%': 'above-12%',
  'Below 12M': 'below-12M',
  '12-24M': '12-24M',
  'Above 24M': 'above-24M',
  'Under 10k': 'under-10k',
  '10k - 1Lac': '10k-1lac',
  'Above 1Lac': 'above-1lac',
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
  'At Maturity': 'at-maturity',
  Staggered: 'Staggered Payouts',
};

export const assetFilters = {
  ytm: {
    label: 'YTM',
    tooltipContent: 'YTM',
    options: [
      { label: 'Below 10%', value: filtersContant['Below 10%'] },
      { label: '10-12%', value: filtersContant['10-12%'] },
      { label: 'Above 12%', value: filtersContant['Above 12%'] },
    ],
  },
  tenure: {
    label: 'Tenure',
    tooltipContent: 'Tenure',
    options: [
      { label: 'Below 12M', value: filtersContant['Below 12M'] },
      { label: '12-24M', value: filtersContant['12-24M'] },
      { label: 'Above 24M', value: filtersContant['Above 24M'] },
    ],
  },
  minInvestment: {
    label: 'Min Investment',
    tooltipContent: 'Min Investment',
    options: [
      { label: 'Under 10k', value: filtersContant['Under 10k'] },
      { label: '10k - 1Lac', value: filtersContant['10k - 1Lac'] },
      { label: 'Above 1Lac', value: filtersContant['Above 1Lac'] },
    ],
  },
  principalRepayment: {
    label: 'Principal Repayment',
    tooltipContent: 'Principal Repayment',
    options: [
      { label: 'Monthly', value: filtersContant['Monthly'] },
      { label: 'Quarterly', value: filtersContant['Quarterly'] },
      { label: 'At Maturity', value: filtersContant['At Maturity'] },
      { label: 'Staggered', value: filtersContant['Staggered'] },
    ],
  },
};

const safeNumber = (value: any): number =>
  typeof value === 'number'
    ? value
    : parseFloat(value) || Number.NEGATIVE_INFINITY;
type MetricType = 'ytm' | 'tenure' | 'minInvestment';
export const getDealMetric = (deal: any, metric: MetricType): number => {
  const isFD = isHighYieldFd(deal);
  const isMF = isAssetBondsMF(deal);

  switch (metric) {
    case 'ytm': {
      if (isMF) {
        return safeNumber(deal?.assetMappingData?.['1YrAnnualizedReturn']);
      } else if (isFD) {
        return safeNumber(deal?.assetMappingData?.maxInterest);
      }
      return safeNumber(deal?.preTaxYtm || deal?.irr);
    }

    case 'tenure': {
      if (isFD) {
        const tenure = safeNumber(deal?.assetMappingData?.tenure);
        const tenureType = deal?.assetMappingData?.tenureType?.toLowerCase();

        if (tenureType === 'days') {
          // Use average days in a month for conversion
          return tenure / 30.44;
        } else if (tenureType === 'months') {
          return tenure;
        } else {
          // Default fallback if tenureType is not 'days' or 'months'
          return tenure;
        }
      } else {
        return safeNumber(getMaturityMonths(getMaturityDate(deal)));
      }
    }

    case 'minInvestment': {
      if (isMF) {
        return safeNumber(deal?.assetMappingData?.minInitialInvestment);
      } else if (isAssetBasket) {
        return safeNumber(
          deal?.minInvestmentAmount ||
            Number(deal?.assetMappingData?.faceValue) *
              Number(deal?.assetMappingData?.minNoOfLots) ||
            0
        );
      }
      return safeNumber(deal?.minInvestmentAmount);
    }
  }
};

export const filterBy = (deals: any[], filters: any) => {
  return deals.filter((deal) => {
    const isFD = isHighYieldFd(deal);
    const isMF = isAssetBondsMF(deal);
    const ytm = getDealMetric(deal, 'ytm');
    const tenure = getDealMetric(deal, 'tenure');
    const minInvestment = getDealMetric(deal, 'minInvestment');
    const principalRepayment =
      deal?.assetMappingData?.assetPrincipalPaymentFrequency;

    const ytmFilter = filters.ytm?.length
      ? filters.ytm.some((f: string) => {
          if (f === filtersContant['Below 10%']) return ytm < 10;
          if (f === filtersContant['10-12%']) return ytm >= 10 && ytm <= 12;
          if (f === filtersContant['Above 12%']) return ytm > 12;
          return false;
        })
      : true;

    // For MF, we don't filter by tenure
    const tenureFilter =
      filters.tenure?.length && !isMF
        ? filters.tenure.some((f: string) => {
            if (f === filtersContant['Below 12M']) return tenure < 12;
            if (f === filtersContant['12-24M'])
              return tenure >= 12 && tenure <= 24;
            if (f === filtersContant['Above 24M']) return tenure > 24;
            return false;
          })
        : true;

    const minInvestmentFilter = filters.minInvestment?.length
      ? filters.minInvestment.some((f: string) => {
          if (f === filtersContant['Under 10k']) return minInvestment < 10000;
          if (f === filtersContant['10k - 1Lac'])
            return minInvestment >= 10000 && minInvestment <= 100000;
          if (f === filtersContant['Above 1Lac']) return minInvestment > 100000;
          return false;
        })
      : true;

    let principalRepaymentFilter = true;

    if (filters.principalRepayment?.length && !isFD && !isMF) {
      principalRepaymentFilter = filters.principalRepayment.some(
        (f: string) => {
          if (f === filtersContant['Monthly'])
            return principalRepayment === 'Monthly';
          else if (f === filtersContant['Quarterly'])
            return principalRepayment === 'Quarterly';
          else if (f === filtersContant['At Maturity'])
            return principalRepayment === 'At Maturity';
          else if (
            f === filtersContant['Staggered'] &&
            !['Monthly', 'Quarterly', 'At Maturity'].includes(
              principalRepayment
            )
          ) {
            return true;
          }
        }
      );
    }

    return (
      ytmFilter &&
      tenureFilter &&
      minInvestmentFilter &&
      principalRepaymentFilter
    );
  });
};

export const sortDeals = (deals: any[], sortOption: string): any[] => {
  const sortedDeals = [...deals];
  const ratingScaleMapping = store.getState()?.assets?.ratingScaleData || {};
  const getRatingRank = (rating: string | undefined): number =>
    ratingScaleMapping?.[rating?.toUpperCase()]?.elevationAngle ??
    Number.POSITIVE_INFINITY;

  sortedDeals.sort((a, b) => {
    switch (sortOption) {
      case sortConstant.ytm_desc: {
        const aVal = safeNumber(getDealMetric(a, 'ytm'));
        const bVal = safeNumber(getDealMetric(b, 'ytm'));
        return bVal - aVal;
      }

      case sortConstant.tenure_asc: {
        const aVal = safeNumber(getDealMetric(a, 'tenure'));
        const bVal = safeNumber(getDealMetric(b, 'tenure'));
        return aVal - bVal;
      }

      case sortConstant.investment_asc: {
        const aVal = safeNumber(getDealMetric(a, 'minInvestment'));
        const bVal = safeNumber(getDealMetric(b, 'minInvestment'));
        return aVal - bVal;
      }

      case sortConstant.rating_desc: {
        const aRank = getRatingRank(a.assetMappingData?.rating);
        const bRank = getRatingRank(b.assetMappingData?.rating);
        return aRank - bRank;
      }

      case 'default':
      default:
        return 0;
    }
  });

  return sortedDeals;
};

export const getProductTypeFromTitle = (title: string) => {
  if (title === 'Corporate Bonds') return 'Bonds';
  if (
    title === 'SDIs - LeaseX, LoanX and Invoicex' ||
    title === 'SDIs - LeaseX, LoanX and InvoiceX'
  )
    return 'SDI Secondary';
  if (title === 'Baskets') return 'Basket';
  if (title === 'High Yield FDs') return 'High Yield FDs';
  if (title === 'Bonds MFs') return 'Mutual Funds';
};

export const hasAnyFilterApplied = (query: Record<string, any>): boolean => {
  const filterKeys = ['sort', ...Object.keys(assetFilters)];
  return filterKeys.some((key) => key in query);
};
