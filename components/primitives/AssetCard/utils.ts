import {
  getMaturityDate,
  getMaturityMonths,
  isMldProduct,
} from '../../../utils/asset';
import {
  financeProductTypeConstants,
  isAssetBasket,
  isAssetBonds,
  isAssetBondsMF,
  isAssetStartupEquity,
  isHighYieldFd,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import {
  numberToIndianCurrency,
  roundOff,
  toCurrecyStringWithDecimals,
} from '../../../utils/number';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

export const paymentStatusLabel = {
  Ongoing: 'Actively Earning',
  Confirmed: 'Pending Metrics',
  Completed: 'Returns Completed',
};

export const paymentStatusImage = {
  Ongoing: `${GRIP_INVEST_BUCKET_URL}dealsV2/activelyEarning.svg`,
  Confirmed: `${GRIP_INVEST_BUCKET_URL}dealsV2/pendingMetrics.svg`,
  Completed: `${GRIP_INVEST_BUCKET_URL}dealsV2/returnsCompleted.svg`,
};

type Asset = {
  badges?: string;
};

export const isIrrBadgeVisible = (
  irrDroppingDate: Date | null,
  asset: Asset | null
): boolean => {
  return (
    !!asset?.badges?.split(',').includes('irr dropping soon') &&
    !!irrDroppingDate
  );
};

export const isHideCutOut = (
  irrDroppingDate: Date | null,
  asset: Asset | null
): boolean => {
  return (
    Boolean(irrDroppingDate) &&
    asset?.badges?.includes('irr dropping soon') &&
    new Date(irrDroppingDate).getTime() > Date.now()
  );
};

export const corporateBondConstant = {
  returns: 'Returns in DEMAT',
  amountRaised: 'Amount Raised',
};

/**
 * Function to genrate assetInfo depending upon finance product type
 * @param asset
 * @returns {any} assetInfo
 */

export const getAssetInfo = (asset: any): any => {
  let assetDetails: any = [
    {
      label: `Yield to Maturity`,
      suffix: '%',
      value: roundOff(asset?.irr ?? 0, 2),
      style: {
        label: {
          paddingLeft: 2,
        },
      },
    },
    {
      label: 'Tenure',
      suffix: 'months',
      value: asset.tenure,
      style: {
        flex: {
          alignItems: 'center',
        },
      },
    },
    {
      label: ' Min Investment',
      suffix: null,
      value: `${numberToIndianCurrency(asset.minInvestmentAmount)}`,
      id: 'minInvestment',
      style: {
        flex: {
          alignItems: 'flex-end',
        },
      },
    },
  ];
  if (asset.financeProductType === financeProductTypeConstants.realEstate) {
    assetDetails = [
      {
        label: 'Average Pre-Tax Yield',
        suffix: '%',
        value: asset.irr,
        style: {
          label: {
            paddingLeft: 2,
          },
        },
      },
      {
        label: 'Target Pre-Tax IRR',
        suffix: '%',
        value: Number(asset.postTaxYield).toFixed(2),
        id: 'irr',
        style: {
          flex: {
            alignItems: 'center',
          },
        },
      },
      {
        label: 'Min Investment',
        suffix: null,
        value: `₹${toCurrecyStringWithDecimals(asset.preTaxMinAmount)}`,
        id: 'minInvestment',
        style: {
          flex: {
            alignItems: 'flex-end',
          },
        },
      },
    ];
  } else if (isAssetStartupEquity(asset)) {
    const { fundingDetails = {} } = asset;
    let fundingDetail = fundingDetails?.fundingRound ?? 'Seed';
    if (fundingDetail.length > 8) {
      fundingDetail = `${fundingDetail.substr(0, 8)}...`;
    }
    const { leadInvestorName = '' } = fundingDetails || {};
    assetDetails = [
      {
        label: 'Funding Round',
        value: fundingDetail,
        id: 'fundingRound',
      },
      {
        label: 'Lead Investor',
        value: leadInvestorName,
        id: 'leadInvestor',
        style: {
          flex: {
            alignItems: 'center',
          },
        },
      },
      {
        label: ' Min Investment',
        suffix: null,
        value: `${toCurrecyStringWithDecimals(asset.preTaxMinAmount)}`,
        id: 'minInvestment',
        style: {
          flex: {
            alignItems: 'flex-end',
          },
        },
      },
    ];
  } else if (isAssetBonds(asset)) {
    const isMld = isMldProduct(asset);
    assetDetails = [
      {
        label: `Yield to Maturity`,
        suffix: '%',
        value:
          asset?.assetMappingData?.preTaxYtm || asset?.assetMappingData?.irr,
        style: {
          label: {
            paddingLeft: 2,
          },
        },
      },
      {
        label: 'Time to Maturity',
        suffix: 'Months',
        value: getMaturityMonths(getMaturityDate(asset)),
        style: {
          flex: {
            alignItems: 'center',
          },
        },
      },
      {
        label: 'Min Investment',
        suffix: null,
        value: `${numberToIndianCurrency(asset?.minInvestmentAmount)}`,
        id: 'minInvestment',
        style: {
          flex: {
            alignItems: 'flex-end',
          },
        },
      },
      {
        label: `Coupon Rate`,
        suffix: '%',
        value: asset?.assetMappingData?.couponRate,
        style: {
          label: {
            paddingLeft: 2,
          },
        },
      },
      {
        label: 'Interest Payment',
        suffix: null,
        value: isMld
          ? 'At Maturity'
          : asset?.assetMappingData?.couponInterestReturnFrequency,
        style: {
          flex: {
            alignItems: 'center',
          },
        },
      },
      {
        label: 'Rating',
        suffix: null,
        value: `${asset?.assetMappingData?.ratedBy || ''} ${
          asset?.assetMappingData?.rating || ''
        }`,
        id: 'assetRating',
        style: {
          flex: {
            alignItems: 'flex-end',
          },
        },
      },
    ];
    if (isMld) {
      assetDetails = assetDetails.filter(
        (detail: any) => detail.label !== 'Coupon Rate'
      );
    }
  } else if (isSDISecondary(asset)) {
    assetDetails = [
      {
        label: `Yield to Maturity`,
        suffix: '%',
        value: roundOff(asset?.irr ?? 0, 2),
        style: {
          label: {
            paddingLeft: 2,
          },
        },
      },
      {
        label: 'Time to Maturity',
        suffix: `${
          getMaturityMonths(getMaturityDate(asset)) > 1 ? 'Months' : 'Month'
        }`,
        value: getMaturityMonths(getMaturityDate(asset)),
        style: {
          flex: {
            alignItems: 'center',
          },
        },
      },
      {
        label: 'Min Investment',
        suffix: null,
        value:
          numberToIndianCurrency(asset.minInvestmentAmount) ??
          `${numberToIndianCurrency(
            Number(asset?.assetMappingData?.calculatedFaceValue) *
              Number(asset?.assetMappingData?.minNoOfLots) +
              Number(asset?.assetMappingData?.additionalCharges) || 0
          )}`,
        id: 'minInvestment',
        style: {
          flex: {
            alignItems: 'flex-end',
          },
        },
      },
      {
        label: `No of Partners`,
        suffix: '',
        value: asset?.assetPartnersCount || 0,
        style: {
          label: {
            paddingLeft: 2,
          },
        },
      },
      {
        label: `Payment Frequency`,
        suffix: '',
        value: asset?.assetMappingData?.interestReturnFrequency,
        style: {
          flex: {
            alignItems: 'center',
          },
        },
      },
      {
        label: 'Rating',
        suffix: null,
        value: `${asset?.assetMappingData?.ratedBy || ''} ${
          asset?.assetMappingData?.rating || ''
        }`,
        id: 'assetRating',
        style: {
          flex: {
            alignItems: 'flex-end',
          },
        },
      },
    ];
  } else if (isHighYieldFd(asset)) {
    assetDetails = [
      {
        label: `Interest Rate`,
        suffix: '%',
        valueLabel: 'up to',
        value: asset?.assetMappingData?.maxInterest,
      },
      {
        label: 'Tenure',
        valueLabel: 'from',
        suffix: `${asset?.assetMappingData?.tenureType}`,
        value: `${asset?.assetMappingData?.tenure}`,
      },
      {
        label: 'Min Investment',
        suffix: '',
        value: `${numberToIndianCurrency(
          Number(asset?.assetMappingData?.minTxnAmount) || 0
        )}`,
      },
      {
        id: 'assetRating',
        label: asset?.category === 'bank' ? 'DICGC Insured' : 'NBFC Rating',
        suffix: null,
        value: `${
          asset?.category === 'bank'
            ? 'Upto 5L'
            : asset?.assetMappingData?.rating
        }`,
      },
    ];
  }
  if (isAssetBasket(asset)) {
    assetDetails = [
      {
        label: `Yield To Maturity`,
        suffix: '%',
        value: roundOff((asset?.assetMappingData?.irr || asset?.irr) ?? 0, 2),
        style: {
          label: {
            paddingLeft: 2,
          },
        },
      },
      {
        label: 'Time to Maturity',
        suffix: `${
          getMaturityMonths(getMaturityDate(asset)) > 1 ? 'Months' : 'Month'
        }`,
        value: getMaturityMonths(getMaturityDate(asset)),
        style: {
          flex: {
            alignItems: 'center',
          },
        },
      },
      {
        label: 'Min Investment',
        suffix: null,
        value: `${numberToIndianCurrency(
          asset?.minInvestmentAmount ||
            Number(asset?.assetMappingData?.faceValue) *
              Number(asset?.assetMappingData?.minNoOfLots) ||
            0
        )}`,
        id: 'minInvestment',
        style: {
          flex: {
            alignItems: 'flex-end',
          },
        },
      },
      {
        label: `No of Partners`,
        suffix: '',
        value: asset?.assetPartnersCount || 0,
        style: {
          label: {
            paddingLeft: 2,
          },
        },
      },
    ];
  }
  if (isAssetBondsMF(asset)) {
    //@TODO: update once confirmed API keys
    assetDetails = [
      {
        label: `1Y Annualised Return`,
        suffix: '%',
        value: roundOff(
          asset?.assetMappingData?.['1YrAnnualizedReturn'] ?? 0,
          2
        ),
      },
      {
        label: 'Min. Investment',
        value: numberToIndianCurrency(
          Number(asset?.assetMappingData?.minInitialInvestment) || 0
        ),
        suffix: '',
        id: 'minInvestment',
      },
      {
        label: 'No. of Unique Bonds',
        value: Number(asset?.assetMappingData?.noOfHoldings) || 0,
        suffix: '',
      },
    ];
  }

  return assetDetails;
};
