import { isDocumentUnderVerification } from './kyc';
import { isAssetSpvParentAIF } from './asset';
import { isAssetBonds, isSDISecondary } from './financeProductTypes';
import store from '../redux';
import { userData } from '../redux/slices/user';

export const kycStatuses = [
  'pending',
  'pending verification',
  'verified',
  'rejected',
];
export const pendingStatuses: (string | number)[] = ['pending', 'rejected'];

export const pendingKycStatuses: (string | number)[] = [
  'pending',
  'rejected',
  'pending verification',
];
export const isUserIFA = (userData: userData) => userData?.userType === 'ifa';

/**
 * Check whether the user has completed Commercial product KYC
 *
 * @param userData `userData` object of the loggedin user stored in redux
 * @returns {String} status for enhanced kyc i.e, "pending verification" | "verified" | "pending"
 */
export function getEnhancedKYCStatus(userData: userData) {
  const {
    cheque,
    nomineeDob,
    nomineeAddress,
    nomineeName,
    photo,
    nomineeEmail,
    placeOfBirth,
    countryOfBirth,
  } = userData || {};
  if (
    nomineeAddress &&
    nomineeDob &&
    nomineeName &&
    photo &&
    nomineeEmail &&
    countryOfBirth &&
    placeOfBirth
  ) {
    if (
      userData?.kycBankStatus === 'pending verification' &&
      (cheque?.status === 'pending verification' || cheque?.status === 2)
    ) {
      return 'pending verification';
    }
    return 'verified';
  } else {
    return 'pending';
  }
}
export const isEnhancedKycRequired = (asset: any): boolean => {
  return isAssetSpvParentAIF(asset);
};
export const isKycUnderVerification = (userData: userData) => {
  const { kycPanStatus, kycAadhaarStatus, kycBankStatus, kycDone } = userData;
  const isVerificationPending = kycStatuses[1];
  return (
    kycPanStatus === isVerificationPending ||
    kycAadhaarStatus === isVerificationPending ||
    (kycBankStatus === isVerificationPending && !kycDone)
  );
};
export const isKycPending = (userData: userData, kycDetails: any) => {
  const { kycPanStatus, kycAadhaarStatus, kycBankStatus, cheque, nomineeName } =
    userData || {};
  let userDocument = kycDetails?.depository || {};
  if (kycDetails?.depository?.userDocument) {
    userDocument = kycDetails?.depository?.userDocument;
  }

  return (
    pendingStatuses.includes(kycPanStatus) ||
    pendingStatuses.includes(kycAadhaarStatus) ||
    pendingStatuses.includes(kycBankStatus) ||
    !cheque ||
    cheque?.status === 'pending verification' ||
    cheque?.status === 2 ||
    !userDocument ||
    userDocument?.status === 0 ||
    userDocument?.status === 2 ||
    (isNaN(userDocument?.status) && userDocument?.status !== 'verified') ||
    !nomineeName
  );
};

export const isAdditionalKYCPending = (userData: userData) => {
  const status = getEnhancedKYCStatus(userData);
  return status === 'pending';
};
export const isAdditionalKycPendingVerification = (userData: any) => {
  const status = getEnhancedKYCStatus(userData);
  return status === 'pending verification';
};

export const isUserSignedUp = () => {
  const accessData = store.getState()?.access;
  if (!accessData?.accessToken) {
    return 'not-logged-in';
  }
  if (accessData?.mobileNo && accessData?.emailID) {
    return 'signed-up';
  }
  return 'not-signed-up';
};

export const isUserLogged = () => {
  const accessData = store.getState().access;
  if (!accessData) {
    return false;
  }
  return Boolean(
    accessData?.accessToken &&
      accessData?.userID &&
      accessData?.emailID &&
      accessData?.mobileNo
  );
};

