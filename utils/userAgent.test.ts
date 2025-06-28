import {
    trackAgentParams,
    getOS,
  } from '../utils/userAgent';
  
  describe('Agent Detection Utilities', () => {
    const originalNavigator = global.navigator;
    const originalWindow = global.window;
  
    beforeEach(() => {
      // Reset mocks before each test
  
      // Mock userAgent with empty value (configurable for reassignment)
      Object.defineProperty(window.navigator, 'userAgent', {
        value: '',
        configurable: true,
      });
  
      // Mock navigator.connection
      (window.navigator as Navigator & { connection?: { effectiveType?: string } }).connection = {
        effectiveType: '4g',
      };
  
      // Mock window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });
  
    afterEach(() => {
      global.navigator = originalNavigator;
      global.window = originalWindow;
      jest.clearAllMocks();
    });
  
    describe('getBrowserName', () => {
      it('should return GSA', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'GSA' });
        expect(trackAgentParams().browser).toBe('GSA');
      });
  
      it('should return Opera', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Opera' });
        expect(trackAgentParams().browser).toBe('Opera');
  
        Object.defineProperty(navigator, 'userAgent', { value: 'Opr' });
        expect(trackAgentParams().browser).toBe('Opera');
      });
  
      it('should return Edge', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Edg' });
        expect(trackAgentParams().browser).toBe('Edge');
      });
  
      it('should return Chrome', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Chrome' });
        expect(trackAgentParams().browser).toBe('Chrome');
      });
  
      it('should return Safari', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Safari' });
        expect(trackAgentParams().browser).toBe('Safari');
      });
  
      it('should return Firefox', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Firefox' });
        expect(trackAgentParams().browser).toBe('Firefox');
      });
  
      it('should return Unknown', () => {
        Object.defineProperty(navigator, 'userAgent', { value: '' });
        expect(trackAgentParams().browser).toBe('Unknown');
      });
    });
  
    describe('getDeviceType', () => {
      it('should return Phone for Android', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Android' });
        expect(trackAgentParams().deviceType).toBe('Phone');
      });
  
      it('should return Phone for iPhone', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'iPhone' });
        expect(trackAgentParams().deviceType).toBe('Phone');
      });
  
      it('should return Laptop for Windows', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Windows NT' });
        expect(trackAgentParams().deviceType).toBe('Laptop');
      });
  
      it('should return Laptop for Mac', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Macintosh' });
        expect(trackAgentParams().deviceType).toBe('Laptop');
      });
  
      it('should return Unknown', () => {
        Object.defineProperty(navigator, 'userAgent', { value: '' });
        expect(trackAgentParams().deviceType).toBe('Unknown');
      });
    });
  
    describe('getOS', () => {
      it('should return Android', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Android' });
        expect(getOS()).toBe('Android');
      });
  
      it('should return iOS', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'iPhone' });
        expect(getOS()).toBe('iOS');
      });
  
      it('should return Windows', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Windows' });
        expect(getOS()).toBe('Windows');
      });
  
      it('should return Mac', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Macintosh' });
        expect(getOS()).toBe('Mac');
      });
  
      it('should return Linux', () => {
        Object.defineProperty(navigator, 'userAgent', { value: 'Linux' });
        expect(getOS()).toBe('Linux');
      });
  
      it('should return Unknown', () => {
        Object.defineProperty(navigator, 'userAgent', { value: '' });
        expect(getOS()).toBe('Unknown');
      });
    });
  
    describe('getDeviceOrientation', () => {
      it('should return Portrait', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
          matches: query === '(orientation: portrait)',
          media: query,
        })) as any;
  
        expect(trackAgentParams().device_orientation).toBe('Portrait');
      });
  
      it('should return Landscape', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
          matches: query === '(orientation: landscape)',
          media: query,
        })) as any;
  
        expect(trackAgentParams().device_orientation).toBe('Landscape');
      });
  
      it('should return Unknown', () => {
        window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as any;
  
        expect(trackAgentParams().device_orientation).toBe('Unknown');
      });
    });
  
    describe('getNetwotkType', () => {
      it('should return 3g', () => {
        (navigator as Navigator & { connection?: { effectiveType?: string } }).connection = {
          effectiveType: '3g',
        };
        expect(trackAgentParams()['network Type']).toBe('3g');
      });
  
      it('should return Unknown if undefined', () => {
        (navigator as Navigator & { connection?: { effectiveType?: string } }).connection = undefined;
        expect(trackAgentParams()['network Type']).toBe('Unknown');
      });
    });
  
    describe('trackAgentParams integration', () => {
      it('should return all expected keys', () => {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Chrome Android',
        });
  
        window.matchMedia = jest.fn().mockImplementation(query => ({
          matches: query === '(orientation: portrait)',
        })) as any;
  
        const params = trackAgentParams();
        expect(params).toHaveProperty('browser');
        expect(params).toHaveProperty('os');
        expect(params).toHaveProperty('deviceType');
        expect(params).toHaveProperty('device_orientation');
        expect(params).toHaveProperty('network Type');
      });
    });
  });
  