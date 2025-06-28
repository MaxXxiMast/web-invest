import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setAppState, setCkycDetails } from './user';
import { getCKYCDetails } from '../../api/user';
import { getSecret } from '../../api/secrets';
import { AppThunk } from '../index';

type DebartmentDetails = {
  debarmentData: {
    isDebarred: boolean;
    debarredDetails: {
      from: string;
      till: string;
      reason: string;
    };
  };
};

type UserConfigData = {
  debarmentData?: DebartmentDetails;
  sdiTabChangeCount?: number;
};

const initialState: UserConfigData = {
  debarmentData: undefined,
  sdiTabChangeCount: 0,
};

const userConfigSlice = createSlice({
  name: 'userConfig',
  initialState,
  reducers: {
    setUserDebartmentData: (state, action: PayloadAction<UserConfigData>) => {
      state.debarmentData = action.payload.debarmentData;
    },
    setSdiTabChangeCount: (state, action: PayloadAction<number>) => {
      state.sdiTabChangeCount = action.payload;
    },
  },
});

export const { setUserDebartmentData, setSdiTabChangeCount } =
  userConfigSlice.actions;

export default userConfigSlice.reducer;

export function setCkycData(): AppThunk {
  return async (dispatch) => {
    try {
      const res = await getCKYCDetails();
      dispatch(setCkycDetails(res.msg));
      const cKYCflag = await getSecret('feature_flags.ckyc_disabled');
      const isCkycDisabled = cKYCflag?.value === 'true';
      dispatch(
        setAppState({
          ckycDisabled: isCkycDisabled,
        })
      );
    } catch (err) {
      console.log('Error in fetching user ckyc details', err);
    }
  };
}