const kycUrlv2 = ['pan', 'address', 'bank', 'others', 'cmr-cml'];
const getKycStage = (
  userData: any,
  kycDetails: any = {},
  assetData: any = {},
  isIFA = false
) => {
  const {
    kycPanStatus,
    kycAadhaarStatus,
    kycBankStatus,
    nomineeName,
    occupation,
    nationality,
    residentialStatus,
    nomineeDob,
    nomineeAddress,
    photo,
    nomineeEmail,
    placeOfBirth,
    countryOfBirth,
  } = userData;
  const { aadhaar, pan, passport, bankWrongAttempts } = kycDetails;
  const { userDocument } = kycDetails?.depository || {};
  const bank = kycDetails?.bank || {};

  const isEnhancedOtherDetailsPending =
    !nomineeName ||
    !occupation ||
    !nationality ||
    !residentialStatus ||
    ((!nomineeDob ||
      !nomineeAddress ||
      !photo ||
      !nomineeEmail ||
      !placeOfBirth ||
      !countryOfBirth) &&
      userData?.isUserAccredited);

  if (
    pendingKycStatuses.includes(kycPanStatus) &&
    !isDocumentUnderVerification(pan) &&
    !isIFA
  ) {
    return kycUrlv2[0];
  } else if (
    pendingKycStatuses.includes(kycAadhaarStatus) &&
    !(
      isDocumentUnderVerification(aadhaar) ||
      isDocumentUnderVerification(passport)
    ) &&
    !isIFA
  ) {
    return kycUrlv2[1];
  } else if (!userData?.cheque) {
    return kycUrlv2[2];
  } else if (
    kycBankStatus === pendingKycStatuses[0] ||
    (pendingKycStatuses.includes(kycBankStatus) &&
      !isDocumentUnderVerification(pan) &&
      !isDocumentUnderVerification(bank) &&
      bank?.status === 'pending verification' &&
      bankWrongAttempts < 3 &&
      !isIFA)
  ) {
    return kycUrlv2[2];
  } else if (
    bankWrongAttempts >= 3 &&
    kycBankStatus === pendingKycStatuses[2] &&
    pendingKycStatuses.includes(kycBankStatus) &&
    !isDocumentUnderVerification(pan) &&
    bank?.status === 'pending verification' &&
    !isIFA
  ) {
    if (!isAssetSpvParentAIF(assetData)) {
      return kycUrlv2[4];
    }

    return kycUrlv2[3];
  } else if (!isAssetSpvParentAIF(assetData)) {
    if (
      !nomineeName ||
      !residentialStatus ||
      (userData?.isUserAccredited && isEnhancedOtherDetailsPending)
    ) {
      return kycUrlv2[3];
    }

    if (
      !userDocument ||
      userDocument?.status === 0 ||
      userDocument?.status === 2
    ) {
      return kycUrlv2[4];
    }
  } else if (
    isAssetSpvParentAIF(assetData) &&
    (!nomineeName ||
      !occupation ||
      !nationality ||
      !residentialStatus ||
      ((!nomineeDob ||
        !nomineeAddress ||
        !photo ||
        !nomineeEmail ||
        !placeOfBirth ||
        !countryOfBirth) &&
        userData?.isUserAccredited))
  ) {
    if (isAssetBonds(assetData) || isSDISecondary(assetData)) {
      return kycUrlv2[4];
    }
    return kycUrlv2[3];
  }
  return '';
};

export const getKycUrl = (
  userData: any,
  kycDetails: any = {},
  assetData: any = {}
) => {
  const kycUrl = getKycStage(userData, kycDetails, assetData);
  if (!kycUrl) {
    return '/assets';
  }
  return `/kyc/${kycUrl}`;
};

export const getNoOfNotifications = (
  notifications: any,
  pendingResignations?: any,
  pendingMcaEsign?: any
) => {
  let notificationCount = notifications && notifications.length;
  // IFA user do not get the referral bonus
  // TODO: Referral Bonus Notifications for IFA
  // if (userData?.referredBy && !userData?.totalOrders && !isUserIFA(userData)) {
  //   notificationCount += 1;
  // }
  if (pendingResignations && pendingResignations.length) {
    notificationCount += pendingResignations.length;
  }
  if (pendingMcaEsign && pendingMcaEsign.length) {
    notificationCount += pendingMcaEsign.length;
  }
  return notificationCount || 0;
};

