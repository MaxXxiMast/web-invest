import { render, screen } from '@testing-library/react';
import OrderType from '.';

describe('My Transactions', () => {
  test('Order Type', () => {
    render(<OrderType />);
    const element = screen.getByTestId('MyTransactionsOrderType');
    expect(element).toBeInTheDocument();
  });
});
