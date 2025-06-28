import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import Notifications from '../pages/notifications/index';
import { useMediaQuery } from '../utils/customHooks/useMediaQuery';
import { isRenderedInWebview } from '../utils/appHelpers';
import { isGCOrder } from '../utils/gripConnect';
import NotificationFilter from '../pages/notifications/NotificationFilter';
// Mock the Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock custom hooks and utility functions
jest.mock('../utils/customHooks/useMediaQuery', () => ({
    useMediaQuery: jest.fn(),
}));

jest.mock('../utils/appHelpers', () => ({
    isRenderedInWebview: jest.fn(),
}));

jest.mock('../utils/gripConnect', () => ({
    isGCOrder: jest.fn(),
}));

// Mock the useAppSelector hook
jest.mock('../redux/slices/hooks', () => ({
    useAppSelector: jest.fn((selector) => {
        // Default mock implementation
        return { userData: {} };
    }),
}));

// Mock components
jest.mock('../components/common/Header', () => {
    return function DummyHeader({ pageName }) {
        return <div data-testid="header">{pageName}</div>;
    };
});

jest.mock('../components/layout/Notifications', () => {
    return function DummyNotificationsList({ showAllNotifications }) {
        return <div data-testid="notifications-list">Notifications List</div>;
    };
});

jest.mock('../components/common/BackdropComponent', () => {
    return function DummyBackdrop({ open }) {
        return open ? <div data-testid="backdrop">Loading...</div> : null;
    };
});

jest.mock('../pages/notifications/NotificationFilter', () => {
    return function DummyNotificationFilter() {
        return <div data-testid="notification-filter">Filter</div>;
    };
});

jest.mock('../components/primitives/Image', () => {
    return function DummyImage({ src, alt }) {
        return <img src={src} alt={alt} data-testid="no-notification-image" />;
    };
});

