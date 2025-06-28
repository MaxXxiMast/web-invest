import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomSkeleton from './CustomSkeleton';

// Mock dependencies
jest.mock('../../../utils/string', () => ({
  handleExtraProps: jest.fn((className) => className || ''),
}));

// Mock CSS modules
jest.mock('./CustomSkeleton.module.css', () => ({
  Wrapper: 'mock-wrapper-class',
}));

describe('CustomSkeleton', () => {
  test('renders with default props', () => {
    const { container } = render(<CustomSkeleton />);
    const skeletonElement = container.firstChild;

    expect(skeletonElement).toHaveClass('mock-wrapper-class');
    expect(skeletonElement).toHaveStyle('display: block');
  });

  test('applies custom className when provided', () => {
    const { container } = render(<CustomSkeleton className="custom-class" />);
    const skeletonElement = container.firstChild;

    expect(skeletonElement).toHaveClass('mock-wrapper-class');
    expect(skeletonElement).toHaveClass('custom-class');
  });

  test('applies custom styles when provided', () => {
    const customStyles = {
      width: '200px',
      height: '50px',
      backgroundColor: 'gray',
    };

    const { container } = render(<CustomSkeleton styles={customStyles} />);
    const skeletonElement = container.firstChild;

    expect(skeletonElement).toHaveStyle({
      width: '200px',
      height: '50px',
      backgroundColor: 'gray',
    });
  });

  test('applies both custom className and styles together', () => {
    const customStyles = { width: '100px', borderRadius: '8px' };

    const { container } = render(
      <CustomSkeleton className="test-class" styles={customStyles} />
    );

    const skeletonElement = container.firstChild;

    expect(skeletonElement).toHaveClass('mock-wrapper-class');
    expect(skeletonElement).toHaveClass('test-class');
    expect(skeletonElement).toHaveStyle({
      width: '100px',
      borderRadius: '8px',
    });
  });
});
