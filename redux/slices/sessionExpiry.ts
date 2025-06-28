import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type currentDisplayState = {
  show: boolean;
};

const initialState: currentDisplayState = {
  show: false,
};

const sessionExpirySlice = createSlice({
  name: 'sessionExpiry',
  initialState,
  reducers: {
    setSessionExpiry: (state, action: PayloadAction<boolean>) => {
      state.show = action.payload;
    },
  },
});

export const { setSessionExpiry } = sessionExpirySlice.actions;

export default sessionExpirySlice.reducer;
