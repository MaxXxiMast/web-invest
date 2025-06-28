import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppThunk } from '../index';
import { processError } from '../../api/strapi';
import { getRedirectData } from '../../api/redirect';
import { setUserData, showKycPopup } from './user';
import { setAccessDetails } from './access';

type currentDisplayState = {
  accessToken: string;
  user: {
    userID: number | string;
    emailID: string;
    mobileNo: number | string;
  };
  redirectUrl: string;
  openPopup: boolean;
  gcDataDone: boolean;
};

const initialState: currentDisplayState = {
  accessToken: '',
  user: {
    emailID: '',
    mobileNo: '',
    userID: '',
  },
  openPopup: false,
  redirectUrl: '',
  gcDataDone: false,
};

const walletSlice = createSlice({
  name: 'redirect',
  initialState,
  reducers: {
    setRedirectData: (state, action: PayloadAction<any>) => {
      state.accessToken = action.payload.accessToken;
      state.redirectUrl = action.payload.redirectUrl;
      state.user = { ...action.payload.user };
    },
    setGCDataCalled: (state, action: PayloadAction<boolean>) => {
      state.gcDataDone = action.payload;
    },
  },
});

export const { setRedirectData, setGCDataCalled } = walletSlice.actions;

export default walletSlice.reducer;

/**
 * @description fetches and sets in redux store vault transactions of current user.
 * @param page number to get paginated result
 * @returns Appthunk
 */
export function getRedirectInformation(
  id: string,
  cb: (data: any) => void
): AppThunk {
  return async (dispatch) => {
    try {
      const result = await getRedirectData(id);
      dispatch(setUserData({}));
      dispatch(
        setAccessDetails({
          accessToken: result.accessToken,
          userID: result.user.userID,
          emailID: result.user.emailID,
          mobileNo: result.user.mobileNo,
        })
      );
      dispatch(setUserData(result.user));
      dispatch(setRedirectData(result));
      dispatch(showKycPopup(true));
      cb(result);
    } catch (e) {
      console.log(e);
      processError(e || 'Unable to fetch data');
    }
  };
}

export function closeKycPopup(): AppThunk {
  return async (dispatch) => {
    dispatch(showKycPopup(false));
  };
}