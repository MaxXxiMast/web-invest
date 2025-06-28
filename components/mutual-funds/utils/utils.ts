import { KycModules, StatusValues } from './types';
import dayjs from 'dayjs';

export const getKycModuleFields = (
  kycConfigStatus: any,
  moduleType: KycModules
) => {
  const fieldData: any =
    (kycConfigStatus?.default?.kycTypes as any[])?.find(
      (ele) => ele?.name === moduleType
    )?.fields || {};

  return fieldData;
};

export const getOverallDefaultKycStepsMf = (kycConfigStatus: any) => {
  const kycTypes = kycConfigStatus?.default?.kycTypes;
  const total = kycTypes?.length;
  let completed = 0;
  kycTypes?.forEach((element) => {
    if (element.isKYCComplete && !element?.isKYCPendingVerification) {
      completed = completed + 1;
    } else if (element?.isKYCPendingVerification) {
      completed = completed + 1;
    }
  });

  return {
    completed,
    total,
  };
};

export const getOverallDefaultKycStatusMf = (
  kycConfigStatus: any
): StatusValues => {
  if (kycConfigStatus?.default?.isFilteredKYCComplete) {
    return 'verified';
  } else {
    const kycTypes = kycConfigStatus?.default?.kycTypes;
    let isPendingVerification = false;
    for (let i = 0; i < kycTypes?.length; i++) {
      if (!kycTypes[i]?.isKYCComplete) {
        if (kycTypes[i]?.isKYCPendingVerification) {
          isPendingVerification = kycTypes[i]?.isKYCPendingVerification;
        }
      }
      if (isPendingVerification) {
        break;
      }
    }
    if (isPendingVerification) {
      return 'pending verification';
    }
    const kycCompletedSteps = getOverallDefaultKycStepsMf(kycConfigStatus);
    if (kycCompletedSteps.total !== kycCompletedSteps.completed) {
      return 'continue';
    }
    return 'pending';
  }
};

export const getPercentageIncrease = (
  oldValue: number,
  newValue: number
): number => {
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Returns the difference in years (with months as decimals) between two dates.
 * @param fromDate - Start date (string or Date)
 * @param toDate - End date (string or Date)
 * @returns Number of years (e.g., 2.5 for 2 years 6 months)
 */
export function getFilterYrs(
  fromDate: string | Date,
  toDate: string | Date
): string {
  const start = dayjs(fromDate);
  const end = dayjs(toDate);

  const years = end.diff(start, 'year');
  const months = end.diff(start.add(years, 'year'), 'month');
  const decimalYears = years + months / 12;

  return `${Number(decimalYears.toFixed(2)) || 0}Y`;
}

export const handleToFixed = (value: number, decimalPlaces = 2) => {
  if (isNaN(value) || value === null || value === undefined || value === 0) {
    return '0.00';
  }
  return Number(value).toFixed(decimalPlaces);
};
