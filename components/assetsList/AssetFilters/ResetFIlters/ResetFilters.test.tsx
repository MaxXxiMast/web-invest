import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResetFilters from './index';
import { useAppDispatch } from '../../../../redux/slices/hooks';
import { useRouter } from 'next/router';
import { trackEvent } from '../../../../utils/gtm';
import { isRenderedInWebview } from '../../../../utils/appHelpers';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// Reducers
import assetFiltersReducer from '../../../../components/assetsList/AssetFilters/AssetFilterSlice/assetFilters';

jest.mock('../../../../redux/slices/hooks', () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('../../../../utils/resolution', () => ({
  isMobile: false,
}));

jest.mock('../../../../utils/appHelpers', () => ({
  isRenderedInWebview: jest.fn(),
}));

const mockDispatch = jest.fn();
const mockPush = jest.fn();

describe('ResetFilters Component', () => {
  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/assets',
      push: mockPush,
    });
    (isRenderedInWebview as jest.Mock).mockReturnValue(false);
    jest.clearAllMocks();
  });

  const createStore = (preloadedState = {}) =>
    configureStore({
      reducer: {
        assetFilters: assetFiltersReducer,
      },
      preloadedState,
    });

  const renderWithStore = (preloadedState: any) => {
    const store = createStore(preloadedState);
    return render(
      <Provider store={store}>
        <ResetFilters productType="Bond" totalCount={10} />
      </Provider>
    );
  };

  it('should not render if hasAppliedFilters is false', () => {
    const preloadedState = {
      assetFilters: {
        hasAppliedFilters: false,
        filteredDeals: [],
      },
    };

    renderWithStore(preloadedState);

    expect(screen.queryByText(/Reset/i)).not.toBeInTheDocument();
  });

  it('should render and show correct count', () => {
    const preloadedState = {
      assetFilters: {
        hasAppliedFilters: true,
        filteredDeals: [
          { financeProductType: 'Bond' },
          { financeProductType: 'FD' },
          { financeProductType: 'Bond' },
        ],
      },
    };

    renderWithStore(preloadedState);

    expect(screen.getByText('Showing 2 of 10')).toBeInTheDocument();
  });

  it('should dispatch reset and navigate on Reset click', () => {
    const preloadedState = {
      assetFilters: {
        hasAppliedFilters: true,
        filteredDeals: [
          { financeProductType: 'Bond' },
          { financeProductType: 'Bond' },
        ],
      },
    };

    renderWithStore(preloadedState);

    fireEvent.click(screen.getByText('Reset'));

    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(mockPush).toHaveBeenCalledWith(
      { pathname: '/assets', query: {} },
      '/assets#active#bond',
      { shallow: true }
    );
    expect(trackEvent).toHaveBeenCalledWith('asset_list_interaction', {
      functionality: 'reset_button_clicked',
      page_name: 'Asset_List',
      application_type: 'desktop',
    });
  });

});
