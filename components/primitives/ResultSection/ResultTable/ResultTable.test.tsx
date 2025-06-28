import { render, screen, fireEvent } from '@testing-library/react';
import ResultTable from '.';

// Mocks
jest.mock('../ResultRow', () => {
  const MockResultRow = ({ deal }: any) => (
    <tr data-testid={`result-row-${deal.assetID}`}>
      Mock Result Row for {deal.assetID}
    </tr>
  );
  MockResultRow.displayName = 'MockResultRow';
  return MockResultRow;
});

jest.mock('../../Image', () => {
  const MockImage = (props: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img data-testid="mock-image" {...props} alt="filter" />
  );
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

describe('ResultTable Component', () => {
  const mockResetFilters = jest.fn();
  const mockHandleChangeDealModal = jest.fn();
  const mockRedirectToAsset = jest.fn();

  const baseProps = {
    resetFilters: mockResetFilters,
    handleChangeDealModal: mockHandleChangeDealModal,
    totalNumberOfDeals: 2,
    redirectToAsset: mockRedirectToAsset,
    filterAndCompareData: {
      tooltips: {
        Returns: 'Tooltip for Returns',
        Tenure: 'Tooltip for Tenure',
      },
    },
  };

  const deals = [
    { assetID: 'deal1' },
    { assetID: 'deal2' },
    { assetID: 'deal3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "No Results" message when no deals', () => {
    render(<ResultTable {...baseProps} mainViewDeals={[]} />);

    expect(screen.getByText('0 Result Found!')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Try adjusting your filters to discover more investment opportunities.'
      )
    ).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /reset filter/i });
    fireEvent.click(resetBtn);
    expect(mockResetFilters).toHaveBeenCalled();
  });

  it('renders filtered deals when available', () => {
    render(
      <ResultTable
        {...baseProps}
        totalNumberOfDeals={3}
        mainViewDeals={deals}
      />
    );

    expect(screen.getByText('3 Results')).toBeInTheDocument();
    expect(screen.getByTestId('result-row-deal1')).toBeInTheDocument();
    expect(screen.getByTestId('result-row-deal2')).toBeInTheDocument();
    expect(screen.queryByTestId('result-row-deal3')).not.toBeInTheDocument(); // Only 2 rows shown
  });

  it('shows placeholder if only 1 deal is shown', () => {
    render(
      <ResultTable
        {...baseProps}
        totalNumberOfDeals={1}
        mainViewDeals={[deals[0]]}
      />
    );

    expect(screen.getByText('1 Result')).toBeInTheDocument();
    expect(
      screen.getByText('Adjust filters to find more deals')
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-image')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /reset filter/i });
    fireEvent.click(resetBtn);
    expect(mockResetFilters).toHaveBeenCalled();
  });

  it('renders tooltip headers correctly', () => {
    render(
      <ResultTable
        {...baseProps}
        totalNumberOfDeals={2}
        mainViewDeals={deals}
      />
    );

    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips[0]).toHaveAttribute('title', 'Tooltip for Returns');
    expect(tooltips[1]).toHaveAttribute('title', 'Tooltip for Tenure');
    expect(screen.getAllByTestId('tooltip').length).toBeGreaterThanOrEqual(1);
  });
});
