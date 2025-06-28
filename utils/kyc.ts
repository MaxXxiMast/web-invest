import type { userData } from '../redux/slices/user';
import { isAssetSpvParentAIF } from './asset';
import { kycStatuses } from './user';

export const verifiedKycStatuses = ['verified', 'pending verification'];

export const KYC_FILE_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'application/pdf',
];

export const DEMAT_FILE_TYPES = ['application/pdf'];

export const isDocumentUnderVerification = (document: any = {}) => {
  return (
    document?.status === kycStatuses[1] &&
    document?.subStatus === 'failed validation'
  );
};

export const isBankDocumentUnderVerification = (document: any = {}) => {
  return document?.status === kycStatuses[1];
};

export function getPanStatus(user: userData): string {
  const kycPanStatus = user?.kycPanStatus;
  if (kycPanStatus === 'pending' || kycPanStatus === 0) {
    return 'pending';
  } else if (kycPanStatus === 'pending verification' || kycPanStatus === 2) {
    return 'pending verification';
  } else if (kycPanStatus === 'verified' || kycPanStatus === 1) {
    return 'verified';
  }
  return 'pending';
}

export function getAadhaarStatus(user: userData): string {
  const kycAadhaarStatus = user?.kycAadhaarStatus;
  if (kycAadhaarStatus === 'pending' || kycAadhaarStatus === 0) {
    return 'pending';
  } else if (
    kycAadhaarStatus === 'pending verification' ||
    kycAadhaarStatus === 2
  ) {
    return 'pending verification';
  } else if (kycAadhaarStatus === 'verified' || kycAadhaarStatus === 1) {
    return 'verified';
  }
  return 'pending';
}

export function getBankStatus(user: userData): string {
  const kycBankStatus = user?.kycBankStatus;
  if (kycBankStatus === 'pending' || kycBankStatus === 0) {
    return 'pending';
  } else if (kycBankStatus === 'pending verification' || kycBankStatus === 2) {
    return 'pending verification';
  } else if (kycBankStatus === 'verified' || kycBankStatus === 1) {
    return 'verified';
  }
  return 'pending';
}

// As per RBI guidelines , Indian bank account number must be between 9 - 18 digits
export const bankAccountRegex = Object.freeze(/^\d{9,18}$/);

// IFSC has 4 upper case characters, 0 for future purpose and 6 numeric characters (alphabets also possible)
export const ifscCodeRegex = Object.freeze(/^[A-Z]{4}0[A-Z0-9]{6}$/);

export const bankAccNumberRegex = Object.freeze(/\b\d{9,18}\b/);

export const accountTypes = [
  { labelKey: 'Current account', value: 'current account' },
  { labelKey: 'Savings account', value: 'savings account' },
  { labelKey: 'Salary account', value: 'salary account' },
  {
    labelKey: 'Non-resident ordinary (NRO) savings accounts',
    value: 'non-resident ordinary savings account',
  },
  {
    labelKey: 'Non-resident external (NRE) savings accounts',
    value: 'non-resident external savings account',
  },
  {
    labelKey: 'Foreign currency non-resident (FCNR) account',
    value: 'foreign currency non-resident account',
  },
];

export const nriAddressOptions = [
  { labelKey: 'Driving Licence', value: 'driving_licence' },
  { labelKey: 'Utility Bill', value: 'bill' },
  { labelKey: 'Mobile Bill', value: 'mobilebill' },
  { labelKey: 'Other', value: 'other' },
];

export const getHeaderData = (data: any, asset?: any) => {
  const isCMRCMLSteps = !isAssetSpvParentAIF(asset);

  const headerData: any = {};
  let stepArr: any[] = [...data];
  if (!isCMRCMLSteps) {
    stepArr = stepArr.filter((ele) => {
      return ele.id !== 'cmrCml';
    });
  }
  headerData.steps = stepArr;
  return headerData;
};

