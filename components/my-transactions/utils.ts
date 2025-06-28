export const dealTypeOptions = [
  {
    value: 'ALL',
    labelKey: 'All Orders',
  },
  {
    value: 'BUY',
    labelKey: 'Buy Orders',
  },
  {
    value: 'SELL',
    labelKey: 'Sell Orders',
  },
];

export const sideBarData = [
  {
    id: 'Bonds',
    name: 'Bonds',
    key: 'bonds',
    iconName: 'icon-badge',
    order: 1,
    count: 0,
    hideCount: false,
  },
  {
    id: 'SDIs',
    key: 'sdi secondary',
    name: 'SDIs',
    iconName: 'icon-invest-plant',
    order: 2,
    count: 0,
  },
  {
    id: 'Baskets',
    key: 'basket',
    name: 'Baskets',
    iconName: 'icon-badge',
    order: 3,
    count: 0,
  },
];

export const financeProductTypeMapping = {
  Bonds: 'Bonds',
  SDIs: 'SDI Secondary',
  Baskets: 'Basket',
};
