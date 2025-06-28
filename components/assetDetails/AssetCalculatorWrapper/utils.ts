/**
 * @param userKYCConsent consents for user already completed
 * @param kycTypes all the types of kyc
 * @param kycTypeName get content on basis of type name of kyc
 * @returns {string | null} consent submitted by user
 */
const getUserKYCConsentData = (
  userKYCConsent: any,
  kycTypes: any,
  kycTypeName: string
) => {
  const kycTypeID = kycTypes?.find(
    (kycType: any) => kycType?.type === kycTypeName
  )?.id;
  return userKYCConsent?.find((consent: any) => consent.kycType === kycTypeID)
    ?.content;
};

const getCompletedUserConsents = (
  userKYCConsent: any,
  kycTypes: Array<any>
) => {
  return (
    userKYCConsent?.map(
      (consent: any) =>
        kycTypes?.find((type) => type.id === consent?.kycType)?.type
    ) ?? []
  );
};

const canViewCorporateAsset = (userKYCConsent: any, kycTypes: any) => {
  const consentType = [
    'client_identification',
    'accredited_investor_consent',
    'commercial_tnc',
  ];

  // Resident and NRI can view assets
  let clientIdentificationContent = getUserKYCConsentData(
    userKYCConsent,
    kycTypes,
    consentType[0]
  )?.toLowerCase();
  const validClientIdentification = ['resident', 'nri'];

  const isResidentORNRI =
    clientIdentificationContent === validClientIdentification[1] ||
    clientIdentificationContent?.includes(validClientIdentification[0]);

  // Accredited Investor consent
  const accreditedInvestorContent = getUserKYCConsentData(
    userKYCConsent,
    kycTypes,
    consentType[1]
  );
  const isAccreditedInvestorContent = !accreditedInvestorContent
    ?.toLowerCase()
    .includes('none');

  // Check if T&C Checked
  const isCheckedTC = getUserKYCConsentData(
    userKYCConsent,
    kycTypes,
    consentType[2]
  );

  return isResidentORNRI && isAccreditedInvestorContent && isCheckedTC;
};

/**
 * Only Resident, NRI can view assets and who has completed accredited investor consent
 * @param userKYCConsent
 * @param kycTypes
 * @returns if commercial products consents are completed by user
 */
export const isCommercialProductConsentCompleted = (
  userKYCConsent: any,
  kycTypes: Array<any>
) => {
  const consentType = ['client_identification', 'accredited_investor_consent'];
  const completedUserConsents = getCompletedUserConsents(
    userKYCConsent,
    kycTypes
  );
  return (
    consentType.every((type) => completedUserConsents?.includes(type)) &&
    canViewCorporateAsset(userKYCConsent, kycTypes)
  );
};
