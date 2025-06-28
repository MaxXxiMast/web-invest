
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetCard from './index';

// Mocks
jest.mock('next/router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../../redux/slices/hooks', () => ({ useAppSelector: jest.fn() }));
jest.mock('../../../assetsList/partnerLogo', () => {
  const MockPartnerLogo = () => <div data-testid="PartnerLogo" />;
  MockPartnerLogo.displayName = 'MockPartnerLogo';
  return MockPartnerLogo;
});
jest.mock('../../../assetsList/RatingScale', () => {
  const MockRatingScale = ({ rating }: any) => <div data-testid="RatingScale">{rating}</div>;
  MockRatingScale.displayName = 'MockRatingScale';
  return MockRatingScale;
});
jest.mock('../../../../utils/asset', () => ({
  generateAssetURL: jest.fn(() => '/mock-url'),
  getMaturityDate: jest.fn(() => '2025-12-31'),
  getMaturityMonths: jest.fn(() => 24),
}));
jest.mock('../../../../utils/gtm', () => ({ trackEvent: jest.fn() }));
jest.mock('../../utils', () => ({ getMostInvestmentCategory: jest.fn(() => 'categoryA') }));

const mockUseAppSelector = require('../../../../redux/slices/hooks').useAppSelector;

const defaultAsset = {
  assetID: 'asset123',
  financeProductType: 'Bond',
  header: 'Test Asset',
  bonds: { preTaxYtm: 8.5 },
  irr: 8,
  assetMappingData: {
    rating: 'AAA',
    ratedBy: 'CRISIL',
  },
};

describe('AssetCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppSelector.mockImplementation(cb => cb({ portfolioSummary: { preTaxIrr: 12, totalAmountInvested: 1000 } }));
  });

  it('should not render if asset is empty', () => {
    render(<AssetCard asset={{}} />);
    expect(screen.queryByText('Yield to Maturity')).not.toBeInTheDocument();
  });

  it('renders asset info correctly', () => {
    render(<AssetCard asset={defaultAsset} />);
    expect(screen.getByText('Test Asset')).toBeInTheDocument();
    expect(screen.getByText('Yield to Maturity')).toBeInTheDocument();
    expect(screen.getByText('8.5%')).toBeInTheDocument();
    expect(screen.getByText('Tenure')).toBeInTheDocument();
    expect(screen.getByText('24 Months')).toBeInTheDocument();
    expect(screen.getByTestId('PartnerLogo')).toBeInTheDocument();
    expect(screen.getByTestId('RatingScale')).toHaveTextContent('CRISIL AAA');
  });

  it('renders rating scale only if rating exists', () => {
    const assetNoRating = { ...defaultAsset, assetMappingData: {} };
    render(<AssetCard asset={assetNoRating} />);
    expect(screen.queryByTestId('RatingScale')).not.toBeInTheDocument();
  });

  it('shows irr if bonds.preTaxYtm is missing', () => {
    const assetNoYtm = { ...defaultAsset, bonds: undefined };
    render(<AssetCard asset={assetNoYtm} />);
    expect(screen.getByText('8%')).toBeInTheDocument();
  });
});
