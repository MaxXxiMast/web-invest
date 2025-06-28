import dayjs from 'dayjs';

const mockUnix = jest.fn();

const mockedDayjs = Object.assign(
  jest.fn(() => ({
    unix: mockUnix,
  })),
  {
    extend: jest.fn(),
    tz: {
      setDefault: jest.fn(),
    },
  }
);

jest.mock('dayjs', () => mockedDayjs);

import { pullMarketStatus, getMarketStatus } from './marketTime';

describe('Market Status Functions', () => {
  beforeEach(() => {
    mockedDayjs.mockClear();
    mockUnix.mockClear();
  });

  describe('pullMarketStatus', () => {
    test('should return "opens in" when market is opening soon', () => {
      mockUnix.mockReturnValue(950);
      
      const result = pullMarketStatus({
        startTime: 1000,
        closeTime: 2000,
        marketOpenDelayTimer: 100
      });
      expect(result).toBe('opens in');
    });

    test('should return "closes in" when market is closing soon', () => {
      mockUnix.mockReturnValue(1950);
      
      const result = pullMarketStatus({
        startTime: 1000,
        closeTime: 2000,
        marketOpenDelayTimer: 100
      });
      expect(result).toBe('closes in');
    });

    test('should return "open" when market is open', () => {
      mockUnix.mockReturnValue(1500);
      
      const result = pullMarketStatus({
        startTime: 1000,
        closeTime: 2000,
        marketOpenDelayTimer: 100
      });
      expect(result).toBe('open');
    });

    test('should return "closed" when market is closed', () => {
      mockUnix.mockReturnValue(2500);
      
      const result = pullMarketStatus({
        startTime: 1000,
        closeTime: 2000,
        marketOpenDelayTimer: 100
      });
      expect(result).toBe('closed');
    });
  });

  describe('getMarketStatus', () => {
    test('should return "closed" when isMarketOpenToday is false', () => {
      const result = getMarketStatus(1000000, 2000000, false);
      expect(result).toBe('closed');
      expect(mockedDayjs).not.toHaveBeenCalled();
    });

    test('should return appropriate status when isMarketOpenToday is true', () => {
      mockUnix.mockReturnValue(1500);
      
      const result = getMarketStatus(1000000, 2000000, true);
      expect(result).toBe('closes in');
    });
  });
});