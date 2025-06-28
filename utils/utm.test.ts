import Cookie from 'js-cookie';
import {
  isUtmParamExist,
  popuplateUTMParams,
  getUTMParamsIfExist,
  getUTMParams,
} from './utm';

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

const mockCookie = Cookie as jest.Mocked<typeof Cookie>;

describe('UTM Tracking Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isUtmParamExist', () => {
    test('should return false when queryParams is empty', () => {
      expect(isUtmParamExist({})).toBe(false);
    });
  });

  describe('popuplateUTMParams', () => {
    test('should handle partial UTM parameters', () => {
      const queryParams = {
        utm_source: 'facebook',
        utm_campaign: 'holiday_promo',
        gclid: 'CjwKCAjw456',
      };

      const result = popuplateUTMParams(queryParams);

      expect(result.source).toBe('facebook');
      expect(result.campaign).toBe('holiday_promo');
      expect(result.gclid).toBe('CjwKCAjw456');
      expect(result.medium).toBe('Not received');
      expect(result.term).toBe('Not received');
    });

    test('should handle null or undefined queryParams', () => {
      const resultNull = popuplateUTMParams(null);
      const resultUndefined = popuplateUTMParams(undefined);

      const expectedResult = {
        source: 'Not received',
        medium: 'Not received',
        campaign: 'Not received',
        term: 'Not received',
        referrer: 'Not received',
        name: 'Not received',
        content: 'Not received',
        creative: 'Not received',
        adset: 'Not received',
        adgroup: 'Not received',
        placement: 'Not received',
        device: 'Not received',
        fbclid: 'Not received',
        gclid: 'Not received',
      };

      expect(resultNull).toEqual(expectedResult);
      expect(resultUndefined).toEqual(expectedResult);
    });
  });

  describe('getUTMParamsIfExist', () => {
    test('should return empty object when cookie is null', () => {
      mockCookie.get.mockReturnValue(null);

      const result = getUTMParamsIfExist();

      expect(result).toEqual({});
    });
  });

  describe('getUTMParams', () => {
    test('should handle malformed JSON in cookie', () => {
      expect(() => getUTMParams()).toThrow();
    });
  });
});
