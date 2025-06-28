import dayjs from 'dayjs';
import { getMaturityMonths } from '../../../utils/asset';
import { financeProductTypeConstants } from '../../../utils/financeProductTypes';

export const MY_HOLDINGS_SEARCH_LENGTH = 3;
export const sideBarData = [
  {
    id: 'Bonds',
    key: 'bonds',
    name: 'Bonds',
    iconName: 'icon-badge',
    order: 1,
  },
  {
    id: 'SDIs',
    key: 'sdis',
    name: 'SDIs',
    iconName: 'icon-invest-plant',
    order: 2,
  },
  {
    id: 'Baskets',
    key: 'baskets',
    name: 'Baskets',
    iconName: 'icon-badge',
    order: 3,
  },
];

export const sideBarIdKeyMapping = sideBarData.reduce((acc, item) => {
  acc[item.id] = item.key;
  return acc;
}, {});

export const hiddenSideBarData = [
  {
    id: financeProductTypeConstants.highyieldfd,
    name: 'High Yield FDs',
    iconName: 'icon-piggy-bank',
    order: 4,
  },
  {
    id: financeProductTypeConstants.leasing,
    name: 'Leasing',
    iconName: 'icon-key',
    order: 5,
  },
  {
    id: financeProductTypeConstants.inventory,
    name: 'Inventory',
    iconName: 'icon-inventory',
    order: 6,
  },
  {
    id: financeProductTypeConstants.startupEquity,
    name: 'Startup Equity',
    iconName: 'icon-pie-chart',
    order: 7,
  },
  {
    id: financeProductTypeConstants.realEstate,
    name: 'Commercial Property',
    iconName: 'icon-property',
    order: 8,
  },
];

export const headerMapping = {
  Bonds: 'Bonds',
  SDIs: 'SDIs',
  Baskets: 'Baskets',
  [financeProductTypeConstants.highyieldfd]: 'High Yield FDs',
  [financeProductTypeConstants.leasing]: 'Leasing',
  [financeProductTypeConstants.inventory]: 'Inventory',
  [financeProductTypeConstants.startupEquity]: 'Startup Equity',
  [financeProductTypeConstants.realEstate]: 'Commercial Property',
};

export const hiddenProductTypes = hiddenSideBarData.map((item) => item.id);

export const productTypeMapping = {
  Bonds: 'Bonds',
  SDIs: 'SDISecondary',
  Baskets: 'Basket',
};

export const getMaturityMonthsForHolding = (date = dayjs()) => {
  const numberOfMonths = getMaturityMonths(date);
  if (numberOfMonths === 0) {
    return '< 1 month';
  } else if (numberOfMonths === 1) {
    return '1 month';
  }
  return `${numberOfMonths} months`;
};
