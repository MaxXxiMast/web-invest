import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type currentDisplayState = {
  accessToken?: string | null;
  is2faRequired?: boolean;
  userID?: string | number | null;
  firstName?: string | null;
  lastName?: string | null;
  mobileNo?: number | string | undefined;
  emailID?: string | undefined;
  preTaxToggle?: boolean;
  selectedAsset?: any;
  isTimeLessThanTwoHoursRBI: boolean;
  isTimeLessThanTwoHoursFD: boolean;
  isServerDown: boolean;
};

const initialState: currentDisplayState = {
  accessToken: null,
  is2faRequired: false,
  userID: null,
  firstName: '',
  lastName: '',
  mobileNo: '',
  emailID: '',
  preTaxToggle: true,
  selectedAsset: {},
  isTimeLessThanTwoHoursRBI: true,
  isTimeLessThanTwoHoursFD: true,
  isServerDown: false,
};

export const accessSlice = createSlice({
  name: 'access',
  initialState,
  reducers: {
    setAccessDetails: (state, action: PayloadAction<any>) => {
      state.accessToken = action.payload.accessToken || state.accessToken;
      state.is2faRequired = action.payload.is2faRequired || state.is2faRequired;
      state.userID = action.payload.userID || state.userID;
      state.firstName = action.payload.firstName || state.firstName;
      state.lastName = action.payload.lastName || state.lastName;
      state.mobileNo = action.payload.mobileNo || state.mobileNo;
      state.emailID = action.payload.emailID || state.emailID;
      state.preTaxToggle =
        typeof action?.payload?.preTaxToggle === 'boolean'
          ? action?.payload?.preTaxToggle
          : state?.preTaxToggle;
      state.selectedAsset = action.payload?.selectedAsset
        ? action.payload?.selectedAsset
        : state?.selectedAsset;
    },
    resetProductType: (state) => {
      state.selectedAsset = {};
    },
    setIsTimeLessThanTwoHoursRBI: (state, action: PayloadAction<boolean>) => {
      state.isTimeLessThanTwoHoursRBI = action.payload;
    },
    setIsTimeLessThanTwoHoursFD: (state, action: PayloadAction<boolean>) => {
      state.isTimeLessThanTwoHoursFD = action.payload;
    },
    setServerDown: (state, action: PayloadAction<boolean>) => {
      state.isServerDown = action.payload;
    },
  },
});

export const {
  setAccessDetails,
  resetProductType,
  setIsTimeLessThanTwoHoursRBI,
  setIsTimeLessThanTwoHoursFD,
  setServerDown,
} = accessSlice.actions;

export default accessSlice.reducer;
