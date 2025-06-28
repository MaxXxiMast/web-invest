import { kycStepCountMapping } from './kycEntryPoint';

describe('kycStepCountMapping', () => {
  it('should map all KYC steps correctly', () => {
    expect(kycStepCountMapping).toEqual({
      address: 'poa',
      liveness: 'liveness',
      signature: 'signature',
      bank: 'bank',
      depository: 'demat',
      other: 'other_details',
      nominee: 'nominee_details',
      aof: 'aof',
    });
  });

  it('should have correct keys and values', () => {
    expect(kycStepCountMapping.address).toBe('poa');
    expect(kycStepCountMapping.liveness).toBe('liveness');
    expect(kycStepCountMapping.signature).toBe('signature');
    expect(kycStepCountMapping.bank).toBe('bank');
    expect(kycStepCountMapping.depository).toBe('demat');
    expect(kycStepCountMapping.other).toBe('other_details');
    expect(kycStepCountMapping.nominee).toBe('nominee_details');
    expect(kycStepCountMapping.aof).toBe('aof');
  });

  it('should not contain unexpected keys', () => {
    const expectedKeys = [
      'address',
      'liveness',
      'signature',
      'bank',
      'depository',
      'other',
      'nominee',
      'aof',
    ];
    expect(Object.keys(kycStepCountMapping).sort()).toEqual(
      expectedKeys.sort()
    );
  });
});
