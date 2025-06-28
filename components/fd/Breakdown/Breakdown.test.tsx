import { render, screen, fireEvent } from '@testing-library/react';
import Breakdown from './index';

jest.mock('react-html-parser', () => ({
  __esModule: true,
  default: jest.fn((content) => content),
}));

jest.mock('../../primitives/TooltipCompoent/TooltipCompoent', () => ({
  __esModule: true,
  default: jest.fn(({ children, toolTipText }) => (
    <div data-testid="tooltip" data-tooltip-text={toolTipText}>
      {children}
    </div>
  )),
}));

jest.mock('../../primitives/InfoModal/Infomodal', () => ({
  __esModule: true,
  default: jest.fn(({ showModal, modalTitle, modalContent, handleModalClose, isHTML }) => (
    showModal ? (
      <div 
        data-testid="info-modal"
        data-title={modalTitle}
        data-content={modalContent}
        data-is-html={isHTML.toString()}
      >
        <button data-testid="close-modal" onClick={handleModalClose}>Close</button>
      </div>
    ) : null
  )),
}));

jest.mock('../../primitives/CustomSkeleton/CustomSkeleton', () => ({
  __esModule: true,
  default: jest.fn(({ styles, className }) => (
    <div data-testid="skeleton" style={styles} className={className}>Loading...</div>
  )),
}));

jest.mock('../../../utils/string', () => ({
  __esModule: true,
  handleExtraProps: jest.fn((className) => className || ''),
}));

jest.mock('../../../utils/gtm', () => ({
  __esModule: true,
  trackEvent: jest.fn(),
}));

jest.mock('../../../utils/number', () => ({
  __esModule: true,
  convertCurrencyToNumber: jest.fn().mockImplementation((value) => {
    if (value === '₹100,000') return 100000;
    if (value === '₹10,000') return 10000;
    if (value === '₹5,000') return 5000;
    if (value === '₹500.00') return 500;
    return 0;
  }),
}));

