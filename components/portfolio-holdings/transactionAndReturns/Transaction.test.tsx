import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Transaction from './Transaction';
import { getUserTransactionAndReturns } from '../../../api/portfolio';
import { TabText } from './utils';
import classes from './Transaction.module.css';

// Mock the API call
jest.mock('../../../api/portfolio', () => ({
  getUserTransactionAndReturns: jest.fn(),
}));

// Mock the useMediaQuery hook
jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(() => false),
}));

describe('Transaction Component', () => {
  const mockProps = {
    showModal: true,
    setShowModal: jest.fn(),
    securityID: 12345,
    assetName: 'test',
  };

  const mockTransactionData = [
    {
      orderID: '123',
      transactionDate: '2023-01-01',
      type: 'BUY',
      quantity: 10,
      price: 100,
      value: 1000,
      returns: 50,
      returnPercent: 5,
    },
    {
      orderID: '456',
      transactionDate: '2023-02-01',
      type: 'SELL',
      quantity: 5,
      price: 110,
      value: 550,
      returns: 25,
      returnPercent: 2.5,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getUserTransactionAndReturns as jest.Mock).mockResolvedValue(
      mockTransactionData
    );
  });

  test('renders the component correctly when modal is open', async () => {
    render(<Transaction {...mockProps} />);

    expect(screen.getByText('Transactions and Returns')).toBeInTheDocument();

    await waitFor(() => {
      expect(getUserTransactionAndReturns).toHaveBeenCalledWith({
        key: Object.keys(TabText)[0],
        securityID: 12345,
      });
    });
  });

  test('shows loading state while fetching data', () => {
    render(<Transaction {...mockProps} />);
    const skeletonElement = document.querySelector('.MuiSkeleton-root');
    expect(skeletonElement).toBeInTheDocument();
  });

  test('displays transaction data after loading', async () => {
    render(<Transaction {...mockProps} />);
    await waitFor(() => {
      expect(getUserTransactionAndReturns).toHaveBeenCalled();
    });

    await waitFor(() => {
      const rows = document.querySelectorAll(`.${classes.row}`);
      expect(rows.length).toBe(2);
    });
  });
  test('switches tabs correctly', async () => {
    render(<Transaction {...mockProps} />);
    await waitFor(() => {
      expect(getUserTransactionAndReturns).toHaveBeenCalled();
    });
    const secondTabKey = Object.keys(TabText)[1];
    const secondTab = screen.getByText(TabText[secondTabKey]);
    fireEvent.click(secondTab);
    await waitFor(() => {
      expect(getUserTransactionAndReturns).toHaveBeenCalledWith({
        key: secondTabKey,
        securityID: 12345,
      });
    });
  });

  test('closes modal when close button is clicked', () => {
    render(<Transaction {...mockProps} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockProps.setShowModal).toHaveBeenCalledWith(false);
  });

  test('closes modal when OKAY button is clicked', () => {
    render(<Transaction {...mockProps} />);

    const okayButton = screen.getByText('OKAY');
    fireEvent.click(okayButton);

    expect(mockProps.setShowModal).toHaveBeenCalledWith(false);
  });

  test('handles mobile view correctly', async () => {
    require('../../../utils/customHooks/useMediaQuery').useMediaQuery.mockReturnValue(
      true
    );

    render(<Transaction {...mockProps} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const drawerElement = await screen.findByRole('presentation');
    expect(drawerElement).toBeInTheDocument();
  });

  test('displays additional info section', () => {
    render(<Transaction {...mockProps} />);

    expect(
      screen.getByText(
        /You'll receive returns in your Demat linked bank account/
      )
    ).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    (getUserTransactionAndReturns as jest.Mock).mockRejectedValue(
      new Error('API error')
    );

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<Transaction {...mockProps} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching transaction data:',
        expect.any(Error)
      );
    });
    expect(screen.getByText('Transactions and Returns')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
