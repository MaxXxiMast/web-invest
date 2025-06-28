import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MobileFooter from './index';
import { GlobalContext } from '../../../../pages/_app';

jest.mock('swiper/react', () => ({
  Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
}));

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    pathname: '/assets',
    push: jest.fn(),
  })),
}));

jest.mock('../../../../api/strapi', () => ({
  fetchAPI: jest.fn().mockResolvedValue({
    data: [
      {
        attributes: {
          pageData: [
            {
              label: 'Invest',
              src: 'test-src.svg',
              url: '/assets',
              clickedSrc: 'test-clicked-src.svg',
            },
            {
              label: 'My PortFolio',
              src: 'test-portfolio.svg',
              url: '/portfolio',
              clickedSrc: 'test-clicked-portfolio.svg',
            },
          ],
        },
      },
    ],
  }),
}));

jest.mock('../../../../utils/gripConnect', () => ({
  isGCOrder: jest.fn(() => false),
}));

jest.mock('../../../../utils/constants', () => ({
  innerPagesWithNav: ['/assets', '/portfolio', '/resources', '/referral'],
}));

jest.mock('../../../../utils/media', () => ({
  getStrapiMediaS3Url: jest.fn((url) => url),
}));

jest.mock('../../../../utils/string', () => ({
  GRIP_INVEST_GI_STRAPI_BUCKET_URL: 'https://example.com/',
}));

// Mock Image component
jest.mock('../../../primitives/Image', () => {
  return function MockImage(props) {
    return <img data-testid="mock-image" {...props} />;
  };
});

// Mock CustomSkeleton
jest.mock('../../../primitives/CustomSkeleton/CustomSkeleton', () => {
  return function MockSkeleton(props) {
    return <div data-testid="skeleton" {...props} />;
  };
});

describe('MobileFooter Component', () => {
  let originalLocation;

  beforeAll(() => {
    originalLocation = window.location;

    delete window.location;
    window.location = {
      pathname: '/assets',
    } as any;

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMobileFooter = (initialState = {}) => {
    const store = configureStore({
      reducer: {
        config: (state = { chatBots: {} }) => state,
        user: (
          state = { userData: { investmentData: { isInvested: true } } }
        ) => state,
        gcConfig: (
          state = { configData: { themeConfig: { mobileBottomNav: {} } } }
        ) => state,
      },
      preloadedState: initialState,
    });

    return render(
      <GlobalContext.Provider
        value={{ experimentsData: { showReferral: true } }}
      >
        <Provider store={store}>
          <MobileFooter />
        </Provider>
      </GlobalContext.Provider>
    );
  };

  it('renders loading skeleton initially', () => {
    const { fetchAPI } = require('../../../../api/strapi');
    fetchAPI.mockImplementationOnce(() => new Promise(() => {}));

    renderMobileFooter();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders footer links after loading', async () => {
    renderMobileFooter();

    await waitFor(() => {
      expect(screen.getByText('Invest')).toBeInTheDocument();
      expect(screen.getByText('My PortFolio')).toBeInTheDocument();
    });
  });

  it('handles navigation when footer icon is clicked', async () => {
    const { useRouter } = require('next/router');
    const mockRouter = {
      pathname: '/assets',
      push: jest.fn(),
    };
    useRouter.mockReturnValue(mockRouter);

    renderMobileFooter();

    await waitFor(() => {
      expect(screen.getByText('My PortFolio')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('My PortFolio').closest('div'));

    expect(mockRouter.push).toHaveBeenCalledWith('/portfolio');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(
      'isFromAssetDetail'
    );
  });

  it('shows default icons when no footer links are returned from API', async () => {
    const { fetchAPI } = require('../../../../api/strapi');
    fetchAPI.mockResolvedValueOnce({
      data: [
        {
          attributes: {
            pageData: [],
          },
        },
      ],
    });

    renderMobileFooter();

    await waitFor(() => {
      expect(screen.getByText('Invest')).toBeInTheDocument();
      expect(screen.getByText('My PortFolio')).toBeInTheDocument();
      expect(screen.getByText('Resources')).toBeInTheDocument();
    });
  });
});
