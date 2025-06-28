import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TablePagination from './index';
import { handleExtraProps } from '../../../utils/string';

jest.mock('../../../utils/string', () => ({
  handleExtraProps: jest.fn((className) => className),
}));

jest.mock('@mui/material', () => ({
  Pagination: (props: any) => {
    return (
      <div data-testid="mock-pagination" onClick={(e) => props.onChange(e, props.page + 1)}>
        <span data-testid="pagination-page">{props.page}</span>
        <span data-testid="pagination-count">{props.count}</span>
        <span data-testid="pagination-boundary-count">{props.boundaryCount}</span>
        <span data-testid="pagination-sibling-count">{props.siblingCount}</span>
      </div>
    );
  },
}));

jest.mock('../../portfolio-summary/my-returns/ReturnsTable/constants', () => ({
  ROWS_PER_PAGE: 10,
}));

describe('TablePagination Component', () => {
  const defaultProps = {
    page: 1,
    totalCount: 100,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case - 1
  test('renders TablePagination', () => {
    render(<TablePagination {...defaultProps} />);
    
    const paginationInfoText = screen.getByText('Showing 1-10 from 100 entries');
    expect(paginationInfoText).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page').textContent).toBe('1');
  });

  // Test case - 2
  test('renders correct text when on last page with fewer items', () => {
    render(<TablePagination page={10} totalCount={95} onPageChange={jest.fn()} />);
    
    const paginationInfoText = screen.getByText('Showing 91-95 from 95 entries');
    expect(paginationInfoText).toBeInTheDocument();
  });

  // Test case - 3
  test('handles custom rowsPerPage prop correctly', () => {
    render(<TablePagination {...defaultProps} rowsPerPage={20} />);
    
    const paginationInfoText = screen.getByText('Showing 1-20 from 100 entries');
    expect(paginationInfoText).toBeInTheDocument();
    
    expect(screen.getByTestId('pagination-count').textContent).toBe('5');
  });

  // Test case - 4
  test('handles custom className prop correctly', () => {
    const customClassName = 'custom-pagination-class';
    render(<TablePagination {...defaultProps} className={customClassName} />);
    
    expect(handleExtraProps).toHaveBeenCalledWith(customClassName);
  });

  // Test case - 5
  test('handles custom siblingCount prop correctly', () => {
    render(<TablePagination {...defaultProps} siblingCount={2} />);
    
    expect(screen.getByTestId('pagination-sibling-count').textContent).toBe('2');
  });

  // Test case - 6
  test('calls onPageChange when page is changed', () => {
    const onPageChangeMock = jest.fn();
    render(<TablePagination {...defaultProps} onPageChange={onPageChangeMock} />);
    
    fireEvent.click(screen.getByTestId('mock-pagination'));
    
    expect(onPageChangeMock).toHaveBeenCalledWith(2);
  });

  // Test case - 7
  test('handles single page case correctly', () => {
    render(<TablePagination page={1} totalCount={5} onPageChange={jest.fn()} />);
    
    const paginationInfoText = screen.getByText('Showing 1-5 from 5 entries');
    expect(paginationInfoText).toBeInTheDocument();
    
    expect(screen.getByTestId('pagination-count').textContent).toBe('1');
  });

  // Test case - 8
  test('uses default props when not provided', () => {
    render(<TablePagination totalCount={100} onPageChange={jest.fn()}/>);

    const paginationInfoText = screen.getByText('Showing 1-10 from 100 entries');
    expect(paginationInfoText).toBeInTheDocument();
  
    expect(screen.getByTestId('pagination-page').textContent).toBe('1');
  })
});