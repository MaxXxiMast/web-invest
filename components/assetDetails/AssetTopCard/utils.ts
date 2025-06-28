import { getMaturityDate, getMaturityMonths } from '../../../utils/asset';
import { roundOff, toCurrecyStringWithDecimals } from '../../../utils/number';
import {
  isAssetStartupEquity,
  isSDISecondary,
} from '../../../utils/financeProductTypes';

const irrDescription = () => {
  return `Yield to Maturity (YTM) is the total annualized return expected on a Bond/ SDI if held until maturity. YTM accounts for the investment amount, interest payments, and principal repayment. YTM is calculated after deducting brokerage fees and calculated for T+1 day, where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).

 For SEBI Regulated SDIs: IRR shown is for T+1 day, where 'T' would be the day on which the user is placing the order (in case of normal orders) and in case of AMO orders, 'T' would be the next working day.

 For RBI Regulated SDIs: IRR shown is for T+2 day, where 'T' would be the day on which the user is placing the order (in case of normal orders) and in case of AMO orders, 'T' would be the next working day.`;
};

type OverViewModel = {
  label: string;
  value: string;
  prefix?: string;
  tooltipContent?: string;
  cutOutValue?: string;
};

export const getBondMFOverview = (asset: any): OverViewModel[] => {
  return [
    {
      label: 'Unique Bonds',
      value:
        asset?.assetMappingData?.calculationInputFields?.noOfHoldings || '0',
      tooltipContent: `Number of unique bonds in the portfolio`,
    },
    {
      label: 'AUM',
      value: `₹${toCurrecyStringWithDecimals(
        asset?.assetMappingData?.calculationInputFields?.aumManaged || 0,
        0,
        true
      )}`,
    },
  ];
};

export const getAssetOverview = (
  asset: any,
  isMobile = false,
  isFD = false
): OverViewModel[] => {
  const tenure = getMaturityMonths(getMaturityDate(asset));
  const {
    maxInterest = 0,
    preTaxYtm = 0,
    irr = 0,
    tenure: fdTenure = 0,
    tenureType = 'Months',
  } = asset?.assetMappingData?.calculationInputFields ?? {};

  const defaultTooltipContent = `Yield to Maturity (YTM) is the total annualized return expected on a Bond/ SDI if held until maturity. YTM accounts for the investment amount, interest payments, and principal repayment. YTM is calculated after deducting brokerage fees and calculated for T+1 day, where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).`;
  const tooltipContent = isSDISecondary(asset)
    ? irrDescription()
    : defaultTooltipContent;

  if (isFD) {
    return [
      {
        prefix: 'upto',
        label: 'Interest',
        value: `${Number(roundOff(maxInterest || 0, 2))}%`,
      },
      {
        prefix: 'from',
        label: 'Tenure',
        value: `${fdTenure} ${tenureType}`,
      },
    ];
  }

  if (isAssetStartupEquity(asset)) {
    return [
      {
        label: 'Funding Round',
        value:
          asset?.assetMappingData?.calculationInputFields?.fundingRound?.[0],
      },
      {
        label: 'Lead Investor',
        value:
          asset?.assetMappingData?.calculationInputFields?.leadInvestorName,
      },
    ];
  }
  return [
    {
      label: isMobile ? 'Yield to Maturity' : 'YTM',
      value: `${Number(roundOff(preTaxYtm || irr || asset?.irr || 0, 2))}%`,
      tooltipContent,
      cutOutValue:
        asset?.assetMappingData?.calculationInputFields?.irrCutout ||
        asset?.assetMappingData?.calculationInputFields?.preTaxIrrCutout,
    },
    {
      label: 'Remaining Tenure',
      value: `${tenure} ${tenure > 1 ? 'Months' : 'Month'}`,
    },
  ];
};
