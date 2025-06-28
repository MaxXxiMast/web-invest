import { getReturnsSplitByDisplayOrder, returnsSplitMapping } from './utils';

describe('getReturnsSplitByDisplayOrder', () => {
  it('should return keys sorted by displayOrder', () => {
    const input = {
      interestAmount: {},
      principalAmount: {},
    };

    const result = getReturnsSplitByDisplayOrder(input);
    expect(result).toEqual(['principalAmount', 'interestAmount']); // 1 < 2
  });

  it('should handle empty input', () => {
    const result = getReturnsSplitByDisplayOrder({});
    expect(result).toEqual([]);
  });

  it('should default to displayOrder 0 for unknown keys', () => {
    const input = {
      unknownKey: {},
      principalAmount: {},
    };

    const result = getReturnsSplitByDisplayOrder(input);
    expect(result).toEqual(['unknownKey', 'principalAmount']); // unknown = 0, principal = 1
  });

  it('should handle all known keys', () => {
    const input = {
      interestAmount: {},
      principalAmount: {},
      // Uncomment if mapping includes this:
      // preTaxReturn: {},
    };

    const result = getReturnsSplitByDisplayOrder(input);
    expect(result).toEqual(['principalAmount', 'interestAmount']);
  });

  it('should handle duplicate displayOrders by keeping original key order', () => {
    const customMapping = {
      A: { label: 'A', displayOrder: 1 },
      B: { label: 'B', displayOrder: 1 },
    };
    const input = {
      A: {},
      B: {},
    };

    // Temporarily override mapping
    const originalMapping = { ...returnsSplitMapping };
    Object.assign(returnsSplitMapping, customMapping);

    const result = getReturnsSplitByDisplayOrder(input);
    expect(result).toEqual(['A', 'B']);

    // Restore mapping
    Object.assign(returnsSplitMapping, originalMapping);
  });
});
