import dayjs from 'dayjs';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchMarketTiming } from '../../api/rfq';
import { fetchCommentsCount } from '../../api/user';

import { validSections } from '../../utils/asset';
import { isUserLogged } from '../../utils/user';
import type { MarketTimingData } from '../types/user';

import { AppThunk } from '../index';

export type tabName = 'active' | 'past';

type assetsSort = {
  tab: tabName;
  tabSection: validSections;
  sortType?: string;
  pastSearchText?: string;
  pastPageNo?: number;
  pastSortData?: any;
};

type currentDisplayState = {
  showNotification: boolean;
  assetsSort: assetsSort;
  afterEsignDone: boolean;
  marketTiming: MarketTimingData;
  isPaymentModalOpen?: boolean;
  commentsCount?: Record<string, number>;
};

const initialState: currentDisplayState = {
  showNotification: false,
  assetsSort: {
    tabSection: null,
    sortType: 'default',
    tab: 'active',
  },
  afterEsignDone: false,
  marketTiming: {},
  isPaymentModalOpen: false,
  commentsCount: {},
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.showNotification = action.payload;
    },
    setAssetsSort: (state, action: PayloadAction<assetsSort>) => {
      state.assetsSort = { ...state.assetsSort, ...action.payload };
    },
    setAfterEsignDone: (state, action) => {
      state.afterEsignDone = action.payload;
    },
    setMarketTime: (state, action) => {
      state.marketTiming = action.payload;
    },
    setOpenPaymentModal: (state, action) => {
      state.isPaymentModalOpen = action.payload;
    },
    setCommentsCount: (state, action) => {
      state.commentsCount = action.payload;
    },
  },
});

export const {
  setAssetsSort,
  showNotification,
  setAfterEsignDone,
  setMarketTime,
  setOpenPaymentModal,
  setCommentsCount,
} = configSlice.actions;

export default configSlice.reducer;


export function getRFQMarketTiming(): AppThunk {
  return async (dispatch) => {
    let marketTiming: MarketTimingData = JSON.parse(
      localStorage.getItem('marketTiming')
    );
    const dayFormat = 'DD-MM-YYYY';
    const currentDate = dayjs(marketTiming?.currentDate, dayFormat) ?? '';
    const todayDate = dayjs(dayjs(), dayFormat);
    try {
      if (
        isUserLogged() &&
        (!marketTiming || !currentDate || !todayDate.isSame(currentDate, 'day'))
      ) {
        let marketTime = await fetchMarketTiming();
        marketTiming = marketTime;
        localStorage.setItem('marketTiming', JSON.stringify(marketTime));
      }
      dispatch(setMarketTime(marketTiming));
    } catch (err) {
      console.log('error', err);
    }
  };
}

export function getCommentsCountForKYC(): AppThunk {
  return async (dispatch) => {
    let data = await fetchCommentsCount();
    for (const [key, value] of Object.entries(data)) {
      data[key] = Number(value);
    }
    dispatch(setCommentsCount(data));
  };
}
