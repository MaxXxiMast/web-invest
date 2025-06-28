import { calculateAge } from '../../user-kyc/utils/NomineeUtils';
import type { Behaviour } from './types';

export const isSeniorCitizen = (dob: string) => calculateAge(dob) >= 60;

export const determineFDActionForKYC = (kycDetails: any = {}): Behaviour => {
  const kycList = kycDetails?.kycTypes || [];

  if (!kycDetails?.isFilteredKYCComplete) {
    // GET PAN Details
    const panDetails = kycList?.find((kycData) => kycData?.name === 'pan');

    if (panDetails?.isKYCPendingVerification) {
      return 'disabled';
    }

    // IF any of the following is not complete then  then redirect to user-kyc
    if (
      kycList
        ?.filter(({ name }) => !['other', 'address'].includes(name))
        ?.some(
          (kycData) =>
            !kycData?.isKYCComplete && !kycData?.isKYCPendingVerification
        )
    ) {
      return 'redirect';
    }

    const otherDetails = kycList?.find((kycData) => kycData?.name === 'other');
    const otherFields = otherDetails?.fields || {};

    if (
      otherDetails?.isKYCComplete === false &&
      (!otherFields?.gender ||
        !otherFields?.income ||
        !otherFields?.maritalStatus ||
        !otherFields?.motherMaidenName ||
        !otherFields?.nationality ||
        !otherFields?.occupation)
    ) {
      return 'redirect';
    }

    const addressStep = kycList?.find((kycData) => kycData?.name === 'address');
    //If qualification or aadhar xml is pending then show popup
    if (
      !otherFields?.qualification ||
      (!addressStep?.isKYCComplete && !addressStep?.isKYCPendingVerification)
    ) {
      return 'popup';
    }

    // IF any of the following is under verification then show under verification details
    if (kycList?.some((kycData) => kycData?.isKYCPendingVerification)) {
      return 'disabled';
    }
  }

  return 'initiate';
};
