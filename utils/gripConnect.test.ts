import { isGCOrder, getGCSource, isGCOrderViaToken } from './gripConnect';
import store from '../redux';
import { getDataFromJWTToken } from './login';
import { getUTMParamsIfExist } from './utm';

// Mock dependencies
jest.mock('../redux', () => ({
  getState: jest.fn(),
}));
jest.mock('./login', () => ({
  getDataFromJWTToken: jest.fn(),
}));
jest.mock('./utm', () => ({
  getUTMParamsIfExist: jest.fn(),
}));

describe('gripConnect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isGCOrderViaToken', () => {
    it('should return true when tokenData has gcName', () => {
      (store.getState as jest.Mock).mockReturnValue({
        gcConfig: { gcData: { accessToken: 'valid-token' } },
      });
      (getDataFromJWTToken as jest.Mock).mockReturnValue({
        gcData: { gcName: 'testName' },
      });

      expect(isGCOrderViaToken()).toBe(true);
      expect(store.getState).toHaveBeenCalled();
      expect(getDataFromJWTToken).toHaveBeenCalledWith('valid-token');
    });

    it('should return false when accessToken is missing', () => {
      (store.getState as jest.Mock).mockReturnValue({
        gcConfig: { gcData: { accessToken: '' } },
      });
      (getDataFromJWTToken as jest.Mock).mockReturnValue(null);

      expect(isGCOrderViaToken()).toBe(false);
      expect(store.getState).toHaveBeenCalled();
      expect(getDataFromJWTToken).toHaveBeenCalledWith('');
    });

    it('should return false when gcData is missing', () => {
      (store.getState as jest.Mock).mockReturnValue({
        gcConfig: { gcData: { accessToken: 'valid-token' } },
      });
      (getDataFromJWTToken as jest.Mock).mockReturnValue({});

      expect(isGCOrderViaToken()).toBe(false);
      expect(store.getState).toHaveBeenCalled();
      expect(getDataFromJWTToken).toHaveBeenCalledWith('valid-token');
    });

    it('should return false when gcName is empty', () => {
      (store.getState as jest.Mock).mockReturnValue({
        gcConfig: { gcData: { accessToken: 'valid-token' } },
      });
      (getDataFromJWTToken as jest.Mock).mockReturnValue({
        gcData: { gcName: '' },
      });

      expect(isGCOrderViaToken()).toBe(false);
      expect(store.getState).toHaveBeenCalled();
      expect(getDataFromJWTToken).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('isGCOrder', () => {
    it('should return true when isGCOrderViaToken is true', () => {
      (store.getState as jest.Mock).mockReturnValue({
        gcConfig: { gcData: { accessToken: 'valid-token' } },
      });
      (getDataFromJWTToken as jest.Mock).mockReturnValue({
        gcData: { gcName: 'testName' },
      });

      expect(isGCOrder()).toBe(true);
      expect(store.getState).toHaveBeenCalled();
      expect(getDataFromJWTToken).toHaveBeenCalled();
      expect(getUTMParamsIfExist).not.toHaveBeenCalled();
    });

    it('should return false when utmParams medium is not connect', () => {
      (store.getState as jest.Mock).mockReturnValue({
        gcConfig: { gcData: { accessToken: '' } },
      });
      (getDataFromJWTToken as jest.Mock).mockReturnValue(null);
      (getUTMParamsIfExist as jest.Mock).mockReturnValue({
        medium: 'other',
        source: 'testSource',
      });

      expect(isGCOrder()).toBe(false);
      expect(getUTMParamsIfExist).toHaveBeenCalled();
    });

    it('should return false when utmParams is empty', () => {
      (store.getState as jest.Mock).mockReturnValue({
        gcConfig: { gcData: { accessToken: '' } },
      });
      (getDataFromJWTToken as jest.Mock).mockReturnValue(null);
      (getUTMParamsIfExist as jest.Mock).mockReturnValue({});

      expect(isGCOrder()).toBe(false);
      expect(getUTMParamsIfExist).toHaveBeenCalled();
    });
  });

  describe('getGCSource', () => {
    it('should return source when isGCOrder is true via utmParams', () => {
      (store.getState as jest.Mock).mockReturnValue({
        gcConfig: { gcData: { accessToken: '' } },
      });
      (getDataFromJWTToken as jest.Mock).mockReturnValue(null);
      (getUTMParamsIfExist as jest.Mock).mockReturnValue({
        medium: 'connect',
        source: 'testSource',
      });

      expect(getGCSource()).toBe('testSource');
      expect(getUTMParamsIfExist).toHaveBeenCalledTimes(2); // Called in isGCOrder and getGCSource
    });

    it('should return empty string when isGCOrder is false', () => {
      (store.getState as jest.Mock).mockReturnValue({
        gcConfig: { gcData: { accessToken: '' } },
      });
      (getDataFromJWTToken as jest.Mock).mockReturnValue(null);
      (getUTMParamsIfExist as jest.Mock).mockReturnValue({
        medium: 'other',
        source: 'testSource',
      });

      expect(getGCSource()).toBe('');
      expect(getUTMParamsIfExist).toHaveBeenCalled();
    });

    it('should return source when isGCOrder is true via token and utmParams are valid', () => {
      (store.getState as jest.Mock).mockReturnValue({
        gcConfig: { gcData: { accessToken: 'valid-token' } },
      });
      (getDataFromJWTToken as jest.Mock).mockReturnValue({
        gcData: { gcName: 'testName' },
      });
      (getUTMParamsIfExist as jest.Mock).mockReturnValue({
        medium: 'connect',
        source: 'testSource',
      });

      expect(getGCSource()).toBe('testSource');
      expect(getUTMParamsIfExist).toHaveBeenCalled();
    });
  });
});
