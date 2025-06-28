import { render, screen } from '@testing-library/react';
import ToolsMenu from '.';
import { GlobalContext } from '../../../../pages/_app';
import { useAppSelector } from '../../../../redux/slices/hooks';
import { trackEvent } from '../../../../utils/gtm';

// Mock dependencies
jest.mock('../../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('swiper/react', () => ({
  Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
}));

jest.mock('../../Image', () => {
  return function MockImage({ alternativeText, alt }) {
    return(
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={alternativeText || alt} data-testid="mock-image" />
      </>
    );
  };
});

jest.mock('../MegaMenuLinkItem', () => {
  return function MockMegaMenuLinkItem({
    title,
    clickUrl,
    shortDescription,
    icon,
    openInNewTab,
    isBgFilledIcon,
    handleClick,
    subLinks,
  }) {
    return (
      <div data-testid="mega-menu-item" onClick={handleClick}>
        <h4>{title}</h4>
        <p>{shortDescription}</p>
        <div>{icon}</div>
        <span data-url={clickUrl} />
        <span data-openintab={openInNewTab ? 'true' : 'false'} />
        <span data-bgfilledicon={isBgFilledIcon ? 'true' : 'false'} />
        <span data-sublinks={JSON.stringify(subLinks)} />
      </div>
    );
  };
});

const mockToolsCategory = {
  childrenLinks: [
    {
      id: 1,
      title: 'Risk Calculator',
      shortDescription: 'Calculate your risk',
      clickUrl: '/risk-calculator',
      icon: '/icons/risk.svg',
      openInNewTab: false,
      isBgFilledIcon: true,
    },
    {
      id: 2,
      title: 'Return Estimator',
      shortDescription: 'Estimate your returns',
      clickUrl: '/return-estimator',
      icon: '/icons/return.svg',
      openInNewTab: true,
      isBgFilledIcon: false,
      subLinks: [
        {
          id: 21,
          title: 'Sub Link',
          shortDescription: 'Sub description',
          clickUrl: '/sub-link',
          icon: '/icons/sub.svg',
          openInNewTab: true,
          isBgFilledIcon: false,
        },
      ],
    },
  ],
};

describe('ToolsMenu Component', () => {
  beforeEach(() => {
    // Setup mocks
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: { userData: { userID: 'test-user-123' } },
        knowYourInvestor: { customerPersonality: 'Aggressive' },
      };
      return selector(state);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders tools menu items correctly', () => {
    render(
      <GlobalContext.Provider value={{ toolsCategory: mockToolsCategory }}>
        <ToolsMenu />
      </GlobalContext.Provider>
    );

    // Check the menu items are rendered
    const menuItems = screen.getAllByTestId('mega-menu-item');
    expect(menuItems).toHaveLength(2);

    expect(screen.getByText('Risk Calculator')).toBeInTheDocument();
    expect(screen.getByText('Return Estimator')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText('Calculate your risk')).toBeInTheDocument();
    expect(screen.getByText('Estimate your returns')).toBeInTheDocument();

    // Check images
    const images = screen.getAllByTestId('mock-image');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('alt', 'Risk Calculator');
    expect(images[1]).toHaveAttribute('alt', 'Return Estimator');
  });

  test('tracks events when menu items are clicked', () => {
    render(
      <GlobalContext.Provider value={{ toolsCategory: mockToolsCategory }}>
        <ToolsMenu />
      </GlobalContext.Provider>
    );

    const menuItems = screen.getAllByTestId('mega-menu-item');

    // Click the first menu item
    menuItems[0].click();

    // Check if trackEvent was called with correct parameters
    expect(trackEvent).toHaveBeenCalledWith('kyi_banner_clicked', {
      cta_text: 'Risk Calculator',
      section: 'Tools',
      quiz_taken: true,
      isLoggedIn: true,
    });

    // Click the second menu item
    menuItems[1].click();

    // Check second call
    expect(trackEvent).toHaveBeenCalledWith('kyi_banner_clicked', {
      cta_text: 'Return Estimator',
      section: 'Tools',
      quiz_taken: true,
      isLoggedIn: true,
    });
  });

  test('handles when user is not logged in', () => {
    // Mock user as not logged in
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: { userData: { userID: '' } },
        knowYourInvestor: { customerPersonality: 'Aggressive' },
      };
      return selector(state);
    });

    render(
      <GlobalContext.Provider value={{ toolsCategory: mockToolsCategory }}>
        <ToolsMenu />
      </GlobalContext.Provider>
    );

    const menuItems = screen.getAllByTestId('mega-menu-item');
    menuItems[0].click();

    // Check if trackEvent was called with isLoggedIn: false
    expect(trackEvent).toHaveBeenCalledWith('kyi_banner_clicked', {
      cta_text: 'Risk Calculator',
      section: 'Tools',
      quiz_taken: true,
      isLoggedIn: false,
    });
  });

  test('handles when personality is not set', () => {
    // Mock personality as not set
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: { userData: { userID: 'test-user-123' } },
        knowYourInvestor: { customerPersonality: null },
      };
      return selector(state);
    });

    render(
      <GlobalContext.Provider value={{ toolsCategory: mockToolsCategory }}>
        <ToolsMenu />
      </GlobalContext.Provider>
    );

    const menuItems = screen.getAllByTestId('mega-menu-item');
    menuItems[0].click();

    // Check if trackEvent was called with quiz_taken: false
    expect(trackEvent).toHaveBeenCalledWith('kyi_banner_clicked', {
      cta_text: 'Risk Calculator',
      section: 'Tools',
      quiz_taken: false,
      isLoggedIn: true,
    });
  });
});