export const getIfscValue = (value: any) => {
  return value?.ifsc?.value || value?.ifscCode?.value;
};

export const getMICRValue = (value: any) => {
  return value?.micr?.value || value?.micrCode?.value;
};

export const getAccountNumberValue = (value: any) => {
  return value?.aCNo?.value || value?.bankACNo?.value;
};

export const getClientIdValue = (value: any) => {
  return (
    value?.clientID?.value ||
    value?.clienId?.value ||
    value?.clientId?.value ||
    value?.client?.value
  );
};

export const getDpIdValue = (value: any) => {
  return value?.dpID?.value || value?.dpId?.value;
};

/**
 * Validation for IFSC
 *
 * @param {string} value ifsc code
 * @returns `true` when a valid ifsc
 */
export const isValidIFSC = (value = '') => {
  return value?.length === 11;
};

/**
 * Get branch name from the success data
 * @param data data from ifsc api
 * @return {string} Bank, Branch name
 */

export const getBranchName = (data: any) => {
  const { BRANCH = '', BANK = '' } = data || {};
  return `${BANK}, ${BRANCH}`;
};

/**
 * File name extension
 */

export const getFileExtension = (filename = '') => {
  return filename?.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export type StepsArrModal = {
  dekstopLabel: string;
  mobileLabel: string;
  id?: 'IDENTITY' | 'FINANCIAL' | 'OTHER_INFO' | 'NOMINEE';
};

export const kycStepsArr: StepsArrModal[] = [
  {
    dekstopLabel: 'Identity Information',
    mobileLabel: 'Identity',
    id: 'IDENTITY',
  },
  {
    dekstopLabel: 'Bank Information',
    mobileLabel: 'Bank',
    id: 'FINANCIAL',
  },
  {
    dekstopLabel: 'Personal Information',
    mobileLabel: 'Personal Info',
    id: 'OTHER_INFO',
  },
  {
    dekstopLabel: 'Others',
    mobileLabel: 'Others',
    id: 'NOMINEE',
  },
];

export const AnnouncementPoints = [
  {
    id: '001',
    icon: 'icons/ticket.svg',
    lable: 'Access',
    text: 'Lower minimum investment amount for SDI products (LeaseX, LoanX, BondX, InvoiceX)',
  },
  {
    id: '002',
    icon: 'icons/RoundArrowTransfer.svg',
    lable: 'Ease',
    text: 'Payment gateway integration for seamless investment journey',
  },
  {
    id: '003',
    icon: 'icons/BlueShieldUser.svg',
    lable: 'Security',
    text: 'Exchange(NSE) enabled settlement within 1 business day',
  },
];

export const AnnouncementChangePoints = [
  {
    id: '101',
    text: 'Enjoy a lower minimum ticket size of INR 1 lakh or below for all SDI products',
  },
  {
    id: '102',
    text: 'UPI, NEFT and Netbanking have been added as payment options for your convenience',
  },
  {
    id: '103',
    text: 'Investments will be settled to your demat account faster i.e. within 1 working day',
  },
  {
    id: '104',
    text: 'All transactions will be settled by the Exchange (NSE or BSE) for your protection',
  },
  {
    id: '105',
    text: 'Existing users of Grip will need to complete a few additional KYC steps to make new investments',
  },
];

export const AnnouncementNonChangePoints = [
  {
    id: '201',
    text: 'Ability to access unique, diverse, non-market linked investment options',
  },
  {
    id: '202',
    text: 'All fixed-income investment options continue to be SEBI regulated, credit-rated and listed',
  },
  { id: '203', text: 'Nothing changes for your existing investments' },
];

export const getPaymentOptionMessages = (pageData: any) => {
  if (!pageData || !pageData.length) {
    return {};
  }
  const [{ objectData }] = pageData.filter(
    (p) => p.keyValue === 'paymentOptionMessages'
  );
  return objectData;
};
