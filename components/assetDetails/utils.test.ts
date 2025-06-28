import {
  processContent,
  getDocumentStatus,
  getNriAddressDocumentStatus,
  getAssetDetailSchema,
  experimentUserCategoryCheck,
} from './utils';

describe('processContent', () => {
  it('should center align image-center content', () => {
    const content = '<p>image-center</p>';
    const result = processContent(content);
    expect(result).toContain('style="display: flex; justify-content: center;"');
  });

  it('should replace youtube-embeded content with iframe', () => {
    const content =
      'youtube-embeded https://www.youtube.com/embed/dQw4w9WgXcQ youtube-embeded';
    const result = processContent(content);
    expect(result).toContain('<iframe');
    expect(result).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
  });
});

describe('getDocumentStatus', () => {
  it('should return Pending if kycObject is empty', () => {
    expect(getDocumentStatus({}, 'id')).toBe('Pending');
  });

  it('should return Approved for verified status', () => {
    const kycObject = { id: { status: 'verified' } };
    expect(getDocumentStatus(kycObject, 'id')).toBe('Approved');
  });

  it('should return Rejected for rejected status', () => {
    const kycObject = { id: { status: 'rejected' } };
    expect(getDocumentStatus(kycObject, 'id')).toBe('Rejected');
  });
});

describe('getNriAddressDocumentStatus', () => {
  it('should return Pending if no address proof is verified', () => {
    const kycObject = {
      aadhaar: { status: 'pending' },
      passport: { status: 'pending' },
    };
    expect(getNriAddressDocumentStatus(kycObject)).toBe('Pending');
  });

  it('should return Approved if any address proof is verified', () => {
    const kycObject = {
      aadhaar: { status: 'verified' },
      passport: { status: 'pending' },
    };
    expect(getNriAddressDocumentStatus(kycObject)).toBe('Approved');
  });
});

describe('getAssetDetailSchema', () => {
  it('should return a valid schema object', () => {
    const asset = {
      header: 'Test Asset',
      minAmount: 1000,
      maxAmount: 5000,
      irr: 5.5,
    };
    const schema = getAssetDetailSchema(asset);
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'InvestmentOrDeposit',
      name: 'Test Asset',
      amount: {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        minValue: 1000,
        maxValue: 5000,
      },
      interestRate: 5.5,
    });
  });
});

describe('experimentUserCategoryCheck', () => {
  it('should return true for even userId when userType is even', () => {
    expect(experimentUserCategoryCheck('even', 2)).toBe(true);
  });

  it('should return false for odd userId when userType is even', () => {
    expect(experimentUserCategoryCheck('even', 3)).toBe(false);
  });

  it('should return true for all userIds when userType is all', () => {
    expect(experimentUserCategoryCheck('all', 1)).toBe(true);
    expect(experimentUserCategoryCheck('all', 2)).toBe(true);
  });
});