describe('Breakdown Component', () => {
  const defaultProps = {
    id: 'test-breakdown',
    asset: {
      productCategory: 'Bonds',
      productSubcategory: 'Government',
      financeProductType: 'Fixed Income',
      assetID: 'bond-123',
    },
    topData: {
      label: 'Pre-Tax Returns',
      tooltipText: 'Returns before tax deduction',
      uiValue: '₹10,000',
    },
    breakdownData: [
      {
        id: 'principalAmount',
        label: 'Principal Amount',
        value: '₹100,000',
        tooltip: 'Initial investment amount',
        decimals: 2,
        isShowTooltip: true,
      },
      {
        id: 'totalInterest',
        label: 'Total Interest',
        value: '₹10,000',
        tooltip: 'Total interest earned',
        decimals: 2,
        isShowTooltip: false,
      },
      {
        id: 'brokerageFees',
        label: 'Brokerage Fees',
        value: '₹0.00',
        tooltip: 'Fees charged by brokers',
        decimals: 2,
        isShowTooltip: false,
      },
    ],
  };

  const modalContentProps = {
    ...defaultProps,
    breakdownData: [
      {
        id: 'modalItem',
        label: 'With Modal',
        value: '₹5,000',
        tooltip: 'Click learn more for details',
        modalLinkLabel: 'Learn more',
        modalTitle: 'Information',
        modalContent: 'This is modal content',
        isHTML: false,
        decimals: 2,
        isShowTooltip: false,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component with basic props', () => {
    render(<Breakdown {...defaultProps} />);
    
    expect(screen.getByText('Pre-Tax Returns')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('shows loading skeleton when loading prop is true', () => {
    render(<Breakdown {...defaultProps} loading={true} />);
    
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Pre-Tax Returns')).not.toBeInTheDocument();
  });

  test('expands the accordion when clicked', () => {
    const { trackEvent } = require('../../../utils/gtm');
    render(<Breakdown {...defaultProps} />);
    
    expect(screen.queryByText('Principal Amount')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('₹10,000').closest('div'));

    expect(screen.getByText('Principal Amount')).toBeInTheDocument();
    expect(screen.getByText('Total Interest')).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('Pre Tax Returns Previewed', expect.objectContaining({
      action: 'expanded',
      principal_amount: 100000,
      total_interest: 10000,
      product_category: 'Bonds',
      product_sub_category: 'Government',
      financial_product_type: 'Fixed Income',
      asset_id: 'bond-123',
    }));
  });

  test('collapses the accordion when clicked again', () => {
    const { trackEvent } = require('../../../utils/gtm');
    render(<Breakdown {...defaultProps} />);
    
    fireEvent.click(screen.getAllByText('₹10,000')[0].closest('div'));
    expect(screen.getByText('Principal Amount')).toBeInTheDocument();
    
    fireEvent.click(screen.getAllByText('₹10,000')[0].closest('div'));
    expect(trackEvent).toHaveBeenCalledWith('Pre Tax Returns Previewed', expect.objectContaining({
      action: 'collapsed',
    }));
  });

  test('opens info modal when modal link is clicked', () => {
    render(<Breakdown {...modalContentProps} />);
    
    fireEvent.click(screen.getByText('₹10,000').closest('div'));
    fireEvent.click(screen.getByText('Learn more'));
    
    const modal = screen.getByTestId('info-modal');
    expect(modal).toBeInTheDocument();
    expect(modal.dataset.title).toBe('Information');
    expect(modal.dataset.content).toBe('This is modal content');
    expect(modal.dataset.isHtml).toBe('false');
  });

  test('closes info modal when close button is clicked', () => {
    render(<Breakdown {...modalContentProps} />);
    
    fireEvent.click(screen.getByText('₹10,000').closest('div'));
    fireEvent.click(screen.getByText('Learn more'));    
    expect(screen.getByTestId('info-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('info-modal')).not.toBeInTheDocument();
  });

  test('handles breakdown items without tooltips', () => {
    const propsWithoutTooltips = {
      ...defaultProps,
      breakdownData: [
        {
          id: 'itemWithoutTooltip',
          label: 'No Tooltip Item',
          value: '₹5,000',
          decimals: 2,
          isShowTooltip: false,
          tooltip: ''
        },
      ],
    };
    
    render(<Breakdown {...propsWithoutTooltips} />);
    
    fireEvent.click(screen.getByText('₹10,000').closest('div'));
    expect(screen.getByText('No Tooltip Item')).toBeInTheDocument();
    expect(screen.getAllByTestId('tooltip').length).toBe(1);
  });

  test('renders empty breakdown data correctly', () => {
    const propsWithEmptyBreakdown = {
      ...defaultProps,
      breakdownData: [],
    };
    
    render(<Breakdown {...propsWithEmptyBreakdown} />);
    
    fireEvent.click(screen.getByText('₹10,000').closest('div'));
    const listItems = screen.getByRole('list').querySelectorAll('li');
    expect(listItems.length).toBe(0);
  });

  test('correctly converts currency values for tracking', () => {
    const { convertCurrencyToNumber } = require('../../../utils/number');
    const { trackEvent } = require('../../../utils/gtm');
    
    render(<Breakdown {...defaultProps} />);
    fireEvent.click(screen.getByText('₹10,000').closest('div'));
    
    expect(convertCurrencyToNumber).toHaveBeenCalledWith('₹100,000');
    expect(convertCurrencyToNumber).toHaveBeenCalledWith('₹10,000');
    expect(trackEvent).toHaveBeenCalledWith('Pre Tax Returns Previewed', expect.objectContaining({
      principal_amount: 100000,
      total_interest: 10000,
    }));
  });

  test('handles missing asset information gracefully', () => {
    const propsWithoutAsset = {
      ...defaultProps,
      asset: undefined,
    };
    
    render(<Breakdown {...propsWithoutAsset} />);
    
    fireEvent.click(screen.getByText('₹10,000').closest('div'));
    
    expect(screen.getByText('Principal Amount')).toBeInTheDocument();
  });
});