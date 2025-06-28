import { render, screen } from '@testing-library/react';
import Status from '.';

describe('My Holdings', () => {
  test('Status', () => {
    render(<Status status={'Withdrawn'} />);
    const element = screen.getByTestId('MyHoldingsStatus');
    expect(element).toBeInTheDocument();
  });
});
