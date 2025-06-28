import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoogleAuth from './GoogleAuth';
import Cookie from 'js-cookie';
import { useRouter } from 'next/router';
import { useAppDispatch } from '../../../redux/slices/hooks';
import { authenticateSocialLoginRequest } from '../../../redux/slices/user';
import { createPersonalityOnAuthentication } from '../../../redux/slices/knowYourInvestor';
import { useGoogleLogin } from '../../../utils/googleOauth';
import { trackEvent } from '../../../utils/gtm';
import { verifyUserAndRedirect } from '../../../utils/login';
import { getUTMParams } from '../../../utils/utm';

jest.mock('js-cookie');

jest.mock('next/router', () => ({
    __esModule: true,
    useRouter: jest.fn()
}));

jest.mock('../../../redux/slices/hooks', () => ({
    __esModule: true,
    useAppDispatch: jest.fn()
}));

jest.mock('../../../redux/slices/user', () => ({
    __esModule: true,
    authenticateSocialLoginRequest: jest.fn()
}));

jest.mock('../../../redux/slices/knowYourInvestor', () => ({
    __esModule: true,
    createPersonalityOnAuthentication: jest.fn()
}));

jest.mock('../../../utils/googleOauth', () => ({
    __esModule: true,
    useGoogleLogin: jest.fn()
}));

jest.mock('../../../utils/gtm', () => ({
    __esModule: true,
    trackEvent: jest.fn()
}));

jest.mock('../../../utils/login', () => ({
    __esModule: true,
    verifyUserAndRedirect: jest.fn()
}));

jest.mock('../../../utils/utm', () => ({
    __esModule: true,
    getUTMParams: jest.fn()
}));

jest.mock('@mui/material', () => ({
    __esModule: true,
    CircularProgress: () => <div data-testid="circular-progress" />
}));

jest.mock('../../primitives/Button', () => ({
    __esModule: true,
    default: ({ children, onClick }) => (
        <button onClick={onClick} data-testid="google-button">
            {children}
        </button>
    )
}));

jest.mock('../../primitives/Image', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-image" />
}));

jest.mock('./GoogleAuth.module.css', () => ({
    __esModule: true,
    default: {
        socialButton: 'socialButton',
        socialText: 'socialText',
        commonFont: 'commonFont',
        orTextDivider: 'orTextDivider',
        orText: 'orText',
        circularProgress: 'circularProgress'
    }
}));

