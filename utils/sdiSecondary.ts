import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import { GRIP_INVEST_BUCKET_URL } from './string';

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(isBetween);

dayjs.tz.setDefault('Asia/Kolkata');

export const SDISECONDARY_TOOLTIPS = {
  PRICE_PER_UNIT_SDISECONDARY:
    'This is the dirty price of one bond. The dirty price is the sum of the clean price of the bond and accrued interest.',
  INVESTMENT_AMOUNT_SDISECONDARY: 'Purchase price * Number of lots',
  PRE_TAX_RETURNS_SDISECONDARY:
    "The returns shown are prior to TDS and subject to the investor's marginal tax rate. Interest earned is subjected to a 10% TDS deduction. YTM is calculated on T+1 day for SEBI-regulated Bonds/SDIs and T+2 for RBI-regulated SDIs where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).",
  TOTAL_INTEREST_SDISECONDARY:
    'Target returns include interest payments and repayment of principal, prior to deduction or computation of any taxes',
  INTEREST_SDISECONDARY:
    'As per applicable tax laws, TDS (Withholding Tax) will be deducted on the interest income at 25% (in case of Resident Individuals) and 30% (in case of Non-Individual/ Entities domiciled in India).',
};

export const getActivelyEarningImage = (asset?: any) => {
  return asset?.status === 'active'
    ? `${GRIP_INVEST_BUCKET_URL}commons/activelyEarningDetails.svg`
    : `${GRIP_INVEST_BUCKET_URL}commons/Tick.svg`;
};

export const getReturnsCompletedImageURL = (asset: any) => {
  const pendingImageUrl = 'commons/returnsCompletedDisabled.svg';

  return asset?.status !== 'Completed'
    ? `${GRIP_INVEST_BUCKET_URL}${pendingImageUrl}`
    : `${GRIP_INVEST_BUCKET_URL}commons/Tick.svg`;
};

export type SdiSecondaryCalculationDataModal = {
  investmentAmount: number;
  stampDuty: number;
  purchasePrice: number;
  accruedInterest: number;
  principalAmount: number;
  preTaxReturns: number;
  totalInterest: number;
  additionalCharges: number;
  maxInvestment: number;
  maxLots: number;
  minLots: number;
  totalAdditionalCharges: number;
};
