import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './index';
import { sendOtpApi } from '../../../api/login';
import { callErrorToast } from '../../../api/strapi';
import { trackEvent } from '../../../utils/gtm';
import Cookie from 'js-cookie';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { isMobileOrEmail } from '../../../utils/string';

jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={props.src || "/test-image.png"} alt={props.alt || ""} />;
    },
}));

jest.mock('query-string', () => ({
    parse: jest.fn().mockReturnValue({}),
}));

jest.mock('js-cookie', () => ({
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
}));

jest.mock('../../../api/login', () => ({
    sendOtpApi: jest.fn(),
}));

jest.mock('../../../api/strapi', () => ({
    callErrorToast: jest.fn(),
}));

jest.mock('../../../utils/gtm', () => ({
    trackEvent: jest.fn(),
}));

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
    useMediaQuery: jest.fn(),
}));

jest.mock('../../../utils/string', () => ({
    isMobileOrEmail: jest.fn(),
}));

jest.mock('../../../utils/googleOauth', () => ({
    GoogleOAuthProvider: ({ children }) => <div data-testid="google-oauth">{children}</div>,
}));

jest.mock('../../layout/seo', () => ({
    __esModule: true,
    default: (props) => <div data-testid="seo">SEO Component</div>,
}));

jest.mock('../../common/PreLoginMobileHeader', () => ({
    __esModule: true,
    default: (props) => <div data-testid="mobile-header">Mobile Header</div>,
}));

jest.mock('../../common/LoginBackBtn', () => ({
    __esModule: true,
    default: ({ btnTxt, handleClick }) => (
        <button data-testid="back-button" onClick={handleClick}>
            {btnTxt}
        </button>
  ),
}));

jest.mock('../../primitives/Button', () => ({
    __esModule: true,
    default: ({ children, disabled, onClick, isLoading }) => (
        <button 
          data-testid="continue-button" 
          disabled={disabled} 
          onClick={onClick}
          data-loading={isLoading ? 'true' : 'false'}
        >
            {children}
        </button>
    ),
}));

jest.mock('../../common/inputFieldSet', () => ({
    __esModule: true,
    default: ({ placeHolder, label, onChange, value, onKeyPress, onKeyDown, inputId }) => (
        <div>
            <label htmlFor={inputId}>{label}</label>
            <input 
              id={inputId}
              data-testid="login-input"
              placeholder={placeHolder}
              onChange={onChange}
              value={value}
              onKeyPress={onKeyPress}
              onKeyDown={onKeyDown}
            />
        </div>
    ),
}));

jest.mock('./GoogleAuth', () => ({
    __esModule: true,
    default: () => <div data-testid="google-auth">Google Auth Component</div>,
}));

// Global mock for encryptValue
jest.mock('./utils', () => ({
  encryptValue: jest.fn().mockResolvedValue('encrypted')
}));

