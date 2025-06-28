import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RepaymentStructure from '../repayment-structure';
import * as assetsApi from '../../api/assets';
import * as eventUtils from '../../utils/event';
import * as mediaQueryHook from '../../utils/customHooks/useMediaQuery';
import * as fdUtils from '../../utils/financeProductTypes';

// Mock modules
jest.mock('../../api/assets');
jest.mock('../../utils/event');
jest.mock('../../utils/customHooks/useMediaQuery');
jest.mock('../../utils/financeProductTypes');

// Mock child components
jest.mock('../assetDetails/VisualReturnsModal', () => {
  return function MockVisualReturnsModal() {
    return <div data-testid="visual-returns-modal"></div>;
  };
});

// Reusable mock reducer (no-op reducer)
const mockReducer = (state = {}) => state;

// Extracted mocks
const mockGetFdMetadata = assetsApi.getFdMetadata as jest.Mock;
const mockTrackVisualReturnsClick =
  eventUtils.trackVisualReturnsClick as jest.Mock;
const mockUseMediaQuery = mediaQueryHook.useMediaQuery as jest.Mock;
const mockIsHighYieldFd = fdUtils.isHighYieldFd as jest.Mock;

describe('RepaymentStructure Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMediaQuery.mockReturnValue(false);
    mockIsHighYieldFd.mockReturnValue(false);
    mockGetFdMetadata.mockResolvedValue({
      extraInterestRate: {
        seniorCitizen: { defaultChecked: false },
        women: { defaultChecked: false },
      },
      interestPayout: [
        { value: '12 Months', label: '12 Months' },
        { value: '24 Months', label: '24 Months' },
      ],
    });
  });

  const renderWithStore = (preloadedState: any) => {
    const store = configureStore({
      reducer: {
        assets: mockReducer,
        user: mockReducer,
        fdConfig: mockReducer,
        monthlyCard: (state: Record<string, any> = {}, action) => {
          if (action.type === 'monthlyCard/setStructureShowVisualReturns') {
            return { ...state, structureShowVisualReturns: action.payload };
          }
          if (action.type === 'monthlyCard/setFdParams') {
            return { ...state, fdParams: action.payload };
          }
          return state;
        },
      },
      preloadedState,
    });

    return render(
      <Provider store={store}>
        <RepaymentStructure />
      </Provider>
    );
  };

  test('should not render when no interest or principal values are present', () => {
    renderWithStore({
      assets: {
        selectedAsset: {
          assetID: '123',
          assetMappingData: {
            calculationInputFields: {
              assetInterestReturnFrequency: null,
              assetPrincipalPaymentFrequency: null,
            },
          },
        },
      },
      user: {
        userData: { userID: 'user123' },
      },
      fdConfig: {
        fdInputFieldValue: 10000,
      },
    });

    expect(screen.queryByText('REPAYMENT STRUCTURE')).not.toBeInTheDocument();
  });

  test('should render with interest value only', () => {
    renderWithStore({
      assets: {
        selectedAsset: {
          assetID: '123',
          assetMappingData: {
            calculationInputFields: {
              assetInterestReturnFrequency: 'Monthly',
              assetPrincipalPaymentFrequency: null,
            },
          },
        },
      },
      user: {
        userData: { userID: 'user123' },
      },
      fdConfig: {
        fdInputFieldValue: 10000,
      },
    });

    expect(screen.getByText('REPAYMENT STRUCTURE')).toBeInTheDocument();
    expect(screen.getByText('INTEREST')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.queryByText('PRINCIPAL')).not.toBeInTheDocument();
  });

  test('should render with principal value only', () => {
    renderWithStore({
      assets: {
        selectedAsset: {
          assetID: '123',
          assetMappingData: {
            calculationInputFields: {
              assetInterestReturnFrequency: null,
              assetPrincipalPaymentFrequency: 'On Maturity',
            },
          },
        },
      },
      user: {
        userData: { userID: 'user123' },
      },
      fdConfig: {
        fdInputFieldValue: 10000,
      },
    });

    expect(screen.getByText('REPAYMENT STRUCTURE')).toBeInTheDocument();
    expect(screen.getByText('PRINCIPAL')).toBeInTheDocument();
    expect(screen.getByText('On Maturity')).toBeInTheDocument();
    expect(screen.queryByText('INTEREST')).not.toBeInTheDocument();
  });

  test('should render with both interest and principal values', () => {
    renderWithStore({
      assets: {
        selectedAsset: {
          assetID: '123',
          assetMappingData: {
            calculationInputFields: {
              assetInterestReturnFrequency: 'Quarterly',
              assetPrincipalPaymentFrequency: 'On Maturity',
            },
          },
        },
      },
      user: {
        userData: { userID: 'user123' },
      },
      fdConfig: {
        fdInputFieldValue: 10000,
      },
    });

    expect(screen.getByText('REPAYMENT STRUCTURE')).toBeInTheDocument();
    expect(screen.getByText('INTEREST')).toBeInTheDocument();
    expect(screen.getByText('Quarterly')).toBeInTheDocument();
    expect(screen.getByText('PRINCIPAL')).toBeInTheDocument();
    expect(screen.getByText('On Maturity')).toBeInTheDocument();
  });

  test('should call trackVisualReturnsClick and dispatch setStructureShowVisualReturns when clicking "View Returns Schedule"', () => {
    renderWithStore({
      assets: {
        selectedAsset: {
          assetID: '123',
          assetMappingData: {
            calculationInputFields: {
              assetInterestReturnFrequency: 'Monthly',
              assetPrincipalPaymentFrequency: 'On Maturity',
            },
          },
        },
      },
      user: {
        userData: { userID: 'user123' },
      },
      fdConfig: {
        fdInputFieldValue: 10000,
      },
    });

    fireEvent.click(screen.getByText('View Returns Schedule'));

    expect(mockTrackVisualReturnsClick).toHaveBeenCalledWith({
      asset: expect.anything(),
      userID: 'user123',
      investmentAmount: 10000,
      isMobile: false,
    });

    expect(screen.getByTestId('visual-returns-modal')).toBeInTheDocument();
  });

  test('should fetch FD metadata and dispatch setFdParams for high yield FD', async () => {
    mockIsHighYieldFd.mockReturnValue(true);
    mockGetFdMetadata.mockResolvedValue({
      extraInterestRate: {
        seniorCitizen: { defaultChecked: true },
        women: { defaultChecked: false },
      },
      interestPayout: [
        { value: '12 Months', label: '12 Months' },
        { value: '24 Months', label: '24 Months' },
      ],
    });

    renderWithStore({
      assets: {
        selectedAsset: {
          assetID: '123',
          assetMappingData: {
            calculationInputFields: {
              assetInterestReturnFrequency: 'Monthly',
              assetPrincipalPaymentFrequency: 'On Maturity',
            },
          },
        },
      },
      user: {
        userData: { userID: 'user123' },
      },
      fdConfig: {
        fdInputFieldValue: 10000,
      },
    });

    await waitFor(() => {
      expect(mockGetFdMetadata).toHaveBeenCalledWith('123');
    });
  });

  test('should handle mobile view correctly', () => {
    mockUseMediaQuery.mockReturnValue(true);

    renderWithStore({
      assets: {
        selectedAsset: {
          assetID: '123',
          assetMappingData: {
            calculationInputFields: {
              assetInterestReturnFrequency: 'Monthly',
              assetPrincipalPaymentFrequency: 'On Maturity',
            },
          },
        },
      },
      user: {
        userData: { userID: 'user123' },
      },
      fdConfig: {
        fdInputFieldValue: 10000,
      },
    });

    fireEvent.click(screen.getByText('View Returns Schedule'));

    expect(mockTrackVisualReturnsClick).toHaveBeenCalledWith({
      asset: expect.anything(),
      userID: 'user123',
      investmentAmount: 10000,
      isMobile: true,
    });
  });
});
