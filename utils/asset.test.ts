import dayjs from 'dayjs';
import {
  assetStatus,
  isFirstTimeInvestor,
  getMaturityMonths,
  getMaturityDate,
  committedInvestment,
  getRepaymentCycle,
  isValidInvestmentAmount,
  generateAssetURL,
  generateAgreementURL,
  backToAggrementURL,
  getTxnID,
  absoluteCommittedInvestment,
  isAssetAIF,
  isAssetSpvParentAIF,
  isAifDeal,
  isMldProduct,
  isInValidAssetUrl,
  getAssetPartnersName,
} from './asset';

describe('assetStatus', () => {
  it('should return the correct status', () => {
    expect(assetStatus({ assetStatus: 'Active' })).toBe('active');
    expect(assetStatus({ status: 'Past' })).toBe('past');
    expect(assetStatus({})).toBe(undefined);
  });
});

describe('isFirstTimeInvestor', () => {
  it('should return true if user has no investments', () => {
    expect(
      isFirstTimeInvestor({ investmentData: { totalInvestments: 0 } })
    ).toBe(true);
  });

  it('should return false if user has investments', () => {
    expect(
      isFirstTimeInvestor({ investmentData: { totalInvestments: 10 } })
    ).toBe(false);
  });
});

describe('getMaturityMonths', () => {
  it('should calculate the correct number of months', () => {
    const maturityDate = dayjs().add(90, 'days');
    expect(getMaturityMonths(maturityDate)).toBeCloseTo(3);
  });
});

describe('getMaturityDate', () => {
  it('should return the correct maturity date', () => {
    const asset = {
      assetMappingData: {
        calculationInputFields: { maturityDate: '2025-12-31' },
      },
    };
    expect(getMaturityDate(asset)).toBe('2025-12-31');
  });
});

describe('committedInvestment', () => {
  it('should calculate committed investment correctly', () => {
    const asset = { collectedAmount: 500, totalAmount: 1000 };
    expect(committedInvestment(asset)).toBe(0);
  });
});

describe('getRepaymentCycle', () => {
  it('should return the correct repayment cycle', () => {
    expect(getRepaymentCycle({ repaymentCycle: 'Monthly' })).toBe(
      'Monthly Returns'
    );
  });
});

describe('isValidInvestmentAmount', () => {
  it('should validate investment amount correctly', () => {
    const asset = {
      minAmount: 1000,
      maxAmount: 5000,
      totalMaxAmount: 10000,
      collectedAmount: 2000,
      preTaxCollectedAmount: 12000,
    };
    expect(isValidInvestmentAmount(asset, 2000)).toEqual([
      true,
      'Payment allowed',
      20000,
      false,
    ]);
  });
});

describe('generateAssetURL', () => {
  it('should generate the correct asset URL', () => {
    const asset = {
      category: 'bonds',
      assetID: '123',
      partnerName: 'partner',
      name: 'asset',
    };
    expect(generateAssetURL(asset)).toBe(
      '/assetdetails/partner/bonds/asset/123'
    );
  });
});

describe('generateAgreementURL', () => {
  it('should generate the correct agreement URL', () => {
    const asset = {
      category: 'bonds',
      assetID: '123',
      partnerName: 'partner',
      name: 'asset',
    };
    expect(generateAgreementURL(asset, 1000)).toBe(
      '/assetagreement/partner/bonds/asset/123?amount=1000'
    );
  });
});

describe('backToAggrementURL', () => {
  it('should generate the correct back to agreement URL', () => {
    const url = backToAggrementURL({
      assetID: '123',
      name: 'asset',
      category: 'bonds',
      partnerName: 'partner',
      amount: 1000,
    });
    expect(url).toBe('/assetagreement/partner/bonds/asset/123?amount=1000');
  });
});

describe('getTxnID', () => {
  it('should extract the transaction ID correctly', () => {
    expect(getTxnID('TXN-12345')).toBe('TXN');
  });
});

describe('absoluteCommittedInvestment', () => {
  it('should calculate absolute committed investment correctly', () => {
    const asset = { collectedAmount: 500, totalAmount: 1000 };
    expect(absoluteCommittedInvestment(asset)).toBe(50);
  });
});

describe('isAssetAIF', () => {
  it('should return true for AIF assets', () => {
    expect(isAssetAIF({ spvType: 3 })).toBe(true);
  });
});

describe('isAssetSpvParentAIF', () => {
  it('should return true if SPV parent is AIF', () => {
    expect(
      isAssetSpvParentAIF({ spvCategoryDetails: { spvParent: { id: 2 } } })
    ).toBe(true);
  });
});

describe('isAifDeal', () => {
  it('should return true for AIF deals', () => {
    expect(isAifDeal(3)).toBe(true);
  });
});

describe('isMldProduct', () => {
  it('should return true for MLD products', () => {
    expect(isMldProduct({ categoryID: 7 })).toBe(true);
  });
});

describe('isInValidAssetUrl', () => {
  it('should validate asset URL correctly', () => {
    expect(isInValidAssetUrl({ name: 'asset' }, 'asset')).toBe(false);
  });
});

describe('getAssetPartnersName', () => {
  it('should return the correct asset partners name', () => {
    const asset = {
      assetPartners: [
        { tblpartner: { name: 'Partner1' } },
        { tblpartner: { name: 'Partner2' } },
      ],
    };
    expect(getAssetPartnersName(asset)).toBe('Partner1,Partner2');
  });
});
