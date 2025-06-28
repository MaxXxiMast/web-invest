import dayjs from 'dayjs';

import { KycStatusResponseModel, KycStepModel, KycStepType } from './models';
import { identityKycSteps } from './identityUtils';
import { financialKycSteps } from './financialUtils';
import { trackEvent } from '../../../utils/gtm';

export const verifiedStatus = [1, 'approved'];

export const extraStepArr = ['other', 'nominee', 'aof'];

export const kycDocArr = [
  ...identityKycSteps,
  ...financialKycSteps,
  ...extraStepArr,
];

export const kycSections = {
  identity: identityKycSteps,
  financial: financialKycSteps,
  other: ['other'],
  nominee: ['nominee'],
  aof: ['aof'],
};

/**
 * Check given step status
 * @param arr Array of steps
 * @param searchKey Name of step
 * @returns
 */
export const checkActiveStep = (
  arr: KycStepModel[],
  searchKey: KycStepType
) => {
  if (!arr.length) {
    return false;
  }
  return verifiedStatus.includes(
    arr.filter((ele) => ele?.name === searchKey)?.[0]?.status
  );
};

/**
 * Check given step status for bank
 * @param arr Array of steps
 * @param searchKey Name of step
 * @returns
 */
export const checkSkipActiveStep = (
  arr: KycStepModel[],
  searchKey: KycStepType
) => {
  if (!arr.length) {
    return false;
  }
  return (
    checkActiveStep(arr, searchKey) ||
    arr.filter((ele) => ele?.name === searchKey)?.[0]?.status === 2
  );
};

/**
 * Check given step status for address verified KRA
 * @param arr Array of steps
 * @param searchKey Name of step
 * @returns
 */
export const checkSkipStep = (arr: KycStepModel[], searchKey: KycStepType) => {
  if (!arr.length) {
    return false;
  }
  return arr.filter((ele) => ele?.name === searchKey)?.[0]?.status === 3;
};

/**
 * Convert the Date to input format for Input HTML type="date"
 * @param {string}dob date (which has format of DD/MM/YYYY)
 * @returns {string} converted date in format YYYY-MM-DD
 */
