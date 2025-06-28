import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AssetDetailsFold from '../AssetDetailsFold';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('../../../redux/slices/hooks', () => ({
  __esModule: true,
  useAppSelector: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  useSearchParams: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(),
}));

jest.mock('../../assetsList/partnerLogo', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="partner-logo">Partner Logo</div>),
}));

jest.mock('../../primitives/BackBtn/BackBtn', () => ({
  __esModule: true,
  default: jest.fn(({ handleBackEvent }) => (
    <button data-testid="back-btn" onClick={handleBackEvent}>
      Back
    </button>
  )),
}));

jest.mock('../../primitives/MaterialModalPopup', () => ({
  __esModule: true,
  default: jest.fn(({ children, showModal, handleModalClose }) =>
    showModal ? (
      <div data-testid="modal">
        {children}
        <button data-testid="close-modal" onClick={handleModalClose}>
          Close
        </button>
      </div>
    ) : null
  ),
}));

jest.mock('../ShareDealDetails', () => ({
  __esModule: true,
  default: jest.fn(() => (
    <div data-testid="share-deal-details">Share Deal Details</div>
  )),
}));

jest.mock('../../primitives/PoweredByGrip', () => ({
  __esModule: true,
  default: jest.fn(() => (
    <div data-testid="powered-by-grip">Powered By Grip</div>
  )),
}));

jest.mock('../../Ai-assist/AiAssist', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="ai-assist">AI Assist</div>),
}));

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  __esModule: true,
  useMediaQuery: jest.fn(),
}));

jest.mock('../../../utils/asset', () => ({
  __esModule: true,
  getMaturityDate: jest.fn(),
  getMaturityMonths: jest.fn(),
  getRepaymentCycle: jest.fn(),
}));

jest.mock('../../../utils/financeProductTypes', () => ({
  __esModule: true,
  isAssetBonds: jest.fn(),
  isAssetStartupEquity: jest.fn(),
  isHighYieldFd: jest.fn(),
}));

jest.mock('../../../utils/gripConnect', () => ({
  __esModule: true,
  isGCOrder: jest.fn(),
}));

jest.mock('../../../utils/investment', () => ({
  __esModule: true,
  getTotalAmountPaybale: jest.fn(),
}));

jest.mock('../../../utils/number', () => ({
  __esModule: true,
  roundOff: jest.fn(),
}));

jest.mock('../../../utils/appHelpers', () => ({
  __esModule: true,
  isRenderedInWebview: jest.fn(),
  postMessageToNativeOrFallback: jest.fn(),
}));

jest.mock('../../../api/assets', () => ({
  __esModule: true,
  handleAssetCalculation: jest.fn(),
}));

jest.mock('../../../redux/slices/monthlyCard', () => ({
  __esModule: true,
  setShowMobileMonthlyPlan: jest.fn(),
}));

import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../redux/slices/hooks';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import {
  getMaturityDate,
  getMaturityMonths,
  getRepaymentCycle,
} from '../../../utils/asset';
import {
  isAssetBonds,
  isAssetStartupEquity,
  isHighYieldFd,
} from '../../../utils/financeProductTypes';
import { isGCOrder } from '../../../utils/gripConnect';
import { getTotalAmountPaybale } from '../../../utils/investment';
import { roundOff } from '../../../utils/number';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../../utils/appHelpers';
import { handleAssetCalculation } from '../../../api/assets';
import { setShowMobileMonthlyPlan } from '../../../redux/slices/monthlyCard';

