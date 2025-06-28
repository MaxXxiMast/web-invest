import { render, screen } from '@testing-library/react';
import MyHoldingsLink from '.';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('My Transactions', () => {
  test('My Holdings Link', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    render(<MyHoldingsLink />);
    const element = screen.getByTestId('MyHoldingsLink');
    expect(element).toBeInTheDocument();
  });
});
