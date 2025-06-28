import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReturnAndInvestmentModal } from './ReturnAndInvestmentModal';

jest.mock('../../../../utils/number', () => ({
  numberToIndianCurrency: jest.fn(() => '₹1,000.00'),
}));

jest.mock('react-html-parser', () => ({
  __esModule: true,
  default: (html: string) => html,
}));

jest.mock('../../../primitives/MaterialModalPopup', () => ({
  __esModule: true,
  default: ({ children, showModal }: any) =>
    showModal ? <div data-testid="material-modal">{children}</div> : null,
}));

jest.mock('../../../primitives/InfoModal/Infomodal', () => ({
  __esModule: true,
  default: ({ showModal, modalTitle, modalContent }: any) =>
    showModal ? (
      <div data-testid="info-modal">
        <h1>{modalTitle}</h1>
        <div>{modalContent}</div>
      </div>
    ) : null,
}));

jest.mock('../../../primitives/TooltipCompoent/TooltipCompoent', () => ({
  __esModule: true,
  default: ({ toolTipText, children }: any) => (
    <div data-testid="tooltip" title={toolTipText}>
      {children}
    </div>
  ),
}));

jest.mock('../../../primitives/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  ButtonType: { Secondary: 'secondary' },
}));

describe('ReturnAndInvestmentModal — happy path', () => {
  const amountBreakdown = {
    label: 'Total Return',
    tooltipText: 'Header tooltip',
    numValue: 1000,
    breakDownData: [
      {
        id: 'brokerageFees',
        label: 'Brokerage',
        value: '₹100.00',
        modalLinkLabel: 'More Info',
        modalTitle: 'Brokerage Title',
        modalContent: 'Brokerage Content',
        isHTML: false,
        isShowTooltip: true,
        tooltip: '<span>Row tooltip</span>',
      },
      {
        id: 'netReturns',
        label: 'Net Returns',
        value: '₹900.00',
      },
    ],
  };

  let setShowModal: jest.Mock;
  beforeEach(() => {
    setShowModal = jest.fn();
  });

  it('renders header label, value and header tooltip', () => {
    render(
      <ReturnAndInvestmentModal
        showModal={true}
        setShowModal={setShowModal}
        amountBreakdown={amountBreakdown}
      />
    );

    const tooltips = screen.getAllByTestId('tooltip');

    const headerTooltip = tooltips.find(
      (el) => el.getAttribute('title') === 'Header tooltip'
    );

    expect(headerTooltip).toBeInTheDocument();
    expect(headerTooltip).toHaveAttribute('title', 'Header tooltip');
  });

  test('renders breakdown rows with correct labels, values, tooltips and brokerage ₹0 suffix', () => {
    render(
      <ReturnAndInvestmentModal
        showModal={true}
        setShowModal={setShowModal}
        amountBreakdown={amountBreakdown}
      />
    );

    // Brokerage row label & value
    expect(screen.getByText('Brokerage')).toBeInTheDocument();
    expect(screen.getByText('₹100.00')).toBeInTheDocument();

    // brokerageFees should append an extra "₹0" after the value
    expect(screen.getByText('₹0')).toBeInTheDocument();

    // row-level tooltip icon (for the first item)
    const rowTooltips = screen.getAllByTestId('tooltip');
    // one for header, one for this row
    expect(rowTooltips.length).toBeGreaterThanOrEqual(2);
    expect(rowTooltips[1]).toHaveAttribute('title', '<span>Row tooltip</span>');

    // Net Returns row
    expect(screen.getByText('Net Returns')).toBeInTheDocument();
    expect(screen.getByText('₹900.00')).toBeInTheDocument();
  });

  test('opens InfoModal with correct content when modalLinkLabel is clicked', () => {
    render(
      <ReturnAndInvestmentModal
        showModal={true}
        setShowModal={setShowModal}
        amountBreakdown={amountBreakdown}
      />
    );

    // click the "More Info" link
    fireEvent.click(screen.getByText('More Info'));

    // InfoModal should appear
    const infoModal = screen.getByTestId('info-modal');
    expect(infoModal).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Brokerage Title' })
    ).toBeInTheDocument();
    expect(screen.getByText('Brokerage Content')).toBeInTheDocument();
  });

  test('clicking "Got it" button calls setShowModal(false)', () => {
    render(
      <ReturnAndInvestmentModal
        showModal={true}
        setShowModal={setShowModal}
        amountBreakdown={amountBreakdown}
      />
    );

    fireEvent.click(screen.getByText('Got it'));
    expect(setShowModal).toHaveBeenCalledWith(false);
  });

  test('does not render main modal when showModal is false', () => {
    render(
      <ReturnAndInvestmentModal
        showModal={false}
        setShowModal={setShowModal}
        amountBreakdown={amountBreakdown}
      />
    );

    expect(screen.queryByTestId('material-modal')).toBeNull();
  });
});