export const isUserAccredited = (kycConsents: any = []) => {
  return kycConsents.some(
    (consent: any) => consent.kycType === 8 && consent.content !== 'none'
  );
};

export const residentOptions = [
  { labelKey: 'Resident Indian', value: 'resident_indian' },
  { labelKey: 'NRI', value: 'nri' },
  { labelKey: 'OCI', value: 'oci' },
  { labelKey: 'Others', value: 'others' },
];

/**
 * Function to check ckycstatus of an user
 */

export const isUserCkycPending = (userData: userData) => {
  if (!userData) {
    return true;
  }
  const { userCKyc, ckycDisabled } = userData;
  //feature flag for ckyc feature
  if (ckycDisabled) {
    return false;
  }

  if (userCKyc && userCKyc?.ckycStatus === 'SUCCESS') {
    return false;
  }

  return true;
};

/**
 * Function to extract user basic data from userkycdata for aadhaar card
 * @param data
 * @returns
 */

export const getAddressFromCkycData = (data: any) => {
  if (!data) {
    return {
      fullName: '',
      permanentAddress: '',
      correspondenceAddress: '',
      aadhaarNumber: '',
    };
  }

  const { identityDetails = {}, personalDetails = {} } =
    data?.otherDetails?.data?.kycResult?.personalIdentifiableData || {};
  const {
    fullName = '',
    permLine1 = '',
    permLine2 = '',
    permLine3 = '',
    permCity = '',
    permDist = '',
    permPin = '',
    corresLine1 = '',
    corresLine2 = '',
    corresLine3 = '',
    corresCity = '',
    corresDist = '',
    corresPin = '',
    permCorresSameflag,
  } = personalDetails;
  const { identity = [] } = identityDetails;
  const aadhaarDetails = identity.find(
    (detail: any) => detail.identityType === 'Proof of Possession of Aadhaar'
  );
  const permanentAddress = `${permLine1} ${permLine2} ${permLine3} ${permCity} ${permDist} ${permPin}`;
  let correspondenceAddress = `${corresLine1} ${corresLine2} ${corresLine3} ${corresCity} ${corresDist} ${corresPin}`;
  if (permCorresSameflag === 'Y') {
    correspondenceAddress = permanentAddress;
  }
  return {
    fullName,
    permanentAddress,
    correspondenceAddress,
    aadhaarNumber: aadhaarDetails?.identityNumber,
  };
};

/**
 *
 * Allow following Account for investment
 *
 * 1. 'current account'
 * 2. 'savings account'
 * 3. 'salary account'
 * 4. 'non-resident ordinary savings account',
 *
 * Do not allow following accounts for investments
 * 1. 'non-resident external savings account',
 * 2. 'foreign currency non-resident account',
 *
 * @param accountType Saving Account Type
 * @returns {boolean} `true` when non-allowed user comes
 */

export const isUserAccountNRE = (accountType: string) => {
  // When non resident and external or foreign
  if (
    accountType?.includes('non-resident') &&
    !accountType?.includes('ordinary')
  ) {
    return true;
  }

  return false;
};

const ckycTypes = {
  CKYC_SEARCH: 'search',
  CKYC_DOWNLOAD: 'download',
};

export const isUserEligibleForCkycDownload = (userData: userData) => {
  if (!userData) {
    return false;
  }
  const { ckycDisabled } = userData;
  //feature flag for ckyc feature
  if (ckycDisabled) {
    return false;
  }
  const { ckycType } = userData;
  if (ckycType === ckycTypes.CKYC_DOWNLOAD) {
    return true;
  }
  return false;
};

export const isUserCkycDownloadCompleted = (userData: userData) => {
  if (!userData) {
    return false;
  }
  //check first whether user is eligible for ckyc download
  if (isUserEligibleForCkycDownload(userData)) {
    const { userCKyc } = userData;
    if (userCKyc && userCKyc?.ckycStatus === 'SUCCESS') {
      return true;
    }
  }
  return false;
};
