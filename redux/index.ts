import {
  configureStore,
  ThunkAction,
  Action,
  ReducersMapObject,
} from '@reduxjs/toolkit';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import userReducer from './slices/user';
import referalReducer from './slices/referral';
import toastReducer from './slices/toast';
import assetReducer from './slices/assets';
import spvDetailsReducer from './slices/spvDetails';
import walletReducer from './slices/wallet';
import configReducers from './slices/config';
import orderReducers from './slices/orders';

import { processError } from '../api/strapi';
import sessionExpiry from './slices/sessionExpiry';
import bondReducer from './slices/bonds';
import monthlyCardReducer from './slices/monthlyCard';
import redirectReducer from './slices/redirect';
import accessReducer from './slices/access';
import rfqReducer from './slices/rfq';
import portfolioSummaryReducer from './slices/portfoliosummary';
import userConfigReducer from './slices/userConfig';
import fdConfigReducer from './slices/fd';
import gcConfigReducer from './slices/gc';
import knowYourInvestor from './slices/knowYourInvestor';
import aiAssistReducer from './slices/AiAssist';
import featureFlagsReducer from './slices/featureFlags';
import mfConfigReducer from '../components/mutual-funds/redux/mf';
import assetFiltersReducer from '../components/assetsList/AssetFilters/AssetFilterSlice/assetFilters';

const persistConfig = {
  key: 'root',
  storage,
  whilelist: ['access', 'rfq', 'gc', 'assets'],
  blacklist: [
    'user',
    'referral',
    'orders',
    'spvDetails',
    'wallet',
    'sessionExpiry',
    'config',
    'partners',
    'statistics',
    'toast',
    'ipo',
    'bond',
    'redirect',
    'sdiSecondary',
    'portfolioSummary',
    'userConfig',
    'fdConfig',
    'mfConfig',
    'assetFilters',
  ],
};
const rootReducers = {
  user: userReducer,
  referral: referalReducer,
  assets: assetReducer,
  orders: orderReducers,
  spvDetails: spvDetailsReducer,
  wallet: walletReducer,
  sessionExpiry: sessionExpiry,
  config: configReducers,
  toast: toastReducer,
  bond: bondReducer,
  monthlyCard: monthlyCardReducer,
  redirect: redirectReducer,
  access: accessReducer,
  rfq: rfqReducer,
  portfolioSummary: portfolioSummaryReducer,
  userConfig: userConfigReducer,
  fdConfig: fdConfigReducer,
  mfConfig: mfConfigReducer,
  gcConfig: gcConfigReducer,
  knowYourInvestor: knowYourInvestor,
  aiAssist: aiAssistReducer,
  featureFlags: featureFlagsReducer,
  assetFilters: assetFiltersReducer,
};

const reducers = combineReducers(rootReducers);

const persistedReducer = persistReducer(persistConfig, reducers);
export function makeStore() {
  return configureStore({
    reducer: persistedReducer,
    middleware: [thunk],
  });
}

const store = makeStore();

export const persistor = persistStore(store);
export type AppState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
type UnwrapReducers<S extends ReducersMapObject> = {
  [K in keyof S]: ReturnType<S[K]>;
};

export type RootState = UnwrapReducers<typeof rootReducers>;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

export const handleApiError = (
  e: any,
  dispatch?: any,
  activeSessionCb: any = undefined
) => {
  if (e?.status !== 401) {
    if (activeSessionCb) {
      activeSessionCb();
    } else {
      processError(e);
    }
  }
};

export default store;
