// utils.test.ts

import {
  sortConstant,
  sortOptions,
  filtersContant,
  assetFilters,
  filterBy,
  sortDeals,
} from './utils';

jest.mock('../../../redux', () => ({
  __esModule: true,
  default: {
    getState: () => ({
      assets: {
        ratingScaleData: {
          AAA: { elevationAngle: 9 },
          BBB: { elevationAngle: 1 },
        },
      },
    }),
  },
}));

const baseDeal = {
  ytm: 11,
  irr: 11,
  minInvestmentAmount: 50000,
  maturityDate: new Date(Date.now() + 13 * 30 * 24 * 60 * 60 * 1000),
  assetMappingData: {
    assetPrincipalPaymentFrequency: 'Monthly',
    rating: 'AA',
  },
};

describe('sortConstant', () => {
  it('should contain correct sorting keys and values', () => {
    expect(sortConstant.relevance).toBe('relevance');
    expect(sortConstant.ytm_desc).toBe('ytm-high-to-low');
    expect(sortConstant.tenure_asc).toBe('tenure-low-to-high');
    expect(sortConstant.investment_asc).toBe('investment-low-to-high');
    expect(sortConstant.rating_desc).toBe('rating-high-to-low');
  });
});

describe('sortOptions', () => {
  it('should map labels to correct values from sortConstant', () => {
    expect(sortOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Relevance (Default)',
          value: sortConstant.relevance,
        }),
        expect.objectContaining({
          label: 'YTM: High to Low',
          value: sortConstant.ytm_desc,
        }),
      ])
    );
  });
});

describe('filtersContant', () => {
  it('should contain expected filter keys', () => {
    expect(filtersContant['Below 10%']).toBe('below-10%');
    expect(filtersContant['10-12%']).toBe('10-12%');
    expect(filtersContant['Above 12%']).toBe('above-12%');
  });
});

describe('assetFilters', () => {
  it('should include correct ytm filter options', () => {
    const ytm = assetFilters.ytm;
    expect(ytm.label).toBe('YTM');
    expect(ytm.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Below 10%', value: 'below-10%' }),
        expect.objectContaining({ label: '10-12%', value: '10-12%' }),
        expect.objectContaining({ label: 'Above 12%', value: 'above-12%' }),
      ])
    );
  });

  it('should include correct principalRepayment options', () => {
    const pr = assetFilters.principalRepayment;
    expect(pr.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Monthly', value: 'Monthly' }),
        expect.objectContaining({ label: 'Quarterly', value: 'Quarterly' }),
        expect.objectContaining({ label: 'At Maturity', value: 'at-maturity' }),
        expect.objectContaining({
          label: 'Staggered',
          value: 'Staggered Payouts',
        }),
      ])
    );
  });
});