describe('LoginPage Component', () => {
    const mockProps = {
        googleClientId: { value: 'test-client-id' },
        pageData: [
            {
                __component: 'shared.seo',
                metaTitle: 'Login Page',
            },
        ],
        socialLoginFeatureFlag: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useMediaQuery as jest.Mock).mockReturnValue(false);

        Object.defineProperty(window, 'location', {
            value: { search: '' },
            writable: true,
        });

        document.getElementById = jest.fn().mockReturnValue({
            focus: jest.fn()
        });

        require('query-string').parse.mockReturnValue({});
    });

    test('renders login page with correct initial text', () => {
        render(<LoginPage {...mockProps} />);

        expect(screen.getByText('Login to Grip')).toBeInTheDocument();
        expect(screen.getByText(/Don't have an account\?/)).toBeInTheDocument();
        expect(screen.getByText('Sign up Now')).toBeInTheDocument();
    });

    test('switches to signup mode when signup query param is present', () => {
        require('query-string').parse.mockReturnValueOnce({ signup: 'true' });

        render(<LoginPage {...mockProps} />);

        expect(screen.getByText('Create a Grip Account')).toBeInTheDocument();
        expect(screen.getByText(/Already have an account\?/)).toBeInTheDocument();
        expect(screen.getByText('Login Now')).toBeInTheDocument();
    });

    test('toggles between login and signup modes', () => {
        render(<LoginPage {...mockProps} />);

        expect(screen.getByText('Login to Grip')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Sign up Now'));
        expect(screen.getByText('Create a Grip Account')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Login Now'));
        expect(screen.getByText('Login to Grip')).toBeInTheDocument();
    });

    test('validates input field correctly', () => {
        (isMobileOrEmail as jest.Mock).mockImplementation((value) => {
          return value.includes('@') || /^\d{10}$/.test(value);
        });

        render(<LoginPage {...mockProps} />);

        const inputField = screen.getByTestId('login-input');
        const continueButton = screen.getByTestId('continue-button');

        expect(continueButton).toBeDisabled();

        fireEvent.change(inputField, { target: { value: 'invalid' } });
        expect(continueButton).toBeDisabled();

        fireEvent.change(inputField, { target: { value: 'test@example.com' } });
        expect(continueButton).not.toBeDisabled();
        expect(Cookie.set).toHaveBeenCalledWith('loginID', 'test@example.com');
    });

    test('shows error toast when login ID error cookie exists', () => {
        (Cookie.get as jest.Mock).mockReturnValueOnce('true');

        jest.useFakeTimers();
        render(<LoginPage {...mockProps} />);

        expect(Cookie.remove).toHaveBeenCalledWith('show_login_id_error');

        jest.advanceTimersByTime(500);
        expect(callErrorToast).toHaveBeenCalledWith("Couldn’t proceed. Please try again!");
        jest.useRealTimers();
    });

    test('handles API error during OTP submission', async () => {
        (isMobileOrEmail as jest.Mock).mockReturnValue(true);
        (sendOtpApi as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
        (trackEvent as jest.Mock).mockClear();
        // Mock encryptValue to always resolve to a non-empty string
        const { encryptValue } = require('./utils');
        (encryptValue as jest.Mock).mockResolvedValue('encrypted');

        render(<LoginPage {...mockProps} />);
      
        const inputElement = screen.getByTestId('login-input');
        const continueButton = screen.getByTestId('continue-button');
      
        fireEvent.change(inputElement, { target: { value: 'test@example.com' } });
      
        await waitFor(() => {
          expect(continueButton).not.toBeDisabled();
        });
      
        fireEvent.click(continueButton);
      
        await waitFor(() => {
          expect(trackEvent).toHaveBeenCalledWith(
            'login_signup_error',
            expect.objectContaining({
              err: expect.any(Error),
            })
          );
          expect(continueButton).not.toBeDisabled(); // loading ended
        });
      });
      

      test('handles Enter key press', async () => {
        (isMobileOrEmail as jest.Mock).mockReturnValue(true);
        (sendOtpApi as jest.Mock).mockResolvedValueOnce({});
      
        render(<LoginPage {...mockProps} />);
      
        const inputField = screen.getByTestId('login-input');
      
        fireEvent.change(inputField, { target: { value: 'test@example.com' } });
      
        fireEvent.keyPress(inputField, { key: 'Enter', code: 'Enter', charCode: 13 });
      
        await waitFor(() => {
          expect(sendOtpApi).toHaveBeenCalled();
        });
      });
      
      
      test('shows error toast for too short email even if format is valid', async () => {
        (isMobileOrEmail as jest.Mock).mockReturnValue(true);
        (callErrorToast as jest.Mock).mockClear();
        (sendOtpApi as jest.Mock).mockClear();
      
        render(<LoginPage {...mockProps} />);
      
        const inputElement = screen.getByRole('textbox');
        const continueButton = screen.getByTestId('continue-button');
      
        fireEvent.change(inputElement, { target: { value: 't@t' } }); // valid format but too short
        fireEvent.click(continueButton);
      
        await waitFor(() => {
          expect(callErrorToast).toHaveBeenCalledWith('Enter a valid email address');
          expect(sendOtpApi).not.toHaveBeenCalled();
        });
      });
      
         
    test('back button redirects to home in login mode', () => {
        const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

        render(<LoginPage {...mockProps} />);

        const backButton = screen.getByTestId('back-button');
        fireEvent.click(backButton);

        expect(windowOpenSpy).toHaveBeenCalledWith('/', '_self');
        windowOpenSpy.mockRestore();
    });

    test('back button changes to login mode when in signup mode', () => {
        require('query-string').parse.mockReturnValueOnce({ signup: 'true' });

        render(<LoginPage {...mockProps} />);

        expect(screen.getByText('Create a Grip Account')).toBeInTheDocument();

        const backButton = screen.getByTestId('back-button');
        fireEvent.click(backButton);

        expect(screen.getByText('Login to Grip')).toBeInTheDocument();
    });

    test('renders correctly for mobile view', () => {
        (useMediaQuery as jest.Mock).mockReturnValue(true);

        render(<LoginPage {...mockProps} />);

        expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
        expect(screen.getByTestId('google-oauth')).toBeInTheDocument();
        expect(screen.getByTestId('google-auth')).toBeInTheDocument();
    });

    test('handles null getElementById result gracefully', () => {
        document.getElementById = jest.fn().mockReturnValue(null);

        render(<LoginPage {...mockProps} />);

        expect(screen.getByText('Login to Grip')).toBeInTheDocument();
        expect(document.getElementById).toHaveBeenCalledWith('loginInput');
    });
});