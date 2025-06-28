jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(() => ({
    pathname: '/',
    asPath: '/',
    push: jest.fn(),
    query: {},
  })),
}));

jest.mock(
  'next/dynamic',
  () => () => jest.fn().mockImplementation(() => 'MockFooterBanner')
);

jest.mock('swiper/react', () => ({
  Swiper: jest
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="mock-swiper">{children}</div>
    )),
  SwiperSlide: jest
    .fn()
    .mockImplementation(({ children }) => (
      <div data-testid="mock-swiper-slide">{children}</div>
    )),
}));

jest.mock('../../../api/strapi', () => ({
  fetchAPI: jest.fn().mockImplementation(() =>
    Promise.resolve({
      data: [],
      meta: { pagination: { total: 0 } },
    })
  ),
}));

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('../../../utils/user', () => ({
  getNoOfNotifications: jest.fn().mockReturnValue(2),
  isUserLogged: jest.fn(),
}));

jest.mock('../../../utils/constants', () => ({
  allowWithoutLogin: ['/about', '/blog'],
  checkInAllowedSubRoutes: jest.fn(),
  innerPagesWithoutNav: ['/rfq-payment-processing', '/payment-page'],
  routesFornavigationToStickOnScroll: ['/payment'],
}));

jest.mock('../../../utils/gripConnect', () => ({
  isGCOrder: jest.fn(),
}));

jest.mock('../../../utils/login', () => ({
  checkInAllowedDynamicSubRoutes: jest.fn(),
}));

jest.mock('../../../utils/blog', () => ({
  blogCategoryForNavigation: {},
  blogPopulateQuery: {},
}));

jest.mock('../../../utils/gtm', () => ({
  pushToDataLayer: jest.fn(),
  trackEvent: jest.fn(),
}));

jest.mock('../../../utils/appHelpers', () => ({
  isRenderedInWebview: jest.fn(),
}));

jest.mock('../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: 'https://test-bucket.com/',
  handleExtraProps: jest.fn().mockImplementation((props) => props),
}));

jest.mock('../../../utils/timer', () => ({
  debounce: jest.fn().mockImplementation((fn) => fn),
}));

jest.mock('./ProfileImage', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(() => (
      <div data-testid="profile-image">ProfileImage</div>
    )),
}));

jest.mock('./NavigationLogo', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(() => <div data-testid="navigation-logo">Logo</div>),
}));

jest.mock('./PreLoginButton', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ handleLoginSignupClick }) => (
    <button data-testid="login-button" onClick={handleLoginSignupClick}>
      Login/Sign Up
    </button>
  )),
}));

jest.mock('./ReferEarnBtn', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(() => <div data-testid="refer-earn">Refer & Earn</div>),
}));

jest.mock('./MenuToggle', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ handleOnClick }) => (
    <button data-testid="menu-toggle" onClick={handleOnClick}>
      Menu
    </button>
  )),
}));

jest.mock('../PoweredByGrip', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(() => (
      <div data-testid="powered-by-grip">Powered by Grip</div>
    )),
}));

jest.mock('./Notifications', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ handleNotifyClick }) => (
    <div data-testid="notifications" onClick={handleNotifyClick}>
      Notifications
    </div>
  )),
}));

jest.mock('../../layout/Notifications', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(() => (
      <div data-testid="notifications-list">Notifications List</div>
    )),
}));

jest.mock('../../common/PaymentPendingHeader', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(() => (
      <div data-testid="payment-pending-header">Payment Pending Header</div>
    )),
}));

