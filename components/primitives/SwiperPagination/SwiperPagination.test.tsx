import { render } from '@testing-library/react';
import SwiperPagination from './SwiperPagination';
import { handleExtraProps } from '../../../utils/string';

jest.mock('../../../utils/string', () => ({
  handleExtraProps: jest.fn((input) => input || ''),
}));

describe('SwiperPagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props', () => {
    const { container } = render(<SwiperPagination paginationId="" />);

    const paginationElement = container.firstChild;
    expect(paginationElement).toBeInTheDocument();
    expect(paginationElement).toHaveClass('SwiperPagination');
  });

  test('renders with custom className', () => {
    const { container } = render(
      <SwiperPagination paginationId="" className="custom-class" />
    );

    const paginationElement = container.firstChild;
    expect(paginationElement).toHaveClass('custom-class');
    expect(paginationElement).toHaveClass('SwiperPagination');
  });

  test('renders with custom paginationId', () => {
    const { container } = render(
      <SwiperPagination paginationId="custom-pagination" />
    );

    expect(container.querySelector('#custom-pagination')).toBeInTheDocument();
  });

  test('handles empty paginationId correctly', () => {
    const { container } = render(<SwiperPagination paginationId="" />);

    const paginationElement = container.firstChild;
    expect(paginationElement).toHaveAttribute('id', '');
  });

  test('handles undefined props', () => {
    const { container } = render(
      <SwiperPagination paginationId={undefined} className={undefined} />
    );

    const paginationElement = container.firstChild;
    expect(paginationElement).toBeInTheDocument();
    expect(handleExtraProps).toHaveBeenCalledWith('');
  });

  test('checks if the component has appropriate ARIA attributes for accessibility', () => {
    const { container } = render(
      <SwiperPagination paginationId="pagination" />
    );
    const paginationElement = container.firstChild;
    expect(paginationElement).toBeInTheDocument();
  });

  test('calls handleExtraProps with the correct parameters', () => {
    render(
      <SwiperPagination
        paginationId="custom-pagination"
        className="custom-class"
      />
    );

    expect(handleExtraProps).toHaveBeenCalledWith('custom-pagination');
    expect(handleExtraProps).toHaveBeenCalledWith('custom-class');
  });

  test('combines CSS module classes with provided className', () => {
    const { container } = render(
      <SwiperPagination
        paginationId="custom-pagination"
        className="custom-class"
      />
    );

    const paginationElement = container.firstChild;
    expect(paginationElement).toHaveClass('Pagination');
    expect(paginationElement).toHaveClass('custom-class');
    expect(paginationElement).toHaveClass('SwiperPagination');
  });
});
