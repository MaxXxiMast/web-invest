// PersonaAssetCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PersonaAssetCard from './index';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// Mocking button and image components
jest.mock('../../primitives/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  ButtonType: {
    PrimaryLight: 'PrimaryLight',
  },
}));

jest.mock('../../primitives/Image', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
      </> 
    )
  }
}));

// Mock string util
jest.mock('../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: 'https://example.com/',
  handleStringLimit: (str: string, limit: number) =>
    str.length > limit ? `${str.substring(0, limit)}...` : str,
}));

describe('PersonaAssetCard Component', () => {
  const mockProps = {
    partnerLogo: 'https://example.com/logo.png',
    partnerName: 'Test Partner',
    assetData: [
      { label: 'YTM', value: '12%' },
      { label: 'Tenure', value: '6 Months' },
    ],
    handleClick: jest.fn(),
    buttonText: 'Invest Now',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ 1. Renders correctly with logo
  it('renders correctly when partnerLogo is a valid URL', () => {
    render(<PersonaAssetCard {...mockProps} />);

    expect(screen.getByAltText('Partner Logo')).toHaveAttribute(
      'src',
      'https://example.com/logo.png'
    );
    expect(screen.getByAltText('Arrow Icon')).toHaveAttribute(
      'src',
      `${GRIP_INVEST_BUCKET_URL}icons/DiagonalGreyArrow.svg`
    );
    expect(screen.getByText('Invest Now')).toBeInTheDocument();
  });

  // ✅ 2. Renders correctly when logo is not a valid URL
  it('renders partner name if partnerLogo is not a valid URL', () => {
    const propsWithInvalidLogo = {
      ...mockProps,
      partnerLogo: 'logo123',
    };

    render(<PersonaAssetCard {...propsWithInvalidLogo} />);
    expect(screen.getByText('Test Partn...')).toBeInTheDocument();
    expect(screen.getByTitle('Test Partner')).toBeInTheDocument();
  });

  // ✅ 3. Renders asset data correctly
  it('renders all asset data correctly', () => {
    render(<PersonaAssetCard {...mockProps} />);

    expect(screen.getByText('YTM')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
    expect(screen.getByText('Tenure')).toBeInTheDocument();
    expect(screen.getByText('6 Months')).toBeInTheDocument();
  });

  // ✅ 4. Calls handleClick when button is clicked
  it('calls handleClick when button is clicked', () => {
    render(<PersonaAssetCard {...mockProps} />);

    const button = screen.getByText('Invest Now');
    fireEvent.click(button);

    expect(mockProps.handleClick).toHaveBeenCalledTimes(1);
  });

  // ✅ 5. Does not truncate partner name if it is within limit
  it('renders full partner name if within limit', () => {
    const propsWithShortName = {
      ...mockProps,
      partnerLogo: 'invalid-logo',
      partnerName: 'ShortName',
    };

    render(<PersonaAssetCard {...propsWithShortName} />);
    expect(screen.getByText('ShortName')).toBeInTheDocument();
  });

  // ✅ 6. Renders arrow icon correctly
  it('renders arrow icon with correct URL', () => {
    render(<PersonaAssetCard {...mockProps} />);

    const arrowIcon = screen.getByAltText('Arrow Icon');
    expect(arrowIcon).toHaveAttribute(
      'src',
      `${GRIP_INVEST_BUCKET_URL}icons/DiagonalGreyArrow.svg`
    );
  });

  // ✅ 7. Button has correct text
  it('renders button with correct text', () => {
    render(<PersonaAssetCard {...mockProps} />);
    expect(screen.getByText('Invest Now')).toBeInTheDocument();
  });
});
