import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar Component', () => {
  it('TC 1: should render ProgressBar container with correct height', () => {
    render(<ProgressBar barHeight={4} />);

    const container = document.querySelector('.ProgressBar');
    expect(container).toBeInTheDocument();
    expect(container).toHaveStyle('height: 4px');
  });

  test('TC: should apply correct width and height styles', () => {
    const Width = 0; 
    render(<ProgressBar progressWidth={Width} />);
  
    const progressBar = screen.getByRole('progressbar');
    const span = progressBar.querySelector('span');
    expect(span).toHaveStyle(`width: ${Width}%`);
  });

  it('TC 3: should apply additional className if provided', () => {
    render(<ProgressBar className="custom-progress" />);

    const container = document.querySelector('.ProgressBar');
    expect(container?.className).toContain('custom-progress');
  });

  it('TC 4: should fallback to default progressWidth and barHeight', () => {
    render(<ProgressBar />);

    const container = document.querySelector('.ProgressBar');
    const filledSpan = document.querySelector('.ProgressBar span');

    expect(container).toHaveStyle('height: 4px');
    expect(filledSpan).toHaveStyle('width: 0%');
  });
});
