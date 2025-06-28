import { redirectToURLIFKYCNotCompleted } from './utils';
import { kycStatuses } from './../../utils/user';

describe('redirectToURLIFKYCNotCompleted', () => {
  it('should return asset URL when KYC is pending', () => {
    const asset = {
      assetID: '123',
      isRfq: false,
      partnerName: 'testPartner',
      category: 'testCategory',
      name: 'testName',
    };
    const userData = { kycPanStatus: 'pending', kycBankStatus: 'pending' };
    const userKycDetails = {};
    const userKYCConsent = {};
    const kycTypes = {};

    const result = redirectToURLIFKYCNotCompleted(
      asset,
      userKYCConsent,
      kycTypes,
      //@ts-ignore
      userData,
      userKycDetails
    );
    expect(result).toBe('/assetdetails/testpartner/testcategory/testname/123');
  });

  it('should return empty string when asset ID is not provided', () => {
    const asset = { isRfq: false };
    const userData = {};
    const userKycDetails = {};
    const userKYCConsent = {};
    const kycTypes = {};

    const result = redirectToURLIFKYCNotCompleted(
      asset,
      userKYCConsent,
      kycTypes,
      //@ts-ignore
      userData,
      userKycDetails
    );
    expect(result).toBe('');
  });
});
