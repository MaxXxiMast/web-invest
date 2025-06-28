// NotifyMeButton.test.tsx
import {
  fireEvent,
  screen,
  waitFor,
  act,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { getInvestNowButtonStatus } from './utils';
import { getOverallDefaultKycStatus } from '../../../utils/discovery';
import { getMarketStatus } from '../../../utils/marketTime';
import NotifyMeButton from '.';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React, { ReactElement } from 'react';

// Mock reducers for testing
const createMockReducer = (initialState: any = {}) => {
  return (state = initialState, action) => {
    // Handle specific actions that are necessary for your tests
    if (action.type === 'monthlyCard/setNotifyMeButtonStatus') {
      return {
        ...state,
        notifyMeButtonStatus: {
          ...state.notifyMeButtonStatus,
          ...action.payload,
        },
      };
    }
    if (action.type === 'monthlyCard/setSubmitLoading') {
      return {
        ...state,
        submitLoading: action.payload,
      };
    }
    return state;
  };
};

// Create a function to generate a test store with customizable initial state
export function setupStore(preloadedState: any = {}) {
  return configureStore({
    reducer: {
      user: createMockReducer(preloadedState.user || {}),
      config: createMockReducer(preloadedState.config || {}),
      assets: createMockReducer(preloadedState.assets || {}),
      userConfig: createMockReducer(preloadedState.userConfig || {}),
      monthlyCard: createMockReducer(preloadedState.monthlyCard || {}),
    },
    preloadedState,
  });
}

// Custom render function with Redux provider
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock the required dependencies
jest.mock('./utils', () => ({
  getInvestNowButtonStatus: jest.fn(),
}));

jest.mock('../../../utils/discovery', () => ({
  StatusValues: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
  },
  getOverallDefaultKycStatus: jest.fn(),
}));

jest.mock('../../../utils/marketTime', () => ({
  getMarketStatus: jest.fn(),
}));

jest.mock('../../../utils/string', () => ({
  handleExtraProps: jest.fn((className) => className || ''),
}));

