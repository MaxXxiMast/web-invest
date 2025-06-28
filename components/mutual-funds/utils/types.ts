export type KycModules =
  | 'pan'
  | 'bank'
  | 'depository'
  | 'liveness'
  | 'aof'
  | 'address'
  | 'signature'
  | 'other'
  | 'nominee';

export type StatusValues =
  | 'pending'
  | 'pending verification'
  | 'verified'
  | 'continue';

export type TenureType = 'sip' | 'oneTime';

export type PaymentMethods = 'upi' | 'netBanking';

export type BankDetails = {
  accountNo?: string;
  bankName?: string;
  ifscCode?: string;
};

export type MFStepperLoader = Partial<{
  open: boolean;
  step: number;
  error: boolean;
}>;

export type PaymentOptionsModel = {
  label: string;
  value: any;
  disabled?: boolean;
};

export type DataTypes = {
  isLoading?: boolean;
  isPendingOrder?: boolean;
  inputValue?: string | number;
  isCalculatorBtnDisabled?: boolean;
  allowedMaxInputValue?: number;
  allowedMinInputValue?: number;
  tenureType?: TenureType;
  selectedPaymentMethod?: PaymentMethods;
  showPaymentMethodModal?: boolean;
  multiplier?: number;
  stepperLoader?: MFStepperLoader;
  isOTPModalOpen?: boolean;
  assetId?: number;
  bankDetails?: BankDetails;
  availablePaymentMethods?: PaymentOptionsModel[];
  isPaymentMethodsLoading?: boolean;
  purchaseID?: string;
  selectedTenure?: string;
  returnPercentage?: number;
  enabledMF?: boolean;
};

export type MfPaymentMethodRequestModel = {
  amount: number;
  assetID: number;
};

export type MfPaymentMethodResponseModel = {
  upi: {
    isAllowed: boolean;
  };
  netBanking: {
    isAllowed: boolean;
    details?: {
      accountNo: string;
      bankName: string;
      ifscCode: string;
    };
  };
};

export type MFKycTriggerResponseModel = { status: boolean };

export type MfOtpRequestModel = {
  amount: number;
  assetID: number;
};

export type MfOtpResponseModel = {
  purchaseID: string;
};

export type MfVerifyOtpRequestModel = {
  purchaseID: string;
  otp: number;
};

export type MfVerifyOtpResponseModel = {
  success: boolean;
};

export type featureData = {
  featureName: string;
  mapping: {
    visibility: true;
    web: true;
    android: true;
    ios: true;
  };
};