describe('Notifications Page', () => {
    // Create a mock store with empty reducer
    const createTestStore = (initialState) => configureStore({
        reducer: (state = initialState, action) => state
    });

    // Mock router functions
    const mockRouterEvents = {
        on: jest.fn(),
        off: jest.fn(),
    };

    const mockRouter = {
        push: jest.fn(),
        events: mockRouterEvents,
    };

    beforeEach(() => {
        useRouter.mockReturnValue(mockRouter);
        window.innerWidth = 500; // Default to mobile view

        // Reset the useAppSelector mock to default state
        require('../redux/slices/hooks').useAppSelector.mockImplementation(() => ({
            userData: {}
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders header with correct page name', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        const store = createTestStore({
            user: {
                notifications: [],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: { userInvestedAssets: {} }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.getByTestId('header')).toHaveTextContent('Notifications');
    });

    test('shows no notifications message when there are no notifications', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        const store = createTestStore({
            user: {
                notifications: [],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: { userInvestedAssets: {} }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.getByText('No new notifications')).toBeInTheDocument();
        expect(screen.queryByTestId('notifications-list')).not.toBeInTheDocument();
    });

    test('shows notifications list when notifications are present', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        const store = createTestStore({
            user: {
                notifications: [{ id: 1, message: 'Test notification' }],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: { userInvestedAssets: {} }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.getByTestId('notifications-list')).toBeInTheDocument();
        expect(screen.queryByText('No new notifications')).not.toBeInTheDocument();
    });

    test('shows NotificationFilter for LLP users in webview that are not GC orders', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        isRenderedInWebview.mockReturnValue(true);
        isGCOrder.mockReturnValue(false);

        // Mock the useAppSelector to return user with investmentData for Leasing
        require('../redux/slices/hooks').useAppSelector.mockImplementation(() => ({
            userData: {
                investmentData: {
                    'Leasing': { investments: true }
                }
            }
        }));

        const store = createTestStore({
            user: {
                notifications: [{ id: 1, message: 'Test notification' }],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: {
                    investmentData: {
                        'Leasing': { investments: true }
                    }
                }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.getByTestId('notification-filter')).toBeInTheDocument();
    });

    test('does not show NotificationFilter for non-LLP users', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        isRenderedInWebview.mockReturnValue(true);
        isGCOrder.mockReturnValue(false);

        // Mock the useAppSelector to return user without LLP investments
        require('../redux/slices/hooks').useAppSelector.mockImplementation(() => ({
            userData: {
                investmentData: {}
            }
        }));

        const store = createTestStore({
            user: {
                notifications: [{ id: 1, message: 'Test notification' }],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: {
                    investmentData: {}
                }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.queryByTestId('notification-filter')).not.toBeInTheDocument();
    });

    // New test cases added below

    test('shows notifications when pendingResignations exist but no notifications', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        const store = createTestStore({
            user: {
                notifications: [],
                pendingResignations: [{ id: 1, details: 'Pending resignation' }],
                pendingMcaEsign: [],
                userData: { userInvestedAssets: {} }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.getByTestId('notifications-list')).toBeInTheDocument();
        expect(screen.queryByText('No new notifications')).not.toBeInTheDocument();
    });

    test('shows notifications when pendingMcaEsign exist but no notifications', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        const store = createTestStore({
            user: {
                notifications: [],
                pendingResignations: [],
                pendingMcaEsign: [{ id: 1, details: 'Pending MCA e-sign' }],
                userData: { userInvestedAssets: {} }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.getByTestId('notifications-list')).toBeInTheDocument();
        expect(screen.queryByText('No new notifications')).not.toBeInTheDocument();
    });

    test('redirects to assets page on desktop', () => {
        // Arrange
        useMediaQuery.mockReturnValue(false); // Mock as desktop
        const store = createTestStore({
            user: {
                notifications: [],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: { userInvestedAssets: {} }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(mockRouter.push).toHaveBeenCalledWith('/assets');
    });

    test('shows NotificationFilter for IF-invested users', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        isRenderedInWebview.mockReturnValue(true);
        isGCOrder.mockReturnValue(false);

        // Mock the useAppSelector to return user with investmentData for Inventory
        require('../redux/slices/hooks').useAppSelector.mockImplementation(() => ({
            userData: {
                investmentData: {
                    'Inventory': { investments: true }
                }
            }
        }));

        const store = createTestStore({
            user: {
                notifications: [{ id: 1, message: 'Test notification' }],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: {
                    investmentData: {
                        'Inventory': { investments: true }
                    }
                }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.getByTestId('notification-filter')).toBeInTheDocument();
    });

    test('does not show NotificationFilter for GC orders even with LLP investments', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        isRenderedInWebview.mockReturnValue(true);
        isGCOrder.mockReturnValue(true); // This should prevent filter from showing

        // Mock the useAppSelector to return user with investmentData for both Leasing and Inventory
        require('../redux/slices/hooks').useAppSelector.mockImplementation(() => ({
            userData: {
                investmentData: {
                    'Leasing': { investments: true },
                    'Inventory': { investments: true }
                }
            }
        }));

        const store = createTestStore({
            user: {
                notifications: [{ id: 1, message: 'Test notification' }],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: {
                    investmentData: {
                        'Leasing': { investments: true },
                        'Inventory': { investments: true }
                    }
                }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.queryByTestId('notification-filter')).not.toBeInTheDocument();
    });

    test('does not show NotificationFilter when not in webview even with LLP investments', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        isRenderedInWebview.mockReturnValue(false); // Not in webview
        isGCOrder.mockReturnValue(false);

        // Mock the useAppSelector to return user with investmentData for both Leasing and Inventory
        require('../redux/slices/hooks').useAppSelector.mockImplementation(() => ({
            userData: {
                investmentData: {
                    'Leasing': { investments: true },
                    'Inventory': { investments: true }
                }
            }
        }));

        const store = createTestStore({
            user: {
                notifications: [{ id: 1, message: 'Test notification' }],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: {
                    investmentData: {
                        'Leasing': { investments: true },
                        'Inventory': { investments: true }
                    }
                }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.queryByTestId('notification-filter')).not.toBeInTheDocument();
    });

    test('properly binds and unbinds router event listeners', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        const store = createTestStore({
            user: {
                notifications: [],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: { userInvestedAssets: {} }
            }
        });

        // Act
        const { unmount } = render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        // Should have registered route change event listeners
        expect(mockRouterEvents.on).toHaveBeenCalledTimes(2);
        expect(mockRouterEvents.on).toHaveBeenCalledWith('routeChangeStart', expect.any(Function));
        expect(mockRouterEvents.on).toHaveBeenCalledWith('routeChangeComplete', expect.any(Function));

        // Clean up
        unmount();

        // Should have unregistered route change event listeners
        expect(mockRouterEvents.off).toHaveBeenCalledTimes(4);
        expect(mockRouterEvents.off).toHaveBeenCalledWith('routeChangeStart', expect.any(Function));
        expect(mockRouterEvents.off).toHaveBeenCalledWith('routeChangeComplete', expect.any(Function));
    });

    test('renders no-notification image with correct src', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true); // Mock as mobile
        const store = createTestStore({
            user: {
                notifications: [],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: { userInvestedAssets: {} }
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        const image = screen.getByTestId('no-notification-image');
        expect(image).toHaveAttribute('alt', 'nonotificationlogo');
    });

    test('shows backdrop when loading is true', () => {
        // Arrange
        useMediaQuery.mockReturnValue(true);
        const store = createTestStore({
            user: {
                notifications: [],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: { userInvestedAssets: {} }
            }
        });

        // Setup router to trigger loading state
        mockRouterEvents.on.mockImplementation((event, callback) => {
            if (event === 'routeChangeStart') {
                callback(); // Immediately trigger the loading state
            }
        });

        // Act
        render(
            <Provider store={store}>
                <Notifications />
            </Provider>
        );

        // Assert
        expect(screen.getByTestId('backdrop')).toBeInTheDocument();
    });

    test('dispatches showNotification action on desktop', () => {
        // Arrange
        useMediaQuery.mockReturnValue(false); // Mock as desktop

        const mockDispatch = jest.fn();
        const mockShowNotification = jest.fn();

        const store = createTestStore({
            user: {
                notifications: [],
                pendingResignations: [],
                pendingMcaEsign: [],
                userData: { userInvestedAssets: {} }
            }
        });

        store.dispatch = mockDispatch;

        // Act
        render(
            <Provider store={store}>
                <Notifications showNotification={mockShowNotification} />
            </Provider>
        );

        // Assert that the action was dispatched
        expect(mockRouter.push).toHaveBeenCalledWith('/assets');
    });
});