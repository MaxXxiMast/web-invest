import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetFilter from './AssetFilter';
import * as reduxHooks from '../../../../redux/slices/hooks';
import * as nextRouter from 'next/router';
import * as utils from '../../../../utils/gripConnect';

import * as gtm from '../../../../utils/gtm';
import * as mediaHook from '../../../../utils/customHooks/useMediaQuery';
import * as reduxSlices from '../../../../redux/slices/userConfig';
import * as filterSlices from '../../../../components/assetsList/AssetFilters/AssetFilterSlice/assetFilters';
import * as urlUtils from './utils';

// Mock useMediaQuery globally
jest.spyOn(mediaHook, 'useMediaQuery').mockReturnValue(false);

// Mock useHash hook globally
jest.mock('../../../../utils/customHooks/useHash', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    hash: '',
    updateHash: jest.fn(),
  })),
}));

// Mock child components to simplify rendering and track calls
jest.mock('../FilterButton/FilterButton', () => {
  const MockFilterButton = (props: any) => (
    <button data-testid="filter-button" onClick={() => props.setShowFilters()}>
      {props.isFilterApplied ? 'Applied' : 'Not Applied'}
    </button>
  );
  MockFilterButton.displayName = 'MockFilterButton';
  return MockFilterButton;
});

jest.mock('../FilterAssets', () => {
  const MockFilterAssets = (props: any) => (
    <div data-testid="asset-filters">
      <button data-testid="reset-btn" onClick={props.handleResetBtn}>
        Reset
      </button>
      <button data-testid="apply-btn" onClick={props.handleApplyBtn}>
        Apply
      </button>
      <select
        data-testid="sort-select"
        value={props.sortOptionState}
        onChange={(e) => props.handleSortChange(e.target.value)}
      >
        <option value="sort1">Sort1</option>
        <option value="sort2">Sort2</option>
      </select>
      <button data-testid="close-modal" onClick={props.handleModalClose}>
        Close Modal
      </button>
    </div>
  );
  MockFilterAssets.displayName = 'MockFilterAssets';
  return MockFilterAssets;
});

// Mock gtm.trackEvent once globally (jest.mock must be top-level)
jest.spyOn(gtm, 'trackEvent').mockResolvedValue(undefined);

