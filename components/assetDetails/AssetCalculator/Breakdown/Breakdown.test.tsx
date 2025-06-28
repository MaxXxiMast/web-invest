import { render, screen, fireEvent } from '@testing-library/react';
import Breakdown from './index';

jest.mock('react-html-parser', () => ({
  __esModule: true,
  default: jest.fn((content) => content),
}));

jest.mock('../../../primitives/TooltipCompoent/TooltipCompoent', () => ({
  __esModule: true,
  default: jest.fn(({ children, toolTipText }) => (
    <div data-testid="tooltip" data-tooltip-text={toolTipText}>
      {children}
    </div>
  )),
}));

jest.mock('../../../primitives/InfoModal/Infomodal', () => ({
  __esModule: true,
  default: jest.fn(({ showModal, modalTitle, modalContent, handleModalClose }) => (
    showModal ? (
      <div 
        data-testid="info-modal"
        data-title={modalTitle}
        data-content={modalContent}
      >
        <button data-testid="close-modal" onClick={handleModalClose}>Close</button>
      </div>
    ) : null
  )),
}));

jest.mock('../../../number-animator', () => ({
  __esModule: true,
  default: jest.fn(({ numValue }) => (
    <span data-testid="number-animation">{numValue}</span>
  )),
}));

jest.mock('../../../../utils/string', () => ({
  __esModule: true,
  handleExtraProps: jest.fn((className) => className || ''),
}));

jest.mock('../../../../utils/gtm', () => ({
  __esModule: true,
  trackEvent: jest.fn(),
}));

jest.mock('../../../../utils/number', () => ({
  __esModule: true,
  convertCurrencyToNumber: jest.fn((value) => 
    value ? parseFloat(value.replace(/[₹,]/g, '')) : 0
  ),
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
      numValue: 10000,
    },
    breakdownData: [
      {
        id: 'principalAmount',
        label: 'Principal Amount',
        value: '₹100,000',
        isShowTooltip: true,
        tooltip: 'Initial investment amount',
        decimals: 2,
      },
      {
        id: 'totalInterest',
        label: 'Total Interest',
        value: '₹10,000',
        isShowTooltip: false,
        tooltip: 'Total interest earned',
        decimals: 2,
      },
      {
        id: 'brokerageFees',
        label: 'Brokerage Fees',
        value: '₹0.00',
        isShowTooltip: false,
        tooltip: 'Fees charged by brokers',
        decimals: 2,
      },
    ],
  };

  const amountPayableProps = {
    ...defaultProps,
    topData: {
      ...defaultProps.topData,
      label: 'Amount Payable',
    },
    breakdownData: [
      {
        id: 'purchasePrice',
        label: 'Purchase Price',
        value: '₹100,000',
        tooltip: 'Price at which asset is purchased',
        decimals: 2,
        isShowTooltip: false,  
      },
      {
        id: 'totalAdditionalCharges',
        label: 'Premium',
        value: '₹5,000',
        tooltip: 'Additional premium charged',
        decimals: 2,
        isShowTooltip: false,  
      },
      {
        id: 'stampDuty',
        label: 'Stamp Duty',
        value: '₹1,000',
        tooltip: 'Government tax on financial transactions',
        decimals: 2,
        isShowTooltip: false,  
      },
      {
        id: 'accruedInterest',
        label: 'Accrued Interest',
        value: '₹2,500',
        tooltip: 'Interest accumulated since last payment date',
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

  const propsWithBrokerageFees = {
    ...defaultProps,
    breakdownData: [
      {
        id: 'brokerageFees',
        label: 'Brokerage Fees',
        value: '₹500.00',
        tooltip: 'Fees charged by brokers',
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
    expect(screen.getByTestId('number-animation')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('expands the accordion when clicked', () => {
    const { trackEvent } = require('../../../../utils/gtm');
    render(<Breakdown {...defaultProps} />);
    
    expect(screen.queryByText('Principal Amount')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('10000').closest('div'));

    expect(screen.getByText('Principal Amount')).toBeInTheDocument();
    expect(screen.getByText('Total Interest')).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('Pre Tax Returns Previewed', expect.objectContaining({
      action: 'expanded',
      principal_amount: expect.any(Number),
      total_interest: expect.any(Number),
    }));
  });

  test('collapses the accordion when clicked again', () => {
    const { trackEvent } = require('../../../../utils/gtm');
    render(<Breakdown {...defaultProps} />);
    
    fireEvent.click(screen.getByText('10000').closest('div'));
    expect(screen.getByText('Principal Amount')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('10000').closest('div'));
    expect(trackEvent).toHaveBeenCalledWith('Pre Tax Returns Previewed', expect.objectContaining({
      action: 'collapsed',
    }));
  });

  test('tracks Amount Payable events correctly', () => {
    const { trackEvent } = require('../../../../utils/gtm');
    render(<Breakdown {...amountPayableProps} />);
    
    fireEvent.click(screen.getByText('10000').closest('div'));
    expect(trackEvent).toHaveBeenCalledWith('Amount Payable Previewed', expect.objectContaining({
      action: 'expanded',
      principal_amount: expect.any(Number),
      premium: expect.any(Number),
      stamp_duty: expect.any(Number),
      accured_interest: expect.any(Number),
    }));
  });

  test('opens info modal when modal link is clicked', () => {
    render(<Breakdown {...modalContentProps} />);
    
    fireEvent.click(screen.getByText('10000').closest('div'));
    fireEvent.click(screen.getByText('Learn more'));
    
    const modal = screen.getByTestId('info-modal');
    expect(modal).toBeInTheDocument();
    expect(modal.dataset.title).toBe('Information');
    expect(modal.dataset.content).toBe('This is modal content');
  });

  test('closes info modal when close button is clicked', () => {
    render(<Breakdown {...modalContentProps} />);
    
    fireEvent.click(screen.getByText('10000').closest('div'));
    fireEvent.click(screen.getByText('Learn more'));    
    expect(screen.getByTestId('info-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('info-modal')).not.toBeInTheDocument();
  });

  test('renders brokerage fees with special styling when value is not zero', () => {
    const propsWithBrokerageFees = {
      ...defaultProps,
      breakdownData: [
        {
          id: 'brokerageFees',
          label: 'Brokerage Fees',
          value: '₹500.00',
          tooltip: 'fees charged by brokers',
          decimals: 2,
          isShowTooltip: false
        },
      ],
    };
    
    render(<Breakdown {...propsWithBrokerageFees} />);
    
    fireEvent.click(screen.getByText('10000').closest('div'));
    
    expect(screen.getByText('₹500.00')).toBeInTheDocument();
    expect(screen.getByText('₹0')).toBeInTheDocument();
  });

  test('handles missing asset information gracefully', () => {
    const propsWithoutAsset = {
      ...defaultProps,
      asset: undefined,
    };
    
    render(<Breakdown {...propsWithoutAsset} />);
    
    fireEvent.click(screen.getByText('10000').closest('div'));
    
    expect(screen.getByText('Principal Amount')).toBeInTheDocument();
  });
});