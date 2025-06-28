import { userData } from '../../redux/slices/user';

export const ckycTypes = {
  CKYC_SEARCH: 'search',
  CKYC_DOWNLOAD: 'download',
};

/**
 * Function to check if the user type is difa and ckyctype is download or not
 * @param userData
 * @returns boolean (whether user is eligible for ckyc download or not)
 */

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

/**
 * Function to check ckyc download is completed or not
 * @param userData
 * @returns
 */

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

export const getProfilePhotoURL = (userData: any) => {
  const { photo = '' } = userData || {};
  if (typeof photo === 'string') {
    return photo;
  } else {
    return photo?.signedUrl;
  }
};
