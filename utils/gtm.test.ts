import * as gtmUtils from './gtm';
import * as constants from './constants';
import TagManager from 'react-gtm-module';
import Cookies from 'js-cookie';

declare global {
  interface Window {
    newrelic: {
      noticeError: jest.Mock;
      log: jest.Mock;
    };
  }
}

jest.mock('react-gtm-module', () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}));

jest.mock('./constants', () => ({
  getEnv: jest.fn(),
  getLibraryKeys: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

jest.mock('./ipHandling', () => {
  let ipData = '';

  return {
    getIpData: jest.fn(() => ipData),
    setIpData: jest.fn(() => {
      ipData = JSON.stringify({ city: 'Test City', country: 'Test Country' });
    }),
  };
});

beforeEach(() => {
  (window as any).rudderanalytics = { track: jest.fn() };
  (window as any).dataLayer = [];
  (window as any).newrelic = { noticeError: jest.fn(), log: jest.fn() };

  jest.clearAllMocks();

  (Cookies.get as jest.Mock).mockImplementation((key: string) => {
    if (key === 'webViewRendered') return 'true';
    if (key === 'experimentVariant') return 'A';
    return undefined;
  });
});

describe('GTM Utilities', () => {
  describe('initializeGTM', () => {
    it('should initialize TagManager in production', () => {
      (constants.getEnv as jest.Mock).mockReturnValue('production');
      (constants.getLibraryKeys as jest.Mock).mockReturnValue({
        gtm: 'GTM-XXXX',
      });

      gtmUtils.initializeGTM();

      expect(TagManager.initialize).toHaveBeenCalledWith({ gtmId: 'GTM-XXXX' });
    });

    it('should not initialize TagManager in non-production', () => {
      (constants.getEnv as jest.Mock).mockReturnValue('development');

      gtmUtils.initializeGTM();

      expect(TagManager.initialize).not.toHaveBeenCalled();
    });
  });

  describe('pushToDataLayer', () => {
    it('should push data to GTM dataLayer', () => {
      const mockData = { event: 'testEvent' };
      gtmUtils.pushToDataLayer(mockData);
      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: mockData,
      });
    });
  });

  describe('fireReferralEvent', () => {
    it('should fire a referral event', () => {
      gtmUtils.fireReferralEvent('referralSignup');
      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: { event: 'referralSignup' },
      });
    });
  });

  describe('fireCreateNewUser', () => {
    it('should fire a successful signup event', () => {
      gtmUtils.fireCreateNewUser();
      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: { event: 'successfulSignup' },
      });
    });
  });

  describe('fireCheckout', () => {
    it('should fire a checkout event', () => {
      gtmUtils.fireCheckout();
      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: { event: 'paymentCheckout' },
      });
    });
  });

  describe('trackUser', () => {
    it('should push userID if not already present', () => {
      (window as any).dataLayer = [];
      gtmUtils.trackUser(12345);
      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: { userID: 12345 },
      });
    });

    it('should not push userID if already present', () => {
      (window as any).dataLayer = [{ userID: 12345 }];
      gtmUtils.trackUser(12345);
      expect(TagManager.dataLayer).not.toHaveBeenCalled();
    });
  });

  describe('newRelic logging', () => {
    it('should log error using newRelicErrorLog', () => {
      gtmUtils.newRelicErrorLog('Test Error', { info: 'details' });

      expect(window.newrelic.noticeError).toHaveBeenCalledWith('Test Error', {
        info: 'details',
      });
    });

    it('should log using newRelicErrLogs', () => {
      gtmUtils.newRelicErrLogs('Test Log', 'info', { user: 'test' });

      expect(window.newrelic.log).toHaveBeenCalledWith('Test Log', {
        level: 'info',
        customAttributes: { user: 'test' },
      });
    });
    it('should initialize GTM in production', () => {
      (require('./constants').getEnv as jest.Mock).mockReturnValue(
        'production'
      );
      (require('./constants').getLibraryKeys as jest.Mock).mockReturnValue({
        gtm: 'GTM-XXXX',
      });

      gtmUtils.initializeGTM();
      expect(TagManager.initialize).toHaveBeenCalledWith({ gtmId: 'GTM-XXXX' });
    });

    it('should not initialize GTM in non-production', () => {
      (require('./constants').getEnv as jest.Mock).mockReturnValue(
        'development'
      );
      gtmUtils.initializeGTM();
      expect(TagManager.initialize).not.toHaveBeenCalled();
    });

    it('should push to data layer', () => {
      const data = { event: 'test_event' };
      gtmUtils.pushToDataLayer(data);
      expect(TagManager.dataLayer).toHaveBeenCalledWith({ dataLayer: data });
    });

    it('should fire referral event', () => {
      gtmUtils.fireReferralEvent('ref_event');
      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: { event: 'ref_event' },
      });
    });

    it('should fire create new user event', () => {
      gtmUtils.fireCreateNewUser();
      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: { event: 'successfulSignup' },
      });
    });

    it('should fire checkout event', () => {
      gtmUtils.fireCheckout();
      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: { event: 'paymentCheckout' },
      });
    });
    it('should not call rudderanalytics if userData cookie is missing', () => {
      (Cookies.get as jest.Mock).mockReturnValue(undefined);
      window.rudderanalytics = { identify: jest.fn() };
    
      gtmUtils.trackUser(12345);
    
      expect(window.rudderanalytics.identify).not.toHaveBeenCalled();
    });
    it('should not initialize GTM if environment is not production', () => {
      (require('./constants').getEnv as jest.Mock).mockReturnValue('development');
    
      gtmUtils.initializeGTM();
      expect(TagManager.initialize).not.toHaveBeenCalled();
    });
    it('should not call rudderanalytics if userData cookie is invalid', () => {
      (Cookies.get as jest.Mock).mockReturnValue('invalid-json');
      window.rudderanalytics = { identify: jest.fn() };
    
      gtmUtils.trackUser(12345);
    
      expect(window.rudderanalytics.identify).not.toHaveBeenCalled();
    });
  });
});
