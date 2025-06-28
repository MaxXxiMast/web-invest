import {
  getEnhancedKYCStatus,
  isAdditionalKYCPending,
  isEnhancedKycRequired,
  isKycPending,
  isUserCkycPending,
  kycStatuses,
} from './../../utils/user';
import {
  isAssetBonds,
  isSDISecondary,
  nonTaxRelatedProductTypes,
} from '../../utils/financeProductTypes';
import { isCommercialProductConsentCompleted } from '../assetDetails/AssetCalculatorWrapper/utils';
import { userData } from './../../redux/slices/user';
import { generateAssetURL } from '../../utils/asset';

/*
     1. check for enchanced kyc is required & is done
     2. check for normal kyc and status of normal kyc
     3. check for ckyc status 
   
   */

const checkKycStatusDependingUponAsset = (
  asset: any,
  userData: userData,
  userKYCPending: boolean
) => {
  return (
    (isEnhancedKycRequired(asset) && isAdditionalKYCPending(userData)) ||
    (userKYCPending && !isEnhancedKycRequired(asset)) ||
    (isUserCkycPending(userData) && isEnhancedKycRequired(asset))
  );
};

/**
 *
 * Check for pending KYC:
 *
 * Leasing / Inventory: should open only when normal kyc is completed
 *
 * CRE / SE:  should open only with followig kyc should be completed:
 * 1. Normal KYC
 * 2. Enhanced KYC
 * 3. Consent provided on asset list page
 * @param asset asset details
 * @param userKYCConsent consent submitted by the investor
 * @param kycTypes kyc types for the asset related spv
 * @param userData details of the user
 * @returns
 */

export const redirectToURLIFKYCNotCompleted = (
  asset: any,
  userKYCConsent: any,
  kycTypes: any,
  userData: userData,
  userKycDetails: any
) => {
  const { assetID = '', isRfq = false } = asset || {};
  if (isRfq) {
    return;
  }
  if (assetID) {
    const userKYCPending = isKycPending(userData, userKycDetails);
    if (checkKycStatusDependingUponAsset(asset, userData, userKYCPending)) {
      return generateAssetURL(asset);
    }

    const isNonTaxRelatedAsset = nonTaxRelatedProductTypes.includes(
      asset?.financeProductType
    );

    if (isNonTaxRelatedAsset) {
      if (!isCommercialProductConsentCompleted(userKYCConsent, kycTypes)) {
        return '/assets';
      }
    }
    if (
      (isAssetBonds(asset) || isSDISecondary(asset)) &&
      userData?.kycPanStatus === 'verified' &&
      userData?.kycBankStatus === 'verified'
    ) {
      return '';
    }

    if (isNonTaxRelatedAsset) {
      const isEnhancedKycPending =
        getEnhancedKYCStatus(userData) !== kycStatuses[2];

      if (isEnhancedKycPending) {
        return generateAssetURL(asset);
      }
    }
  }
  return '';
};