jest.mock('./NavItem', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ linkData, handleLogoutClick }) => {
    if (linkData.title === 'Profile' && linkData.childrenLinks) {
      return (
        <div data-testid={`nav-item-${linkData.title}`}>
          <span>{linkData.title}</span>
          <ul>
            {linkData.childrenLinks.map((link, index) => (
              <li key={index} data-testid={`child-link-${link.title}`}>
                {link.title === 'Logout' ? (
                  <button
                    onClick={handleLogoutClick}
                    data-testid="logout-button"
                  >
                    {link.title}
                  </button>
                ) : (
                  <span>{link.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return <li data-testid={`nav-item-${linkData.title}`}>{linkData.title}</li>;
  }),
}));

jest.mock('../../../utils/withLazyLoad', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((Component) => {
    const WithLazyLoad = (props) => (
      <div data-testid="lazy-loaded">
        <Component {...props} />
      </div>
    );
    WithLazyLoad.displayName = `WithLazyLoad(${
      Component.displayName || Component.name || 'Component'
    })`;
    return WithLazyLoad;
  }),
}));

jest.mock('./data', () => ({
  addBlogsInNavigation: jest
    .fn()
    .mockImplementation((categories) => categories),
}));

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Navigation from './Navigation';
import { GlobalContext } from '../../../pages/_app';
import { useRouter } from 'next/router';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { getNoOfNotifications, isUserLogged } from '../../../utils/user';
import { isGCOrder } from '../../../utils/gripConnect';
import {
  checkInAllowedSubRoutes,
  innerPagesWithoutNav,
} from '../../../utils/constants';
import { checkInAllowedDynamicSubRoutes } from '../../../utils/login';
import { pushToDataLayer } from '../../../utils/gtm';
import { isRenderedInWebview } from '../../../utils/appHelpers';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: (state = {
        userData: { 
          userID: 'test-user', 
          liquidity: false,
          userVan: 'test-van',
          investmentData: {
            'Leasing': { investments: true },
            'Inventory': { investments: false }
          }
        },
        notifications: [],
        pendingResignations: [],
        pendingMcaEsign: [],
      }, action) => state,
      config: (state = {
        afterEsignDone: false,
        showNotification: false,
      }, action) => state,
      gcConfig: (state = {
        configData: {
          themeConfig: {
            hamburgerMenu: true,
            hideProfile: false,
            showNotifications: true,
          }
        }
      }, action) => state,
      sessionExpiry: (state = {
        show: false,
      }, action) => state,
      orders: (state = {
        ordersList: [],
        pendingOrders: [],
      }, action) => state,
    },
    preloadedState: initialState,
  });
};

const mockGlobalContextValue = {
  profileLinks: {
    title: 'Profile',
    childrenLinks: [
      {
        id: 1,
        title: 'My Profile',
        clickUrl: '/profile',
        openInNewTab: false,
        accessibilityLabel: 'my profile',
      },
    ],
  },
  loggedinHeaderLinks: [
    {
      title: 'Invest',
      childrenLinks: [
        {
          id: 1,
          title: 'Investments',
          clickUrl: '/investments',
          openInNewTab: false,
          accessibilityLabel: 'investments',
        },
      ],
    },
  ],
  headerLinks: [
    {
      title: 'Products',
      childrenLinks: [
        {
          id: 1,
          title: 'Products',
          clickUrl: '/products',
          openInNewTab: false,
          accessibilityLabel: 'products',
        },
      ],
    },
  ],
  experimentsData: {
    showReferral: true,
  },
  toolsCategory: {
    title: 'Tools',
    childrenLinks: [
      {
        id: 1,
        title: 'Calculator',
        clickUrl: '/calculator',
        openInNewTab: false,
        accessibilityLabel: 'calculator',
      },
    ],
  },
  userData: {
    userVan: 'test-van',
    investmentData: {
      'Leasing': { investments: true },
      'Inventory': { investments: false }
    }
  },
};

