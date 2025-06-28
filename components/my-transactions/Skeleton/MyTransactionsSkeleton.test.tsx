import React from 'react';
import { render, screen } from '@testing-library/react';
import Skeleton from './index';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// Mock CustomSkeleton to simplify testing and track props
jest.mock('../../primitives/CustomSkeleton/CustomSkeleton', () => {
  return jest.fn(({ styles }) => (
    <div data-testid="custom-skeleton" style={styles}></div>
  ));
});

describe('Skeleton Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders container with correct class and test id', () => {
    render(<Skeleton />);
    const container = screen.getByTestId('MyTransactionsSkeleton');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('flex-column');
  });

  test('renders 5 CustomSkeleton components in desktop mode', () => {
    render(<Skeleton isMobile={false} />);
    const skeletons = screen.getAllByTestId('custom-skeleton');
    expect(skeletons).toHaveLength(5);

    // The first one (non-mobile) should have height 30
    expect(skeletons[0]).toHaveStyle('height: 30px');

    // The other 4 should have height 100px
    skeletons.slice(1).forEach((skeleton) => {
      expect(skeleton).toHaveStyle('height: 100px');
    });
  });

  test('renders 4 CustomSkeleton components in mobile mode', () => {
    render(<Skeleton isMobile={true} />);
    const skeletons = screen.getAllByTestId('custom-skeleton');
    expect(skeletons).toHaveLength(4);

    // All should have height 150px in mobile mode
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveStyle('height: 150px');
    });
  });
});
