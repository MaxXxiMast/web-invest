import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { filterBy, sortDeals } from '../utils';
import { AppThunk } from '../../../../redux';
import { setLoading } from '../../../../redux/slices/assets';

export type SortOption =
  | 'relevance'
  | 'ytm-high-to-low'
  | 'tenure-low-to-high'
  | 'investment-low-to-high'
  | 'rating-low-to-high'
  | 'rating-high-to-low';

export type FiltersState = {
  ytm: string[];
  tenure: string[];
  minInvestment: string[];
  principalRepayment: string[];
  rating: string[];
};

type FilteredDeal = {
  id: string;
  productCategory: any;
  financeProductType: any;
  assetMappingData?: {
    ytm?: string;
    tenure?: string;
    minInvestment?: string;
    rating?: string;
  };
};

interface AssetFiltersState {
  sortOption: SortOption;
  filters: FiltersState;
  filteredDeals: FilteredDeal[];
  hasAppliedFilters: boolean;
  showFilterModal: boolean;
}

const initialState: AssetFiltersState = {
  sortOption: 'relevance',
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

const assetFilters = createSlice({
  name: 'assetFilters',
  initialState,
  reducers: {
    setSortOption(state, action: PayloadAction<SortOption>) {
      state.sortOption = action.payload;
    },
    setFilters(state, action: PayloadAction<FiltersState>) {
      state.filters = action.payload;
    },
    resetFilters() {
      return initialState;
    },
    setFilteredDeals(state, action: PayloadAction<FilteredDeal[]>) {
      state.filteredDeals = action.payload;
    },
    setHasAppliedFilters(state, action: PayloadAction<boolean>) {
      state.hasAppliedFilters = action.payload;
    },
    setShowFilterModal(state, action: PayloadAction<boolean>) {
      state.showFilterModal = action.payload;
    },
  },
});

export const {
  setSortOption,
  setFilters,
  resetFilters,
  setFilteredDeals,
  setHasAppliedFilters,
  setShowFilterModal,
} = assetFilters.actions;

export default assetFilters.reducer;

export const resetFiltersWithLoading = (): AppThunk => async (dispatch) => {
  dispatch(setLoading(['active', true]));
  await Promise.resolve();
  dispatch(resetFilters());
  dispatch(setShowFilterModal(false));
  dispatch(setHasAppliedFilters(false));
  dispatch(setLoading(['active', false]));
};

export function setSortAndFilter(
  sortOption: SortOption,
  filters: FiltersState
): AppThunk {
  return async (dispatch) => {
    dispatch(setLoading(['active', true]));
    dispatch(setSortOption(sortOption));
    dispatch(setFilters(filters));
    dispatch(setShowFilterModal(false));
    dispatch(setHasAppliedFilters(true));
    dispatch(filterAssets(sortOption, filters));
    setTimeout(() => {
      dispatch(setLoading(['active', false]));
    }, 0);
  };
}

export function filterAssets(
  sortOption: SortOption,
  filters: FiltersState
): AppThunk {
  return async (dispatch, getState) => {
    const activeDeals = (getState() as any)?.assets?.active || [];

    const filtered = filterBy(activeDeals, filters);
    const sortedDeals = sortDeals(filtered, sortOption);

    dispatch(setFilteredDeals(sortedDeals));
  };
}
