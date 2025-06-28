import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type currentDisplayState = {
  selectedOrder: any;
  selectedPaymentType: string;
  overallKYCStatus: string[];
  kycProcessing: {
    isError: boolean;
    data: any;
  };
  isCommentBoxOpen: boolean;
};

const initialState: currentDisplayState = {
  selectedOrder: {},
  selectedPaymentType: '',
  overallKYCStatus: [],
  kycProcessing: {
    isError: false,
    data: {},
  },
  isCommentBoxOpen: false,
};

const rfqSlice = createSlice({
  name: 'rfq',
  initialState,
  reducers: {
    setSelectedRfq: (state, { payload }: PayloadAction<any>) => {
      state.selectedOrder = payload;
    },
    setPaymentMode: (state, { payload }: PayloadAction<any>) => {
      state.selectedPaymentType = payload;
    },
    setOverallKYCStatus: (state, { payload }: PayloadAction<any>) => {
      state.overallKYCStatus = [...(state?.overallKYCStatus ?? []), payload];
    },
    setKYCProcessing: (state, { payload }: PayloadAction<any>) => {
      state.kycProcessing = {
        isError: payload.isError,
        data: payload.data,
      };
    },
    setOpenCommentBox: (state, action) => {
      state.isCommentBoxOpen = action.payload;
    },
  },
});

export const {
  setSelectedRfq,
  setPaymentMode,
  setOverallKYCStatus,
  setKYCProcessing,
  setOpenCommentBox,
} = rfqSlice.actions;

export default rfqSlice.reducer;