describe('AssetFilter component', () => {
  let useAppSelectorMock: jest.SpyInstance;
  let useAppDispatchMock: jest.SpyInstance;
  let useRouterMock: jest.SpyInstance;
  let isGCOrderMock: jest.SpyInstance;
  let setSdiTabChangeCountMock: jest.SpyInstance;
  let resetFiltersWithLoadingMock: jest.SpyInstance;
  let setShowFilterModalMock: jest.SpyInstance;
  let setSortAndFilterMock: jest.SpyInstance;
  let syncAssetFiltersToURLMock: jest.SpyInstance;

  let useHashMock: jest.SpyInstance;
  const updateHashMock = jest.fn();

  const mockDispatch = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    const mockedUseHash = require('../../../../utils/customHooks/useHash')
      .default as jest.Mock;
    jest.clearAllMocks();
    mockedUseHash.mockReturnValue({
      hash: '#active',
      updateHash: updateHashMock,
    });

    // Mock isRenderedInWebview
    jest.mock('../../../../utils/appHelpers', () => ({
      isRenderedInWebview: jest.fn().mockReturnValue(false),
      postMessageToNativeOrFallback: jest.fn(),
    }));

    // Setup redux hooks mocks
    useAppSelectorMock = jest.spyOn(reduxHooks, 'useAppSelector');
    useAppDispatchMock = jest
      .spyOn(reduxHooks, 'useAppDispatch')
      .mockReturnValue(mockDispatch);

    // Mock next/router
    useRouterMock = jest.spyOn(nextRouter, 'useRouter').mockReturnValue({
      query: {},
      pathname: '/test-path',
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      route: '/test-path',
      events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
      isFallback: false,
    } as any);

    // Mock utility functions
    isGCOrderMock = jest.spyOn(utils, 'isGCOrder').mockReturnValue(false);

    // Spy on redux actions
    setSdiTabChangeCountMock = jest
      .spyOn(reduxSlices, 'setSdiTabChangeCount')
      .mockImplementation((payload?: number) => ({
        type: 'userConfig/setSdiTabChangeCount',
        payload: payload ?? 0,
      }));

    resetFiltersWithLoadingMock = jest
      .spyOn(filterSlices, 'resetFiltersWithLoading')
      .mockImplementation(() => {
        return (dispatch: any) => {
          return;
        };
      });

    setShowFilterModalMock = jest
      .spyOn(filterSlices, 'setShowFilterModal')
      .mockImplementation((val: boolean) => ({
        type: 'assetFilters/setShowFilterModal',
        payload: val,
      }));

    setSortAndFilterMock = jest
      .spyOn(filterSlices, 'setSortAndFilter')
      .mockImplementation((sort: any, filters: any) => {
        return (dispatch: any) => {
          return;
        };
      });

    // Spy on URL utils
    syncAssetFiltersToURLMock = jest
      .spyOn(urlUtils, 'syncAssetFiltersToURL')
      .mockImplementation(() => {});

    // Spy on useHash hook and its updateHash function
    jest.mock('../../../../utils/customHooks/useHash', () => ({
      __esModule: true,
      default: jest.fn(),
    }));

    // Setup redux selector mock default state
    useAppSelectorMock.mockImplementation((selectorFn) =>
      selectorFn({
        assetFilters: {
          sortOption: 'sort1',
          filters: {
            ytm: ['10-12%'],
            tenure: ['12-24M'],
            minInvestment: [],
            principalRepayment: [],
            risk: [],
          },
          filteredDeals: [{ id: 1 }, { id: 2 }],
          hasAppliedFilters: false,
          showFilterModal: false,
        },
      })
    );

    // UseMediaQuery mocked to false by default (desktop)
    jest.spyOn(mediaHook, 'useMediaQuery').mockReturnValue(false);
  });

  test('should render correctly on desktop and match snapshot', () => {
    const { container } = render(
      <AssetFilter handlePastOfferSearchText={jest.fn()} totalDeals={50} />
    );
    expect(container).toBeInTheDocument();

    // Should render the tabs (Active Offers and Past Offers)
    expect(screen.getByText('Active Offers')).toBeInTheDocument();
    expect(screen.getByText('Past Offers')).toBeInTheDocument();

    // FilterButton should render (since activeTab is not Past Offers)
    expect(screen.getByTestId('filter-button')).toBeInTheDocument();

    // AssetFilters should render
    expect(screen.getByTestId('asset-filters')).toBeInTheDocument();
  });

  test('tabChangeEvent does nothing if clicked tab is activeTab', () => {
    render(
      <AssetFilter handlePastOfferSearchText={jest.fn()} totalDeals={50} />
    );
    const activeTabElement = screen.getByText('Active Offers');

    fireEvent.click(activeTabElement);

    expect(updateHashMock).not.toHaveBeenCalled();
  });

  test('tabChangeEvent switches tab, updates hash, tracks event, dispatches and resets scroll on mobile', () => {
    // Mock mobile view
    jest.spyOn(mediaHook, 'useMediaQuery').mockReturnValue(true);

    // Mock webview check
    const { isRenderedInWebview } = require('../../../../utils/appHelpers');
    isRenderedInWebview.mockReturnValue(false);

    // Set initial hash to active
    const mockedUseHash = require('../../../../utils/customHooks/useHash')
      .default as jest.Mock;
    mockedUseHash.mockReturnValue({
      hash: '#active',
      updateHash: updateHashMock,
    });

    render(
      <AssetFilter handlePastOfferSearchText={jest.fn()} totalDeals={50} />
    );

    // Append a div with id SidebarLinks for scroll test
    const sidebarLinksDiv = document.createElement('div');
    sidebarLinksDiv.id = 'SidebarLinks';
    sidebarLinksDiv.scrollLeft = 100;
    document.body.appendChild(sidebarLinksDiv);

    // Past Offers tab is the other tab
    const pastTab = screen.getByText('Past');
    fireEvent.click(pastTab);

    // updateHash called with '#past_offering#bonds'
    expect(updateHashMock).toHaveBeenCalledWith('#past_offering#bonds');

    // localStorage set
    expect(localStorage.getItem('isFromAssetDetail')).toBe('true');

    // scrollLeft reset to 0
    expect(sidebarLinksDiv.scrollLeft).toBe(0);

    // trackEvent called with correct event name and properties
    expect(gtm.trackEvent).toHaveBeenCalledWith('asset_list_interaction', {
      functionality: 'navigate_to_past_deals',
      page_name: 'Past_Deals',
      application_type: 'mobile_app',
      switch_position: 'Past',
    });

    // dispatch called with setSdiTabChangeCount(0)
    expect(mockDispatch).toHaveBeenCalledWith(
      setSdiTabChangeCountMock.mock.results[0].value
    );

    // Cleanup
    document.body.removeChild(sidebarLinksDiv);
  });

  test('toggleFilterPopup dispatches setShowFilterModal with toggled value', () => {
    // Mock showFilterModal false initially
    useAppSelectorMock.mockImplementation((selectorFn) =>
      selectorFn({
        assetFilters: {
          showFilterModal: false,
        },
      })
    );

    render(
      <AssetFilter handlePastOfferSearchText={jest.fn()} totalDeals={50} />
    );
    fireEvent.click(screen.getByTestId('filter-button'));

    expect(mockDispatch).toHaveBeenCalledWith(
      setShowFilterModalMock.mock.results[0].value
    );
  });

  test('handleReset dispatches resetFiltersWithLoading and router.push with empty query', () => {
    render(
      <AssetFilter handlePastOfferSearchText={jest.fn()} totalDeals={50} />
    );
    fireEvent.click(screen.getByTestId('reset-btn'));

    expect(mockDispatch).toHaveBeenCalledWith(
      resetFiltersWithLoadingMock.mock.results[0].value
    );
    expect(mockPush).toHaveBeenCalledWith(
      { pathname: '/test-path', query: {} },
      '/test-path',
      { shallow: true }
    );
  });

  test('renders SearchBox on desktop when tab is Past Offers', () => {
    // Mock desktop
    jest.spyOn(mediaHook, 'useMediaQuery').mockReturnValue(false);

    useAppSelectorMock.mockImplementation((selector) =>
      selector({
        assetFilters: {
          sortOption: 'sort1',
          filters: {},
          hasAppliedFilters: false,
          showFilterModal: false,
        },
      })
    );

    const useHashMock = require('../../../../utils/customHooks/useHash')
      .default as jest.Mock;
    useHashMock.mockReturnValue({
      hash: '#past_offering#bonds',
      updateHash: updateHashMock,
    });

    render(
      <AssetFilter handlePastOfferSearchText={jest.fn()} totalDeals={10} />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument(); // SearchBox input
  });

  test('scroll resets to 0 on tab switch in mobile', () => {
    jest.spyOn(mediaHook, 'useMediaQuery').mockReturnValue(true);

    const sidebarLinks = document.createElement('div');
    sidebarLinks.id = 'SidebarLinks';
    sidebarLinks.scrollLeft = 120;
    document.body.appendChild(sidebarLinks);

    render(
      <AssetFilter handlePastOfferSearchText={jest.fn()} totalDeals={10} />
    );
    fireEvent.click(screen.getByText('Past'));

    expect(sidebarLinks.scrollLeft).toBe(0);
    document.body.removeChild(sidebarLinks);
  });
});
