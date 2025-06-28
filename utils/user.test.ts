import {
  getAddressFromCkycData,
  isUserAccountNRE,
  getNoOfNotifications,
  isUserSignedUp,
  isUserLogged,
  isUserCkycPending,
  isUserEligibleForCkycDownload,
  isUserCkycDownloadCompleted,
} from './user';
import store from '../redux';

describe('getAddressFromCkycData', () => {
  it('should return default values when data is null', () => {
    const result = getAddressFromCkycData(null);
    expect(result).toEqual({
      fullName: '',
      permanentAddress: '',
      correspondenceAddress: '',
      aadhaarNumber: '',
    });
  });

  it('should extract address and aadhaar details correctly', () => {
    const mockData = {
      otherDetails: {
        data: {
          kycResult: {
            personalIdentifiableData: {
              identityDetails: {
                identity: [
                  {
                    identityType: 'Proof of Possession of Aadhaar',
                    identityNumber: '1234-5678-9012',
                  },
                ],
              },
              personalDetails: {
                fullName: 'John Doe',
                permLine1: '123 Main St',
                permLine2: 'Apt 4B',
                permLine3: '',
                permCity: 'Metropolis',
                permDist: 'Central',
                permPin: '123456',
                corresLine1: '456 Elm St',
                corresLine2: '',
                corresLine3: '',
                corresCity: 'Gotham',
                corresDist: 'North',
                corresPin: '654321',
                permCorresSameflag: 'N',
              },
            },
          },
        },
      },
    };

    const result = getAddressFromCkycData(mockData);
    expect(result).toEqual({
      fullName: 'John Doe',
      permanentAddress: '123 Main St Apt 4B  Metropolis Central 123456',
      correspondenceAddress: '456 Elm St   Gotham North 654321',
      aadhaarNumber: '1234-5678-9012',
    });
  });
});

describe('isUserAccountNRE', () => {
  it('should return true for non-resident external accounts', () => {
    expect(isUserAccountNRE('non-resident external savings account')).toBe(
      true
    );
  });

  it('should return false for non-resident ordinary accounts', () => {
    expect(isUserAccountNRE('non-resident ordinary savings account')).toBe(
      false
    );
  });
});

describe('getNoOfNotifications', () => {
  it('should calculate notification count correctly', () => {
    const notifications = [{ id: 1 }, { id: 2 }];
    const pendingResignations = [{ id: 3 }];
    const pendingMcaEsign = [{ id: 4 }, { id: 5 }];

    const result = getNoOfNotifications(
      notifications,
      pendingResignations,
      pendingMcaEsign
    );
    expect(result).toBe(5);
  });
});

describe('isUserSignedUp', () => {
  it('should return signed-up status correctly', () => {
    // @ts-ignore
    jest.spyOn(store, 'getState').mockReturnValue({
      access: {
        mobileNo: '123',
        emailID: 'test@example.com',
        accessToken: 'token',
        isTimeLessThanTwoHoursRBI: false,
        isTimeLessThanTwoHoursFD: false,
        isServerDown: false,
      },
    });
    expect(isUserSignedUp()).toBe('signed-up');
  });
});

describe('isUserLogged', () => {
  it('should return logged-in status correctly', () => {
    // @ts-ignore
    jest.spyOn(store, 'getState').mockReturnValue({
      access: {
        userID: '1',
        emailID: 'test@example.com',
        mobileNo: '123',
        accessToken: 'token',
        isTimeLessThanTwoHoursRBI: false,
        isTimeLessThanTwoHoursFD: false,
        isServerDown: false,
      },
    });
    expect(isUserLogged()).toBe(true);
  });
});

describe('isUserCkycPending', () => {
  it('should return true if CKYC is pending', () => {
    const userData = {
      userID: '1',
      emailID: 'test@example.com',
      mobileNo: '123',
      firstName: 'John',
      lastName: 'Doe',
      documents: [],
      dematNo: '',
      kycPanStatus: 'pending',
      kycAadhaarStatus: 'pending',
      kycBankStatus: 'pending',
      nomineeName: '',
      userCKyc: null,
      ckycDisabled: false,
    };
    //@ts-ignore
    expect(isUserCkycPending(userData)).toBe(true);
  });
});

describe('isUserEligibleForCkycDownload', () => {
  it('should return true if user is eligible for CKYC download', () => {
    const userData = {
      userID: '1',
      emailID: 'test@example.com',
      mobileNo: '123',
      firstName: 'John',
      lastName: 'Doe',
      documents: [],
      dematNo: '',
      kycPanStatus: 'verified',
      kycAadhaarStatus: 'verified',
      kycBankStatus: 'verified',
      nomineeName: 'Jane Doe',
      ckycType: 'download',
      ckycDisabled: false,
    };
    //@ts-ignore
    expect(isUserEligibleForCkycDownload(userData)).toBe(true);
  });
});

describe('isUserCkycDownloadCompleted', () => {
  it('should return true if CKYC download is completed', () => {
    const userData = {
      userID: '1',
      emailID: 'test@example.com',
      mobileNo: '123',
      firstName: 'John',
      lastName: 'Doe',
      documents: [],
      dematNo: '',
      kycPanStatus: 'verified',
      kycAadhaarStatus: 'verified',
      kycBankStatus: 'verified',
      nomineeName: 'Jane Doe',
      userCKyc: { ckycStatus: 'SUCCESS' },
      ckycType: 'download',
      ckycDisabled: false,
    };
    //@ts-ignore
    expect(isUserCkycDownloadCompleted(userData)).toBe(true);
  });
});
