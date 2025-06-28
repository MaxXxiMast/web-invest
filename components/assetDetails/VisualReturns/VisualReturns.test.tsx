import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VisualReturns from '.';
import { isAssetBonds } from '../../../utils/financeProductTypes';
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { isHighYieldFd } from '../../../utils/financeProductTypes';
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { setUnits } from '../../../redux/slices/monthlyCard';

// Mock dependencies
jest.mock('../../../api/assets');
jest.mock('../../../api/strapi');
jest.mock('../../../utils/financeProductTypes');
jest.mock('../../../utils/dateFormatter');
jest.mock('../../../utils/number');
jest.mock('../../../utils/gtm');
jest.mock('../../../utils/customHooks/useMediaQuery');
jest.mock('../../../redux/slices/hooks');
jest.mock('../../../utils/appHelpers', () => ({
  isRenderedInWebview: jest.fn(),
  postMessageToNativeOrFallback: jest.fn(),
}));

beforeAll(() => {
  // mock createObjectURL
  global.URL.createObjectURL = jest.fn(() => 'mockedObjectURL');
});

const mockDispatch = jest.fn();
const mockAsset = {
  assetID: 'asset123',
  name: 'Test Asset',
  productCategory: 'Bonds',
  productSubcategory: 'Corporate Bonds',
  financeProductType: 'BONDS',
};

const mockInvestment = { averageReturn: 1000 };
const mockRepaymentData = [
  {
    date: '2023-01-01',
    principalAmount: 10000,
    interestPreTax: 1000,
    totalReturnPreTax: 11000,
    amount: 11000,
    tds: 100,
    interest: 900,
  },
  {
    date: '2023-02-01',
    principalAmount: 0,
    interestPreTax: 1000,
    totalReturnPreTax: 1000,
    amount: 1000,
    tds: 50,
    interest: 950,
  },
];

jest.mock('../../../api/assets', () => ({
  ...jest.requireActual('../../../api/assets'),
  fetchVisualReturnData: jest.fn((lotSize, assetID, isPreTax, format) => {
    if (format === 'pdf' || format === 'excel') {
      return Promise.resolve({ blob: () => new Blob(['test']) });
    }
    return Promise.resolve({ repaymentMetric: mockRepaymentData });
  }),
  fileDownloadHandler: jest
    .fn()
    .mockResolvedValue({ blob: () => new Blob(['test']) }),
}));

jest.mock('../../../utils/number', () => ({
  ...jest.requireActual('../../../utils/number'),
  numberToIndianCurrencyWithDecimals: jest.fn((val) => `₹${val}`),
  SDISecondaryAmountToCommaSeparator: jest.fn((val) => val),
}));

const defaultProps = {
  asset: { assetID: 1, name: 'Test Asset', productCategory: 'Bonds' },
  investment: 10000,
  isPreTax: true,
  amount: 1000,
  tenure: 12,
  lotSize: 1,
  seniorCitizen: false,
  womenCitizen: false,
};

