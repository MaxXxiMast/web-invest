import dayjs from 'dayjs';
import {
  getCurrentFinancialYear,
  getNextFinancialYears,
  getFinancialYearListForFilter,
} from '../../../../utils/date';
import { MyReturnsType } from './types';
import { InvestmentType } from '../../utils';
import { financeProductTypeConstants } from '../../../../utils/financeProductTypes';

const tabArrKeyMapping = [
  { label: 'Upcoming', key: 'upcoming' },
  { label: 'Past', key: 'past' },
  { label: 'In-arrears', key: 'arrears' },
];

const monthFilterKeyMapping = {
  upcoming: [
    { label: 'Next 3 months', key: 'next3month' },
    { label: 'Next 6 months', key: 'next6month' },
  ],
  past: [
    { label: 'Past 3 months', key: 'past3month' },
    { label: 'Past 6 months', key: 'past6month' },
  ],
};

const monthsFilter = {
  upcoming: monthFilterKeyMapping.upcoming.map((value) => value.label),
  past: monthFilterKeyMapping.past.map((value) => value.label),
};

const finalDateFormat = 'YYYY-MM-DD';

const getFinancialYearDates = (
  fy: string
): { startDate: string; endDate: string } | null => {
  const regex = /^FY(\d{4})-(\d{4})$/;
  const match = fy.match(regex);

  if (!match) {
    console.error('Invalid financial year format');
    return null;
  }

  const startYear = parseInt(match[1]);
  const endYear = parseInt(match[1]) + 1;
  const today = dayjs();
  let startDate = dayjs().format(finalDateFormat);

  if (today.year() === startYear) {
    startDate = today.format(finalDateFormat);
  } else {
    startDate = dayjs(`${startYear}-04-01`, finalDateFormat).format(
      finalDateFormat
    );
  }
  const endDate = dayjs(`${endYear}-03-31`, finalDateFormat).format(
    finalDateFormat
  );

  return { startDate, endDate };
};

export const ROWS_PER_PAGE = 5;

export const tabArr = tabArrKeyMapping.map((ele) => ele.label);

export const getKeyFromLabel = (label: string) => {
  const key = tabArrKeyMapping.find((ele) => ele.label === label);
  return key?.key as MyReturnsType;
};

export const getDatesForAPI = (filterName: string, isArrears = false) => {
  const today = dayjs();

  if (isArrears) {
    return {
      startDate: '2021-01-01',
      endDate: today.format('YYYY-MM-DD'),
    };
  }

  if (monthsFilter.upcoming.includes(filterName)) {
    if (filterName === 'Next 3 months') {
      return {
        startDate: today.format(finalDateFormat),
        endDate: today.add(3, 'month').format(finalDateFormat),
      };
    } else {
      return {
        startDate: today.format(finalDateFormat),
        endDate: today.add(6, 'month').format(finalDateFormat),
      };
    }
  }

  if (monthsFilter.past.includes(filterName)) {
    if (filterName === 'Past 3 months') {
      return {
        startDate: today.subtract(3, 'month').format(finalDateFormat),
        endDate: today.format(finalDateFormat),
      };
    } else {
      return {
        startDate: today.subtract(6, 'month').format(finalDateFormat),
        endDate: today.format(finalDateFormat),
      };
    }
  }

  if (filterName.startsWith('FY')) {
    return getFinancialYearDates(filterName);
  }

  return {
    startDate: today.format('YYYY-MM-DD'),
    endDate: today.format('YYYY-MM-DD'),
  };
};

export const getFilters = (
  monthFilterType: MyReturnsType,
  selectedAssetType: InvestmentType = 'LLPs & CRE'
) => {
  const filters = monthsFilter[monthFilterType];

  if (monthFilterType === 'upcoming') {
    return [...filters, getCurrentFinancialYear(), ...getNextFinancialYears()];
  }

  if (selectedAssetType === 'Bonds, SDIs & Baskets') {
    return [...filters, ...getFinancialYearListForFilter('2022')];
  }

  if (selectedAssetType === 'High Yield FDs') {
    return [...filters, ...getFinancialYearListForFilter('2023')];
  }

  return [...filters, ...getFinancialYearListForFilter('2020')];
};

export const financeProductTypeMappingsReturns: Record<
  InvestmentType,
  string[]
> = {
  'Bonds, SDIs & Baskets': [
    financeProductTypeConstants.bonds,
    financeProductTypeConstants.sdi,
    financeProductTypeConstants.Baskets,
  ],
  'LLPs & CRE': [
    financeProductTypeConstants.leasing,
    financeProductTypeConstants.inventory,
    financeProductTypeConstants.realEstate,
  ],
  'Startup Equity': [financeProductTypeConstants.startupEquity],
  'High Yield FDs': [financeProductTypeConstants.highyieldfd],
};
