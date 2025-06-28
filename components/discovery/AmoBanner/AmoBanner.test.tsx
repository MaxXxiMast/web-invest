import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { AmoBanner } from './index';
import { DiscoverContext } from '../../../contexts/discoverContext';
import { trackEvent } from '../../../utils/gtm';
import { delay } from '../../../utils/timer';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('../../../utils/timer', () => ({
  delay: jest.fn(),
}));

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('../../user-kyc/common/GenericModal', () => {
  return function MockGenericModal({
      showModal,
      title,
      subtitle,
      btnText,
      handleModalClose,
      handleBtnClick,
      hideClose,
      hideIcon,
  }) {
    if (!showModal) return null;
    return (
      <div data-testid="generic-modal">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <button onClick={handleBtnClick}>{btnText}</button>
        {!hideClose && (
          <button onClick={handleModalClose} data-testid="close-button">
            Close
          </button>
        )}
      </div>
    );
  };
});

jest.mock('../../primitives/Image', () => {
  return function MockImage({ src, alt, width, height }) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        data-testid="banner-image"
      />
    );
  };
});

jest.mock('../../primitives/Button', () => {
  const Button = ({ children, onClick, className, variant, width, compact }) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-width={width}
      data-compact={compact}
      data-testid="button"
    >
      {children}
    </button>
  );
  Button.ButtonType = { Secondary: 'secondary' };
  return Button;
});

const mockPush = jest.fn();
const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>;
const mockDelay = delay as jest.MockedFunction<typeof delay>;
const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

const defaultContextValue = {
  amo_orders_pending_pay: 5,
  amo_orders_pending_pay_rfq: 3,
  market_open: true,
  orders_pending_pay: 2,
};

const defaultBannerData = {
  image: {
    url: 'test-image.svg',
    width: 150,
    height: 80,
  },
  bannerText: 'Test banner text',
  knowMoreButton: {
    text: 'Learn More',
    modalTitle: 'Custom Modal Title',
    modalDescription: 'Custom modal description',
  },
  exploreDealsButton: {
    text: 'View Deals',
    btnLink: '/custom-deals',
  },
  showNowLiveText: true,
};

const renderAmoBanner = (bannerData = defaultBannerData, contextValue = defaultContextValue) => {
  return render(
    <DiscoverContext.Provider value={contextValue}>
      <AmoBanner bannerData={bannerData} />
    </DiscoverContext.Provider>
  );
};

describe('AmoBanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    mockUseMediaQuery.mockReturnValue(false);
    mockDelay.mockResolvedValue(undefined);
  });

  test('renders banner with all elements when showNowLiveText is true', async () => {
    renderAmoBanner();
    
    await waitFor(() => {
      expect(screen.getByText('Now Live')).toBeInTheDocument();
      expect(screen.getByText('Test banner text')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      expect(screen.getByText('View Deals')).toBeInTheDocument();
      expect(screen.getByTestId('banner-image')).toBeInTheDocument();
    })
  });

  test('tracks event when Explore Deals button is clicked', async () => {
    renderAmoBanner();

    fireEvent.click(screen.getByText('View Deals'));

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('amo_explore_deals', {
        amo_orders_pending_pay: 5,
        amo_orders_pending_pay_rfq: 3,
        market_open: true,
        orders_pending_pay: 2,
      });
    })
  });

  test('closes modal when close button is clicked', async () => {
    renderAmoBanner();

    fireEvent.click(screen.getByText('Learn More'));
    await waitFor(() => {})
    expect(screen.getByTestId('generic-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Okay! Understood'));
    expect(screen.queryByTestId('generic-modal')).not.toBeInTheDocument();
  });

  test('navigates to custom link when Know More button has btnLink', async () => {
    const bannerData = {
      ...defaultBannerData,
      knowMoreButton: {
        text: 'Learn More',
        btnLink: '/custom-know-more-link',
        modalTitle: 'Custom Modal Title',
        modalDescription: 'Custom modal description',
      },
    };
    renderAmoBanner(bannerData);

    fireEvent.click(screen.getByText('Learn More'));

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('amo_know_more_clicked', {
        amo_orders_pending_pay: 5,
        amo_orders_pending_pay_rfq: 3,
        market_open: true,
        orders_pending_pay: 2,
      });
      expect(mockPush).toHaveBeenCalledWith('/custom-know-more-link');
      expect(screen.queryByTestId('generic-modal')).not.toBeInTheDocument();
    })
  });

  test('handles null/undefined bannerData properties', async () => {
    const nullBannerData = {
      image: null,
      bannerText: null,
      knowMoreButton: null,
      exploreDealsButton: null,
      showNowLiveText: null,
    };
    renderAmoBanner(nullBannerData);

    await waitFor(() => {
      expect(screen.getByText('You can now place After Market Orders for Bonds and SDIs')).toBeInTheDocument();
      expect(screen.getByText('Know More')).toBeInTheDocument();
      expect(screen.getByText('Explore Deals')).toBeInTheDocument();
    })
  });

  test('handles empty exploreDealsButton btnLink', async () => {
    const bannerData = {
      ...defaultBannerData,
      exploreDealsButton: { 
        text: 'View Deals',
        btnLink: ''
      },
    };
    renderAmoBanner(bannerData);

    fireEvent.click(screen.getByText('View Deals'));

    await waitFor(() => {
      expect(mockDelay).toHaveBeenCalledWith(300);
      expect(mockPush).toHaveBeenCalledWith('/assets');
    });
  });

  test('handles undefined exploreDealsButton', async () => {
    const bannerData = {
      ...defaultBannerData,
      exploreDealsButton: undefined,
    };
    renderAmoBanner(bannerData);

    fireEvent.click(screen.getByText('Explore Deals'));

    await waitFor(() => {
      expect(mockDelay).toHaveBeenCalledWith(300);
      expect(mockPush).toHaveBeenCalledWith('/assets');
    });
  });

  test('handles undefined knowMoreButton', async () => {
    const bannerData = {
      ...defaultBannerData,
      knowMoreButton: undefined,
    };
    renderAmoBanner(bannerData);

    fireEvent.click(screen.getByText('Know More'));

    await waitFor(() => {
      expect(screen.getByTestId('generic-modal')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    })
  });
});