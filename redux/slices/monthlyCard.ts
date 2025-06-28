import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAssetBonds, isSDISecondary } from '../../utils/financeProductTypes';

type NotifyMeButtonStatus = {
  isDisabled: boolean;
  message: string;
  triggerNotifyMeButton: boolean;
  buttonText: string;
};

type MonthlyCardState = {
  showVisualReturns: boolean;
  showMobileMonthlyPlan: boolean;
  submitLoading: boolean;
  singleLotCalculation: any;
  units: number;
  investmentAmount: number;
  showBidPopup: boolean;
  disableBondsInvestBtn: boolean;
  calculatedReturns: any;
  localProps: any;
  pendingOrders: any;
  viewAssetDetailEventFields: any;
  fdParams: any;
  showStructureVisualReturns: boolean;
  notifyMeButtonStatus: NotifyMeButtonStatus;
};

const initialState: MonthlyCardState = {
  showVisualReturns: false,
  showMobileMonthlyPlan: false,
  submitLoading: true,
  singleLotCalculation: {},
  units: 0,
  investmentAmount: 0,
  showBidPopup: false,
  disableBondsInvestBtn: true,
  calculatedReturns: {},
  localProps: {
    loading: true,
    pageData: null,
    orderNudgeData: null,
  },
  pendingOrders: [],
  viewAssetDetailEventFields: {},
  fdParams: {
    tenure: 0,
    selectedCheckbox: { srCitizen: true, women: true },
    seletedFilter: null,
  },
  showStructureVisualReturns: false,
  notifyMeButtonStatus: {
    isDisabled: false,
    message: '',
    triggerNotifyMeButton: false,
    buttonText: 'Invest Now',
  },
};

const monthlyCardSlice = createSlice({
  name: 'monthlyCard',
  initialState,
  reducers: {
    resetMonthlyCard: (state) => {
      state = {
        ...initialState,
        localProps: state.localProps,
        singleLotCalculation: state.singleLotCalculation,
      };
    },
    setLocalProps: (state, action: PayloadAction<any>) => {
      state.localProps = action.payload;
    },
    setPendingOrders: (state, action: PayloadAction<any>) => {
      state.pendingOrders = action.payload;
    },
    setViewAssetDetailEventFields: (state, action: PayloadAction<any>) => {
      state.viewAssetDetailEventFields = action.payload;
    },
    setShowMobileMonthlyPlan: (state, action: PayloadAction<boolean>) => {
      state.showMobileMonthlyPlan = action.payload;
    },
    setSubmitLoading: (state, action: PayloadAction<boolean>) => {
      state.submitLoading = action.payload;
    },
    setSingleLotCalculation: (state, action: PayloadAction<any>) => {
      state.singleLotCalculation = action.payload;
    },
    setCalculatedReturns: (state, action: PayloadAction<any>) => {
      state.calculatedReturns = action.payload;
    },
    setFdParams: (state, action: PayloadAction<any>) => {
      state.fdParams = {
        ...state.fdParams,
        ...action.payload,
      };
    },
    setUnits: (state, action: PayloadAction<number>) => {
      state.units = action.payload;
    },
    setInvestmentAmount: (state, action: PayloadAction<number>) => {
      state.investmentAmount = action.payload;
    },
    setShowBidPopup: (state, action: PayloadAction<boolean>) => {
      state.showBidPopup = action.payload;
    },
    handleVisualReturnsShow: (state, action: PayloadAction<any>) => {
      document.body.classList.add('scroll-hidden');
      state.showVisualReturns = action.payload?.res;
      if (action.payload?.isDesktopModal) state.showMobileMonthlyPlan = false;
    },
    setDisableBondsInvestBtn: (state, action: PayloadAction<boolean>) => {
      state.disableBondsInvestBtn = action.payload;
    },
    handleVisualModalClose: (state, action: PayloadAction<boolean>) => {
      document.body.classList.remove('scroll-hidden');
      state.showVisualReturns = action.payload;
    },
    updateHeaderSlot: (state, action: PayloadAction<any>) => {
      const { data = {}, asset = {} } = action.payload;

      if (isAssetBonds(asset) || isSDISecondary(asset)) {
        state.units = data.lots;
        return;
      }

      if (data.lots < 1) {
        let { minLotValue = 0 } = asset?.sdiDetails ?? {};
        state.units = minLotValue * 3;
      } else {
        state.units = data.lots;
      }
    },
    setStructureShowVisualReturns: (state, action: PayloadAction<boolean>) => {
      state.showStructureVisualReturns = action.payload;
    },
    setNotifyMeButtonStatus: (
      state,
      action: PayloadAction<Partial<NotifyMeButtonStatus>>
    ) => {
      state.notifyMeButtonStatus = {
        ...state.notifyMeButtonStatus,
        ...action.payload,
      };
    },
  },
});

export const {
  setLocalProps,
  setPendingOrders,
  setShowMobileMonthlyPlan,
  setSubmitLoading,
  setCalculatedReturns,
  handleVisualModalClose,
  handleVisualReturnsShow,
  setSingleLotCalculation,
  setUnits,
  setShowBidPopup,
  updateHeaderSlot,
  setDisableBondsInvestBtn,
  setInvestmentAmount,
  resetMonthlyCard,
  setViewAssetDetailEventFields,
  setFdParams,
  setStructureShowVisualReturns,
  setNotifyMeButtonStatus,
} = monthlyCardSlice.actions;

export default monthlyCardSlice.reducer;
