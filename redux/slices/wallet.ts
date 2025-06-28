import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppThunk, handleApiError } from '../index';
import {
  fetchWalletDetails,
  fetchWalletTransactions,
  initiateWalletTxn,
  retryWalletTxn,
  updateWallet,
  withdrawAmount,
} from '../../api/wallet';
import { processError } from '../../api/strapi';

type currentDisplayState = {
  walletSummary: any;
  userWalletTransactions: any;
  walletLoading: boolean;
  loading: boolean;
  selectedTxn: any;
  autoWithdrawl: boolean; //adding a seprate variable for autoWithdrawl
};

const initialState: currentDisplayState = {
  userWalletTransactions: {},
  walletSummary: {},
  walletLoading: false,
  loading: false,
  autoWithdrawl: false,
  selectedTxn: {},
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.walletLoading = payload;
    },
    setSelected: (state, { payload }: PayloadAction<any>) => {
      state.selectedTxn = payload;
      state.walletLoading = false;
    },
    setUserWalletSummary: (state, action: PayloadAction<any>) => {
      state.walletSummary = action.payload;
      state.autoWithdrawl = action.payload.autowithdrawal
        ? action.payload.autowithdrawal
        : state.autoWithdrawl;
      state.walletLoading = false;
    },
    setWalletTransactions: (state, action: PayloadAction<any>) => {
      state.userWalletTransactions = action.payload;
      state.walletLoading = false;
    },
    updateUserWallet: (state, action: PayloadAction<any>) => {
      state.walletSummary = {
        ...state.walletSummary,
        ...action.payload,
      };
      state.autoWithdrawl = action.payload.autowithdrawal
        ? action.payload.autowithdrawal
        : state.autoWithdrawl;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
  },
});

export const {
  setUserWalletSummary,
  setWalletTransactions,
  setWalletLoading,
  setSelected,
  updateUserWallet,
  setLoading,
} = walletSlice.actions;

export default walletSlice.reducer;

export function fetchWalletInfo(): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setWalletLoading(true));
      const { msg } = await fetchWalletDetails();
      const { data } = msg;
      dispatch(setUserWalletSummary(data));
    } catch (e) {
      const activeSessionCb = () => {
        console.log(e);
        dispatch(setWalletLoading(false));
      };
      handleApiError(e, dispatch, activeSessionCb);
    }
  };
}

/**
 * @description fetches and sets in redux store vault transactions of current user.
 * @param page number to get paginated result
 * @returns Appthunk
 */
export function getWalletTransactions(page?: number): AppThunk {
  return async (dispatch) => {
    try {
      const { result } = await fetchWalletTransactions(page || 1);
      dispatch(setWalletTransactions(result));
    } catch (e) {
      console.log(e);
      processError(e || 'Unable to fetch transactions');
    }
  };
}

export function addMoneyToWallet(
  amount: number | string,
  reason: string,
  userID: number,
  cb: (flag: boolean, data: any) => void
): AppThunk {
  return async (dispatch) => {
    try {
      const { msg } = await initiateWalletTxn(Number(amount), reason, userID);
      cb && cb(true, msg);
    } catch (err) {
      const activeSessionCb = () => {
        console.log(err);
        cb && cb(false, {});
      };
      handleApiError(err, dispatch, activeSessionCb);
    }
  };
}

export function clearSelectedTransaction(): AppThunk {
  return async (dispatch) => {
    dispatch(setSelected({}));
  };
}

export function retryPayment(
  transactionID: string,
  cb: (flag: boolean, data: any) => void
): AppThunk {
  return async () => {
    try {
      const order = await retryWalletTxn(transactionID);
      cb && cb(true, order.msg);
    } catch (e) {
      cb && cb(false, {});
    }
  };
}

export function updateAutoWithdrawal(
  autowithdrawal: boolean,
  cb: () => void
): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      await updateWallet({ autowithdrawal });
      dispatch(updateUserWallet({ autowithdrawal }));
      dispatch(setLoading(false));
      cb && cb();
    } catch (e) {
      const activeSessionCb = () => {
        dispatch(setLoading(false));
        console.log(e);
        cb && cb();
      };
      handleApiError(e, dispatch, activeSessionCb);
    }
  };
}

export function withdrawAmountFromWallet(
  amount: number,
  cb: (flag: boolean, data: any) => void
): AppThunk {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const withdrawalData = await withdrawAmount(amount);

      dispatch(fetchWalletInfo());
      dispatch(setLoading(false));

      cb && cb(true, withdrawalData);
    } catch (e) {
      const activeSessionCb = () => {
        dispatch(setLoading(false));
        cb && cb(false, processError(e));
      };
      handleApiError(e, dispatch, activeSessionCb);
    }
  };
}
