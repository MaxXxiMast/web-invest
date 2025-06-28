import { render, fireEvent } from '@testing-library/react';
import ScrollToTop from './ScrollToTop';

describe('ScrollToTop Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.scrollTo = jest.fn();
  });

  const triggerScroll = (y: number) => {
    Object.defineProperty(window, 'scrollY', {
      value: y,
      writable: true,
    });

    fireEvent.scroll(window);
  };

  it('renders without crashing', () => {
    const { container } = render(<ScrollToTop />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('does not show scroll button initially', () => {
    const { container } = render(<ScrollToTop />);
    const scrollBtn = container.querySelector('div');
    expect(scrollBtn?.className).not.toContain('ShowBtn');
  });

  it('shows scroll button after scrolling more than 50px', () => {
    const { container } = render(<ScrollToTop />);
    triggerScroll(100);

    const scrollBtn = container.querySelector('div');
    expect(scrollBtn?.className).toContain('ShowBtn');
  });

  it('hides scroll button when scrolling back above 50px', () => {
    const { container } = render(<ScrollToTop />);
    triggerScroll(100); // Show it
    triggerScroll(30); // Then hide it

    const scrollBtn = container.querySelector('div');
    expect(scrollBtn?.className).not.toContain('ShowBtn');
  });

  it('scrolls to top when clicked', () => {
    const { container } = render(<ScrollToTop />);
    triggerScroll(100);

    const scrollBtn = container.querySelector('div');
    if (scrollBtn) {
      fireEvent.click(scrollBtn);
    }

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });
});
