import { financeProductTypeConstants } from '../../utils/financeProductTypes';
import { dateFormatter } from '../../utils/dateFormatter';

type SideBarLinkModel = {
  id: string;
  name: string;
  iconName?: string;
  order?: number;
};

export const SidebarLinks: SideBarLinkModel[] = [
  {
    id: financeProductTypeConstants.bonds,
    name: 'Bonds',
    iconName: 'icon-badge',
    order: 1,
  },
  {
    id: financeProductTypeConstants.sdi,
    name: 'SDIs',
    iconName: 'icon-invest-plant',
    order: 2,
  },
  {
    id: financeProductTypeConstants.Baskets,
    name: 'Baskets',
    iconName: 'icon-badge',
  },
  {
    id: financeProductTypeConstants.highyieldfd,
    name: 'High Yield FDs',
    iconName: 'icon-piggy-bank',
    order: 3,
  },
  {
    id: financeProductTypeConstants.leasing,
    name: 'Leasing',
    iconName: 'icon-key',
  },
  {
    id: financeProductTypeConstants.inventory,
    name: 'Inventory',
    iconName: 'icon-inventory',
  },
  {
    id: financeProductTypeConstants.startupEquity,
    name: 'Startup Equity',
    iconName: 'icon-pie-chart',
  },
  {
    id: financeProductTypeConstants.realEstate,
    name: 'Commercial Property',
    iconName: 'icon-property',
  },
];

export const amoTextFormat = (
  text: string,
  date: string,
  isEnable?: boolean,
  format?: string
) => {
  return date
    ? `${text} ${dateFormatter({
        dateTime: date,
        timeZoneEnable: isEnable,
        dateFormat: format,
      })}`
    : '';
};

export const getLiquidityDate = (
  assetId: number,
  useOrderDate?: string,
  assetIds?: number[],
  isAssetReturnsCompleted?: boolean,
  liquidityDates = {
    cutOffDate: '2025-02-10',
    fallbackDate: '2025-04-10',
  }
) => {
  if (assetIds.includes(assetId) && !isAssetReturnsCompleted) {
    const inputDate = new Date(useOrderDate);
    const cutOffDate = new Date(liquidityDates.cutOffDate); // 10 FEB 2025

    if (inputDate > cutOffDate) {
      inputDate.setDate(inputDate.getDate() + 60); // Add 60 days
    } else {
      return dateFormatter({
        dateTime: new Date(liquidityDates.fallbackDate).toDateString(),
        timeZoneEnable: true,
        dateFormat: 'DD MMM YYYY',
      });
    }

    return dateFormatter({
      dateTime: inputDate.toISOString(),
      timeZoneEnable: true,
      dateFormat: 'DD MMM YYYY',
    });
  }
  return null;
};
