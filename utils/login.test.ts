// login.test.ts
import Cookie from 'js-cookie';
import {
  successOTPRudderStackEvent,
  verifyUserAndRedirect,
  checkInAllowedDynamicSubRoutes,
  getDataFromJWTToken,
} from './login';
import * as gtm from './gtm';
import * as clarity from './clarity';
import MoengageWebServices from './ThirdParty/moengage/moengage';

jest.mock('js-cookie');
jest.mock('./gtm');
jest.mock('./clarity');
jest.mock('./ThirdParty/moengage/moengage');

describe('login.ts utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('successOTPRudderStackEvent', () => {
    it('should track login event correctly', () => {
      (Cookie.get as jest.Mock).mockReturnValue('test@email.com');

      successOTPRudderStackEvent(
        {
          emailID: 'test@email.com',
          mobileNo: '1234567890',
          mobileCode: 91,
        },
        'Proceed'
      );

      expect(gtm.trackEvent).toHaveBeenCalledWith(
        'login_signup_otp_verify',
        expect.objectContaining({
          type: 'login',
          login_mode: 'email',
          email: 'test@email.com',
          mobile: '1234567890',
          mobile_code: 91,
          cta_text: 'Proceed',
        })
      );
    });

    it('should track signup event with mobile', () => {
      (Cookie.get as jest.Mock).mockReturnValue('9876543210');

      successOTPRudderStackEvent({
        mobileNo: '9876543210',
        mobileCode: 91,
      });

      expect(gtm.trackEvent).toHaveBeenCalledWith(
        'login_signup_otp_verify',
        expect.objectContaining({
          type: 'signup',
          login_mode: 'mobile',
          mobile: '9876543210',
        })
      );
    });
  });

  describe('verifyUserAndRedirect', () => {
    it('should redirect to /discover if login is successful and not 2FA', () => {
      const mockUser = {
        userData: {
          emailID: 'test@email.com',
          mobileNo: '1234567890',
          mobileCode: 91,
          userID: 1,
          firstName: 'Diya',
          lastName: 'Maheshwari',
          is2faRequired: false,
        },
      };

      (Cookie.get as jest.Mock).mockImplementation((key) => {
        if (key === 'redirectTo') return '/';
        if (key === 'loginID') return 'test@email.com';
        return null;
      });

      const result = verifyUserAndRedirect(mockUser, 'email', 'Submit');

      expect(result).toBe('/discover');
      expect(gtm.trackUser).toHaveBeenCalledWith(1);
      expect(gtm.trackEvent).toHaveBeenCalledWith(
        'User Logged In',
        expect.objectContaining({
          email: 'test@email.com',
          mobile: '1234567890',
        })
      );
      expect(clarity.identifyClarityUser).toHaveBeenCalledWith(
        'test@email.com'
      );
      expect(MoengageWebServices.transformUserIdentityEvent).toHaveBeenCalled();
      expect(Cookie.remove).toHaveBeenCalledWith('redirectTo');
    });

    it('should fallback to /signup if data is missing', () => {
      const result = verifyUserAndRedirect({ userData: {} });
      expect(result).toBe('/signup');
    });
  });

  describe('checkInAllowedDynamicSubRoutes', () => {
    it('should return true for /assetdetails path', () => {
      expect(checkInAllowedDynamicSubRoutes('/product/assetdetails/123')).toBe(
        true
      );
    });

    it('should return false for other paths', () => {
      expect(checkInAllowedDynamicSubRoutes('/dashboard')).toBe(false);
    });
  });

  describe('getDataFromJWTToken', () => {
    it('should decode valid JWT token', () => {
      const token = Buffer.from(JSON.stringify({ user: 'Diya' })).toString(
        'base64'
      );
      const fakeJWT = `aaa.${token}.zzz`;

      expect(getDataFromJWTToken(fakeJWT)).toEqual({ user: 'Diya' });
    });

    it('should return empty object if token is missing', () => {
      expect(getDataFromJWTToken(undefined as any)).toEqual({});
    });
  });
});
