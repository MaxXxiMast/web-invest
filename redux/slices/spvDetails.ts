import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getSpvDetails, getKYCTypes } from '../../api/spvDetails';

import { AppThunk } from '../index';

type currentDisplayState = {
  spvList: any;
  kycTypes: any;
};

const initialState: currentDisplayState = {
  spvList: [],
  kycTypes: [],
};

const configSlice = createSlice({
  name: 'spvDetails',
  initialState,
  reducers: {
    setSpvDetails: (state, action: PayloadAction<any>) => {
      state.spvList = action.payload;
    },
    setKYCTypes: (state, action: PayloadAction<any>) => {
      state.kycTypes = action.payload;
    },
  },
});

export const { setSpvDetails, setKYCTypes } = configSlice.actions;

export default configSlice.reducer;

export function getSpvDetailsList(): AppThunk {
  return async (dispatch) => {
    const { result } = await getSpvDetails();
    dispatch(setSpvDetails(result));
  };
}

export function getKYCDetailsList(cb?: any): AppThunk {
  return async (dispatch) => {
    const { result } = await getKYCTypes();
    dispatch(setKYCTypes(result));
    cb?.(result);
  };
}
