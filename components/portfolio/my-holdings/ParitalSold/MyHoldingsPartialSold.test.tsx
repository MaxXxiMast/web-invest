import { render, screen } from '@testing-library/react';
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
import PartialSold from '.';

jest.mock('../../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

describe('My Holdings', () => {
  test('Partial Sold', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    render(<PartialSold show={true} />);
    const element = screen.getByTestId('MyHoldingsPartialSold');
    expect(element).toBeInTheDocument();
  });
});
