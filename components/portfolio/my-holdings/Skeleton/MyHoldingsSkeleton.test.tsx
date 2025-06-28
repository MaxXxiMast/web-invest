import { render, screen } from '@testing-library/react';
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
import Skeleton from '.';

jest.mock('../../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

describe('My Holdings', () => {
  test('Skeleton', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    render(<Skeleton />);
    const element = screen.getByTestId('MyHoldingsSkeleton');
    expect(element).toBeInTheDocument();
  });
});
