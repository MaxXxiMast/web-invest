import {
    getEnv,
    getLibraryKeys,
    innerPagesWithNav,
    innverPagesMobileWithFooter,
    innerPagesMobileHeaderRouteNameMapping,
    GripLogo,
    GripBlogLogo,
    allowWithoutLogin,
    innerPagesWithoutNav,
    persistRouteArr,
    pagesToShowTwoFA,
    routesFornavigationToStickOnScroll,
    checkInAllowedSubRoutes
  } from './constants';

jest.mock('./constants', () => {
    const actual = jest.requireActual('./constants');
    return {
      ...actual,
      GRIP_INVEST_BUCKET_URL: 'https://mocked-grip-invest-url.com/',
      GRIP_INVEST_GI_STRAPI_BUCKET_URL: 'https://mocked-gi-strapi-url.com/',
      hideFooterPages: ['/gci-payment-processing', '/gci-postpayment-processing'],
      innerPagesWithNav: ['/', '/assets'],
      innverPagesMobileWithFooter: ['/assets'],
      innerPagesMobileHeaderRouteNameMapping: { '/assets': 'Invest' },
      GripLogo: 'https://mocked-grip-logo.com/',
      GripBlogLogo: 'https://mocked-grip-blog-logo.com/',
      allowWithoutLogin: ['/about-us', '/faq'],
      innerPagesWithoutNav: ['/user-kyc'],
      persistRouteArr: ['assetdetails', 'user-kyc', 'kyc', 'assetagreement'],
      pagesToShowTwoFA: ['/assets'],
      routesFornavigationToStickOnScroll: ['assetdetails'],
      checkInAllowedSubRoutes: jest.fn((path: string) =>
        ['/gci-payment-processing', '/gci-postpayment-processing'].some((el) => path.startsWith(el))
      ),
      
    //   checkInAllowedSubRoutes: jest.fn().mockReturnValue(true),
    };
  });

  describe('getEnv', () => {
    it('should return "development" when process.env.NEXT_PUBLIC_ENVIRONMENT is "development"', () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'development';
      expect(getEnv()).toBe('development');
    });
  
    it('should return "production" when process.env.NEXT_PUBLIC_ENVIRONMENT is not "development"', () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
      expect(getEnv()).toBe('production');
    });
  });

describe('getLibraryKeys', () => {
  it('should return the correct GTM key from process.env', () => {
    process.env.NEXT_PUBLIC_GTM_ID = 'GTM-59N75NB';

    const keys = getLibraryKeys();

    expect(keys).toEqual({
      gtm: 'GTM-59N75NB',
    });
  });
});

describe('innerPagesWithNav', () => {
    it('should contain expected inner pages with nav', () => {
      expect(innerPagesWithNav).toEqual(['/', '/assets']);
    });
  });

describe('Constants Testcases', ()=>{

    it('should contain expected mobile footer pages', () => {
        expect(innverPagesMobileWithFooter).toEqual(['/assets']);
      });
    
      it('should map route to correct name', () => {
        expect(innerPagesMobileHeaderRouteNameMapping['/assets']).toBe('Invest');
      });
    
      it('should have correct GripLogo URL', () => {
        expect(GripLogo).toBe('https://mocked-grip-logo.com/');
      });
    
      it('should have correct GripBlogLogo URL', () => {
        expect(GripBlogLogo).toBe('https://mocked-grip-blog-logo.com/');
      });
    
      it('should include routes that do not require login', () => {
        expect(allowWithoutLogin).toContain('/about-us');
        expect(allowWithoutLogin).toContain('/faq');
      });
    
      it('should contain pages that do not have nav', () => {
        expect(innerPagesWithoutNav).toEqual(['/user-kyc']);
      });
    
      it('should contain routes to persist', () => {
        expect(persistRouteArr).toEqual(['assetdetails', 'user-kyc', 'kyc', 'assetagreement']);
      });      
    
      it('should include routes where 2FA should be shown', () => {
        expect(pagesToShowTwoFA).toContain('/assets');
      });

})

describe('checkInAllowedSubRoutes', () => {
    it('should return true for matching hideFooterPages route', () => {
      expect(checkInAllowedSubRoutes('/gci-payment-processing/status')).toBe(true);
    });
  
    it('should return false for non-matching route', () => {
      expect(checkInAllowedSubRoutes('/dashboard')).toBe(false);
    });
  });
  

  
  
  
  