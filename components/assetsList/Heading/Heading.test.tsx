import { render, screen } from '@testing-library/react';
import Heading from '.';

// Mock components
jest.mock('../SDIFilterTab', () => ({
  __esModule: true,
  default: ({ event }: any) => (
    <div data-testid="sdi-filter-tab" data-event={event}></div>
  ),
}));

jest.mock('../AssetFilters/ResetFIlters', () => ({
  __esModule: true,
  default: ({ productType, totalCount }: any) => (
    <div
      data-testid="reset-filters"
      data-product={productType}
      data-count={totalCount}
    ></div>
  ),
}));

describe('Heading Component', () => {
  it('renders with title "Corporate Bonds" and shows ResetFilters', () => {
    render(
      <Heading
        title="Corporate Bonds"
        totalCount={5}
        subCategory="Default"
        SDITabArr={[]}
      />
    );
    expect(screen.getByText('Corporate Bonds')).toBeInTheDocument();
    const resetFilters = screen.getByTestId('reset-filters');
    expect(resetFilters).toHaveAttribute('data-product', 'Bonds');
    expect(resetFilters).toHaveAttribute('data-count', '5');
  });

  it('renders with title "Baskets" and shows ResetFilters', () => {
    render(
      <Heading
        title="Baskets"
        totalCount={10}
        subCategory="Default"
        SDITabArr={[]}
      />
    );
    expect(screen.getByText('Baskets')).toBeInTheDocument();
    expect(screen.getByTestId('reset-filters')).toBeInTheDocument();
  });

  it('renders with title "High Yield FDs" and shows ResetFilters', () => {
    render(
      <Heading
        title="High Yield FDs"
        totalCount={3}
        subCategory="Default"
        SDITabArr={[]}
      />
    );
    expect(screen.getByTestId('reset-filters')).toHaveAttribute(
      'data-product',
      'High Yield FDs'
    );
  });

  it('does not render ResetFilters or SDIFilterTab when title is unknown', () => {
    render(
      <Heading title="Unknown Product" subCategory="Default" SDITabArr={[]} />
    );
    expect(screen.queryByTestId('reset-filters')).toBeNull();
  });
});
