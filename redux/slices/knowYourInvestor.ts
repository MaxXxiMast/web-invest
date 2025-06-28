import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getKnowYourInvestorPersonality,
  postResponseIdTypeForm,
} from '../../api/persona';
import type { AppThunk } from '../index';
import { isUserLogged } from '../../utils/user';

type currentDisplayState = {
  customerPersonality: string | null;
  isLoading: boolean;
};

const initialState: currentDisplayState = {
  customerPersonality: null,
  isLoading: false,
};

const knowYourInvestor = createSlice({
  name: 'knowYourInvestor',
  initialState,
  reducers: {
    setCustomerPersonality: (state, action: PayloadAction<any>) => {
      if (action?.payload) {
        state.customerPersonality = action?.payload;
      } else {
        state.customerPersonality = null;
      }
    },
    setLoadingPersonality: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCustomerPersonality, setLoadingPersonality } =
  knowYourInvestor.actions;

export function fetchPeronality(cb?: () => void): AppThunk {
  return async (dispatch) => {
    try {
      let res = await getKnowYourInvestorPersonality();
      dispatch(
        setCustomerPersonality(res?.data?.investorsPersonality ?? 'abc')
      );
    } catch (err) {
    } finally {
      cb?.();
    }
  };
}

export function SetAndGetPeronality(
  personaResponseId,
  cb?: (peronalityName: string) => void,
  redirectcb?: () => void
): AppThunk {
  return async (dispatch) => {
    try {
      isUserLogged() && dispatch(setLoadingPersonality(true)); // Set loading only for logged in users
      redirectcb?.(); // Redirect to the result page
      await postResponseIdTypeForm({ responseID: personaResponseId });
      let res = await getKnowYourInvestorPersonality();
      dispatch(
        setCustomerPersonality(res?.data?.investorsPersonality ?? 'abc')
      );
      cb?.(res?.data?.investorsPersonality);
    } catch (e) {
      dispatch(setCustomerPersonality(null));
    } finally {
      dispatch(setLoadingPersonality(false));
    }
  };
}

export function createPersonalityOnAuthentication(
  cb?: () => void,
  redirectcb?: () => void
): AppThunk {
  return async (dispatch, getState) => {
    const personaName = getState()?.knowYourInvestor?.customerPersonality || '';

    if (isUserLogged()) {
      const personaResponseId = sessionStorage.getItem(
        'personaTypeFormResponseId'
      );
      if (personaResponseId) {
        sessionStorage.removeItem('personaTypeFormResponseId');
        if (!personaName) {
          dispatch(SetAndGetPeronality(personaResponseId, cb, redirectcb));
        }
      } else {
        // Enabled only when login or signup
        dispatch(fetchPeronality(cb));
      }
    } else {
      cb?.();
    }
  };
}

export default knowYourInvestor.reducer;
