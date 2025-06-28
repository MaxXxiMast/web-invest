jest.mock('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({ pathname: '/' })
}));

jest.mock('next/image', () => ({
    __esModule: true,
    default: function MockImage(props: any) {
        return <img data-testid="mock-image" {...props} alt={props.alt || ''} />;
    }
}));

jest.mock('../../../redux/slices/hooks', () => ({
    useAppSelector: jest.fn().mockReturnValue(false)
}));

jest.mock('../../../utils/user', () => ({
    isUserLogged: jest.fn().mockReturnValue(false)
}));

jest.mock('../../../utils/media', () => ({
    getStrapiMediaS3Url: jest.fn().mockImplementation(url => url)
}));

const mockConstants = {
    GripLogo: 'default-grip-logo.png',
    GripBlogLogo: 'default-grip-blog-logo.png',
    innerPagesMobileHeaderRouteNameMapping: {
        '/': '',
        '/profile': 'User Profile',
        '/discover': 'Discover'
    }
};

jest.mock('../../../utils/constants', () => mockConstants);

const mockContextValues = {
    logo: 'logo-from-context.png',
    BlogLogo: 'blog-logo-from-context.png'
};

const ReactActual = jest.requireActual('react');
jest.spyOn(ReactActual, 'useContext').mockImplementation(() => mockContextValues);

jest.mock('../../../pages/_app', () => ({
    GlobalContext: React.createContext(mockContextValues)
}));

// imported modules will use the mocked versions.
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavigationLogo from './NavigationLogo';

const originalLocation = window.location;
const locationMock = {
    ...originalLocation,
    pathname: '/'
};

describe('NavigationLogo Component', () => {
    const mockOpen = jest.fn();

    beforeAll(() => {
        // @ts-ignore - we're intentionally mocking this
        delete window.location;
        // @ts-ignore - TypeScript doesn't know we're creating a mock
        window.location = locationMock;
    });

    afterAll(() => {
        // @ts-ignore - restore original location
        window.location = originalLocation;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        window.open = mockOpen;
        locationMock.pathname = '/';
        (mockConstants.innerPagesMobileHeaderRouteNameMapping as any)['/'] = '';
    });

    test('renders the logo component', () => {
        render(<NavigationLogo />);
        expect(screen.getByTestId('mock-image')).toBeInTheDocument();
    });

    test('redirects to root when not logged in and logo is clicked', () => {
        const { useRouter } = require('next/router');
        const { isUserLogged } = require('../../../utils/user');

        (useRouter as jest.Mock).mockReturnValue({ pathname: '/' });
        (isUserLogged as jest.Mock).mockReturnValue(false);

        render(<NavigationLogo />);

        const logoWrapper = screen.getByTestId('mock-image').parentElement;
        fireEvent.click(logoWrapper!);

        expect(mockOpen).toHaveBeenCalledWith('/', '_self');
    });

    test('redirects to discover when logged in and logo is clicked', () => {
        const { useRouter } = require('next/router');
        const { isUserLogged } = require('../../../utils/user');

        (useRouter as jest.Mock).mockReturnValue({ pathname: '/' });
        (isUserLogged as jest.Mock).mockReturnValue(true);

        render(<NavigationLogo />);

        const logoWrapper = screen.getByTestId('mock-image').parentElement;
        fireEvent.click(logoWrapper!);

        expect(mockOpen).toHaveBeenCalledWith('/discover', '_self');
    });

    test('redirects to blog when on blog page and logo is clicked', () => {
        const { useRouter } = require('next/router');

        (useRouter as jest.Mock).mockReturnValue({ pathname: '/blog/article' });

        render(<NavigationLogo />);

        const logoWrapper = screen.getByTestId('mock-image').parentElement;
        fireEvent.click(logoWrapper!);

        expect(mockOpen).toHaveBeenCalledWith('/blog', '_self');
    });

    test('redirects to discover when token is expired', () => {
        const { useRouter } = require('next/router');
        const { useAppSelector } = require('../../../redux/slices/hooks');
        const { isUserLogged } = require('../../../utils/user');

        (useRouter as jest.Mock).mockReturnValue({ pathname: '/' });
        (useAppSelector as jest.Mock).mockReturnValue(true); // token expired
        (isUserLogged as jest.Mock).mockReturnValue(false);

        render(<NavigationLogo />);

        const logoWrapper = screen.getByTestId('mock-image').parentElement;
        fireEvent.click(logoWrapper!);

        expect(mockOpen).toHaveBeenCalledWith('/discover', '_self');
    });

    test('uses fallback logo when context logo is not available', () => {
        const { getStrapiMediaS3Url } = require('../../../utils/media');
        (getStrapiMediaS3Url as jest.Mock).mockReturnValue(null);

        render(<NavigationLogo />);

        const image = screen.getByTestId('mock-image');
        expect(image).toHaveAttribute('src', mockConstants.GripLogo);
    });

    test('displays route text when available in mapping', () => {
        locationMock.pathname = '/profile';
        (mockConstants.innerPagesMobileHeaderRouteNameMapping as any)['/profile'] = 'User Profile';

        render(<NavigationLogo />);

        expect(screen.getByText('User Profile')).toBeInTheDocument();
    });
});