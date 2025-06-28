import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchVisualReturnFdDataRedux } from '../../api/assets';
import { callErrorToast, processError } from '../../api/strapi';

// Types
import type { OrderInitateBody } from '../../api/assets';
import type { Behaviour } from '../../components/fd/FDButton/types';
import type { AppThunk } from '../index';
import type { FixerraRepaymentResponse } from '../../components/fd/FDCalculator/utils';

type OptionData = {
  render: boolean;
  defaultChecked: boolean;
  enabled: boolean;
};

type MetaData = {
  interestPayout: string[];
  extraInterestRate: {
    women: OptionData;
    seniorCitizen: OptionData;
  };
  minAmount: number;
  maxAmount: number;
  tenureType: string;
};

export type FDStepperLoader = Partial<{
  open: boolean;
  step: number;
  error: boolean;
}>;

type ResettingModalValues = {
  showLoader: boolean;
  isWomen: boolean;
  isSrCitizen: boolean;
};

type FdData = {
  fdCalculationMetaData?: MetaData;
  fdInputFieldValue?: number;
  fdKYCBehaviour?: Behaviour;
  stepperLoader?: FDStepperLoader;
  fdOrderIniateBody?: OrderInitateBody | {};
  resetInterestModal?: ResettingModalValues;
};

const initialState: FdData = {
  fdCalculationMetaData: null,
  fdInputFieldValue: 0,
  fdKYCBehaviour: 'initiate',
  stepperLoader: {
    open: false,
    step: 0,
    error: false,
  },
  fdOrderIniateBody: {},
  resetInterestModal: {
    showLoader: false,
    isWomen: false,
    isSrCitizen: false,
  },
};

const fdConfig = createSlice({
  name: 'fdConfig',
  initialState,
  reducers: {
    setFdMetaData: (state, action: PayloadAction<MetaData>) => {
      state.fdCalculationMetaData = action.payload;
    },
    setFdInputValue: (state, action: PayloadAction<number>) => {
      state.fdInputFieldValue = action.payload;
    },
    setFDKYCBehaviour: (state, action: PayloadAction<Behaviour>) => {
      state.fdKYCBehaviour = action.payload;
    },
    setOpenFDStepperLoader: (state, action: PayloadAction<FDStepperLoader>) => {
      state.stepperLoader = { ...state.stepperLoader, ...action.payload };
    },
    setFDOrderIniateBody: (state, action: PayloadAction<OrderInitateBody>) => {
      state.fdOrderIniateBody = action.payload;
    },
    setResettingModalValues: (
      state,
      action: PayloadAction<ResettingModalValues>
    ) => {
      state.resetInterestModal = {
        ...state.resetInterestModal,
        ...action.payload,
      };
    },
  },
});

export const {
  setFdMetaData,
  setFdInputValue,
  setFDKYCBehaviour,
  setOpenFDStepperLoader,
  setFDOrderIniateBody,
  setResettingModalValues,
} = fdConfig.actions;

type FDCalculationDataBody = {
  assetID: number;
  investmentAmount: number;
  tenure: number;
  payoutFrequency: string;
  format: string;
  seniorCitizen: boolean;
  womenCitizen: boolean;
};

export function getFDCalculationData(
  body: FDCalculationDataBody,
  cb: (data: FixerraRepaymentResponse) => void,
  onErrorCB?: () => void
): AppThunk {
  return async () => {
    try {
      const calculationData = await fetchVisualReturnFdDataRedux({
        ...body,
        tenure: Math.ceil(body.tenure),
      });
      cb(calculationData);
    } catch (e) {
      callErrorToast(processError(e));
      onErrorCB?.();
    }
  };
}

export default fdConfig.reducer;
