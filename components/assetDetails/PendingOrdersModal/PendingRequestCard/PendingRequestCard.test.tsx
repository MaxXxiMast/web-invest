import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PendingRequestCard from '../PendingRequestCard';
import '@testing-library/jest-dom';

// Mock dynamic import
jest.mock('next/dynamic', () => {
  return () => {
    const MockComponent = (props: any) => (
      <div data-testid="dynamic-modal">{props.children}</div>
    );
    MockComponent.displayName = 'MockDynamicComponent';
    return MockComponent;
  };
});

// Mock APIs
jest.mock('../../../../api/payment', () => ({
  getPaymentType: jest.fn(),
}));

jest.mock('../../../../api/order', () => ({
  fetchUtrNumber: jest.fn(),
}));

// Mock primitives
jest.mock('../../../primitives/Image', () => {
  const MockImage = (props: any) => (
    <img src={props.src} alt={props.alt} data-testid="mock-image" />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('../../../primitives/Button', () => {
  const MockButton = (props: any) => (
    <button {...props} data-testid="mock-button">
      {props.children}
    </button>
  );
  MockButton.displayName = 'MockButton';
  return MockButton;
});

// Mock utilities
jest.mock('../../../../utils/number', () => ({
  numberToIndianCurrencyWithDecimals: (num: number) => `₹${num.toFixed(2)}`,
}));

jest.mock('../../../../utils/dateFormatter', () => ({
  isToday: () => true,
}));

// Mock other components
jest.mock('../../../confirmation/order-journey/VerticalStepper', () => ({
  RenderBankDetailModal: () => (
    <div data-testid="bank-detail-modal">Bank Details</div>
  ),
}));

jest.mock('../../../portfolio-investment/portfolio-card-rfq', () => ({
  AmoCard: () => <div data-testid="amo-card">AmoCard</div>,
}));

jest.mock('../../../portfolio/utils', () => ({
  amoTextFormat: (prefix: string, date: string, bold?: boolean) =>
    `${prefix} ${date}`,
}));

// Test props
const mockProps = {
  investmentValue: 50000,
  amount: 50000,
  assetID: 123,
  units: 2,
  expireBy: '2025-12-12',
  partnerLogo: 'https://example.com/logo.png',
  assetName: 'MyAssetName',
  transactionID: 'txn123',
  handleClick: jest.fn(),
  handleUtrModal: jest.fn(),
  isAmo: 0,
  rfqID: 456,
  amoLink: '',
  amoStartDate: '',
  amoExpireBy: '',
  isMarketClosed: false,
};

import { getPaymentType } from '../../../../api/payment';
import { fetchUtrNumber } from '../../../../api/order';

describe('PendingRequestCard', () => {
  beforeEach(() => {
    (getPaymentType as jest.Mock).mockResolvedValue({
      NSE: {
        priority: 1,
        upi: { isAllowed: false },
        netBanking: { isAllowed: false },
        offline: {
          isAllowed: true,
          isExpired: false,
          details: { bank: 'ABC Bank' },
        },
        settlementDate: '2025-12-12',
      },
    });

    (fetchUtrNumber as jest.Mock).mockResolvedValue({
      utr: '',
    });
  });

  it('renders correctly and displays amount', async () => {
    render(<PendingRequestCard {...mockProps} />);

    expect(await screen.findByText('Pay ₹50000.00')).toBeInTheDocument();
    expect(screen.getByTestId('mock-image')).toHaveAttribute(
      'src',
      mockProps.partnerLogo
    );
    expect(screen.getByText(/ID :/)).toHaveTextContent('MyAssetName');
  });

  it('disables the pay button when UTR is recorded', async () => {
    (fetchUtrNumber as jest.Mock).mockResolvedValueOnce({
      utr: '1234567890',
    });

    render(<PendingRequestCard {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('UTR recorded')).toBeInTheDocument();
    });

    const button = screen.getByTestId('mock-button');
    expect(button).toBeDisabled();
  });

  it('calls handleClick on pay button click when online is not available and UTR not present', async () => {
    render(<PendingRequestCard {...mockProps} />);

    const button = await screen.findByText("I've paid via NEFT/RTGS");
    fireEvent.click(button);

    expect(mockProps.handleUtrModal).toHaveBeenCalled();
  });
});
