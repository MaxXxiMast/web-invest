import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchScheduleOfReturn } from '../../api/bonds';

import { AppThunk } from '../index';
import { fetchOrderDetails } from '../../api/order';

type currentDisplayState = {
  returnScheduleLoading: boolean;
  returnSchedule: [];
  detailedInfo: any;
};

const initialState: currentDisplayState = {
  returnScheduleLoading: false,
  returnSchedule: [],
  detailedInfo: {},
};

const bondsSlice = createSlice({
  name: 'bonds',
  initialState,
  reducers: {
    setReturnSchedule: (state, action: PayloadAction<any>) => {
      state.returnSchedule = action.payload.returnSchedule;
    },
    setDetailedInfo: (state, action: PayloadAction<any>) => {
      state.detailedInfo = action.payload.detailedInfo;
    },
    setReturnLoading: (state, { payload }: PayloadAction<any>) => {
      state.returnScheduleLoading = payload;
    },
  },
});

export const {
  setReturnSchedule,
  setDetailedInfo,
  setReturnLoading,
} = bondsSlice.actions;

export default bondsSlice.reducer;


export function fetchReturnSchedule(assetID: string): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setReturnLoading(true));
      const response = await fetchScheduleOfReturn(assetID);
      const { msg } = response;
      dispatch(setReturnSchedule({ returnSchedule: msg.list, assetID }));
      dispatch(setReturnLoading(false));
    } catch (e) {}
  };
}

export function fetchDetailedInfo(transactionID: string): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setReturnLoading(true));
      const response = await fetchOrderDetails(transactionID);
      dispatch(setDetailedInfo({ detailedInfo: response }));
      dispatch(setReturnLoading(false));
    } catch (e) {}
  };
}
