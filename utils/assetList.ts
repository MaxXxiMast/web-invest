import { GRIP_INVEST_BUCKET_URL } from './string';

type SectionMapping = {
  sebi?: string;
  rbi?: string;
};

export type assetListIdMapping =
  | 'sdi'
  | 'bonds'
  | 'bondsMFs'
  | 'highyieldfd'
  | 'startupEquity'
  | 'realEstate'
  | 'leasing'
  | 'inventory'
  | 'commercialProperty'
  | 'Baskets';

export type ProductType =
  | 'XCase'
  | 'Corporate Bonds'
  | 'SDI Secondary'
  | 'High Yield FDs'
  | 'Startup Equity'
  | 'Commercial Property'
  | 'Leasing'
  | 'Mutual Funds'
  | 'Inventory';

type Item = {
  name: string;
  id: assetListIdMapping;
  mobileImage: any;
  mobileImageInActive: any;
  isNew?: boolean;
  visibility?: boolean;
  showAnnoucementWidget?: boolean;
  multitab?: boolean;
  tabName?: string;
  tabMapping?: SectionMapping;
  productType?: ProductType;
  isSpecialNew?: boolean;
  order?: number;
};

export const assetListMapping: Item[] = [
  {
    name: 'Bonds MFs',
    id: 'bondsMFs',
    order: 1,
    mobileImage: `${GRIP_INVEST_BUCKET_URL}commons/case-blue.svg`,
    mobileImageInActive: `${GRIP_INVEST_BUCKET_URL}commons/case.svg`,
    isNew: true,
    visibility: true,
    multitab: false,
    showAnnoucementWidget: false,
    tabName: 'Bonds MFs',
    productType: 'Mutual Funds',
    isSpecialNew: true,
  },
  {
    name: 'Baskets',
    id: 'Baskets',
    order: 4,
    mobileImage: `${GRIP_INVEST_BUCKET_URL}commons/case-blue.svg`,
    mobileImageInActive: `${GRIP_INVEST_BUCKET_URL}commons/case.svg`,
    isNew: false,
    visibility: true,
    multitab: false,
    showAnnoucementWidget: false,
    tabName: 'XCase',
    productType: 'XCase',
    isSpecialNew: false,
  },
  {
    name: 'Bonds',
    id: 'bonds',
    order: 2,
    mobileImage: `${GRIP_INVEST_BUCKET_URL}assets/BondsTabIconActive.svg`,
    mobileImageInActive: `${GRIP_INVEST_BUCKET_URL}commons/BondsTabIconInActive.svg`,
    isNew: false,
    visibility: true,
    showAnnoucementWidget: false,
    multitab: false,
    tabName: 'Corporate Bonds',
    productType: 'Corporate Bonds',
  },
  {
    name: 'SDIs',
    id: 'sdi',
    order: 3,
    mobileImage: `${GRIP_INVEST_BUCKET_URL}assets/LeaseXTabIconSelected.svg`,
    mobileImageInActive: `${GRIP_INVEST_BUCKET_URL}commons/LeaseXTabIconUnSelected.svg`,
    isNew: false,
    visibility: true,
    multitab: true,
    showAnnoucementWidget: false,
    tabName: 'SDI Secondary',
    productType: 'SDI Secondary',
    tabMapping: {
      sebi: 'Securitized Debt Instruments',
      rbi: 'Unlisted PTC',
    },
  },
  {
    name: 'FDs',
    id: 'highyieldfd',
    order: 5,
    mobileImage: `${GRIP_INVEST_BUCKET_URL}commons/piggy-bank.svg`,
    mobileImageInActive: `${GRIP_INVEST_BUCKET_URL}commons/piggy-bank-grey.svg`,
    isNew: false,
    visibility: true,
    showAnnoucementWidget: false,
    multitab: false,
    tabName: 'High Yield FDs',
    productType: 'High Yield FDs',
    isSpecialNew: false,
  },
  {
    name: 'Startup Equity',
    id: 'startupEquity',
    mobileImage: `${GRIP_INVEST_BUCKET_URL}assets/StartupTabIconSelected.svg`,
    mobileImageInActive: `${GRIP_INVEST_BUCKET_URL}commons/StartupTabIconUnSelected.svg`,
    visibility: false,
    showAnnoucementWidget: true,
    multitab: false,
    tabName: 'Startup Equity',
    productType: 'Startup Equity',
  },
  {
    name: 'Commercial Property',
    id: 'realEstate',
    mobileImage: `${GRIP_INVEST_BUCKET_URL}assets/CommercialProperty.svg`,
    mobileImageInActive: `${GRIP_INVEST_BUCKET_URL}commons/CommercialPropertyTabIconInActive.svg`,
    visibility: false,
    showAnnoucementWidget: true,
    multitab: false,
    tabName: 'Commercial Property',
    productType: 'Commercial Property',
  },
  {
    name: 'Leasing',
    id: 'leasing',
    mobileImage: `${GRIP_INVEST_BUCKET_URL}assets/LeasingTabIconActive.svg`,
    mobileImageInActive: `${GRIP_INVEST_BUCKET_URL}commons/LeasingTabIconInActive.svg`,
    visibility: false,
    showAnnoucementWidget: false,
    multitab: false,
    tabName: 'Leasing',
    productType: 'Leasing',
  },
  {
    name: 'Inventory',
    id: 'inventory',
    mobileImage: `${GRIP_INVEST_BUCKET_URL}assets/InventoryTabIconActive.svg`,
    mobileImageInActive: `${GRIP_INVEST_BUCKET_URL}commons/InventoryInactive.svg`,
    visibility: false,
    showAnnoucementWidget: false,
    multitab: false,
    tabName: 'Inventory',
    productType: 'Inventory',
  },
];

export const getEnableAssetList = (filterArr: assetListIdMapping[] = []) => {
  return assetListMapping
    .filter((item) => item.visibility && !filterArr.includes(item.id))
    ?.sort((a, b) => a?.order - b?.order);
};

export const getAssetSectionMapping = (
  filterArr: assetListIdMapping[] = []
) => {
  let sectionMapping: any = {};
  const assetListMapping = getEnableAssetList(filterArr);
  assetListMapping.forEach((item) => {
    if (item.multitab) {
      sectionMapping[item.id] = item.tabMapping;
    } else {
      sectionMapping[item.id] = item.productType;
    }
  });
  return sectionMapping;
};

export const getTabName = (object: any, value: string) => {
  return Object.keys(object).find((key) =>
    key === 'sdi'
      ? [object?.[key]?.sebi, object?.[key]?.rbi].includes(value)
      : object?.[key] === value
  );
};

export const offerTypeArr = [
  { id: 901, title: 'Active Offers' },
  { id: 902, title: 'Past Offers' },
];

export const getActiveStateByHash = (
  hash: string,
  isGC = false,
  removeAssetArr = []
) => {
  let arr = hash.split(/#|%23/);
  let offerType = arr[1]
    ? arr[1] === 'active'
      ? offerTypeArr[0]
      : offerTypeArr[1]
    : offerTypeArr[0];
  const enabledProductList = getEnableAssetList(removeAssetArr);
  let defaultAssetType = enabledProductList?.[0]?.id || 'bonds';
  if (isGC) {
    defaultAssetType =
      offerType.title === 'Past Offers'
        ? 'bonds'
        : enabledProductList?.[0]?.id || 'bonds';
  }
  let assetType = enabledProductList.some((p) => p.id === arr[2])
    ? arr[2] || defaultAssetType
    : defaultAssetType;
  let assetSubType = arr[3] || null;
  return {
    offerType,
    assetType,
    assetSubType,
  };
};
