import fetchMock from 'jest-fetch-mock';
import { render, screen } from '@testing-library/react';
import MyTransactions from '.';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

// Mock the useMediaQuery hook
jest.mock('../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(() => ({
    userData: { id: 1, name: 'Test User' },
  })),
}));

fetchMock.enableMocks();

describe('My Holdings', () => {
  test('Desktop View', () => {
    // Mock the return value of useMediaQuery to be false (indicating desktop view)
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    render(<MyTransactions />);

    // Check if the Desktop component is rendered
    const desktopElement = screen.getByTestId('MyTransactionsDesktop');
    expect(desktopElement).toBeInTheDocument();
  });

  test('Mobile View', () => {
    // Mock the return value of useMediaQuery to be true (indicating mobile view)
    (useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<MyTransactions />);

    // Check if the Mobile component is rendered
    const mobileElement = screen.getByTestId('MyTransactionsMobile');
    expect(mobileElement).toBeInTheDocument();
  });
});
