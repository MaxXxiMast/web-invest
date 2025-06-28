import { render, screen, fireEvent } from '@testing-library/react';
import ResultRow from '.';

jest.mock('../../Image', () => {
  const MockImage = (props: any) => {
    const { default: Image } = require('next/image');
    return <Image data-testid="mock-image" {...props} alt={props.alt} />;
  };
  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('../../TooltipCompoent/TooltipCompoent', () => {
  const MockTooltipComponent = (props: any) => (
    <div data-testid="tooltip" title={props.toolTipText}>
      {props.children}
    </div>
  );
  MockTooltipComponent.displayName = 'MockTooltipComponent';
  return MockTooltipComponent;
});

jest.mock('../../../assetsList/RatingScale', () => {
  const MockRatingScale = (props: any) => (
    <div data-testid="rating-scale">{props.rating}</div>
  );
  MockRatingScale.displayName = 'MockRatingScale';
  return MockRatingScale;
});

jest.mock('../../../FilterAndCompare/utils/helperUtils', () => ({
  AssetType: (deal: any) => deal?.type ?? 'Unknown Type',
  RegulatedBy: (deal: any) => deal?.regulatedBy ?? 'Not Regulated',
}));

jest.mock('../../../../utils/number', () => ({
  numberToIndianCurrency: (num: number) => `₹${num.toLocaleString('en-IN')}`,
}));

describe('ResultRow Component', () => {
  const mockDeal = {
    rating: 'A+',
    ratedBy: 'care',
    type: 'High Yield FDs',
    irr: 11.5,
    tenure: 24,
    minInvest: 10000,
    securityCover: 1.5,
    logo: '/logo.svg',
    regulatedBy: 'SEBI',
  };

  const tooltips = {
    SEBI: 'SEBI regulated entity',
    'High Yield FDs': 'Fixed Deposit type',
  };

  const baseProps = {
    deal: mockDeal,
    handleChangeDealModal: jest.fn(),
    totalNumberOfDeals: 3,
    redirectToAsset: jest.fn(),
    tooltips,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all deal data correctly', () => {
    render(<ResultRow {...baseProps} />);

    expect(screen.getByText('SEBI')).toBeInTheDocument();
    expect(screen.getByText('High Yield FDs')).toBeInTheDocument();

    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByTestId('rating-scale')).toHaveTextContent('A+');
    expect(screen.getByText('₹10,000')).toBeInTheDocument();
    expect(screen.getByText('1.5')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /explore/i })
    ).toBeInTheDocument();
  });

  it('calls redirectToAsset when logo is clicked', () => {
    render(<ResultRow {...baseProps} />);

    fireEvent.click(screen.getByTestId('mock-image'));
    expect(baseProps.redirectToAsset).toHaveBeenCalledWith(mockDeal);
  });

  it('calls redirectToAsset when Explore button is clicked', () => {
    render(<ResultRow {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: /explore/i }));
    expect(baseProps.redirectToAsset).toHaveBeenCalledWith(mockDeal);
  });

  it('renders tooltip for regulation label', () => {
    render(<ResultRow {...baseProps} />);
    expect(screen.getByTestId('tooltip')).toHaveAttribute(
      'title',
      'SEBI regulated entity'
    );
  });

  it('shows "Swap Deal" link when total deals > 2', () => {
    render(<ResultRow {...baseProps} />);
    expect(screen.getByText('Swap Deal')).toBeInTheDocument();
  });

  it('does not show "Swap Deal" link when total deals ≤ 2', () => {
    render(<ResultRow {...baseProps} totalNumberOfDeals={2} />);
    expect(screen.queryByText('Swap Deal')).not.toBeInTheDocument();
  });

  it('calls handleChangeDealModal on clicking "Swap Deal"', () => {
    render(<ResultRow {...baseProps} />);
    fireEvent.click(screen.getByText('Swap Deal'));
    expect(baseProps.handleChangeDealModal).toHaveBeenCalledWith(true);
  });

  it('renders "N/A" when data is missing', () => {
    const incompleteDeal = { type: '', ratedBy: '', logo: '' };
    render(<ResultRow {...baseProps} deal={incompleteDeal} />);
    expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(2);
  });
});