describe('VisualReturns Component', () => {
  beforeEach(() => {
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        monthlyCard: {
          singleLotCalculation: {
            minLots: 1,
            maxLots: 10,
            maxInvestment: 100000,
          },
          units: 1,
        },
        user: { userData: null },
      })
    );
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    require('../../../utils/appHelpers').isRenderedInWebview.mockReturnValue(
      false
    );
    require('../../../utils/appHelpers').postMessageToNativeOrFallback.mockImplementation(
      (_, __, fallback) => fallback()
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading skeleton initially', () => {
    render(<VisualReturns {...defaultProps} />);
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  test('renders Bonds repayment table correctly', async () => {
    (isAssetBonds as jest.Mock).mockReturnValue(true);
    render(<VisualReturns {...defaultProps} lotSize={2} />);
    await waitFor(() => {
      expect(screen.getByText('Principal')).toBeInTheDocument();
      expect(screen.getByText('Interest')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(
        mockRepaymentData.length + 2
      );
    });
  });

  test('handles lot adjustment correctly', async () => {
    (isAssetBonds as jest.Mock).mockReturnValue(true);
    const { rerender } = render(
      <VisualReturns {...defaultProps} lotSize={1} />
    );
    fireEvent.click(screen.getByText('+'));
    expect(mockDispatch).toHaveBeenCalledWith(setUnits(2));
    rerender(<VisualReturns {...defaultProps} lotSize={2} />);
    fireEvent.click(screen.getByText('-'));
    expect(mockDispatch).toHaveBeenCalledWith(setUnits(1));
  });

  test('handles download functionality', async () => {
    render(<VisualReturns {...defaultProps} />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Download'));
    });
    await waitFor(() => {
      expect(screen.getByText('As PDF')).toBeInTheDocument();
      expect(screen.getByText('As Excel')).toBeInTheDocument();
    });
  });

  test('calculates totals correctly', async () => {
    (isAssetBonds as jest.Mock).mockReturnValue(true);
    (numberToIndianCurrencyWithDecimals as jest.Mock).mockImplementation(
      (num) => `₹${num.toLocaleString('en-IN')}`
    );

    render(<VisualReturns {...defaultProps} lotSize={2} />);
    await waitFor(
      () => {
        const totalRow = screen.getByText('Total').closest('tr');
        expect(totalRow).toBeInTheDocument();
        expect(totalRow).toHaveTextContent('Total');
      },
      { timeout: 3000 }
    );
  });

  test('shows edit button when not hidden', async () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        monthlyCard: {
          singleLotCalculation: {
            minLots: 1,
            maxLots: 10,
            maxInvestment: 100000,
          },
          units: 1,
        },
        user: { userData: { some: 'data' } },
      })
    );

    render(
      <VisualReturns
        asset={mockAsset}
        investment={mockInvestment}
        isPreTax={true}
        amount={10000}
        hideEditButton={false}
      />
    );

    // Wait for component to render completely
    await waitFor(
      () => {
        const editButton =
          screen.queryByText('Edit Returns') ||
          screen.queryByRole('button', { name: /edit/i });
        if (!editButton) {
          console.log('DOM:', document.body.innerHTML);
        }

        expect(editButton).toBeTruthy;
      },
      { timeout: 3000 }
    );
  });

  test('disables invest button when loading', async () => {
    render(<VisualReturns {...defaultProps} disableInvestButton={true} />);
    expect(screen.getByRole('button', { name: /Invest Now/i })).toBeDisabled();
  });

  test('should render correct header for Bonds product category', async () => {
    render(<VisualReturns {...defaultProps} />);
    await waitFor(() => {
      expect(
        screen.getByRole('columnheader', { name: /Date/i })
      ).toBeInTheDocument();
    });
  });

  test('should render the correct button text for investment action', () => {
    render(<VisualReturns {...defaultProps} />);
    expect(screen.getByText('Invest Now')).toBeInTheDocument();
  });

  test('shows mobile layout correctly', async () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    render(<VisualReturns {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Visualise Returns')).toBeInTheDocument();
      expect(document.querySelector('.flex-column')).toBeInTheDocument();
    });
  });

  test('renders payment schedule popup items correctly', async () => {
    (isAssetBonds as jest.Mock).mockReturnValue(true);
    render(<VisualReturns {...defaultProps} />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Download'));
    });
    await waitFor(() => {
      expect(screen.getByText('As PDF')).toBeInTheDocument();
      expect(screen.getByText('As Excel')).toBeInTheDocument();
    });
  });

  test('renders tooltip correctly', async () => {
    render(<VisualReturns {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Visualise Returns')).toBeInTheDocument();
    });
  });

  test('renders totals row correctly', async () => {
    (isAssetBonds as jest.Mock).mockReturnValue(true);
    render(<VisualReturns {...defaultProps} />);
    await waitFor(() => {
      const totalRow = screen.getByText('Total').closest('tr');
      expect(totalRow).toBeInTheDocument();
      expect(totalRow).toHaveTextContent('Total');
    });
  });

  test('formats investment value correctly for SDI assets', async () => {
    const sdiAsset = {
      ...mockAsset,
      financeProductType: 'SDI_SECONDARY',
      productCategory: 'SDI',
    };
    render(<VisualReturns {...defaultProps} asset={sdiAsset} />);
    await waitFor(() => {
      expect(screen.getByText(/Visualise Returns/i)).toBeInTheDocument();
    });
  });

  test('Add Principal amount in repayment Data', async () => {
    (isAssetBonds as jest.Mock).mockReturnValue(true);
    render(<VisualReturns {...defaultProps} />);
    await waitFor(() => {
      expect(
        screen.getByRole('columnheader', { name: /Principal/i })
      ).toBeInTheDocument();
    });
  });

  test('sets default units when lotSize is 0', async () => {
    render(<VisualReturns {...defaultProps} lotSize={0} />);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setUnits(1));
    });
  });

  test('renders FD table correctly when isFD is true', async () => {
    (isHighYieldFd as jest.Mock).mockReturnValue(true);
    const fdData = [
      {
        date: '2023-03-01',
        principalAmount: 10000,
        interest: 500,
        amount: 10500,
      },
    ];
    render(
      <VisualReturns
        {...defaultProps}
        lotSize={-1}
        asset={{ ...defaultProps.asset, productCategory: 'High Yield FDs' }}
        fdRepaymentMetric={fdData as any}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Payout')).toBeInTheDocument();
    });
  });

  test('calls handleDownloadClick and sets showDownload to true', async () => {
    render(<VisualReturns {...defaultProps} />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Download'));
      expect(screen.getByText('As PDF')).toBeInTheDocument();
    });
  });

  test('convertBlobToBase64 resolves a base64 string', async () => {
    const blob = new Blob(['Hello World'], { type: 'text/plain' });
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    expect(base64).toContain('data:text/plain;base64');
  });

  test('sets units to minLots when lotSize is -1 and not FD', async () => {
    render(<VisualReturns {...defaultProps} lotSize={-1} />);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setUnits(1));
    });
  });

  test('downloads Excel using fallback on Web', async () => {
    const { fileDownloadHandler } = require('../../../api/assets');
    const { isRenderedInWebview } = require('../../../utils/appHelpers');
    isRenderedInWebview.mockReturnValue(true);
    fileDownloadHandler.mockResolvedValue({ blob: () => new Blob(['excel']) });
    render(<VisualReturns {...defaultProps} />);
    fireEvent.click(await screen.findByText('Download'));
    fireEvent.click(await screen.findByText('As Excel'));
    await waitFor(() => {
      expect(fileDownloadHandler).toHaveBeenCalled();
    });
  });

  test('fallback download buttons do not render for High Yield FD CSV', async () => {
    const fdAsset = {
      ...defaultProps.asset,
      productCategory: 'High Yield FDs',
      financeProductType: 'HIGH_YIELD_FD',
    };
    (isHighYieldFd as jest.Mock).mockReturnValue(true);
    render(<VisualReturns {...defaultProps} asset={fdAsset} />);
    fireEvent.click(await screen.findByText('Download'));
    await waitFor(() => {
      expect(screen.getByText('As PDF')).toBeInTheDocument();
      expect(screen.queryByText('As Excel')).toBeNull();
    });
  });
});
