import {
  MfPaymentMethodResponseModel,
  MfOtpResponseModel,
  MfOtpRequestModel,
  MfVerifyOtpRequestModel,
  MfVerifyOtpResponseModel,
  MfPaymentMethodRequestModel,
  MFKycTriggerResponseModel,
  featureData,
} from '../components/mutual-funds/utils/types';
import { NavData } from '../components/mutual-funds/mf-line-chart/utils';
import { fetchAPI } from './strapi';

export const getMFKycDetails = (): Promise<MFKycTriggerResponseModel> => {
  return fetchAPI(`/v3/kyc/process-mf`, {}, { method: 'POST' }, true, false);
};

export const getPaymentMethodsMf = (
  request: MfPaymentMethodRequestModel
): Promise<MfPaymentMethodResponseModel> => {
  const { amount, assetID } = request;
  if (!amount || !assetID) {
    return;
  }
  return fetchAPI(
    `/v3/rfq/payment-details?amount=${amount}&assetID=${assetID}`,
    {},
    {},
    true
  );
};

export const requestMfOtp = (
  body: MfOtpRequestModel
): Promise<MfOtpResponseModel> => {
  return fetchAPI(
    `/v3/orders/request-otp`,
    {},
    { method: 'POST', body: JSON.stringify(body) },
    true
  );
};

export const verifyMfOtp = (
  body: MfVerifyOtpRequestModel
): Promise<MfVerifyOtpResponseModel> => {
  return fetchAPI(
    `/v3/orders/verify-otp`,
    {},
    { method: 'POST', body: JSON.stringify(body) },
    true
  );
};

export const fetchNavData = (
  securityID: number,
  startDate: string,
  endDate: string
): Promise<NavData> => {
  return fetchAPI(
    `/v3/assets/nav/${securityID}?${
      startDate ? 'startDate=' + startDate + '&' : ''
    }endDate=${endDate}`,
    {},
    {},
    true
  );
};

export const fetchFeatureFlag = (): Promise<featureData[]> => {
  return fetchAPI(`/v3/users/enabled-features`, {}, {}, true);
};
