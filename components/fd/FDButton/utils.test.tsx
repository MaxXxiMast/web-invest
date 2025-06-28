// __tests__/utils.test.ts
import { isSeniorCitizen, determineFDActionForKYC } from './utils';
import { calculateAge } from '../../user-kyc/utils/NomineeUtils';

jest.mock('../../user-kyc/utils/NomineeUtils', () => ({
  calculateAge: jest.fn(),
}));

describe('isSeniorCitizen', () => {
  it('should return true if age is 60 or above', () => {
    (calculateAge as jest.Mock).mockReturnValue(60);
    expect(isSeniorCitizen('1960-01-01')).toBe(true);
  });

  it('should return false if age is below 60', () => {
    (calculateAge as jest.Mock).mockReturnValue(59);
    expect(isSeniorCitizen('1970-01-01')).toBe(false);
  });
});

describe('determineFDActionForKYC', () => {
  it('should return disabled if PAN is pending verification', () => {
    const input = {
      isFilteredKYCComplete: false,
      kycTypes: [{ name: 'pan', isKYCPendingVerification: true }],
    };
    expect(determineFDActionForKYC(input)).toBe('disabled');
  });

  it('should return redirect if mandatory KYC (excluding address/other) is incomplete and not pending', () => {
    const input = {
      isFilteredKYCComplete: false,
      kycTypes: [
        { name: 'pan' },
        { name: 'id', isKYCComplete: false, isKYCPendingVerification: false },
      ],
    };
    expect(determineFDActionForKYC(input)).toBe('redirect');
  });

  it('should return redirect if "other" KYC is incomplete and missing fields', () => {
    const input = {
      isFilteredKYCComplete: false,
      kycTypes: [
        { name: 'pan' },
        {
          name: 'other',
          isKYCComplete: false,
          fields: {
            gender: '',
            income: '',
            maritalStatus: '',
            motherMaidenName: '',
            nationality: '',
            occupation: '',
          },
        },
      ],
    };
    expect(determineFDActionForKYC(input)).toBe('redirect');
  });

  it('should return popup if qualification is missing or address KYC is incomplete and not pending', () => {
    const input = {
      isFilteredKYCComplete: false,
      kycTypes: [
        { name: 'pan', isKYCComplete: true },
        {
          name: 'other',
          isKYCComplete: true,
          fields: {
            qualification: '', 
            gender: 'm',
            income: 'yes',
            maritalStatus: 'yes',
            motherMaidenName: 'yes',
            nationality: 'yes',
            occupation: 'yes',
          },
        },
        {
          name: 'address',
          isKYCComplete: false,
          isKYCPendingVerification: false, 
        },
      ],
    };
    expect(determineFDActionForKYC(input)).toBe('popup');
  });

  it('should return disabled if any KYC type is pending verification', () => {
    const input = {
      isFilteredKYCComplete: false,
      kycTypes: [
        { name: 'pan', isKYCComplete: true },
        {
          name: 'other',
          isKYCComplete: true,
          fields: {
            gender: 'm',
            income: 'yes',
            maritalStatus: 'yes',
            motherMaidenName: 'yes',
            nationality: 'yes',
            occupation: 'yes',
            qualification: 'graduate',
          },
        },
        {
          name: 'address',
          isKYCComplete: true,
        },
        {
          name: 'id',
          isKYCPendingVerification: true, 
        },
      ],
    };
    expect(determineFDActionForKYC(input)).toBe('disabled');
  });

  it('should return initiate if all checks pass', () => {
    const input = {
      isFilteredKYCComplete: false,
      kycTypes: [
        { name: 'pan', isKYCComplete: true },
        {
          name: 'other',
          isKYCComplete: true,
          fields: {
            gender: 'm',
            income: 'yes',
            maritalStatus: 'yes',
            motherMaidenName: 'yes',
            nationality: 'yes',
            occupation: 'yes',
            qualification: 'graduate',
          },
        },
        { name: 'address', isKYCComplete: true },
      ],
    };
    expect(determineFDActionForKYC(input)).toBe('initiate');
  });
});
