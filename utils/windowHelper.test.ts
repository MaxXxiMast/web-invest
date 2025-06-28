import { redirectHandler } from './windowHelper';

describe('redirectHandler', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).location;

    let hrefValue = '';
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: {
        get href() {
          return hrefValue;
        },
        set href(val: string) {
          hrefValue = val;
        },
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: originalLocation,
    });
  });

  it('should log info and redirect to given URL', () => {
    const pageUrl = 'https://gripinvest.in';
    const pageName = 'Grip Website';

    redirectHandler({ pageUrl, pageName })
    expect(window.location.href).toBe(pageUrl);
  });

  it('should use empty string if pageName is not provided', () => {
    const pageUrl = '';

    redirectHandler({ pageUrl });

    expect(window.location.href).toBe(pageUrl);
  });

  it('should log error and throw if redirection fails', () => {
    const pageUrl = 'https://gripinvest.in/discovers';
    const pageName = 'Page Not Found';

    Object.defineProperty(window.location, 'href', {
      configurable: true,
      set() {
        throw new Error('Mock failure');
      },
    });

    expect(() => redirectHandler({ pageUrl, pageName })).toThrow(
      'Redirection failed: Mock failure'
    );
  });

  it('should handle non-Error thrown values gracefully', () => {
    const pageUrl = 'https://gripinvest.in/login';
    const pageName = 'Unhandled Runtime Error';

    Object.defineProperty(window.location, 'href', {
      configurable: true,
      set() {
        throw 'some string error';
      },
    });

    expect(() => redirectHandler({ pageUrl, pageName })).toThrow(
      'Redirection failed: Unknown error'
    );
  });
});