describe('filterBy', () => {
  it('should filter by YTM', () => {
    const filters = {
      ytm: [filtersContant['10-12%']],
      tenure: [],
      minInvestment: [],
      principalRepayment: [],
    };
    expect(filterBy([baseDeal], filters).length).toBe(1);
  });

  it('should filter by tenure (12-24M)', () => {
    const filters = {
      ytm: [],
      tenure: [filtersContant['12-24M']],
      minInvestment: [],
      principalRepayment: [],
    };
    expect(filterBy([baseDeal], filters).length).toBe(1);
  });

  it('should filter by min investment (10k - 1Lac)', () => {
    const filters = {
      ytm: [],
      tenure: [],
      minInvestment: [filtersContant['10k - 1Lac']],
      principalRepayment: [],
    };
    expect(filterBy([baseDeal], filters).length).toBe(1);
  });

  it('should filter by principal repayment (Monthly)', () => {
    const filters = {
      ytm: [],
      tenure: [],
      minInvestment: [],
      principalRepayment: [filtersContant['Monthly']],
    };
    expect(filterBy([baseDeal], filters).length).toBe(1);
  });

  describe('sortDeals', () => {
    const dealA = {
      ytm: 12,
      irr: 12,
      minInvestmentAmount: 50000,
      maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assetMappingData: {
        rating: 'AAA',
      },
    };

    const dealB = {
      ytm: 8,
      irr: 8,
      minInvestmentAmount: 150000,
      maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      assetMappingData: {
        rating: 'BBB',
      },
    };

    it('should sort by YTM descending', () => {
      const result = sortDeals([dealA, dealB], sortConstant.ytm_desc);
      expect(result[0]).toBe(dealA);
    });

    it('should sort by tenure ascending', () => {
      const result = sortDeals([dealA, dealB], sortConstant.tenure_asc);
      expect(result[0]).toBe(dealA);
    });

    it('should sort by investment ascending', () => {
      const result = sortDeals([dealA, dealB], sortConstant.investment_asc);
      expect(result[0]).toBe(dealA);
    });

    it('should sort by rating descending (AAA before BBB)', () => {
      const result = sortDeals([dealA, dealB], sortConstant.rating_desc);
      expect(result[0].assetMappingData.rating).toBe('BBB');
    });

    it('should return original order for default sort', () => {
      const result = sortDeals([dealA, dealB], 'default');
      expect(result).toEqual([dealA, dealB]);
    });
    it('should filter by principal repayment Quarterly', () => {
      const deal = {
        ...baseDeal,
        assetMappingData: { assetPrincipalPaymentFrequency: 'Quarterly' },
      };
      const filters = {
        ytm: [],
        tenure: [],
        minInvestment: [],
        principalRepayment: [filtersContant['Quarterly']],
      };
      expect(filterBy([deal], filters).length).toBe(1);
    });

    it('should filter by principal repayment At Maturity', () => {
      const deal = {
        ...baseDeal,
        assetMappingData: { assetPrincipalPaymentFrequency: 'At Maturity' },
      };
      const filters = {
        ytm: [],
        tenure: [],
        minInvestment: [],
        principalRepayment: [filtersContant['At Maturity']],
      };
      expect(filterBy([deal], filters).length).toBe(1);
    });

    it('should filter by principal repayment Staggered', () => {
      const deal = {
        ...baseDeal,
        assetMappingData: { assetPrincipalPaymentFrequency: 'Staggered' },
      };
      const filters = {
        ytm: [],
        tenure: [],
        minInvestment: [],
        principalRepayment: [filtersContant['Staggered']],
      };
      expect(filterBy([deal], filters).length).toBe(1);
    });

    it('should exclude deal if principalRepayment value doesn’t match any filter', () => {
      const deal = {
        ...baseDeal,
        assetMappingData: { assetPrincipalPaymentFrequency: 'Semi-Annual' },
      };

      const filters = {
        ytm: [],
        tenure: [],
        minInvestment: [],
        principalRepayment: [filtersContant['Monthly']],
      };

      expect(filterBy([deal], filters).length).toBe(0);
    });

    it('should exclude deal if any filter fails (final return false case)', () => {
      const deal = {
        ...baseDeal,
        ytm: 5,
        minInvestmentAmount: 1000000,
        assetMappingData: {
          assetPrincipalPaymentFrequency: 'Monthly',
          rating: 'AAA',
        },
      };

      const filters = {
        ytm: [filtersContant['Above 12%']],
        tenure: [],
        minInvestment: [],
        principalRepayment: [],
      };

      expect(filterBy([deal], filters).length).toBe(0);
    });
    it('should filter by min investment under 10k', () => {
      const deal = {
        ...baseDeal,
        minInvestmentAmount: 9900,
      };

      const filters = {
        ytm: [],
        tenure: [],
        minInvestment: [filtersContant['Under 10k']],
        principalRepayment: [],
      };

      expect(filterBy([deal], filters).length).toBe(1);
    });
    it('should exclude deal if repayment frequency is not recognized', () => {
      const deal = {
        ...baseDeal,
        assetMappingData: { assetPrincipalPaymentFrequency: 'Semi-Annual' },
      };

      const filters = {
        ytm: [],
        tenure: [],
        minInvestment: [],
        principalRepayment: [filtersContant['Quarterly']],
      };

      expect(filterBy([deal], filters).length).toBe(0);
    });
    it('should allow deal through if no rating filter is applied', () => {
      const filters = {
        ytm: [],
        tenure: [],
        minInvestment: [],
        principalRepayment: [],
      };

      expect(filterBy([baseDeal], filters).length).toBe(1);
    });
    it('should reject deal if any filter fails', () => {
      const deal = {
        ...baseDeal,
        ytm: 5,
      };

      const filters = {
        ytm: [filtersContant['Above 12%']],
        tenure: [],
        minInvestment: [],
        principalRepayment: [],
      };

      expect(filterBy([deal], filters).length).toBe(0);
    });
    it('should exclude deal if YTM filter value is invalid', () => {
      const deal = { ...baseDeal, ytm: 11 };
      const filters = {
        ytm: ['invalid-ytm'],
        tenure: [],
        minInvestment: [],
        principalRepayment: [],
      };
      expect(filterBy([deal], filters).length).toBe(0);
    });
    it('should exclude deal if Tenure filter value is invalid', () => {
      const deal = {
        ...baseDeal,
        maturityDate: new Date(Date.now() + 13 * 30 * 24 * 60 * 60 * 1000),
      };
      const filters = {
        ytm: [],
        tenure: ['invalid-tenure'],
        minInvestment: [],
        principalRepayment: [],
      };
      expect(filterBy([deal], filters).length).toBe(0);
    });
    it('should exclude deal if principalRepayment filter value is invalid', () => {
      const deal = {
        ...baseDeal,
        assetMappingData: { assetPrincipalPaymentFrequency: 'Monthly' },
      };
      const filters = {
        ytm: [],
        tenure: [],
        minInvestment: [],
        principalRepayment: ['not-a-valid-option'],
      };
      expect(filterBy([deal], filters).length).toBe(0);
    });
    it('should exclude deal if tenure does not satisfy "Above 24M" filter', () => {
      const deal = {
        ...baseDeal,
        maturityDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
      };

      const filters = {
        ytm: [],
        tenure: [filtersContant['Above 24M']],
        minInvestment: [],
        principalRepayment: [],
      };

      expect(filterBy([deal], filters).length).toBe(0);
    });
    it('should exclude deal if tenure is <= 24 months but "Above 24M" is selected', () => {
      const deal = {
        ...baseDeal,
        maturityDate: new Date(Date.now() + 20 * 30 * 24 * 60 * 60 * 1000), // ≈20 months
      };

      const filters = {
        ytm: [],
        tenure: [filtersContant['Above 24M']],
        minInvestment: [],
        principalRepayment: [],
      };

      expect(filterBy([deal], filters).length).toBe(0);
    });
    it('should return false for unrecognized min investment filter value', () => {
      const deal = {
        ytm: 11,
        irr: 11,
        minInvestmentAmount: 50000,
        maturityDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
        assetMappingData: {
          assetPrincipalPaymentFrequency: 'Monthly',
          rating: 'AA',
        },
      };

      const filters = {
        ytm: [],
        tenure: [],
        minInvestment: ['Invalid Range'], // ← will hit return false
        principalRepayment: [],
      };

      const result = filterBy([deal], filters);
      expect(result).toHaveLength(0); // this triggers the fallback return false
    });
    it('should sort by investment ascending (minInvestmentAmount)', () => {
      const dealA = { minInvestmentAmount: 5000 };
      const dealB = { minInvestmentAmount: 100000 };
      const result = sortDeals([dealB, dealA], sortConstant.investment_asc);
      expect(result[0].minInvestmentAmount).toBe(5000);
    });

    it('should sort by rating descending (higher rank first)', () => {
      const dealA = {
        assetMappingData: { rating: 'AAA' },
      };
      const dealB = {
        assetMappingData: { rating: 'BBB' },
      };
      const result = sortDeals([dealA, dealB], sortConstant.rating_desc);
      expect(result[0].assetMappingData.rating).toBe('BBB');
    });
  });
});