describe('AssetDetailsFold', () => {
  const mockDispatch = jest.fn();
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockSearchParamsGet = jest.fn();

  const createMockStore = (stateOverrides = {}) => {
    return configureStore({
      reducer: {
        assets: () => ({
          selectedAsset: {
            id: '1',
            desc: 'Test Asset',
            tenure: 12,
            irr: 10.5,
            bonds: { preTaxYtm: 11.2 },
            assetMappingData: {
              calculationInputFields: {
                tenure: 12,
                tenureType: 'months',
                minTxnAmount: 1000,
                maxInterest: 8.5,
                preTaxYtm: 9.5,
                irr: 10.0,
              },
            },
          },
        }),
        monthlyCard: () => ({
          units: 10,
        }),
        gcConfig: () => ({
          configData: {
            themeConfig: {
              pages: {
                assetDetail: {
                  hideBackArrow: false,
                },
              },
            },
          },
        }),
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      const mockState = {
        assets: {
          selectedAsset: {
            id: '1',
            desc: 'Test Asset',
            tenure: 12,
            irr: 10.5,
            bonds: { preTaxYtm: 11.2 },
            assetMappingData: {
              calculationInputFields: {
                tenure: 12,
                tenureType: 'months',
                minTxnAmount: 1000,
                maxInterest: 8.5,
                preTaxYtm: 9.5,
                irr: 10.0,
              },
            },
          },
        },
        monthlyCard: { units: 10 },
        gcConfig: {
          configData: {
            themeConfig: {
              pages: {
                assetDetail: { hideBackArrow: false },
              },
            },
          },
        },
      };
      return selector(mockState);
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      query: { value: ['test-asset-id'] },
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockSearchParamsGet,
    });
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    (isGCOrder as jest.Mock).mockReturnValue(false);
    (isAssetBonds as jest.Mock).mockReturnValue(false);
    (isAssetStartupEquity as jest.Mock).mockReturnValue(false);
    (isHighYieldFd as jest.Mock).mockReturnValue(false);
    (getRepaymentCycle as jest.Mock).mockReturnValue('Monthly');
    (getMaturityDate as jest.Mock).mockReturnValue('2024-12-31');
    (getMaturityMonths as jest.Mock).mockReturnValue(12);
    (getTotalAmountPaybale as jest.Mock).mockReturnValue(10000);
    (roundOff as jest.Mock).mockReturnValue(10.5);
    (isRenderedInWebview as jest.Mock).mockReturnValue(false);
    (Cookies.get as jest.Mock).mockReturnValue(null);
    (handleAssetCalculation as jest.Mock).mockResolvedValue({
      assetCalcDetails: {
        minLots: 1,
        investmentAmount: 1000,
        stampDuty: 50,
      },
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });

    Object.defineProperty(document, 'getElementById', {
      value: jest.fn(() => ({
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      })),
      writable: true,
    });

    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });

    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  const renderComponent = (storeOverrides = {}) => {
    const store = createMockStore(storeOverrides);
    return render(
      <Provider store={store}>
        <AssetDetailsFold />
      </Provider>
    );
  };

  test('renders PoweredByGrip when isGC is true', () => {
    (isGCOrder as jest.Mock).mockReturnValue(true);
    renderComponent();

    expect(screen.getByTestId('powered-by-grip')).toBeInTheDocument();
  });

  test('does not render back button when GC hideBackArrow is true', () => {
    (isGCOrder as jest.Mock).mockReturnValue(true);

    const mockUseAppSelector = useAppSelector as jest.Mock;
    mockUseAppSelector.mockImplementation((selector) => {
      const mockState = {
        assets: { selectedAsset: {} },
        monthlyCard: { units: 10 },
        gcConfig: {
          configData: {
            themeConfig: {
              pages: {
                assetDetail: { hideBackArrow: true },
              },
            },
          },
        },
      };
      return selector(mockState);
    });

    renderComponent();

    expect(screen.queryByTestId('back-btn')).not.toBeInTheDocument();
  });

  test('handles back navigation from asset detail', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('true');

    renderComponent();
    fireEvent.click(screen.getByTestId('back-btn'));

    expect(mockBack).toHaveBeenCalled();
  });

  test('handles back navigation from discover', () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'isFromDiscover') return 'true';
      return null;
    });

    renderComponent();
    fireEvent.click(screen.getByTestId('back-btn'));

    expect(mockPush).toHaveBeenCalledWith('/discover');
  });

  test('handles back navigation from discover with filter params', () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === 'isFromDiscover') return 'true';
      return null;
    });
    mockSearchParamsGet.mockImplementation((param) => {
      if (param === 'source') return 'discover-filter';
      if (param === 'return-bracket') return '8-12';
      if (param === 'tenure-bracket') return '1-2';
      return null;
    });

    renderComponent();
    fireEvent.click(screen.getByTestId('back-btn'));

    expect(mockPush).toHaveBeenCalledWith(
      '/discover?focus=filter&return-bracket=8-12&tenure-bracket=1-2'
    );
  });

  test('handles default navigation to assets', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

    renderComponent();
    fireEvent.click(screen.getByTestId('back-btn'));

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'isFromAssetDetail',
      'true'
    );
    expect(mockPush).toHaveBeenCalledWith('/assets');
  });

  test('opens share modal when not in webview', async () => {
    (isRenderedInWebview as jest.Mock).mockReturnValue(false);
    (Cookies.get as jest.Mock).mockReturnValue(null);

    renderComponent();

    const shareButton = screen.getByTitle('Share Deal');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('share-deal-details')).toBeInTheDocument();
    });
  });

  test('posts message to native when in webview', async () => {
    (isRenderedInWebview as jest.Mock).mockReturnValue(true);

    renderComponent();

    const shareButton = screen.getByTitle('Share Deal');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(postMessageToNativeOrFallback).toHaveBeenCalledWith('shareDeal', {
        data: expect.objectContaining({
          dealName: 'Test Asset',
          minInvestmentAmount: 10000,
          irr: 10.5,
          tenure: 12,
        }),
      });
    });
  });

  test('handles share deal for high yield FD', async () => {
    (isHighYieldFd as jest.Mock).mockReturnValue(true);
    (isRenderedInWebview as jest.Mock).mockReturnValue(true);

    renderComponent();

    const shareButton = screen.getByTitle('Share Deal');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(postMessageToNativeOrFallback).toHaveBeenCalledWith('shareDeal', {
        data: expect.objectContaining({
          minInvestmentAmount: 1000,
          tenure: '12 months',
          irr: 8.5,
        }),
      });
    });
  });

  test('closes share modal', async () => {
    renderComponent();

    const shareButton = screen.getByTitle('Share Deal');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('close-modal'));

    expect(mockDispatch).toHaveBeenCalledWith(setShowMobileMonthlyPlan(false));
  });

  describe('Scroll Event Handling', () => {
    let mockStickyHeaderElement;
    let scrollHandler;

    beforeEach(() => {
      mockStickyHeaderElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      };

      (document.getElementById as jest.Mock).mockImplementation((id) => {
        if (id === 'StickyHeaderRef') {
          return mockStickyHeaderElement;
        }
        if (id === 'NavigationMain') {
          return {
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
            },
          };
        }
        return null;
      });

      (window.addEventListener as jest.Mock).mockImplementation(
        (event, handler) => {
          if (event === 'scroll') {
            scrollHandler = handler;
          }
        }
      );
    });

    test('handlePartnerLogo shows partner logo when scrollY > 95 on mobile', () => {
      (useMediaQuery as jest.Mock).mockReturnValue(true);

      renderComponent();

      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });

      if (scrollHandler) {
        scrollHandler();
      }

      expect(window.addEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
    });

    test('handlePartnerLogo shows partner logo when scrollY > 80 on desktop', () => {
      (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop

      renderComponent();

      Object.defineProperty(window, 'scrollY', { value: 85, writable: true });

      if (scrollHandler) {
        scrollHandler();
      }

      expect(window.addEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
    });

    test('handlePartnerLogo removes StickyHeaderBg class when scrollY <= 50', () => {
      renderComponent();

      Object.defineProperty(window, 'scrollY', { value: 30, writable: true });

      if (scrollHandler) {
        scrollHandler();
      }

      expect(mockStickyHeaderElement.classList.remove).toHaveBeenCalledWith(
        'StickyHeaderBg'
      );
    });
  });

  describe('Navigation Element Styling (checkNavEle)', () => {
    let mockNavElement;

    beforeEach(() => {
      mockNavElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      };

      jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
        callback();
        return 123 as any;
      });

      jest.spyOn(global, 'clearTimeout').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('checkNavEle adds WhiteBg class to NavigationMain element', () => {
      (document.getElementById as jest.Mock).mockImplementation((id) => {
        if (id === 'NavigationMain') {
          return mockNavElement;
        }
        return null;
      });

      renderComponent();

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
      expect(mockNavElement.classList.add).toHaveBeenCalledWith('WhiteBg');
    });

    test('checkNavEle handles missing NavigationMain element gracefully', () => {
      (document.getElementById as jest.Mock).mockImplementation((id) => {
        if (id === 'NavigationMain') {
          return null;
        }
        return mockNavElement;
      });

      expect(() => {
        renderComponent();
      }).not.toThrow();

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
    });
  });

  test('applies FD asset header class for high yield FD', () => {
    (isHighYieldFd as jest.Mock).mockReturnValue(true);

    const { container } = renderComponent();

    expect(container.querySelector('.FDAssetHeader')).toBeInTheDocument();
  });

  test('renders repayment cycle for bonds', () => {
    (isAssetBonds as jest.Mock).mockReturnValue(true);
    (getRepaymentCycle as jest.Mock).mockReturnValue('Quarterly');

    renderComponent();

    expect(getRepaymentCycle).toHaveBeenCalled();
  });

  test('handles missing selectedAsset gracefully', () => {
    const mockUseAppSelector = useAppSelector as jest.Mock;
    mockUseAppSelector.mockImplementation((selector) => {
      const mockState = {
        assets: { selectedAsset: null },
        monthlyCard: { units: 0 },
        gcConfig: null,
      };
      return selector(mockState);
    });

    expect(() => renderComponent()).not.toThrow();
  });
});