describe('NotifyMeButton', () => {
  const handleSubmitClick = jest.fn();
  const handleKycContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getInvestNowButtonStatus as jest.Mock).mockReturnValue({
      isSubmitDisabled: false,
      message: null,
    });
    (getOverallDefaultKycStatus as jest.Mock).mockReturnValue('APPROVED');
    (getMarketStatus as jest.Mock).mockReturnValue('open');
  });

  const initialState = {
    config: {
      marketTiming: {
        marketStartTime: '09:00',
        marketClosingTime: '16:00',
        isMarketOpenToday: true,
      },
    },
    user: {
      kycConfigStatus: {
        default: {
          isFilteredKYCComplete: true,
        },
      },
    },
    userConfig: {
      debarmentData: null,
    },
    assets: {
      selectedAsset: {
        isRfq: false,
      },
    },
    monthlyCard: {
      submitLoading: false,
      notifyMeButtonStatus: {
        isDisabled: false,
        message: null,
        buttonText: 'Invest Now',
        triggerNotifyMeButton: false,
      },
    },
  };

  const renderComponent = (customState = {}, props = {}) => {
    const mergedState = { ...initialState };
    // Deep merge the custom state
    Object.keys(customState).forEach((key) => {
      mergedState[key] = {
        ...mergedState[key],
        ...customState[key],
      };
    });

    return renderWithProviders(
      <NotifyMeButton
        disabled={false}
        handleSubmitClick={handleSubmitClick}
        handleKycContinue={handleKycContinue}
        id="notify-button"
        {...props}
      />,
      { preloadedState: mergedState }
    );
  };

  it('renders the button with correct text when KYC is complete', async () => {
    await act(async () => {
      renderComponent();
    });
    expect(screen.getByText('Invest Now')).toBeInTheDocument();
    expect(
      screen.queryByText('KYC verification pending')
    ).not.toBeInTheDocument();
  });

  it('renders the button with Complete KYC text when KYC is not complete', async () => {
    await act(async () => {
      renderComponent({
        user: {
          kycConfigStatus: {
            default: {
              isFilteredKYCComplete: false,
            },
          },
        },
      });
    });
    expect(screen.getByText('Complete KYC')).toBeInTheDocument();
  });

  it('displays UserKycStatus component when there is a message', async () => {
    (getInvestNowButtonStatus as jest.Mock).mockReturnValue({
      isSubmitDisabled: true,
      message: 'KYC verification pending',
    });
    await act(async () => {
      renderComponent();
    });
    expect(screen.getByText('KYC verification pending')).toBeInTheDocument();
  });

  it('calls handleKycContinue when button is clicked and KYC is not complete', async () => {
    await act(async () => {
      renderComponent({
        user: {
          kycConfigStatus: {
            default: {
              isFilteredKYCComplete: false,
            },
          },
        },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(handleKycContinue).toHaveBeenCalled();
    expect(handleSubmitClick).not.toHaveBeenCalled();
  });

  it('calls handleSubmitClick when button is clicked and KYC is complete', async () => {
    (getMarketStatus as jest.Mock).mockReturnValue('open');
    (getOverallDefaultKycStatus as jest.Mock).mockReturnValue('APPROVED');

    await act(async () => {
      renderComponent();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(handleSubmitClick).toHaveBeenCalledWith(false, 'APPROVED');
    expect(handleKycContinue).not.toHaveBeenCalled();
  });

  it('calls handleSubmitClick with correct parameters when market is closed', async () => {
    (getMarketStatus as jest.Mock).mockReturnValue('closed');
    (getOverallDefaultKycStatus as jest.Mock).mockReturnValue('APPROVED');

    await act(async () => {
      renderComponent();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(handleSubmitClick).toHaveBeenCalledWith(true, 'APPROVED');
  });

  it('disables the button when disabled prop is true', async () => {
    await act(async () => {
      renderComponent({}, { disabled: true });
    });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables the button when isSubmitDisabled is true', async () => {
    (getInvestNowButtonStatus as jest.Mock).mockReturnValue({
      isSubmitDisabled: true,
      message: null,
    });

    await act(async () => {
      renderComponent();
    });

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls handleButtonClick when triggerNotifyMeButton is true', async () => {
    let component;

    await act(async () => {
      component = renderComponent({
        monthlyCard: {
          notifyMeButtonStatus: {
            triggerNotifyMeButton: true,
          },
        },
      });
    });

    await waitFor(() => {
      expect(handleSubmitClick).toHaveBeenCalledWith(false, 'APPROVED');
    });
  });

  it('applies className prop to Button component', async () => {
    await act(async () => {
      renderComponent({}, { className: 'test-class' });
    });
    expect(screen.getByRole('button')).toHaveClass('test-class');
  });

  it('passes id prop to Button component', async () => {
    await act(async () => {
      renderComponent({}, { id: 'custom-id' });
    });
    expect(screen.getByRole('button')).toHaveAttribute('id', 'custom-id');
  });

  it('handles case when marketTiming is undefined', async () => {
    await act(async () => {
      renderComponent({
        config: {
          marketTiming: undefined,
        },
      });
    });

    expect(getMarketStatus).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles case when kycConfigStatus is undefined', async () => {
    await act(async () => {
      renderComponent({
        user: {
          kycConfigStatus: undefined,
        },
      });
    });

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(getInvestNowButtonStatus).not.toHaveBeenCalled();
  });

  it('handles case when selectedAsset is undefined', async () => {
    await act(async () => {
      renderComponent({
        assets: {
          selectedAsset: undefined,
        },
      });
    });

    expect(screen.getByRole('button')).toBeInTheDocument();
    // isRfq should be false when selectedAsset is undefined
    expect(getInvestNowButtonStatus).toHaveBeenCalledWith(
      { isFilteredKYCComplete: true },
      null,
      false
    );
  });
});
