import { render, screen } from '@testing-library/react';
import MyTransactionsPagination from '.';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

describe('My Transactions', () => {
  test('Pagination', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    render(
      <MyTransactionsPagination
        activePage={1}
        totalPages={2}
        handlePageChange={() => {}}
      />
    );
    const element = screen.getByTestId('MyTransactionsPagination');
    expect(element).toBeInTheDocument();
  });
});
