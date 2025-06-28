import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataTypes, MFStepperLoader } from '../utils/types';

const initialState: DataTypes = {
  isOTPModalOpen: false,
  isLoading: true,
  isPendingOrder: false,
  isCalculatorBtnDisabled: false,
  inputValue: 50000,
  allowedMaxInputValue: null,
  allowedMinInputValue: null,
  tenureType: 'oneTime',
  multiplier: 50000,
  selectedPaymentMethod: 'upi',
  showPaymentMethodModal: false,
  assetId: 0,
  stepperLoader: {
    open: false,
    step: 0,
    error: false,
  },
  bankDetails: null,
  availablePaymentMethods: [],
  isPaymentMethodsLoading: false,
  purchaseID: '',
  selectedTenure: '1Y',
  returnPercentage: 0,
};

const mfSlice = createSlice({
  name: 'mf',
  initialState,
  reducers: {
    setMfData: (state, action: PayloadAction<DataTypes>) => {
      const allowedKeys = [
        'isLoading',
        'isPendingOrder',
        'inputValue',
        'allowedMinInputValue',
        'allowedMaxInputValue',
        'isCalculatorBtnDisabled',
        'tenureType',
        'multiplier',
        'selectedPaymentMethod',
        'showPaymentMethodModal',
        'isOTPModalOpen',
        'assetId',
        'bankDetails',
        'availablePaymentMethods',
        'isPaymentMethodsLoading',
        'purchaseID',
        'selectedTenure',
        'returnPercentage',
      ];
      allowedKeys.forEach((key) => {
        if (action.payload[key] !== undefined) {
          state[key] = action.payload[key];
        }
      });
    },
    setOpenMFStepperLoader: (state, action: PayloadAction<MFStepperLoader>) => {
      state.stepperLoader = { ...state.stepperLoader, ...action.payload };
    },
  },
});

export const { setMfData, setOpenMFStepperLoader } = mfSlice.actions;

export default mfSlice.reducer;
