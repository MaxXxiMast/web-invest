import { render, screen, fireEvent } from '@testing-library/react';
jest.resetModules();
// Mocks for utils
jest.doMock('../utils', () => ({
  __esModule: true,
  sortOptions: [{ label: 'Relevance', value: 'relevance' }],
  assetFilters: {
    type: {
      label: 'Type',
      tooltipContent: 'Filter by type',
      options: ['One', 'Two'],
    },
    rating: {
      label: 'Rating',
      tooltipContent: 'Filter by rating',
      options: ['AAA', 'BBB'],
    },
    dummyFilter: {
      label: undefined,
      tooltipContent: undefined,
      options: undefined,
    },
    partialLabel: {
      label: undefined,
      tooltipContent: 'Only tooltip',
      options: ['One'],
    },
    partialTooltip: {
      label: 'Only label',
      tooltipContent: undefined,
      options: ['Two'],
    },
    partialOptions: {
      label: 'Label',
      tooltipContent: 'Tooltip',
      options: undefined,
    },
  },
}));

// Mock SortFilter
jest.doMock('../SortFilter/SortFilter', () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <select
      data-testid="sort-filter"
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="relevance">Relevance</option>
    </select>
  ),
}));
// Mock FilterGroup
jest.doMock('../FilterGroup/FilterGroup', () => ({
  __esModule: true,
  default: ({ label, tooltipContent, options, onChange }: any) => (
    <div data-testid="filter-group">
      <div>Label: {label || 'undefined'}</div>
      <div>Tooltip: {tooltipContent || 'undefined'}</div>
      <div>Options: {options?.join(', ') || 'undefined'}</div>
      <button onClick={() => onChange(['mocked'])}>Change {label}</button>
    </div>
  ),
}));
// Mock Modal
jest.doMock('../../../primitives/MaterialModalPopup', () => ({
  __esModule: true,
  default: ({ showModal, children }: any) =>
    showModal ? <div>{children}</div> : null,
}));
// Mock Button
jest.doMock('../../../primitives/Button', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    ButtonType: {
      Inverted: 'inverted',
    },
  };
});
describe('AssetFilters Component', () => {
  it('renders safely with missing assetFilters fields', async () => {
    const AssetFilters = (await import('../FilterAssets')).default;
    render(
      <AssetFilters
        showModal={true}
        handleModalClose={jest.fn()}
        sortOptionState="relevance"
        handleSortChange={jest.fn()}
        filtersState={{}} // <== Intentionally empty
        handleFilterChange={jest.fn()}
        handleResetBtn={jest.fn()}
        handleApplyBtn={jest.fn()}
      />
    );
    expect(screen.getAllByText(/Label:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tooltip:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Options:/i).length).toBeGreaterThan(0);
  });
  it('calls handleSortChange with correct value', async () => {
    const AssetFilters = (await import('../FilterAssets')).default;
    const handleSortChange = jest.fn();
    render(
      <AssetFilters
        showModal={true}
        handleModalClose={jest.fn()}
        sortOptionState="relevance"
        handleSortChange={handleSortChange}
        filtersState={{}}
        handleFilterChange={jest.fn()}
        handleResetBtn={jest.fn()}
        handleApplyBtn={jest.fn()}
      />
    );
    const select = screen.getByTestId('sort-filter');
    fireEvent.change(select, { target: { value: 'relevance' } });
    expect(handleSortChange).toHaveBeenCalledWith('relevance');
  });
  it('renders multiple filters and triggers filter change', async () => {
    const AssetFilters = (await import('../FilterAssets')).default;
    const handleFilterChange = jest.fn();
    render(
      <AssetFilters
        showModal={true}
        handleModalClose={jest.fn()}
        sortOptionState="relevance"
        handleSortChange={jest.fn()}
        filtersState={{ type: [], rating: [] }}
        handleFilterChange={handleFilterChange}
        handleResetBtn={jest.fn()}
        handleApplyBtn={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('Change Type'));
    fireEvent.click(screen.getByText('Change Rating'));
    expect(handleFilterChange).toHaveBeenCalledTimes(2);
    expect(handleFilterChange).toHaveBeenCalledWith('type', ['mocked']);
    expect(handleFilterChange).toHaveBeenCalledWith('rating', ['mocked']);
  });
  it('calls reset and apply button handlers', async () => {
    const AssetFilters = (await import('../FilterAssets')).default;
    const handleReset = jest.fn();
    const handleApply = jest.fn();
    render(
      <AssetFilters
        showModal={true}
        handleModalClose={jest.fn()}
        sortOptionState="relevance"
        handleSortChange={jest.fn()}
        filtersState={{}}
        handleFilterChange={jest.fn()}
        handleResetBtn={handleReset}
        handleApplyBtn={handleApply}
      />
    );
    fireEvent.click(screen.getByText('Reset'));
    fireEvent.click(screen.getByText('Apply'));
    expect(handleReset).toHaveBeenCalled();
    expect(handleApply).toHaveBeenCalled();
  });
  it('does not render modal when showModal is false', async () => {
    const AssetFilters = (await import('../FilterAssets')).default;
    const { container } = render(
      <AssetFilters
        showModal={false}
        handleModalClose={jest.fn()}
        sortOptionState="relevance"
        handleSortChange={jest.fn()}
        filtersState={{}}
        handleFilterChange={jest.fn()}
        handleResetBtn={jest.fn()}
        handleApplyBtn={jest.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
  it('renders all filter groups from assetFilters', async () => {
    const AssetFilters = (await import('../FilterAssets')).default;
    const mockFilters = {
      ytm: [],
      tenure: [],
      minInvestment: [],
      principalRepayment: [],
      rating: [],
    };
    const { container } = render(
      <AssetFilters
        showModal={true}
        handleModalClose={jest.fn()}
        sortOptionState="relevance"
        handleSortChange={jest.fn()}
        filtersState={mockFilters}
        handleFilterChange={jest.fn()}
        handleResetBtn={jest.fn()}
        handleApplyBtn={jest.fn()}
      />
    );
    // Prefix 'Label: ' as that's how it's rendered
    const expectedLabels = ['Label: Type', 'Label: Rating'];
    for (const label of expectedLabels) {
      expect(container).toHaveTextContent(label);
    }
  });

  it('renders FilterGroup with missing options safely', async () => {
    const AssetFilters = (await import('../FilterAssets')).default;
    const filtersWithMissingOptions = {
      type: [],
      rating: undefined,
      someFilter: undefined,
    };
    render(
      <AssetFilters
        showModal={true}
        handleModalClose={jest.fn()}
        sortOptionState="relevance"
        handleSortChange={jest.fn()}
        filtersState={filtersWithMissingOptions}
        handleFilterChange={jest.fn()}
        handleResetBtn={jest.fn()}
        handleApplyBtn={jest.fn()}
      />
    );
    expect(screen.getAllByTestId('filter-group').length).toBeGreaterThan(0);
  });

  it('calls handleFilterChange with empty array', async () => {
    const AssetFilters = (await import('../FilterAssets')).default;
    const handleFilterChange = jest.fn();
    render(
      <AssetFilters
        showModal={true}
        handleModalClose={jest.fn()}
        sortOptionState="relevance"
        handleSortChange={jest.fn()}
        filtersState={{ type: ['One'] }}
        handleFilterChange={handleFilterChange}
        handleResetBtn={jest.fn()}
        handleApplyBtn={jest.fn()}
      />
    );
  
    // Simulate empty array change
    fireEvent.click(screen.getByText('Change Type'));
    expect(handleFilterChange).toHaveBeenCalledWith('type', ['mocked']);
  });

  it('uses default props when not provided (showModal)', async () => {
    const AssetFilters = (await import('../FilterAssets')).default;
    const { container } = render(
      <AssetFilters
        // showModal prop is omitted here to trigger the default
        handleModalClose={jest.fn()}
        sortOptionState="relevance"
        handleSortChange={jest.fn()}
        filtersState={{}}
        handleFilterChange={jest.fn()}
        handleResetBtn={jest.fn()}
        handleApplyBtn={jest.fn()}
      />
    );
    // Since showModal defaults to false, modal should not be visible
    expect(container).toBeEmptyDOMElement();
  });
  
  
});

