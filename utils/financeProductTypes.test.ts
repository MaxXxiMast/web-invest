import {
  financeProductTypeConstants,
  financeProductTypeMapping,
  hideAssets,
  hideAssetsInPortfolio,
  isAssetLeasing,
  isAssetInventory,
  isAssetCommercialProduct,
  isAssetStartupEquity,
  isAssetBonds,
  isSDISecondary,
  isAssetBasket,
  isAssetBondsMF,
  isHighYieldFd,
  nonTaxRelatedProductTypes,
  isAssetEligibleForRepeatOrderPopup,
  isSEOrCRE,
  isAssetUnlistedPTC,
} from './financeProductTypes';

describe('financeProductUtils', () => {
  const assetFactory = (type: string, category = '') => ({
    financeProductType: type,
    productCategory: category,
  });

  describe('financeProductTypeConstants and Mapping', () => {
    it('should map constants to correct labels', () => {
      expect(financeProductTypeConstants.leasing).toBe('Lease Financing');
      expect(financeProductTypeMapping['Lease Financing']).toBe('leasing');
    });
  });

  describe('hideAssets', () => {
    it('returns 1 if product type is hidden', () => {
      const hiddenType = financeProductTypeMapping['Lease Financing'];
      expect(hideAssets(hiddenType)).toBe(1);
    });

    it('returns 0 if product type is not hidden', () => {
      expect(hideAssets('bonds')).toBe(0);
    });
  });

  describe('hideAssetsInPortfolio', () => {
    it('returns 1 if product type is hidden in portfolio', () => {
      const hiddenType = financeProductTypeMapping['SDI Secondary'];
      expect(hideAssetsInPortfolio(hiddenType)).toBe(1);
    });

    it('returns 0 if product type is not hidden in portfolio', () => {
      expect(hideAssetsInPortfolio('bonds')).toBe(0);
    });
  });

  describe('Asset type checkers', () => {
    it('identifies leasing asset', () => {
      expect(isAssetLeasing(assetFactory(financeProductTypeConstants.leasing))).toBe(true);
    });

    it('identifies inventory asset', () => {
      expect(isAssetInventory(assetFactory(financeProductTypeConstants.inventory))).toBe(true);
    });

    it('identifies commercial product asset', () => {
      expect(isAssetCommercialProduct(assetFactory(financeProductTypeConstants.realEstate))).toBe(true);
    });

    it('identifies startup equity asset', () => {
      expect(isAssetStartupEquity(assetFactory(financeProductTypeConstants.startupEquity))).toBe(true);
    });

    it('identifies bonds asset', () => {
      expect(isAssetBonds(assetFactory(financeProductTypeConstants.bonds))).toBe(true);
    });

    it('identifies SDI secondary asset', () => {
      expect(isSDISecondary(assetFactory(financeProductTypeConstants.sdi))).toBe(true);
    });

    it('identifies basket asset', () => {
      expect(isAssetBasket(assetFactory(financeProductTypeConstants.Baskets))).toBe(true);
    });

    it('identifies bond MF asset', () => {
      expect(isAssetBondsMF(assetFactory(financeProductTypeConstants.bondsMFs))).toBe(true);
    });

    it('identifies high yield FD asset', () => {
      expect(isHighYieldFd(assetFactory(financeProductTypeConstants.highyieldfd))).toBe(true);
    });

    it('returns false for unmatched types', () => {
      expect(isAssetLeasing(assetFactory('Other'))).toBe(false);
      expect(isAssetInventory({})).toBe(false);
    });
  });

  describe('nonTaxRelatedProductTypes', () => {
    it('includes real estate and startup equity', () => {
      expect(nonTaxRelatedProductTypes).toContain(financeProductTypeConstants.realEstate);
      expect(nonTaxRelatedProductTypes).toContain(financeProductTypeConstants.startupEquity);
    });
  });

  describe('Repeat Order Popups', () => {
    it('should allow repeat order popup for SE, CRE and SDI', () => {
      expect(isAssetEligibleForRepeatOrderPopup(assetFactory(financeProductTypeConstants.sdi))).toBe(true);
      expect(isAssetEligibleForRepeatOrderPopup(assetFactory(financeProductTypeConstants.realEstate))).toBe(true);
    });

    it('should allow SE or CRE types in isSEOrCRE', () => {
      expect(isSEOrCRE(assetFactory(financeProductTypeConstants.startupEquity))).toBe(true);
    });

    it('returns false for other types', () => {
      expect(isSEOrCRE(assetFactory('bonds'))).toBe(false);
    });

  });

  describe('isAssetUnlistedPTC', () => {
    it('returns true for unlisted PTC', () => {
      expect(isAssetUnlistedPTC({ productCategory: 'Unlisted PTC' })).toBe(true);
    });

    it('is case insensitive', () => {
      expect(isAssetUnlistedPTC({ productCategory: 'uNlIsTeD pTc' })).toBe(true);
    });

    it('returns false for others', () => {
      expect(isAssetUnlistedPTC({ productCategory: 'Corporate Bond' })).toBe(false);
      expect(isAssetUnlistedPTC({})).toBe(false);
    });
    it('returns false if asset is not leasing', () => {
        expect(isAssetLeasing({ financeProductType: 'Other' })).toBe(false);
        expect(isAssetLeasing(undefined)).toBe(false);
    });
  });
});
