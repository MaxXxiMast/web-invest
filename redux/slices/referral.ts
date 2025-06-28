import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  fetchDashboardMetrics,
  sendReminder,
  redeem,
  fetchLogsByUser,
  fetchReferrralRules,
} from '../../api/referral';
import { AppThunk } from '../index';
import { fireReferralEvent } from '../../utils/gtm';
import {
  callErrorToast,
  callSuccessToast,
  processError,
} from '../../api/strapi';

type currentDisplayState = {
  loading: boolean;
  dashboardMetrics: any;
  transactionLogs: any;
  referralRules: any[];
};

const initialState: currentDisplayState = {
  loading: false,
  dashboardMetrics: {},
  transactionLogs: [],
  referralRules: [],
};

const referralSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setDashboardMetrics: (state, { payload }: PayloadAction<any>) => {
      state.dashboardMetrics = {
        ...state.dashboardMetrics,
        ...payload,
      };
    },
    setTransactionLogs: (state, { payload }: PayloadAction<any>) => {
      state.transactionLogs = {
        ...state.transactionLogs,
        ...payload,
      };
    },
    setReferralRules: (state, action: PayloadAction<any>) => {
      state.referralRules = action.payload;
    },
  },
});

export const {
  setDashboardMetrics,
  setTransactionLogs,
  setReferralRules,
} = referralSlice.actions;

export default referralSlice.reducer;

export function getDashboardMetrics(cb?: () => void): AppThunk {
  return async (dispatch) => {
    try {
      const { data } = await fetchDashboardMetrics();
      dispatch(setDashboardMetrics(data));
      cb && cb();
    } catch (e) {
      callErrorToast(processError(e));
    }
  };
}

export function handleRemindNow(userId: string | number): AppThunk {
  return async (dispatch) => {
    try {
      await sendReminder(userId);
      callSuccessToast('Reminder sent successfully.');
      const response = await fetchDashboardMetrics();
      dispatch(setDashboardMetrics(response.data));
    } catch (err) {
      callErrorToast(processError(err));
    }
  };
}

export function handleRedeemNow(cb?: () => void): AppThunk {
  return async (dispatch) => {
    try {
      const response = await redeem();
      callSuccessToast(response.data.msg);
      fireReferralEvent('redeemReferralBonus');
      const metrics = await fetchDashboardMetrics();
      dispatch(setDashboardMetrics(metrics.data));
      cb?.();
    } catch (e) {
      callErrorToast(processError(e));
    }
  };
}

export function fetchTransactionHistory(cb?: () => void): AppThunk {
  return async (dispatch) => {
    try {
      const data = await fetchLogsByUser();
      dispatch(setTransactionLogs(data));
      cb && cb();
    } catch (e) {
      callErrorToast(processError(e));
    }
  };
}

export function fetchReferralDetails(): AppThunk {
  return async (dispatch) => {
    const { list } = await fetchReferrralRules();
    dispatch(setReferralRules(list));
  };
}
