import React from 'react';
import { render, screen } from '@testing-library/react';
import StickySidebar from './StickySidebar';

jest.mock('react-sticky-el', () => {
  const MockSticky = ({ children, ...props }: any) => (
    <div data-testid="mock-sticky" {...props}>
      {children}
    </div>
  );
  MockSticky.displayName = 'MockSticky';
  return MockSticky;
});

describe('StickySidebar Component', () => {
  it('TC 1: should render children inside Sticky by default', () => {
    render(<StickySidebar />);
    expect(screen.getByTestId('mock-sticky')).toBeInTheDocument();
  });

  it('TC 2: should not wrap with Sticky if isSticky is false', () => {
    render(<StickySidebar isSticky={false} />);
    expect(screen.queryByTestId('mock-sticky')).not.toBeInTheDocument();
  });

  it('TC 3: should pass bottomOffset to Sticky', () => {
    render(<StickySidebar bottomOffset={120} />);
    expect(screen.getByTestId('mock-sticky')).toHaveAttribute('bottomOffset', '120');
  });

  it('TC 4: should apply stickyClassName properly', () => {
    render(<StickySidebar stickyClassName="my-sticky-class" />);
    expect(screen.getByTestId('mock-sticky')).toHaveAttribute('stickyClassName', 'my-sticky-class');
  });

  it('TC 5: should handle empty stickyClassName properly', () => {
    render(<StickySidebar stickyClassName="" />);
    expect(screen.getByTestId('mock-sticky')).toHaveAttribute('stickyClassName', '');
  });

  it('TC 6: should apply default bottomOffset if not provided', () => {
    render(<StickySidebar />);
    expect(screen.getByTestId('mock-sticky')).toHaveAttribute('bottomOffset', '80');
    
  });
});
