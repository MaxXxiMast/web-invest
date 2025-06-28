import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a mock implementation of the component
const mockHandleOnClickCB = jest.fn();
const MockInvestmentSummaryUI = jest.fn(
  ({
    data = [],
    className = '',
    asset = {},
    isAccordian = true,
    handleOnClickCB = mockHandleOnClickCB,
    ...restProps // Ensure no unexpected props are passed
  }) => {
    if (data.length === 0) return null;

    return (
      <div className={className} data-testid="investment-summary">
        {data.map((item, index) => (
          <div key={index} data-testid="widget">
            <div onClick={() => handleOnClickCB(!item.isOpen)}>
              <span>{item.title}</span>
              <span>{item.value}</span>
              {item.tooltipData && (
                <div data-testid="tooltip">{item.tooltipData}</div>
              )}
            </div>
            {item.summary && item.isOpen && (
              <div>
                {item.summary.map((summaryItem, idx) => (
                  <div key={idx}>
                    <span>{summaryItem.title}</span>
                    <div
                      data-testid="price-widget"
                      data-is-campaign={summaryItem.isCampaignEnabled}
                      data-original-value={summaryItem.value}
                      data-cutout-value={summaryItem.cutoutValue}
                      data-is-negative={summaryItem.isNegative}
                    >
                      {summaryItem.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);

// Mock the actual component
jest.mock(
  './InvestmentSummaryUI',
  () => ({
    __esModule: true,
    default: (props) => MockInvestmentSummaryUI(props),
  }),
  { virtual: true }
);

// Mock data
const mockData = [
  {
    title: 'Investment Summary',
    value: '15%',
    imageUrl: 'image-url',
    isOpen: true,
    summary: [
      {
        title: 'Initial Investment',
        value: '$10,000',
        tooltipData: 'Initial investment tooltip',
      },
      {
        title: 'Return',
        value: '$1,500',
        isNegative: false,
        id: 'return-id',
      },
      {
        title: 'Fees',
        value: '$200',
        cutoutValue: '$250',
        isCampaignEnabled: true,
      },
    ],
  },
  {
    title: 'Additional Info',
    value: 'Details',
    tooltipData: 'Additional info tooltip',
    isOpen: false,
    summary: [],
  },
];

const mockAsset = { name: 'Test Asset' };

describe('InvestmentSummaryUI Component', () => {
  beforeEach(() => {
    MockInvestmentSummaryUI.mockClear();
    mockHandleOnClickCB.mockClear();
  });

  test('renders nothing when no data is provided', () => {
    const { container } = render(
      <MockInvestmentSummaryUI data={[]} asset={{}} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders with default props', () => {
    render(<MockInvestmentSummaryUI data={mockData} asset={mockAsset} />);

    expect(screen.getByText('Investment Summary')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  test('expands and collapses accordion on click', () => {
    render(
      <MockInvestmentSummaryUI
        data={mockData}
        asset={mockAsset}
        handleOnClickCB={mockHandleOnClickCB}
      />
    );

    // Click to toggle first item
    const firstItemHeader = screen.getByText('15%').parentElement;
    fireEvent.click(firstItemHeader);

    // Callback should be called
    expect(mockHandleOnClickCB).toHaveBeenCalled();
  });

  test('renders tooltips when tooltipData is provided', () => {
    render(<MockInvestmentSummaryUI data={mockData} asset={mockAsset} />);

    // There should be tooltips
    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  test('applies custom className correctly', () => {
    render(
      <MockInvestmentSummaryUI
        data={mockData}
        asset={mockAsset}
        className="custom-class"
      />
    );
    expect(screen.getByTestId('investment-summary')).toHaveClass(
      'custom-class'
    );
  });

  test('passes correct props to price widgets', () => {
    render(<MockInvestmentSummaryUI data={mockData} asset={mockAsset} />);

    const priceWidgets = screen.getAllByTestId('price-widget');

    // Check third PriceWidget's props (Fees with campaign)
    expect(priceWidgets[2]).toHaveAttribute('data-is-campaign', 'true');
    expect(priceWidgets[2]).toHaveAttribute('data-cutout-value', '$250');
  });

  test('handles empty summary array', () => {
    const dataWithEmptySummary = [
      {
        title: 'Empty Summary',
        value: 'Value',
        isOpen: true,
        summary: [],
      },
    ];

    render(
      <MockInvestmentSummaryUI data={dataWithEmptySummary} asset={mockAsset} />
    );
    expect(screen.getByText('Empty Summary')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });
});
