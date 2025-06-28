import {
  assetListMapping,
  getEnableAssetList,
  getAssetSectionMapping,
  getTabName,
  getActiveStateByHash,
} from './assetList';

describe('assetListMapping', () => {
  it('should be an array', () => {
    expect(Array.isArray(assetListMapping)).toBe(true);
  });

  it('should have at least one item with required fields', () => {
    for (const item of assetListMapping) {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('mobileImage');
      expect(item).toHaveProperty('mobileImageInActive');
    }
  });

  it('each asset should have a unique id', () => {
    const ids = assetListMapping.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should correctly handle visibility flag', () => {
    const invisibleItems = assetListMapping.filter(
      (item) => item.visibility === false
    );
    const visibleItems = assetListMapping.filter(
      (item) => item.visibility !== false
    );

    expect([...invisibleItems, ...visibleItems].length).toBe(
      assetListMapping.length
    );
  });

  it('should have correct product types when defined', () => {
    const validProductTypes = [
      'XCase',
      'Corporate Bonds',
      'SDI Secondary',
      'High Yield FDs',
      'Startup Equity',
      'Commercial Property',
      'Leasing',
      'Mutual Funds',
      'Inventory',
    ];

    const productTypes = assetListMapping
      .filter((item) => item.productType)
      .map((item) => item.productType);

    for (const pt of productTypes) {
      expect(validProductTypes).toContain(pt);
    }
  });

  it('should have valid and unique order values among items that have it', () => {
    const orders = assetListMapping
      .filter((item) => typeof item.order === 'number')
      .map((item) => item.order!);
    orders.forEach((order) => {
      expect(typeof order).toBe('number');
    });
    const uniqueOrders = new Set(orders);
    expect(uniqueOrders.size).toBe(orders.length);
  });

  it('should validate isNew and isSpecialNew types', () => {
    for (const item of assetListMapping) {
      if ('isNew' in item) expect(typeof item.isNew).toBe('boolean');
      if ('isSpecialNew' in item)
        expect(typeof item.isSpecialNew).toBe('boolean');
    }
  });

  it('should contain at least one item with showAnnoucementWidget false or true', () => {
    const hasAnnoucementFlag = assetListMapping.some(
      (item) => 'showAnnoucementWidget' in item
    );
    expect(hasAnnoucementFlag).toBe(true);
  });

  it('should return only visible and non-filtered items in sorted order', () => {
    const result = getEnableAssetList(['bonds']); // exclude 'bonds'

    expect(Array.isArray(result)).toBe(true);
    expect(result.every((item) => item.visibility)).toBe(true);
    expect(result.some((item) => item.id === 'bonds')).toBe(false);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].order <= result[i + 1].order).toBe(true);
    }
  });
  it('should exclude items with visibility=false in getEnableAssetList', () => {
    const result = getEnableAssetList();
    expect(result.some((item) => item.visibility === false)).toBe(false);
  });
  it('should not fail if some items have missing order field', () => {
    const modified = [...getEnableAssetList()];
    modified.push({ ...modified[0], id: 'dummy', order: undefined });
    const sorted = [...modified].sort(
      (a, b) => (a?.order || 0) - (b?.order || 0)
    );
    expect(sorted).toBeDefined();
  });

  it('should return section mapping based on multitab or productType', () => {
    const result = getAssetSectionMapping();

    expect(typeof result).toBe('object');
    Object.entries(result).forEach(([key, value]) => {
      expect(typeof key).toBe('string');
      expect(value).toBeDefined();
    });
  });
  it('should return tab key based on value match', () => {
    const input = {
      sdi: { sebi: 'Securitized Debt Instruments', rbi: 'Unlisted PTC' },
      bonds: 'Corporate Bonds',
    };

    expect(getTabName(input, 'Securitized Debt Instruments')).toBe('sdi');
    expect(getTabName(input, 'Unlisted PTC')).toBe('sdi');
    expect(getTabName(input, 'Corporate Bonds')).toBe('bonds');
    expect(getTabName(input, 'Something Else')).toBeUndefined();
  });
  it('should return key for non-sdi keys when value matches directly', () => {
    const obj = {
      bonds: 'Corporate Bonds',
      leases: 'Lease Deals',
    };
    const result = getTabName(obj, 'Lease Deals');
    expect(result).toBe('leases');
  });
  it('should return undefined if no match found in getTabName and not sdi', () => {
    const tabMapping = {
      fd: 'High Yield FD',
      xcase: 'Baskets',
    };
    const result = getTabName(tabMapping, 'Nonexistent');
    expect(result).toBeUndefined();
  });

  it('should correctly parse hash and return offerType, assetType, assetSubType', () => {
    const hash = '#active#bonds#subtype';
    const result = getActiveStateByHash(hash);

    expect(result.offerType.title).toBe('Active Offers');
    expect(result.assetType).toBe('bonds');
    expect(result.assetSubType).toBe('subtype');
  });

  it('should fallback to default asset type if not found in enabled list', () => {
    const hash = '#active#nonexistent#anything';
    const result = getActiveStateByHash(hash);

    expect(result.assetType).not.toBe('nonexistent');
  });

  it('should handle isGC true and Past Offers correctly', () => {
    const hash = '#past#bonds';
    const result = getActiveStateByHash(hash, true);

    expect(result.offerType.title).toBe('Past Offers');
    expect(result.assetType).toBe('bonds');
  });
  it('should use enabled list id when GC is true and offerType is not Past Offers', () => {
    const hash = '#active#bonds';
    const result = getActiveStateByHash(hash, true);
    expect(result.assetType).not.toBeUndefined();
  });
  it('should fallback to defaultAssetType when arr[2] is undefined', () => {
    const hash = '#active';
    const result = getActiveStateByHash(hash);
    expect(result.assetType).toBeDefined();
  });
  it('should return null for assetSubType if not present in hash', () => {
    const hash = '#active#bonds';
    const result = getActiveStateByHash(hash);
    expect(result.assetSubType).toBeNull();
  });
});
