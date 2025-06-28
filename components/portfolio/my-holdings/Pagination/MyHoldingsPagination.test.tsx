import { render, screen } from '@testing-library/react';
import MyHoldingsPagination from '.';
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';

jest.mock('../../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

describe('My Holdings', () => {
  test('Pagination', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    render(
      <MyHoldingsPagination
        activePage={1}
        totalPages={1}
        handlePageChange={() => {}}
      />
    );
    const element = screen.getByTestId('MyHoldingsPagination');
    expect(element).toBeInTheDocument();
  });
});
