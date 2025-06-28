const mockUnix = jest.fn();
const mockedDayjs = Object.assign(
  jest.fn(() => ({
    unix: mockUnix,
    tz: jest.fn().mockReturnValue({
      hour: jest.fn().mockReturnValue(12),
      minute: jest.fn().mockReturnValue(30)
    })
  })),
  {
    extend: jest.fn(),
    tz: {
      setDefault: jest.fn(),
    },
  }
);

jest.mock('dayjs', () => mockedDayjs);

import * as utils from './number'; 

describe('Utility functions tests', () => {
  describe('roundOff', () => {
    test('should handle string values and convert them to numbers', () => {
      expect(utils.roundOff('12.3456', 2)).toBe('12.35');
      expect(utils.roundOff('12', 2)).toBe('12.00');
    });
  });

  describe('toCurrecyStringWithDecimals', () => {
    test('should format numbers in lakhs with Lac/Lacs suffix', () => {
      expect(utils.toCurrecyStringWithDecimals(100000, 2)).toBe('1Lac');
      expect(utils.toCurrecyStringWithDecimals(500000, 2)).toBe('5 Lakh');
      expect(utils.toCurrecyStringWithDecimals(500000, 2, true)).toBe('5L');
    });

    test('should format numbers in crores with Crore suffix', () => {
      expect(utils.toCurrecyStringWithDecimals(10000000, 2)).toBe('1 Crore');
      expect(utils.toCurrecyStringWithDecimals(10000000, 2, true)).toBe('1Cr');
    });

    test('should handle string inputs', () => {
      expect(utils.toCurrecyStringWithDecimals('5000', 2)).toBe('5K');
    });

    test('should return the original value on exceptions', () => {
      expect(utils.toCurrecyStringWithDecimals(null as any, 2)).toBe("0");
    });
  });

  describe('SDISecondaryAmountToCommaSeparator', () => {
    test('should handle string inputs', () => {
      expect(utils.SDISecondaryAmountToCommaSeparator('1234567.89', 2)).toBe('12,34,567.89');
    });
  });

  describe('numberToCurrency', () => {
    test('should format number with commas as per International locale when specified', () => {
      expect(utils.numberToCurrency(1234567, true)).toBe('1,234,567');
    });

    test('should handle string inputs', () => {
      expect(utils.numberToCurrency('1234567')).toBe('12,34,567');
      expect(utils.numberToCurrency('1234567', true)).toBe('1,234,567');
    });

    test('should return the original value on exceptions', () => {
      expect(utils.numberToCurrency(null as any)).toBe('null');
    });
  });

  describe('convertCurrencyToNumber', () => {
    test('should handle negative numbers', () => {
      expect(utils.convertCurrencyToNumber('-₹1,234.56')).toBe(-1234.56);
    });

    test('should handle null or undefined gracefully', () => {
      expect(utils.convertCurrencyToNumber(undefined as any)).toBeNaN();
      expect(utils.convertCurrencyToNumber(null as any)).toBeNaN();
    });
  });

  describe('numberToIndianCurrencyWithDecimals', () => {
    test('should handle different maximum fraction digits', () => {
      expect(utils.numberToIndianCurrencyWithDecimals(1234.5678, 3)).toBe('₹1,234.568');
    });

    test('should handle integer values correctly', () => {
      const integerValue = 1234;
      expect(utils.numberToIndianCurrencyWithDecimals(integerValue)).toBe('₹1,234.00');
    });

    test('should handle string inputs', () => {
      expect(utils.numberToIndianCurrencyWithDecimals('1234567.89')).toBe('₹12,34,567.89');
      expect(utils.numberToIndianCurrencyWithDecimals('1234567')).toBe('₹12,34,567.00');
    });

    test('should handle commas in string inputs', () => {
      expect(utils.numberToIndianCurrencyWithDecimals('1,234,567.89')).toBe('₹12,34,567.89');
    });

    test('should return the original value on exceptions', () => {
       expect(utils.numberToIndianCurrencyWithDecimals(null as any)).toBe('null');
    });
  });

  describe('numberToIndianCurrency', () => {
    test('should format number as Indian currency without decimals when specified', () => {
      expect(utils.numberToIndianCurrency(1234567.89, false)).toBe('₹12,34,567');
      expect(utils.numberToIndianCurrency(1000.5, false)).toBe('₹1,000');
    });

    test('should format number as Indian currency with decimals by default', () => {
      expect(utils.numberToIndianCurrency(1234567.89)).toBe('₹12,34,567.89');
    });

    test('should handle string inputs', () => {
      expect(utils.numberToIndianCurrency('1234567.89')).toBe('₹12,34,567.89');
      expect(utils.numberToIndianCurrency('1234567', false)).toBe('₹12,34,567');
    });

    test('should handle commas in string inputs', () => {
      expect(utils.numberToIndianCurrency('1,234,567.89')).toBe('₹12,34,567.89');
    });

    test('should return the original value on exceptions', () => {
      expect(utils.numberToIndianCurrency(null as any)).toBe('null');
    });
  });

  describe('changeNumberFormat', () => {
    test('should format small numbers with currency symbol', () => {
      expect(utils.changeNumberFormat(50000)).toBe('₹50,000');
    });

    test('should format lakhs correctly', () => {
      expect(utils.changeNumberFormat(100000)).toBe('₹1 Lakh');
      expect(utils.changeNumberFormat(500000)).toBe('₹5 Lakhs');
    });

    test('should format crores correctly', () => {
      expect(utils.changeNumberFormat(10000000)).toBe('₹1 Crore');
      expect(utils.changeNumberFormat(50000000)).toBe('₹5 Crores');
    });

    test('should handle large crores correctly', () => {
      expect(utils.changeNumberFormat(1000000000000)).toContain('Crore');
    });

    test('should handle zero and NaN gracefully', () => {
      expect(utils.changeNumberFormat(0)).toBe(0);
      expect(utils.changeNumberFormat(NaN)).toBe(0);
    });
  });

  describe('isValidWithdrawInput', () => {
    let mockWalletSummary;
    let mockUserData;

    beforeEach(() => {
      mockWalletSummary = {
        amountInWallet: 10000,
        todaysWithdrawals: []
      };
      mockUserData = {
        kycDone: true
      };
      jest.clearAllMocks();
    });

    test('should return false when amount is zero', () => {
      const [isValid, message] = utils.isValidWithdrawInput('0', mockWalletSummary, mockUserData, false);
      expect(isValid).toBe(false);
      expect(message).toBe('Amount cant be zero');
    });

    test('should reject if already 3 withdrawals today', () => {
      mockWalletSummary.todaysWithdrawals = [
        { amount: 100 },
        { amount: 200 },
        { amount: 300 }
      ];

      const [isValid, message] = utils.isValidWithdrawInput('1000', mockWalletSummary, mockUserData, false);
      expect(isValid).toBe(false);
      expect(message).toContain('Only 3 withdrawal requests');
    });

    test('should reject if amount exceeds 20L', () => {
      const [isValid, message] = utils.isValidWithdrawInput('2000001', mockWalletSummary, mockUserData, false);
      expect(isValid).toBe(false);
      expect(message).toContain('not withdraw more than ₹20,00,000');
    });

    test('should reject if cumulative withdrawals exceed 20L', () => {
      mockWalletSummary.todaysWithdrawals = [
        { amount: 1000000 },
        { amount: 900000 }
      ];

      const [isValid, message] = utils.isValidWithdrawInput('200000', mockWalletSummary, mockUserData, false);
      expect(isValid).toBe(false);
      expect(message).toContain('not withdraw more than ₹20,00,000');
    });

    test('should accept valid withdrawals for KYC-verified users', () => {
      mockWalletSummary.amountInWallet = 5000;
      const [isValid, message] = utils.isValidWithdrawInput('3000', mockWalletSummary, mockUserData, false);
      expect(isValid).toBe(true);
      expect(message).toBe('');
    });

    test('should accept valid withdrawals for institutional users', () => {
      mockWalletSummary.amountInWallet = 5000;
      mockUserData.kycDone = false;
      const [isValid, message] = utils.isValidWithdrawInput('3000', mockWalletSummary, mockUserData, true);
      expect(isValid).toBe(true);
      expect(message).toBe('');
    });

    test('should reject if amount exceeds wallet balance', () => {
      mockWalletSummary.amountInWallet = 5000;
      const [isValid, message] = utils.isValidWithdrawInput('6000', mockWalletSummary, mockUserData, false);
      expect(isValid).toBe(false);
      expect(message).toContain('not withdraw more than the amount available');
    });
  });

  describe('isValidAddMoneyAmount', () => {
    test('should reject negative amount', () => {
      const [isValid, message] = utils.isValidAddMoneyAmount('-100');
      expect(isValid).toBe(false);
      expect(message).toBe('Amount cannot be  0');
    });

    test('should reject amount exceeding 30L', () => {
      const [isValid, message] = utils.isValidAddMoneyAmount('3000001');
      expect(isValid).toBe(false);
      expect(message).toBe('Maximum 30L can be added in a single transaction');
    });

    test('should accept valid amount', () => {
      const [isValid, message] = utils.isValidAddMoneyAmount('1000000');
      expect(isValid).toBe(true);
      expect(message).toBe('');
    });
  });

  describe('bytesToSize', () => {
    test('should convert bytes to readable format', () => {
      expect(utils.bytesToSize(0)).toBe('N/A');
      expect(utils.bytesToSize(500)).toBe('500 B');
      expect(utils.bytesToSize(1024)).toBe('1.0 KB');
      expect(utils.bytesToSize(1048576)).toBe('1.0 MB');
      expect(utils.bytesToSize(1073741824)).toBe('1.0 GB');
      expect(utils.bytesToSize(1099511627776)).toBe('1.0 TB');
    });
  });

  describe('getSizeToBytes', () => {
    test('should convert different sizes to bytes', () => {
      expect(utils.getSizeToBytes(1, 'B')).toBe(1);
      expect(utils.getSizeToBytes(1, 'KB')).toBe(1024);
      expect(utils.getSizeToBytes(1, 'MB')).toBe(1048576);
      expect(utils.getSizeToBytes(1, 'GB')).toBe(1073741824);
      expect(utils.getSizeToBytes(1, 'TB')).toBe(1099511627776);
    });
  });

  describe('addNumberPadding', () => {
    test('should not pad multi-digit numbers', () => {
      expect(utils.addNumberPadding(12, 2)).toBe('12');
      expect(utils.addNumberPadding(123, 2)).toBe('123');
    });
  });

  describe('isEven', () => {
    test('should correctly identify even numbers', () => {
      expect(utils.isEven(2)).toBe(true);
      expect(utils.isEven(10)).toBe(true);
      expect(utils.isEven(0)).toBe(true);
    });
  });
});