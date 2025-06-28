import React from 'react';
import { render, screen } from '@testing-library/react';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import PartnerLogo from '.';

// Mock the hooks and components
jest.mock('../../../utils/customHooks/useMediaQuery');
jest.mock('../../primitives/Image', () => ({
  __esModule: true,
  default: ({ src, alt, height, width }: any) => (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} height={height} width={width} />
    </>
  ),
}));
jest.mock('../../../utils/financeProductTypes', () => ({
  isAssetBonds: jest.fn(),
  isAssetCommercialProduct: jest.fn(),
  isSDISecondary: jest.fn(),
}));
jest.mock('../../../utils/string', () => ({
  handleExtraProps: jest.fn((x) => x),
  handleStringLimit: jest.fn((str) => str),
}));

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<
  typeof useMediaQuery
>;
const mockIsAssetBonds = require('../../../utils/financeProductTypes')
  .isAssetBonds as jest.Mock;
const mockIsAssetCommercialProduct =
  require('../../../utils/financeProductTypes')
    .isAssetCommercialProduct as jest.Mock;
const mockIsSDISecondary = require('../../../utils/financeProductTypes')
  .isSDISecondary as jest.Mock;

describe('PartnerLogo Component', () => {
  const defaultAsset = {
    partnerLogo: 'logo.png',
    partnerName: 'Test Partner',
    partner: {
      logo: 'partner-logo.png',
      name: 'Partner Name',
    },
  };

  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false); // Default to desktop
    mockIsAssetBonds.mockReturnValue(false);
    mockIsAssetCommercialProduct.mockReturnValue(false);
    mockIsSDISecondary.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders with partner logo', () => {
    render(<PartnerLogo asset={defaultAsset} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'logo.png');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Partner');
  });

  test('renders with partner name when no logo', () => {
    const assetWithoutLogo = { ...defaultAsset, partnerLogo: undefined };
    render(<PartnerLogo asset={assetWithoutLogo} />);
    expect(screen.getByText('Test Partner')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('renders with custom height and width', () => {
    render(<PartnerLogo asset={defaultAsset} height={50} width={100} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('height', '50');
    expect(img).toHaveAttribute('width', '100');
  });

  test('renders with url wrapper', () => {
    render(<PartnerLogo asset={defaultAsset} url="https://example.com" />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com'
    );
  });

  test('renders partnership text for commercial deals', () => {
    mockIsAssetCommercialProduct.mockReturnValue(true);
    render(<PartnerLogo asset={defaultAsset} isPartnershipText />);
    expect(screen.getByText('In Partnership With')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('renders partnership name when no logo for commercial deals', () => {
    mockIsAssetCommercialProduct.mockReturnValue(true);
    const assetWithoutLogo = { ...defaultAsset, partnerLogo: undefined };
    render(<PartnerLogo asset={assetWithoutLogo} isPartnershipText />);
    expect(screen.getByText('In Partnership With')).toBeInTheDocument();
    expect(screen.getByText('Test Partner')).toBeInTheDocument();
  });

  test('renders units for bond assets on desktop', () => {
    mockIsAssetBonds.mockReturnValue(true);
    render(<PartnerLogo asset={defaultAsset} units={5} showUnit />);
    expect(screen.getByText('5 Units')).toBeInTheDocument();
  });

  test('renders lots for SDI secondary assets on mobile', () => {
    mockUseMediaQuery.mockReturnValue(true);
    mockIsSDISecondary.mockReturnValue(true);
    render(<PartnerLogo asset={defaultAsset} units={3} showLot />);
    expect(screen.getByText('3 Lots')).toBeInTheDocument();
  });

  test('renders plural units correctly', () => {
    mockIsAssetBonds.mockReturnValue(true);
    render(<PartnerLogo asset={defaultAsset} units={2} showUnit />);
    expect(screen.getByText('2 Units')).toBeInTheDocument();
  });

  test('does not render units when showUnit is false', () => {
    mockIsAssetBonds.mockReturnValue(true);
    render(<PartnerLogo asset={defaultAsset} units={5} showUnit={false} />);
    expect(screen.queryByText('5 Units')).not.toBeInTheDocument();
  });

  test('uses discovery page partner data when isDiscoveryPage is true', () => {
    render(<PartnerLogo asset={defaultAsset} isDiscoveryPage />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'partner-logo.png');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Partner Name');
  });

  test('applies custom container class', () => {
    render(
      <PartnerLogo asset={defaultAsset} customContainerClass="custom-class" />
    );
    expect(screen.getByTestId('partner-logo-container')).toHaveClass(
      'custom-class'
    );
  });

  test('renders correctly for asset agreement', () => {
    render(<PartnerLogo asset={defaultAsset} isAssetAgreement />);
    // You might want to add specific assertions for layout classes here
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
