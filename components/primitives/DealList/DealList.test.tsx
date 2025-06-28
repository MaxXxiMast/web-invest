import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DealListModal from '.';

// Mock dependencies
jest.mock('next/image', () => {
  const MockNextImage = ({ src, alt, className }) => (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={className} data-testid="next-image" />
    </>
  );
  MockNextImage.displayName = 'MockNextImage';
  return MockNextImage;
});
jest.mock('../MaterialModalPopup', () => {
  const MockMaterialModalPopup = ({ children, showModal, handleModalClose }) =>
    showModal ? <div data-testid="modal-popup">{children}</div> : null;
  MockMaterialModalPopup.displayName = 'MockMaterialModalPopup';
  return MockMaterialModalPopup;
});
jest.mock('../CustomSkeleton/CustomSkeleton', () => {
  const MockCustomSkeleton = ({ styles }) => (
    <div data-testid="custom-skeleton" style={styles} />
  );
  MockCustomSkeleton.displayName = 'MockCustomSkeleton';
  return MockCustomSkeleton;
});

jest.mock('../Button', () => {
  const Button = ({ children, onClick }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  );
  Button.ButtonType = { Primary: 'primary' };
  return Button;
});
jest.mock('../../../api/strapi', () => ({
  fetchAPI: jest.fn(),
}));
jest.mock('../../FilterAndCompare/utils/helperUtils', () => ({
  AssetType: jest.fn((deal) => deal.assetType || 'High Yield FDs'),
  RegulatedBy: jest.fn((deal) => deal.regulator || 'RBI Regulated'),
}));
jest.mock('./utils', () => ({
  processAssetData: jest.fn((asset) => asset),
}));

// Import the mocked fetchAPI
import { fetchAPI } from '../../../api/strapi';

describe('DealListModal', () => {
  const mockProps = {
    onClose: jest.fn(),
    isShowModal: true,
    handleSelectedDeal: jest.fn(),
    selectedFilterOptions: [
      { filterLabel: 'IRR/YTM', min: 5, max: 15 },
      { filterLabel: 'Tenure', min: 3, max: 12 },
    ],
    totalNumberOfDeals: 10,
    mainViewDeals: [{ assetID: 'main-deal-1' }],
  };

  const mockDeals = {
    data: [
      {
        assetID: 'asset-1',
        assetType: 'High Yield FDs',
        logo: '/test-logo-1.png',
        irr: '8.5',
        tenure: '6 months',
        regulator: 'SEBI Regulated',
      },
      {
        assetID: 'asset-2',
        assetType: 'Bonds',
        logo: '/test-logo-2.png',
        irr: 'YTM 9.2',
        tenure: '12 months',
        regulator: 'RBI Regulated',
      },
      {
        assetID: 'main-deal-1', // This should be filtered out
        assetType: 'High Yield FDs',
        logo: '/main-deal.png',
        irr: '7.5',
        tenure: '3 months',
        regulator: 'RBI Regulated',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchAPI as jest.Mock).mockResolvedValue(mockDeals);
  });

  test('renders loading skeleton initially', async () => {
    render(<DealListModal {...mockProps} />);

    expect(screen.getByText('Select deal to compare')).toBeInTheDocument();
    expect(screen.getAllByTestId('custom-skeleton').length).toBe(6); 
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('Compare this deal')).toBeInTheDocument();
  });

  test('fetches and displays deals correctly', async () => {
    render(<DealListModal {...mockProps} />);

    await waitFor(() => {
      expect(fetchAPI).toHaveBeenCalledWith(
        '/v3/assets/discovery/filter',
        {
          skip: 0,
          limit: 10,
          maxIrr: 15,
          minIrr: 5,
          minTenure: 3,
          maxTenure: 12,
        },
        {},
        true
      );
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('next-image').length).toBe(2); 
    });

    // Check that all deal content is displayed correctly
    expect(screen.getByText('Interest 8.5%')).toBeInTheDocument();
    expect(screen.getByText('| 6 months')).toBeInTheDocument();

    expect(screen.getByText('| 12 months')).toBeInTheDocument();
  });

  test('selects a deal when clicked', async () => {
    render(<DealListModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getAllByTestId('next-image').length).toBe(2);
    });

    const dealItems = screen
      .getAllByTestId('next-image')
      .map((img) => img.closest('div[class*="dealItem"]'));
    fireEvent.click(dealItems[0]);
    expect(screen.getByText('SEBI Regulated')).toBeInTheDocument();
  });

  test('calls handleSelectedDeal when Compare button is clicked', async () => {
    render(<DealListModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getAllByTestId('next-image').length).toBe(2);
    });

    // Select a deal
    const dealItems = screen
      .getAllByTestId('next-image')
      .map((img) => img.closest('div[class*="dealItem"]'));
    fireEvent.click(dealItems[0]);

    // Click the Compare button
    fireEvent.click(screen.getByText('Compare this deal'));

    // Verify handleSelectedDeal was called with the selected deal
    expect(mockProps.handleSelectedDeal).toHaveBeenCalledWith(
      expect.objectContaining({
        assetID: 'asset-1',
      })
    );
  });

  test('filters out mainViewDeals from the displayed deals', async () => {
    render(<DealListModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getAllByTestId('next-image').length).toBe(2);
    });

    // The deal with assetID 'main-deal-1' should be filtered out
    const dealItems = screen
      .getAllByTestId('next-image')
      .map((img) => img.closest('div[class*="dealItem"]'));
    expect(dealItems.length).toBe(2);

    // Check that none of the deals have the filtered assetID
    let mainDealFound = false;
    dealItems.forEach((item) => {
      if (item.textContent.includes('main-deal-1')) {
        mainDealFound = true;
      }
    });

    expect(mainDealFound).toBe(false);
  });
});
