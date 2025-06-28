import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { SetToastType } from '../types/user';

type currentDisplayState = {
  toastInfo: SetToastType;
};

const initialState: currentDisplayState = {
  toastInfo: {
    visible: false,
    msg: '',
    type: 'success',
  },
};

const statisticSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    setToast: (state, action: PayloadAction<any>) => {
      const currentState = state.toastInfo;
      if (currentState && action.payload.visible !== currentState.visible) {
        state.toastInfo = action.payload;
      }
    },
  },
});

export const { setToast } = statisticSlice.actions;

export default statisticSlice.reducer;
