import {
  PaymentMethods,
  PaymentOptionsModel,
  MfPaymentMethodResponseModel,
} from './types';

export const getPaymentMethod = (
  pgData: MfPaymentMethodResponseModel
): PaymentMethods => {
  if (pgData?.upi?.isAllowed) {
    return 'upi';
  }
  return 'netBanking';
};

export const getAllPaymentMethods = (
  pgData: MfPaymentMethodResponseModel
): PaymentOptionsModel[] => {
  return [
    {
      label: 'UPI',
      value: 'upi',
      disabled: !pgData?.upi?.isAllowed,
    },
    {
      label: 'Net banking',
      value: 'netBanking',
      disabled: !pgData?.netBanking?.isAllowed,
    },
  ];
};