export const convertAPIToDateInputFormat = (dob = '') => {
  return dayjs(dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
};

export const getKycStepStatus = (
  kycStatusArr: KycStatusResponseModel[] = []
) => {
  if (!kycStatusArr.length) {
    return [];
  }
  const completedSteps: KycStepModel[] = kycStatusArr.map((ele) => {
    let stepStatus = 0;
    // Check for KYC Complete and Under Verification Status
    if (ele.isKYCComplete) {
      stepStatus = 1;
    } else {
      stepStatus = ele?.isKYCPendingVerification ? 2 : 0;
    }
    return {
      status: stepStatus,
      name: ele?.name as KycStepType,
    };
  }) as KycStepModel[];

  return completedSteps;
};

export const getDocStatusString = (status: number) => {
  if (status === 1) {
    return 'Approved';
  }
  if (status === 2) {
    return 'Under verification';
  }
  return 'Pending';
};

/**
 * Convert Input HTML type="date" format for the API format
 * @param {string}dob date (which has format of YYYY-MM-DD)
 * @returns {string} converted date in format DD/MM/YYYY
 */
export const convertDateInputToAPIFormat = (dob: string) => {
  return dayjs(dob, 'YYYY-MM-DD').format('DD/MM/YYYY');
};

/**
 * Convert the normal dob which has no identified format to input format for Input HTML type="date"
 * @param dob date
 * @returns converted date in format YYYY-MM-DD
 */
export const convertNomineeDoBDateInput = (dob = '') => {
  const updatedFormatDate = dayjs(dob);

  // Using for invalid format date or partial
  if (updatedFormatDate.isValid()) {
    return updatedFormatDate.format('YYYY-MM-DD');
  }

  return '';
};

/**
 * existing user message for different modules
 */
export const existingUserMessage = {
  pan: 'We’ve fetched your PAN details from your existing KYC provided on Grip',
  bank: 'We’ve fetched your bank account details from your existing KYC provided on Grip',
  demat: 'We’ve fetched Demat details from your existing KYC provided on Grip',
};

export const completedStepsHelper = (
  existingArr: KycStepModel[],
  val: KycStepModel
) => {
  const tempExistingArr = [...existingArr];
  const existingItemIndex = tempExistingArr.findIndex(
    (ele) => ele.name === val.name
  );
  if (existingItemIndex > -1) {
    tempExistingArr[existingItemIndex] = {
      ...tempExistingArr[existingItemIndex],
      ...val,
    };
  } else {
    tempExistingArr.push(val);
  }

  return tempExistingArr;
};

// Every Status should be verified, if status 3 then it is used for skipping or showing step for a condition
export const isCompletedStep = (value: KycStepModel) => {
  const status = Number(value?.status);
  return (
    status === 1 ||
    status === 3 ||
    (['liveness', 'address', 'depository', 'bank'].includes(value?.name) &&
      status === 2)
  );
};

export type DocItem = {
  label: string;
  description?: string;
  id: string;
};

export const updatedKycSteps: DocItem[] = [
  {
    label: 'Identity Information',
    description: 'PAN, Address details, Selfie and Signature',
    id: 'identity',
  },
  {
    label: 'Basic Financial Information',
    description: 'Bank Account and DEMAT details',
    id: 'financial',
  },
  {
    label: 'Other Information',
    description: 'Other personal information',
    id: 'other',
  },
  {
    label: 'Nominee(s)',
    description: 'Nominee name, DOB and Email',
    id: 'nominee',
  },
  {
    label: 'eSign',
    description: 'eSign the Customer Onboarding Form',
    id: 'aof',
  },
];

export const getStatusofEachSection = (kycSteps: KycStepModel[]) => {
  let finalSectionStatus = {};
  for (const sectionStep of updatedKycSteps) {
    const sectionSteps = kycSections?.[sectionStep.id] ?? [];
    const sectionStepDetails = kycSteps
      .filter((kycStep) => sectionSteps.includes(kycStep.name))
      .map((kycStep) => Number(kycStep.status));

    // If any of the step status is 2 then section status 2 (under verification)
    // If every step status is 1 then section status 1 (verified)
    // If every step status is 0 then section status 0 (pending)
    if (sectionStepDetails.some((value) => value === 2)) {
      finalSectionStatus[sectionStep.id] = 2;
    } else if (sectionStepDetails.every((value) => value === 1)) {
      finalSectionStatus[sectionStep.id] = 1;
    } else {
      finalSectionStatus[sectionStep.id] = 0;
    }
  }

  return finalSectionStatus;
};

export const popupBlockedError = (popupName: string) => {
  return {
    title: 'Pop-ups blocked on your browser',
    icon: 'icons/popupBlocked.svg',
    desc1: `Our ${popupName} window was blocked by your browser. 
    Please allow your browser to show pop-up windows for a smoother KYC. 
    You can block them once your KYC is complete`,
    desc2: 'You can block them once your KYC is complete',
    styledLink: {
      title: 'Show me how to fix this',
      link: 'https://www.gripinvest.in/blog/how-to-temporarily-enable-pop-ups-in-your-web-browser',
    },
    btnText: 'I’ve unblocked popups',
  };
};

export const skipManualVerificationForAOF = ['liveness', 'depository', 'bank'];

export const isAnyStepUnderVerification = (completedSteps: KycStepModel[]) => {
  return completedSteps.some((stepDetails) => stepDetails.status === 2);
};

type KYCErrorEvent = {
  module: string;
  error_heading: string;
  error_type: string;
  error_payload: unknown;
  cta_text?: string;
  error_message?: string;
};

export const trackKYCErrorEvt = (data: KYCErrorEvent) => {
  trackEvent('kyc_error', data);
};

export const trackKYCCheckpointEvt = (module: string) => {
  trackEvent('kyc_checkpoint', {
    module,
  });
};

export const trackKYCSuccessEvt = (module: string, data: unknown) => {
  trackEvent(`kyc_${module}_added`, data);
};

/**
 * Aadhar XML and Bank should be verified to be FD ready
 * @param completedSteps Completed Steps Details for
 * @param kycValues Values for the KYC
 * @returns {boolean} FD KYC is completed or not
 */
export const getFDKYCReady = (
  completedSteps: KycStepModel[],
  kycValues: any
) => {
  const addressStep = completedSteps.find((step) => step.name === 'address');
  const bankStep = completedSteps.find((step) => step.name === 'bank');
  const addressDetails: any = kycValues?.address ?? {};
  const qualificationDetails: any = kycValues?.other ?? {};

  // Added check for digilocker and aadhar xml for xml details and xml document should be true
  return (
    addressStep?.status === 1 &&
    ['aadhaar_xml', 'digilocker'].includes(addressDetails?.moduleType) &&
    bankStep?.status === 1 &&
    qualificationDetails?.qualification
  );
};

// GET KYC Details from the kycConfigStatus using name
export const getKYCDetailsFromConfig = (
  kycConfigStatus: {
    default: { kycTypes: KycStatusResponseModel[] };
  },
  name: string
) => {
  const kycStatusArr: KycStatusResponseModel[] =
    kycConfigStatus?.default?.kycTypes || [];

  const data: any = kycStatusArr.find((ele) => ele.name === name) || {};

  return {
    ...(data?.fields || {}),
    ...(data?.optionalFields || {}),
  };
};