describe('Navigation Component', () => {
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  // Mock localStorage
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    (useRouter as jest.Mock).mockImplementation(() => ({
      pathname: '/',
      asPath: '/',
      push: jest.fn(),
    }));

    (useMediaQuery as jest.Mock).mockReturnValue(false);
    (isUserLogged as jest.Mock).mockReturnValue(false);
    (isGCOrder as jest.Mock).mockReturnValue(false);
    (checkInAllowedSubRoutes as jest.Mock).mockReturnValue(false);
    (checkInAllowedDynamicSubRoutes as jest.Mock).mockReturnValue(false);

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });

    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();

    require('../../../api/strapi').fetchAPI.mockImplementation(() =>
      Promise.resolve({
        data: [],
        meta: { pagination: { total: 0 } },
      })
    );
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    jest.useFakeTimers();
  });

  test('renders navigation for logged in user with profile and notification options', async () => {
    (isGCOrder as jest.Mock).mockReturnValue(true);
    const store = createTestStore({
      user: {
        userData: { 
          userID: 'test-user', 
          liquidity: true,
          userVan: 'test-van',
          investmentData: {
            'Leasing': { investments: true },
            'Inventory': { investments: false }
          }
        },
        notifications: [{ id: 1, message: 'Test notification' }],
        pendingResignations: [],
        pendingMcaEsign: [],
      },
    });
  
    require('../../../utils/user').isUserLogged.mockReturnValue(true);

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });
  
    expect(screen.getByTestId('profile-image')).toBeInTheDocument();
    expect(screen.getByTestId('refer-earn')).toBeInTheDocument();
  });

  test('hamburger menu toggles navigation on click', async () => {
    const store = createTestStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    const menuToggle = screen.getByTestId('menu-toggle');
    expect(menuToggle).toBeInTheDocument();

    fireEvent.click(menuToggle);

    expect(require('./MenuToggle').default).toHaveBeenCalledWith(
      expect.objectContaining({
        activeClass: false,
        handleOnClick: expect.any(Function),
      }),
      expect.anything()
    );
  });

  test('renders payment pending header on payment processing page', async () => {
    const store = createTestStore();

    (useRouter as jest.Mock).mockImplementation(() => ({
      pathname: '/rfq-payment-processing',
      push: jest.fn(),
    }));

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    expect(screen.getByTestId('payment-pending-header')).toBeInTheDocument();
  });

  test('login button redirects to login page when clicked', async () => {
    const store = createTestStore();
    const routerPush = jest.fn();

    (useRouter as jest.Mock).mockImplementation(() => ({
      pathname: '/',
      push: routerPush,
    }));

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);

    expect(routerPush).toHaveBeenCalledWith('/login?signup=true');
    expect(require('../../../utils/gtm').trackEvent).toHaveBeenCalledWith(
      'login_signup_page',
      { page: 'primary' }
    );
  });

  test('notifications are handled properly for logged in users', async () => {
    (isRenderedInWebview as jest.Mock).mockReturnValue(true);
    (isGCOrder as jest.Mock).mockReturnValue(true);
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ appVersion: '1.9.0' }));
    const store = createTestStore({
      user: {
        userData: { 
          userID: 'test-user', 
          liquidity: false,
          userVan: 'test-van',
          investmentData: {
            'Leasing': { investments: true },
            'Inventory': { investments: false }
          }
        },
        notifications: [{ id: 1, message: 'Test notification' }],
        pendingResignations: [],
        pendingMcaEsign: [],
      },
    });
  
    require('../../../utils/user').isUserLogged.mockReturnValue(true);
    require('../../../utils/customHooks/useMediaQuery').useMediaQuery.mockReturnValue(true);
  
    const routerPush = jest.fn();
    (useRouter as jest.Mock).mockImplementation(() => ({
      pathname: '/',
      push: routerPush,
    }));

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });
  
    const notificationsButton = screen.getByTestId('notifications');
    fireEvent.click(notificationsButton);

    expect(routerPush).toHaveBeenCalledWith('/notifications');
  });

  test('notifications panel opens when clicked on desktop and closes when clicked on anywhere else', async () => {
    (isGCOrder as jest.Mock).mockReturnValue(true);
    const store = createTestStore({
      user: {
        userData: { 
          userID: 'test-user', 
          liquidity: false,
          userVan: 'test-van',
          investmentData: {
            'Leasing': { investments: true },
            'Inventory': { investments: false }
          }
        },
        notifications: [{ id: 1, message: 'Test notification' }],
        pendingResignations: [],
        pendingMcaEsign: [],
      },
    });
    
    const mockDispatch = jest.fn();
    jest.mock('react-redux', () => ({
      ...jest.requireActual('react-redux'),
      useDispatch: () => mockDispatch,
      useSelector: jest.requireActual('react-redux').useSelector,
    }));
  
    require('../../../utils/user').isUserLogged.mockReturnValue(true);
    require('../../../utils/customHooks/useMediaQuery').useMediaQuery.mockReturnValue(false);
    
    const mockAddEventListener = jest.fn();
    const originalAddEventListener = document.addEventListener;
    document.addEventListener = mockAddEventListener;

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    const notificationsButton = screen.getByTestId('notifications');
    
    await act(async () => {
      fireEvent.click(notificationsButton);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('notifications')).toBeInTheDocument();
    });
    
    document.addEventListener = originalAddEventListener;
  });

  test('renders No new notifications message when there are no notifications', async () => {
    (isGCOrder as jest.Mock).mockReturnValue(true);
    const store = createTestStore({
      user: {
        userData: { 
          userID: 'test-user', 
          liquidity: false,
          userVan: 'test-van',
          investmentData: {
            'Leasing': { investments: true },
            'Inventory': { investments: false }
          }
        },
        notifications: [],
        pendingResignations: [],
        pendingMcaEsign: [],
      },
    });
    
    const mockDispatch = jest.fn();
    jest.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(mockDispatch);
  
    (isUserLogged as jest.Mock).mockReturnValue(true);
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    (getNoOfNotifications as jest.Mock).mockReturnValue(0);

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    const notificationsButton = screen.getByTestId('notifications');
    
    await act(async () => {
      fireEvent.click(notificationsButton);
    });
    
    await waitFor(() => {
      expect(require('../../../utils/user').getNoOfNotifications).toHaveBeenCalled();
    });
  });

  test('renders with GC order specific elements', async () => {
    const store = createTestStore();

    require('../../../utils/user').isUserLogged.mockReturnValue(true);
    require('../../../utils/gripConnect').isGCOrder.mockReturnValue(true);

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    expect(screen.getByTestId('powered-by-grip')).toBeInTheDocument();
  });

  test('handles logout when clicked', async () => {
    (isGCOrder as jest.Mock).mockReturnValue(true);
    const mockDispatch = jest.fn();

    jest
      .spyOn(require('react-redux'), 'useDispatch')
      .mockReturnValue(mockDispatch);

    require('../../../utils/user').isUserLogged.mockReturnValue(true);

    const store = createTestStore({
      user: {
        userData: { userID: 'test-user' },
        notifications: [],
        pendingResignations: [],
        pendingMcaEsign: [],
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
  });

  test('correctly handles multiple notifications and esign states', async () => {
    (isGCOrder as jest.Mock).mockReturnValue(true);
    const store = createTestStore({
      user: {
        userData: { 
          userID: 'test-user', 
          liquidity: false,
          userVan: 'test-van',
          investmentData: {
            'Leasing': { investments: true },
            'Inventory': { investments: false }
          }
        },
        notifications: [{ id: 1 }, { id: 2 }],
        pendingResignations: [{ id: 1 }],
        pendingMcaEsign: [{ id: 1 }],
      },
      config: {
        afterEsignDone: true,
        showNotification: false,
      },
    });
  
    const mockDispatch = jest.fn();
    jest.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(mockDispatch);
  
    (isUserLogged as jest.Mock).mockReturnValue(true);
    (getNoOfNotifications as jest.Mock).mockReturnValue(4);
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  
    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });
  
    const notificationsButton = screen.getByTestId('notifications');
    
    await act(async () => {
      fireEvent.click(notificationsButton);
    });
  
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  test("calls openReferPage function when 'Refer a Friend' button is clicked", async () => {
    const mockDispatch = jest.fn();
    const store = createTestStore({
      user: {
        userData: { userID: 'test-user' },
        notifications: [{ id: 1, message: 'Test notification' }],
        pendingResignations: [],
        pendingMcaEsign: [],
      },
    });

    const originalWindowOpen = window.open;
    window.open = jest.fn();

    jest.mock('react-redux', () => ({
      ...jest.requireActual('react-redux'),
      useDispatch: () => mockDispatch,
    }));

    require('../../../utils/user').isUserLogged.mockReturnValue(true);
    require('../../../utils/gripConnect').isGCOrder.mockReturnValue(false);
    require('../../../utils/customHooks/useMediaQuery').useMediaQuery.mockReturnValue(
      false
    );
    (pushToDataLayer as jest.Mock).mockReturnValue({
      event: 'referAndearnClicked',
    });

    const { default: ReferEarnBtnMock } = require('./ReferEarnBtn');

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    const mockCallArgs = ReferEarnBtnMock.mock.calls.find(
      (call) => call[0].handleBtnClickEvent
    );
    const handleBtnClickEvent = mockCallArgs[0].handleBtnClickEvent;

    const referButton = screen.getByTestId('refer-earn');
    fireEvent.click(referButton);

    act(() => {
      handleBtnClickEvent();
    });

    expect(pushToDataLayer).toHaveBeenCalledWith({
      event: 'referAndEarnClicked',
    });

    expect(window.open).toHaveBeenCalledWith('/referral', '_self');
    window.open = originalWindowOpen;
  });

  test('handles scroll events correctly', async () => {
    const store = createTestStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    expect(window.addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );

    const scrollCallback = (
      window.addEventListener as jest.Mock
    ).mock.calls.find((call) => call[0] === 'scroll')[1];

    Object.defineProperty(window, 'scrollY', { value: 100 });
    scrollCallback();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    Object.defineProperty(window, 'scrollY', { value: 50 });
    scrollCallback();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    const { unmount } = render(
      <Provider store={store}>
        <GlobalContext.Provider value={mockGlobalContextValue}>
          <Navigation />
        </GlobalContext.Provider>
      </Provider>
    );

    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });

  test('handles afterEsign notification states correctly', async () => {
    const store = createTestStore({
      user: {
        userData: { userID: 'test-user' },
        notifications: [{ id: 1 }],
        pendingResignations: [{ id: 2 }],
        pendingMcaEsign: [],
      },
      config: {
        afterEsignDone: false,
        showNotification: true,
      },
    });

    const mockDispatch = jest.fn();
    jest
      .spyOn(require('react-redux'), 'useDispatch')
      .mockReturnValue(mockDispatch);

    (isUserLogged as jest.Mock).mockReturnValue(true);
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });

  test('renders PaymentPendingHeader for innerPagesWithoutNav routes', async () => {
    const store = createTestStore();

    (useRouter as jest.Mock).mockImplementation(() => ({
      pathname: '/rfq-payment-processing',
      push: jest.fn(),
    }));

    (innerPagesWithoutNav as any).includes = jest.fn().mockReturnValue(true);

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    expect(screen.getByTestId('payment-pending-header')).toBeInTheDocument();

    expect(
      require('../../common/PaymentPendingHeader').default
    ).toHaveBeenCalledWith({ isClickable: true }, expect.anything());

    (useRouter as jest.Mock).mockImplementation(() => ({
      pathname: '/payment-page',
      push: jest.fn(),
    }));

    await act(async () => {
      render(
        <Provider store={store}>
          <GlobalContext.Provider value={mockGlobalContextValue}>
            <Navigation />
          </GlobalContext.Provider>
        </Provider>
      );
    });

    expect(
      require('../../common/PaymentPendingHeader').default
    ).toHaveBeenCalledWith({ isClickable: false }, expect.anything());
  });
});
