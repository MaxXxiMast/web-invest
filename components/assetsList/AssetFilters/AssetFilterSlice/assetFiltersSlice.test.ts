// assetFiltersSlice.test.ts

import {
  setSortOption,
  setFilters,
  resetFilters,
  setFilteredDeals,
  setHasAppliedFilters,
  setShowFilterModal,
  resetFiltersWithLoading,
  setSortAndFilter,
  filterAssets,
  SortOption,
  FiltersState,
} from './assetFilters';

import reducer from './assetFilters';
import store from '../../../../redux';

jest.mock('../../../../redux/slices/assets', () => ({
  setLoading: jest.fn(() => ({ type: 'assets/setLoading' })),
}));

jest.mock('../utils', () => ({
  filterBy: jest.fn(() => [
    { id: '1', ytm: 12, assetMappingData: { rating: 'AAA' } },
  ]),
  sortDeals: jest.fn(() => [
    { id: '1', ytm: 12, assetMappingData: { rating: 'AAA' } },
  ]),
}));

const initialState = {
  sortOption: 'relevance' as SortOption,
  filters: {
    ytm: [],
    tenure: [],
    minInvestment: [],
    principalRepayment: [],
    rating: [],
  },
  filteredDeals: [],
  hasAppliedFilters: false,
  showFilterModal: false,
};

describe('assetFilters reducer', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle setSortOption', () => {
    const state = reducer(initialState, setSortOption('ytm-high-to-low'));
    expect(state.sortOption).toBe('ytm-high-to-low');
  });

  it('should handle setFilters', () => {
    const filters: FiltersState = {
      ytm: ['Above 12%'],
      tenure: [],
      minInvestment: [],
      principalRepayment: [],
      rating: [],
    };
    const state = reducer(initialState, setFilters(filters));
    expect(state.filters).toEqual(filters);
  });

  it('should handle resetFilters', () => {
    const state = reducer(undefined, resetFilters());
    expect(state).toEqual(initialState);
  });

  it('should handle setFilteredDeals', () => {
    const deals = [
      { id: '1', productCategory: 'test', financeProductType: 'type' },
    ];
    const state = reducer(initialState, setFilteredDeals(deals));
    expect(state.filteredDeals).toEqual(deals);
  });

  it('should handle setHasAppliedFilters', () => {
    const state = reducer(initialState, setHasAppliedFilters(true));
    expect(state.hasAppliedFilters).toBe(true);
  });

  it('should handle setShowFilterModal', () => {
    const state = reducer(initialState, setShowFilterModal(true));
    expect(state.showFilterModal).toBe(true);
  });
});

describe('assetFilters thunks using real store', () => {
  beforeEach(() => {
    store.dispatch(resetFilters());
    store.dispatch(setFilteredDeals([]));
  });

  it('resetFiltersWithLoading should reset filters and hide modal', async () => {
    await store.dispatch<any>(resetFiltersWithLoading());

    const state = store.getState().assetFilters;

    expect(state.filters).toEqual(initialState.filters);
    expect(state.showFilterModal).toBe(false);
  });

  it('setSortAndFilter should update filters, sort and deals', async () => {
    const filters: FiltersState = {
      ytm: ['Above 12%'],
      tenure: [],
      minInvestment: [],
      principalRepayment: [],
      rating: [],
    };

    const sortOption: SortOption = 'ytm-high-to-low';

    await store.dispatch<any>(setSortAndFilter(sortOption, filters));

    const state = store.getState().assetFilters;

    expect(state.sortOption).toBe(sortOption);
    expect(state.filters).toEqual(filters);
    expect(state.filteredDeals.length).toBeGreaterThan(0);
    expect(state.hasAppliedFilters).toBe(true);
    expect(state.showFilterModal).toBe(false);
  });

  it('filterAssets should apply sorted + filtered deals', async () => {
    await store.dispatch<any>(
      filterAssets('ytm-high-to-low', initialState.filters)
    );
    const state = store.getState().assetFilters;

    expect(state.filteredDeals.length).toBeGreaterThan(0);
  });
});
