import { hasSpvCategoryBank } from './spv';
import * as objectUtils from './object';

describe('hasSpvCategoryBank', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false if spvCategoryBank is empty object', () => {
    jest.spyOn(objectUtils, 'isEmpty').mockReturnValue(true);

    const input = { spvCategoryBank: {} };
    const result = hasSpvCategoryBank(input);

    expect(objectUtils.isEmpty).toHaveBeenCalledWith({});
    expect(result).toBe(false);
  });

  it('should return true if spvCategoryBank is not empty', () => {
    jest.spyOn(objectUtils, 'isEmpty').mockReturnValue(false);

    const input = { spvCategoryBank: { bank: 'HDFC' } };
    const result = hasSpvCategoryBank(input);

    expect(objectUtils.isEmpty).toHaveBeenCalledWith({ bank: 'HDFC' });
    expect(result).toBe(true);
  });

  it('should return false if spvCategoryBank is undefined', () => {
    jest.spyOn(objectUtils, 'isEmpty').mockReturnValue(true);

    const input = {};
    const result = hasSpvCategoryBank(input);

    expect(objectUtils.isEmpty).toHaveBeenCalledWith({});
    expect(result).toBe(false);
  });

  it('should return true if spvCategoryBank is present and not empty', () => {
    const mockBankData = { name: 'Axis Bank' };
    jest.spyOn(objectUtils, 'isEmpty').mockImplementation((val) => Object.keys(val).length === 0);

    const result = hasSpvCategoryBank({ spvCategoryBank: mockBankData });

    expect(result).toBe(true);
  });
});
