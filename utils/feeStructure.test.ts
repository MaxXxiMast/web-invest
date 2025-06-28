import {
  startupEquityFeeStructure,
  commercialProductFeesStructure,
  defaultFeeStructure,
  calculateTotalPayableAmount,
  WHY_POST_TAX_DETAILS,
} from './feeStructure';

describe('startupEquityFeeStructure', () => {
  it('should return an empty array if asset is null', () => {
    expect(startupEquityFeeStructure(null, 1000)).toEqual([]);
  });

  it('should calculate fees correctly for a valid asset', () => {
    const asset = {
      assetMappingData: {
        calculationInputFields: {
          gripFee: 2,
          aifFee: 1.5,
          statuatoryFee: 18,
        },
      },
    };
    const result = startupEquityFeeStructure(asset, 1000);
    expect(result).toHaveLength(3);
    expect(result[0].value).toBe(20); // Grip Fee
    expect(result[1].value).toBe(15); // AIF Fee
    expect(result[2].value).toBeCloseTo(2.7); // Statutory Charges
  });
});

describe('commercialProductFeesStructure', () => {
  it('should calculate fees correctly for a valid asset', () => {
    const asset = {
      commercialPropertyDetails: {},
      gripFee: 2,
      aifFees: 1.5,
      statuatorFees: 18,
    };
    const result = commercialProductFeesStructure(asset, 1000);
    expect(result).toHaveLength(3);
    expect(result[0].value).toBe(20); // Grip Fee
    expect(result[1].value).toBe(20); // AIF Fee
    expect(result[2].value).toBeCloseTo(3.6); // Statutory Charges
  });
});

describe('defaultFeeStructure', () => {
  it('should return an empty array if calculatedReturns or asset is null', () => {
    expect(defaultFeeStructure(null, '10', null)).toEqual([]);
  });

  it('should calculate pre-tax returns and tax correctly', () => {
    const calculatedReturns = { totalPreTaxAmount: 5000 };
    const asset = { gripFee: 2 };
    const result = defaultFeeStructure(calculatedReturns, '10', asset);
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(5000); // Pre-Tax Returns
    expect(result[1].value).toBe('10.0'); // Tax Applicable
  });
});

describe('calculateTotalPayableAmount', () => {
  it('should calculate the total payable amount correctly', () => {
    const fees = [{ value: 20 }, { value: 15 }, { value: '2.7' }];
    const investmentAmount = 1000;
    const result = calculateTotalPayableAmount(fees, investmentAmount);
    expect(result).toBe(1038); // Total Payable Amount
  });
});

describe('WHY_POST_TAX_DETAILS', () => {
  it('should contain correct details for post-tax returns', () => {
    expect(WHY_POST_TAX_DETAILS.WHY_POST_TAX).toContain('Grip creates a LLP');
    expect(WHY_POST_TAX_DETAILS.WHY_POST_TAX_HEADING).toBe('Post Tax Returns');
  });
});