describe('GoogleAuth Component', () => {
    const mockDispatch = jest.fn();
    const mockPush = jest.fn();
    const mockGoogleLogin = jest.fn();
    
    beforeEach(() => {
        jest.clearAllMocks();
        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useGoogleLogin as jest.Mock).mockReturnValue(mockGoogleLogin);
    });

    test('renders nothing when google login is not included in feature flags', () => {
        const socialLoginFeatureFlag = { value: 'facebook,linkedin' };
        const { container } = render(
            <GoogleAuth 
                socialLoginFeatureFlag={socialLoginFeatureFlag} 
            />
        );
        expect(container).toBeEmptyDOMElement();
    });

    test('renders google login button when feature flag includes google', () => {
        const socialLoginFeatureFlag = { value: 'google,facebook' };
        render(
            <GoogleAuth 
                socialLoginFeatureFlag={socialLoginFeatureFlag} 
            />
        );

        expect(screen.getByTestId('google-button')).toBeInTheDocument();
        expect(screen.getByText('Continue with Google')).toBeInTheDocument();
        expect(screen.getByText('OR')).toBeInTheDocument();
    });

    test('calls googleLogin when button is clicked', () => {
        const socialLoginFeatureFlag = { value: 'google' };
        render(
            <GoogleAuth 
                socialLoginFeatureFlag={socialLoginFeatureFlag} 
            />
        );

        fireEvent.click(screen.getByTestId('google-button'));

        expect(trackEvent).toHaveBeenCalledWith('login_signup_initiate', {
            mode: 'google',
            mobile: '',
            email: '',
        });
        expect(mockGoogleLogin).toHaveBeenCalled();
    });

    test('shows loader when google login is in progress', async () => {
        const socialLoginFeatureFlag = { value: 'google' };
        const mockTokenResponse = { access_token: 'mock-token' };

        (useGoogleLogin as jest.Mock).mockImplementation(({ onSuccess }) => {
            return () => {
                onSuccess(mockTokenResponse);
            };
        });

        (authenticateSocialLoginRequest as jest.Mock).mockReturnValue({ type: 'mock-action' });

        render(<GoogleAuth socialLoginFeatureFlag={socialLoginFeatureFlag} />);

        fireEvent.click(screen.getByTestId('google-button'));

        await waitFor(() => {
            expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
        });
    });

    test('handles google login success properly', async () => {
        const socialLoginFeatureFlag = { value: 'google' };
        const mockTokenResponse = { access_token: 'mock-token' };
        const mockUserResponse = { userData: { emailID: 'test@example.com' } };
        const mockRedirectURL = '/dashboard';

        (verifyUserAndRedirect as jest.Mock).mockReturnValue(mockRedirectURL);
        (authenticateSocialLoginRequest as jest.Mock).mockImplementation((token, provider, utmParams, onSuccess) => {
            onSuccess(mockUserResponse);
            return { type: 'mock-action' };
        });
        (createPersonalityOnAuthentication as jest.Mock).mockImplementation(callback => {
            callback();
            return { type: 'mock-action' };
        });
        (useGoogleLogin as jest.Mock).mockImplementation(({ onSuccess }) => {
            return () => onSuccess(mockTokenResponse);
        });

        render(<GoogleAuth socialLoginFeatureFlag={socialLoginFeatureFlag} />);

        fireEvent.click(screen.getByTestId('google-button'));

        await waitFor(() => {
            expect(Cookie.set).toHaveBeenCalledWith('loginID', 'test@example.com');
            expect(verifyUserAndRedirect).toHaveBeenCalledWith(
              mockUserResponse,
              'google',
              'Continue with google'
            );
            expect(mockDispatch).toHaveBeenCalledTimes(2);
            expect(mockPush).toHaveBeenCalledWith(mockRedirectURL);
        });
    });

    test('handles google login failure', async () => {
        const socialLoginFeatureFlag = { value: 'google' };
        const mockTokenResponse = { access_token: 'mock-token' };

        (authenticateSocialLoginRequest as jest.Mock).mockImplementation((token, provider, utmParams, onSuccess, onError) => {
            onError({ error: 'Login failed' });
            return { type: 'mock-action' };
        });
        (useGoogleLogin as jest.Mock).mockImplementation(({ onSuccess }) => {
            return () => onSuccess(mockTokenResponse);
        });

        render(<GoogleAuth socialLoginFeatureFlag={socialLoginFeatureFlag} />);

        fireEvent.click(screen.getByTestId('google-button'));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('circular-progress')).not.toBeInTheDocument();
        });
    });

    test('handles UTM parameters when cookie exists', async () => {
        const socialLoginFeatureFlag = { value: 'google' };
        const mockTokenResponse = { access_token: 'mock-token' };
        const mockUtmParams = { utm_source: 'test' };

        (Cookie.get as jest.Mock).mockReturnValue('utm_source=test');
        (getUTMParams as jest.Mock).mockReturnValue(mockUtmParams);

        (useGoogleLogin as jest.Mock).mockImplementation(({ onSuccess }) => {
            return () => onSuccess(mockTokenResponse);
        });

        render(<GoogleAuth socialLoginFeatureFlag={socialLoginFeatureFlag} />);

        fireEvent.click(screen.getByTestId('google-button'));

        await waitFor(() => {
            expect(Cookie.get).toHaveBeenCalledWith('utm');
            expect(getUTMParams).toHaveBeenCalled();
            expect(authenticateSocialLoginRequest).toHaveBeenCalledWith(
                'mock-token',
                'google',
                mockUtmParams,
                expect.any(Function),
                expect.any(Function)
            );
        });
    });

    test('handles google login onError callback', async () => {
        const socialLoginFeatureFlag = { value: 'google' };
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        (useGoogleLogin as jest.Mock).mockImplementation(({ onError }) => {
            return () => onError('Google login error');
        });

        render(<GoogleAuth socialLoginFeatureFlag={socialLoginFeatureFlag} />);

        fireEvent.click(screen.getByTestId('google-button'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Google login error');
        });

        consoleSpy.mockRestore();
    });

    test('handles case when socialLoginFeatureFlag has no value property', () => {
        const socialLoginFeatureFlag = { someOtherProp: 'test' };
        render(<GoogleAuth socialLoginFeatureFlag={socialLoginFeatureFlag} />);

        const googleButton = screen.queryByTestId('google-button');
        expect(googleButton).not.toBeInTheDocument();
    });

    test('handles null user response data', async () => {
        const socialLoginFeatureFlag = { value: 'google' };
        const mockTokenResponse = { access_token: 'mock-token' };

        const mockUserResponse = null;

        (authenticateSocialLoginRequest as jest.Mock).mockImplementation((token, provider, utmParams, onSuccess) => {
            onSuccess(mockUserResponse);
            return { type: 'mock-action' };
        });
        (createPersonalityOnAuthentication as jest.Mock).mockImplementation(callback => {
            callback();
            return { type: 'mock-action' };
        });
        (useGoogleLogin as jest.Mock).mockImplementation(({ onSuccess }) => {
            return () => onSuccess(mockTokenResponse);
        });

        render(<GoogleAuth socialLoginFeatureFlag={socialLoginFeatureFlag} />);

        fireEvent.click(screen.getByTestId('google-button'));

        await waitFor(() => {
            expect(Cookie.set).toHaveBeenCalledWith('loginID', undefined);
        });
    });
});