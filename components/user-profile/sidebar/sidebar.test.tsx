import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileSidebar from './index';
import * as appHelpers from '../../../utils/appHelpers';
import * as gtm from '../../../utils/gtm';
import * as mediaQuery from '../../../utils/customHooks/useMediaQuery';

// Mock the redux hooks
jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the sidebar array
jest.mock('../utils/sidebar', () => ({
  sidebarArr: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      showInMobile: false,
      gcId: 'dashboard',
    },
    {
      id: 'accountdetails',
      name: 'Account Details',
      icon: 'icons/user-frame.svg',
      gcId: 'accountDetails',
    },
    {
      id: 'mytransactions',
      name: 'My Transactions',
      showInMobile: true,
      gcId: 'mytransactions',
    },
    { id: 'profile', name: 'Profile', showInMobile: true, gcId: 'profile' },
  ],
}));

// Mock the isGCOrder utility
jest.mock('../../../utils/gripConnect', () => ({
  isGCOrder: jest.fn(),
}));

describe('ProfileSidebar Component', () => {
  const mockHandleChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    require('../../../redux/slices/hooks').useAppSelector.mockImplementation(
      (selector) => {
        const state = {
          user: {
            userData: {
              investmentData: {
                Leasing: { investments: true },
                Inventory: { investments: false },
              },
            },
          },
          gcConfig: {
            configData: {
              themeConfig: {
                pages: {
                  profile: {
                    dashboard: true,
                    mytransactions: true,
                    profile: true,
                  },
                },
              },
            },
          },
        };
        return selector(state);
      }
    );

    require('react-redux').useSelector.mockImplementation((selector) => {
      const state = {
        user: {
          userData: {},
        },
      };
      return selector(state);
    });

    // Mock localStorage for app details
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        appVersion: '1.0.0',
        otaVersion: '1.1.0',
        isUpdateRequired: false,
      })
    );

    // Mock mediaQuery hook
    jest.spyOn(mediaQuery, 'useMediaQuery').mockReturnValue(false);

    // Mock isGCOrder
    require('../../../utils/gripConnect').isGCOrder.mockReturnValue(false);
  });

  test('renders with active section highlighted', () => {
    render(
      <ProfileSidebar handleChange={mockHandleChange} active="accountdetails" />
    );

    const accountDetailsItem = screen.getByText('Account Details'); // Assuming this text exists
    expect(accountDetailsItem.closest('.Item')).toHaveClass('Active');
  });

  test('hides transactions item when Leasing and Inventory investments are all false', () => {
    // Mock the sidebar array to include the transactions item
    require('../utils/sidebar').sidebarArr.length = 0;
    require('../utils/sidebar').sidebarArr.push(
      {
        id: 'dashboard',
        name: 'Dashboard',
        showInMobile: false,
        gcId: 'dashboard',
      },
      {
        id: 'mytransactions',
        name: 'My Transactions',
        showInMobile: true,
        gcId: 'mytransactions',
      }
    );

    require('../../../redux/slices/hooks').useAppSelector.mockImplementation(
      (selector) => {
        const state = {
          user: {
            userData: {
              investmentData: {
                Leasing: { investments: false },
                Inventory: { investments: false },
              },
            },
          },
          gcConfig: {
            configData: {
              themeConfig: {
                pages: {
                  profile: {
                    dashboard: true,
                    mytransactions: true,
                    profile: true,
                  },
                },
              },
            },
          },
        };
        return selector(state);
      }
    );

    render(
      <ProfileSidebar handleChange={mockHandleChange} active="accountdetails" />
    );

    const transactionsItem = screen.queryByText('My Transactions');
    expect(transactionsItem).not.toBeInTheDocument();
  });

  test('filters sidebar items based on GC configuration', () => {
    // Enable GC order
    require('../../../utils/gripConnect').isGCOrder.mockReturnValue(true);

    // Reset sidebar array
    require('../utils/sidebar').sidebarArr.length = 0;
    require('../utils/sidebar').sidebarArr.push(
      {
        id: 'dashboard',
        name: 'Dashboard',
        showInMobile: false,
        gcId: 'dashboard',
      },
      {
        id: 'mytransactions',
        name: 'My Transactions',
        showInMobile: true,
        gcId: 'mytransactions',
      }
    );

    require('../../../redux/slices/hooks').useAppSelector.mockImplementation(
      (selector) => {
        const state = {
          user: {
            userData: {
              investmentData: {
                Leasing: { investments: true },
                Inventory: { investments: false },
              },
            },
          },
          gcConfig: {
            configData: {
              themeConfig: {
                pages: {
                  profile: {
                    dashboard: true,
                    // mytransactions is missing - should filter it out
                  },
                },
              },
            },
          },
        };
        return selector(state);
      }
    );

    render(
      <ProfileSidebar handleChange={mockHandleChange} active="accountdetails" />
    );

    // Dashboard should be present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // My Transactions should be filtered out by GC config
    const transactionsItem = screen.queryByText('My Transactions');
    expect(transactionsItem).not.toBeInTheDocument();
  });

  test('displays app version information when available', () => {
    render(
      <ProfileSidebar handleChange={mockHandleChange} active="accountdetails" />
    );

    expect(screen.getByText(/Current App Version/)).toBeInTheDocument();
    expect(screen.getByText(/\(1\.1\.0\)/)).toBeInTheDocument();
  });

  test('displays app version and OTA version correctly when both are available and OTA version is not "0"', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        appVersion: '2.0.0',
        otaVersion: '2.1.0',
        isUpdateRequired: false,
      })
    );

    render(
      <ProfileSidebar handleChange={mockHandleChange} active="accountdetails" />
    );

    const versionText = screen.getByText(/Current App Version 2.0.0 \(2.1.0\)/);
    expect(versionText).toBeInTheDocument();
  });

  test('displays update button when update is required', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        appVersion: '1.0.0',
        otaVersion: '1.1.0',
        isUpdateRequired: true,
      })
    );

    render(
      <ProfileSidebar handleChange={mockHandleChange} active="accountdetails" />
    );

    const updateButton = screen.getByText('Update Now');
    expect(updateButton).toBeInTheDocument();
  });

  test('triggers app update when update button is clicked', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        appVersion: '1.0.0',
        otaVersion: '1.1.0',
        isUpdateRequired: true,
      })
    );

    // Mock trackEvent and postMessageToNative
    const trackEventSpy = jest.spyOn(gtm, 'trackEvent');
    const postMessageSpy = jest.spyOn(
      appHelpers,
      'postMessageToNativeOrFallback'
    );

    render(
      <ProfileSidebar handleChange={mockHandleChange} active="accountdetails" />
    );

    const updateButton = screen.getByText('Update Now');
    fireEvent.click(updateButton);

    expect(trackEventSpy).toHaveBeenCalledWith('app_update_clicked');
    expect(postMessageSpy).toHaveBeenCalledWith('click_update_app', {});
  });

  test('applies custom className when provided', () => {
    render(
      <ProfileSidebar
        handleChange={mockHandleChange}
        active="accountdetails"
        className="custom-class"
      />
    );

    const sidebar = screen.getByText('Dashboard').closest('.Sidebar');
    expect(sidebar).toHaveClass('custom-class');
  });

  test('loads appDetails from localStorage on mount', () => {
    render(
      <ProfileSidebar handleChange={mockHandleChange} active="accountdetails" />
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('AppDetails');
  });

  test('handles empty gcProfileConfig gracefully', () => {
    require('../../../redux/slices/hooks').useAppSelector.mockImplementation(
      (selector) => {
        const state = {
          user: {
            userData: {
              investmentData: {
                Leasing: { investments: true },
                Inventory: { investments: false },
              },
            },
          },
          gcConfig: {
            configData: {
              themeConfig: {
                pages: {
                  profile: null,
                },
              },
            },
          },
        };
        return selector(state);
      }
    );

    render(
      <ProfileSidebar handleChange={mockHandleChange} active="accountdetails" />
    );

    // Should still render without errors
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('handles missing AppDetails in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <ProfileSidebar handleChange={mockHandleChange} active="accountdetails" />
    );

    // Should not crash and should not show app version info
    expect(screen.queryByText(/Current App Version/)).not.toBeInTheDocument();
  });
});
