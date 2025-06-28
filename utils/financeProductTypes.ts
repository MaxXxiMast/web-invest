// finance product type constants for assets
export const financeProductTypeConstants = {
  inventory: 'Inventory Financing',
  leasing: 'Lease Financing',
  realEstate: 'Commercial Property',
  ncd: 'Non Convertible Debentures',
  startupEquity: 'Startup Equity',
  bonds: 'Bonds',
  sdi: 'SDI Secondary',
  highyieldfd: 'High Yield FDs',
  Baskets: 'Basket',
  bondsMFs: 'Mutual Funds',
};

/**
 * To replace key with value and value with key in object
 * @param obj
 * @returns
 */
const invertObject = (obj: any) => {
  const invertedObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      invertedObj[obj[key]] = key;
    }
  }
  return invertedObj;
};

export const financeProductTypeMapping = invertObject(
  financeProductTypeConstants
);

// llp removal
export const hideAssets = (productType: string) =>
  [
    financeProductTypeMapping['Lease Financing'],
    financeProductTypeMapping['Inventory Financing'],
    financeProductTypeMapping['Commercial Property'],
    financeProductTypeMapping['Startup Equity'],
  ].filter((el) => el == productType)?.length;

export const hideAssetsInPortfolio = (productType: string) =>
  [
    financeProductTypeMapping['Lease Financing'],
    financeProductTypeMapping['Inventory Financing'],
    financeProductTypeMapping['Commercial Property'],
    financeProductTypeMapping['Startup Equity'],
    financeProductTypeMapping['SDI Secondary'],
    financeProductTypeMapping['Basket'],
  ].filter((el) => el == productType)?.length;

/**
 * @param asset details of an asset
 * @returns `true` when asset is of leasing type
 */
export const isAssetLeasing = (asset: any) => {
  return asset?.financeProductType === financeProductTypeConstants.leasing;
};

/**
 * @param asset details of an asset
 * @returns `true` when asset is of inventory type
 */
export const isAssetInventory = (asset: any) => {
  return asset?.financeProductType === financeProductTypeConstants.inventory;
};

/**
 * @param asset details of an asset
 * @returns `true` when asset is of commercial property type
 */
export const isAssetCommercialProduct = (asset: any) => {
  return asset?.financeProductType === financeProductTypeConstants.realEstate;
};

/**
 * @param asset details of an asset
 * @returns `true` when asset is of commercial property type
 */
export const isAssetStartupEquity = (asset: any) => {
  return (
    asset?.financeProductType === financeProductTypeConstants.startupEquity
  );
};

export const isAssetBonds = (asset: any) => {
  return asset?.financeProductType === financeProductTypeConstants.bonds;
};

/**
 * @param asset details of an asset
 * @returns `true` when asset is of SDI secondary type
 */
export const isSDISecondary = (asset: any) => {
  return asset?.financeProductType === financeProductTypeConstants?.sdi;
};

/**
 * @param asset details of an asset
 * @returns `true` when asset is of Corporate bonds type
 */

export const isAssetBasket = (asset: any) => {
  return asset?.financeProductType === financeProductTypeConstants.Baskets;
};

export const isAssetBondsMF = (asset: any) => {
  return asset?.financeProductType === financeProductTypeConstants.bondsMFs;
};

export const isHighYieldFd = (asset: any) => {
  return asset?.financeProductType === financeProductTypeConstants.highyieldfd;
};

// finance product types that are not product related
export const nonTaxRelatedProductTypes = [
  financeProductTypeConstants.realEstate,
  financeProductTypeConstants.startupEquity,
];

export const isAssetEligibleForRepeatOrderPopup = (asset: any) => {
  const repeatOrderPopupAssetType = [
    financeProductTypeConstants.realEstate,
    financeProductTypeConstants.startupEquity,
    financeProductTypeConstants.sdi,
  ];
  return repeatOrderPopupAssetType.includes(asset?.financeProductType);
};

export const isSEOrCRE = (asset: any) => {
  const repeatOrderPopupAssetType = [
    financeProductTypeConstants.realEstate,
    financeProductTypeConstants.startupEquity,
  ];
  return repeatOrderPopupAssetType.includes(asset?.financeProductType);
};

/**
 * Check if an asset is unlisted PTC
 * @param asset asset details
 * @returns `true` if asset is of unlisted PTC type
 */
export const isAssetUnlistedPTC = (asset: any) => {
  return asset?.productCategory?.toLowerCase() === 'unlisted ptc';
};
