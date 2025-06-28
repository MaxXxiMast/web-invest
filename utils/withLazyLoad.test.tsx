import { render, screen } from '@testing-library/react';
import withLazyLoad from './withLazyLoad';
import useIntersectionObserver from './useIntersectionObserver';

jest.mock('./useIntersectionObserver');

jest.mock('../components/primitives/CustomSkeleton/CustomSkeleton', () => {
  return function MockCustomSkeleton({ styles }) {
    return <div data-testid="skeleton" style={styles}>Loading...</div>;
  };
});

const TestComponent = ({ text = 'Test Content' }) => <div data-testid="test-component">{text}</div>;

describe('withLazyLoad HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders skeleton initially when not in view', () => {
    (useIntersectionObserver as jest.Mock).mockReturnValue([false, jest.fn()]);
    
    const LazyComponent = withLazyLoad(TestComponent);
    render(<LazyComponent />);
    
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
  });

  test('renders wrapped component when in view', () => {
    (useIntersectionObserver as jest.Mock).mockReturnValue([true, jest.fn()]);
    
    const LazyComponent = withLazyLoad(TestComponent);
    render(<LazyComponent />);
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
  });
});