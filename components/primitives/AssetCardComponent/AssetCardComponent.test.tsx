import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetCardComponent from './AssetCardComponent';
import { generateAssetURL } from '../../../utils/asset';
import { trackEvent } from '../../../utils/gtm';
import { useRouter } from 'next/router';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../utils/asset', () => ({
  generateAssetURL: jest.fn(),
}));
jest.mock('../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));
jest.mock('../../../utils/discovery', () => ({
  getDiscoveryAssetBadges: jest.fn(() => [
    { label: 'Test Badge', image: '/test-badge.png' },
    { label: 'Icon Badge', imageIcon: 'icon-class' },
  ]),
  getDiscoveryAssetInfo: jest.fn(() => [
    {
      label: 'Test Info',
      value: '10%',
      suffix: 'APY',
      icon: '/test-icon.png',
      isCampaignEnabled: false,
    },
    {
      label: 'Campaign Info',
      value: '5%',
      cutoutValue: '8%',
      suffix: 'APY',
      isCampaignEnabled: true,
    },
  ]),
  getProductTypeLabel: {
    Bond: 'Bond',
    'Other Type': 'Other',
  },
}));
jest.mock('../../../utils/financeProductTypes', () => ({
  isAssetBonds: jest.fn(() => false),
}));

// Mock components
jest.mock('../../assetsList/partnerLogo', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="partner-logo">Partner Logo</div>),
  };
});
jest.mock('../Button', () => {
  return {
    __esModule: true,
    default: jest.fn(({ children, onClick }) => (
      <button data-testid="button" onClick={onClick}>
        {children}
      </button>
    )),
    ButtonType: {
      Primary: 'primary',
    },
  };
});
jest.mock('../Image', () => {
  return {
    __esModule: true,
    default: jest.fn(({ src, alt }) => (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} data-testid="image" />
      </>
    )),
  };
});
jest.mock('../PriceWidget', () => {
  return {
    __esModule: true,
    default: jest.fn(({ originalValue, cutoutValue, isCampaignEnabled }) => (
      <div data-testid="price-widget">
        {isCampaignEnabled ? cutoutValue : originalValue}
      </div>
    )),
  };
});

describe('AssetCardComponent', () => {
  const mockAsset = {
    assetID: '123',
    name: 'Test Asset',
    description:
      'This is a test asset description that should be long enough to test the string limit function',
    financeProductType: 'Bond',
    repeatInvestorPercentage: 75,
  };

  const mockRouter = {
    push: jest.fn(),
    pathname: '/discover',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (generateAssetURL as jest.Mock).mockReturnValue('/asset/123');
  });

  // Test case 1
  test('renders null when no asset is provided', () => {
    const { container } = render(<AssetCardComponent asset={null} />);
    expect(container.firstChild).toBeNull();
  });

  // Test case 2
  test('renders the component with asset data', () => {
    render(<AssetCardComponent asset={mockAsset} />);

    // Check if basic elements are rendered
    expect(screen.getByText('Bond')).toBeInTheDocument();
    expect(
      screen.getByText(/This is a test asset description/)
    ).toBeInTheDocument();
    expect(screen.getByTestId('partner-logo')).toBeInTheDocument();
    expect(screen.getByText('Invest Now')).toBeInTheDocument();
  });

  // Test case 3
  test('truncates long descriptions', () => {
    const longDescription =
      'This is a very long description that should be truncated because it exceeds the character limit set in the component code';
    render(
      <AssetCardComponent
        asset={{ ...mockAsset, description: longDescription }}
      />
    );

    // The description should be truncated
    const description = screen.getByText(/This is a very long description/);
    expect(description.textContent?.length).toBeLessThan(
      longDescription.length
    );
  });

  // Test case 4
  test('displays asset information correctly', () => {
    render(<AssetCardComponent asset={mockAsset} />);

    const priceWidgets = screen.getAllByTestId('price-widget');
    expect(priceWidgets.length).toBe(2);
  });

  // Test case 5
  test('displays badges correctly', () => {
    render(<AssetCardComponent asset={mockAsset} />);

    // Check if badges are rendered
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
    expect(screen.getByText('Icon Badge')).toBeInTheDocument();
  });

  // Test case 6
  test('does not render invest button on past deals', () => {
    render(<AssetCardComponent asset={mockAsset} isPastDeal={true} />);

    // The invest button should not be rendered
    expect(screen.queryByText('Invest Now')).not.toBeInTheDocument();
  });

  // Test case 7
  test('navigates to asset page when clicked', () => {
    render(<AssetCardComponent asset={mockAsset} />);

    // Click on the card
    fireEvent.click(screen.getByText('Bond'));

    // Check if router.push was called with the correct URL
    expect(mockRouter.push).toHaveBeenCalledWith('/asset/123');
  });

  // Test case 8
  test('tracks event when card is clicked', () => {
    render(<AssetCardComponent asset={mockAsset} />);

    // Click on the card
    fireEvent.click(screen.getByText('Bond'));

    // Check if trackEvent was called with the correct parameters
    expect(trackEvent).toHaveBeenCalledWith('Viewed_Asset', {
      url: '/discover',
      assetID: '123',
      repeatInvestorPercentage: 75,
    });
  });

  // Test case 9
  test('tracks personality event when isPersona is true', () => {
    render(<AssetCardComponent asset={mockAsset} isPersona={true} />);

    // Click on the card
    fireEvent.click(screen.getByText('Bond'));
    expect(trackEvent).toHaveBeenCalledWith('personality_deal_card_clicked', {
      section: 'discover',
      assetId: '123',
      assetName: 'Test Asset',
    });
  });

  // Test case 10
  test('converts product type string correctly', () => {
    render(
      <AssetCardComponent
        asset={{ ...mockAsset, financeProductType: 'Other Type' }}
      />
    );

    // Check if the product type is rendered correctly
    const productTypeElement = screen.getByText('Other');
    expect(productTypeElement).toBeInTheDocument();

    // Check if the CSS class is applied correctly
    expect(productTypeElement).toHaveClass('ProductType');
    expect(productTypeElement).toHaveClass('OtherType');
  });
});
