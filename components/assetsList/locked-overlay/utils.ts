export type showBanner = {
  showNoInvestBannerUser: boolean;
  showConnectBannerUser: boolean;
};

/**
 * Asset List Consent view for Aif
 */
export const assetListConsentForAif = [
  'accredited_investor_consent',
  'client_identification',
  'commercial_tnc',
];

export const showNoInvestmentBanner = (content: string) => {
  const value = content?.toLowerCase();
  return value?.includes('foreign') || value === 'none';
};

export const showContactBanner = (content: string) => {
  return ['llp', 'corporate', 'huf'].includes(content?.toLowerCase());
};

/**
 * @param investorType Type of investor selected by user
 * @returns {String} message for contact banner
 */
export const showContactBannerMessage = (investorType: string) => {
  const message = (data: string) => {
    return `Reach out to us at <a href="mailto:invest@gripinvest.in">invest@gripinvest.in</a> to complete the KYC requirements of ${data} and then you will be allowed to invest`;
  };

  const value = investorType?.toLowerCase();
  if (value === 'huf') {
    return message('HUF');
  } else {
    return message('corporate body');
  }
};

/**
 * @param investorType Type of investor selected by user
 * @param accreditedConsent if selected accreditedConsent for a investor
 * @returns {String} message for no investment banner
 */
export const showNoInvestBannerMessage = (
  investorType: string,
  accreditedConsent: string
) => {
  const message = (investor: string) => {
    return `Because of regulatory reasons, we are restricting ${investor} / OCI / Others from
      investing in this asset type. Be in touch with us through
      <a href="mailto:invest@gripinvest.in">invest@gripinvest.in</a> and we
      might have a good news for you very soon`;
  };

  const value = investorType?.toLowerCase();

  if (value?.includes('foreign')) {
    return message('foreign citizens');
  } else if (accreditedConsent === 'none') {
    return `Because of regulatory reasons, we are restricting non accredited investors from viewing this asset type. If you are an accredited investor and wrongly filled the form then reach out to <a href="mailto:invest@gripinvest.in">invest@gripinvest.in</a> to enable you
      `;
  } else {
    return message('foreign citizens');
  }
};

export const checkValidResidentialStatus = (userData: any) => {
  return (
    userData &&
    userData?.residentialStatus &&
    ['resident_indian', 'nri', 'oci', 'others'].indexOf(
      userData?.residentialStatus
    ) > -1
  );
};

export const getResidentialStatusMapping = (residentialStatus: string) => {
  if (residentialStatus === 'resident_indian') {
    return 'Resident Indian';
  } else if (residentialStatus === 'nri') {
    return 'NRI';
  }
  return 'Foreign Citizen';
};
