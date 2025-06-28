import {
  financeProductTypeMapping,
  isAssetBasket,
  isAssetBonds,
  isAssetCommercialProduct,
  isAssetInventory,
  isAssetStartupEquity,
  isSDISecondary,
} from '../../utils/financeProductTypes';
import {
  committedInvestment,
  getMaturityDate,
  getMaturityMonths,
} from '../../utils/asset';
import { roundOff, toCurrecyStringWithDecimals } from '../../utils/number';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { colors } from '../utils/designSystem';

export const pastOfferHeader = {
  realEstate: [
    {
      name: 'Assets Leased of',
      isSortable: false,
      id: 'partner',
    },
    {
      name: 'Raised (₹)',
      isSortable: true,
      id: 'raisedAmount',
    },
    {
      name: 'Target Pre- Tax IRR',
      isSortable: true,
      id: 'tax',
    },
    {
      name: 'Subscription',
      isSortable: true,
      id: 'subscription',
    },
  ],

  startupEquity: [
    {
      name: 'Partner',
      isSortable: false,
      id: 'partner',
    },
    {
      name: 'Raised (₹)',
      isSortable: true,
      id: 'raisedAmount',
    },
    {
      name: 'Subscription',
      isSortable: true,
      id: 'subscription',
    },
    {
      name: 'Lead Investor',
      isSortable: false,
      id: 'leadInvestor',
    },
  ],

  inventory: [
    {
      name: 'Assets Leased of',
      isSortable: false,
      id: 'partner',
    },
    {
      name: 'Raised (₹)',
      isSortable: true,
      id: 'raisedAmount',
    },
    {
      name: 'Subscription',
      isSortable: true,
      id: 'subscription',
    },
    {
      name: 'Yield',
      isSortable: true,
      id: 'yield',
    },
  ],

  bonds: [
    {
      name: 'Bonds Of',
      isSortable: false,
      id: 'partner',
    },
    {
      name: 'Raised (₹)',
      isSortable: true,
      id: 'raisedAmount',
    },
    {
      name: 'YTM',
      isSortable: true,
      id: 'ytm',
    },
    {
      name: 'Rating',
      isSortable: false,
      id: 'rating',
    },
  ],

  leasing: [
    {
      name: 'Assets Leased of',
      isSortable: false,
      id: 'partner',
    },
    {
      name: 'Raised (₹)',
      isSortable: true,
      id: 'raisedAmount',
    },
    {
      name: 'Subscription',
      isSortable: true,
      id: 'subscription',
    },
    {
      name: 'Projected IRR',
      isSortable: true,
      id: 'irr',
    },
    {
      name: 'Returns Completed till date',
      isSortable: true,
      id: 'returns',
      info: true,
      infoDetail: {
        text: 'It shows the no. of returns completed out of total returns decided.',
      },
    },
  ],
  sdi: [
    {
      name: 'SDI Of',
      isSortable: false,
      id: 'partner',
    },
    {
      name: 'Raised (₹)',
      isSortable: true,
      id: 'raisedAmount',
    },
    {
      name: 'YTM',
      isSortable: true,
      id: 'irr',
    },
    {
      name: 'Rating',
      isSortable: false,
      id: 'rating',
    },
  ],
};

export const fundingRoundTooltips: Record<string, string> = {
  'Pre-seed':
    'This stage typically refers to the period in which a company\'s founders are first getting their operations off the ground. The founders, as well as close friends and family, are the most common "pre-seed" funders, often known as the FFF.',
  'Seed Round':
    ' Seed funding is the first official equity funding stage that a business venture raises. This early financial support is ideally the "seed" that will help to grow the business.',
  'Pre-Series A':
    ' Sometimes startups have progressed beyond the seed funding stage but are yet to receive Series A funding. Pre-Series A is a type of mid-round funding that is used to raise the additional funds needed to boost revenue.',
  'Series A':
    ' Series A funding is the first venture capital funding for a startup. The Series A round is a significant milestone for startups because they must demonstrate that they have a minimum viable product (MVP) - not just a great idea or team - to acquire an A round funding.',
  'Extended Series A':
    ' Extended Series A funding refers to the case when Series A funding has already been raised but the startup might require additional money before moving on to raising funds for the next series funding and expansion into new markets.',
  'Series B':
    ' Series B is the second stage of venture capital investment, and it aims to assist the startup in expanding its market base and moving businesses beyond the development stage.',
  'Series C':
    ' Series C refers to the third round of venture capital financing, in which investors put money into the meat of successful businesses. Series C funding is aimed at scaling the business and ensuring that it grows as quickly and successfully as possible.',
  'Series D':
    ' Series D refers to the fourth round of financing in the early stage financing cycle of new business growth, and is typically used to fund a unique situation, such as a new vertical expansion, a merger or acquisition.',
  'Pre-IPO':
    ' A pre-IPO, or pre-initial public offering, is a late-stage fundraising effort by a private company before it lists on a public exchange',
  'Bridge Rounds':
    'Bridge round is an interim financing round intended to keep the company afloat until the next, larger financing round.',
};

export const getSlideIcon = (productType: string) => {
  if (productType == financeProductTypeMapping['Bonds']) {
    return `${GRIP_INVEST_BUCKET_URL}asset-details/CorporateBondMobile.svg`;
  } else if (productType == 'realEstate') {
    return `${GRIP_INVEST_BUCKET_URL}asset-details/commercialProperty.svg`;
  } else if (productType == 'startupEquity') {
    return `${GRIP_INVEST_BUCKET_URL}asset-details/startupEquity.svg`;
  } else if (productType == 'sdi') {
    return `${GRIP_INVEST_BUCKET_URL}new-website/assets/swiperDetail.svg`;
  }
  return `${GRIP_INVEST_BUCKET_URL}new-website/assets/swiperDetail.svg`;
};

export const getMenuDrawerBackground = (productType: string) => {
  if (productType == financeProductTypeMapping['Bonds']) {
    return colors.GripLighter;
  } else if (productType == 'sdi') {
    return colors.LighterSeven;
  } else if (productType == 'realEstate') {
    return colors.Honeydew;
  } else if (productType == 'startupEquity') {
    return colors.Water;
  }
  return colors.Water;
};

export const getSubscriptionPercentage = (data: any) => {
  return Math.min(
    parseInt(
      roundOff(
        ((data?.collectedAmount || 0) * 100) /
          (Number(data?.totalAmount || 0) +
            Number(data?.preTaxTotalAmount || 0))
      )
    ),
    100
  );
};

export const getLeasingTableData = (data, activeSection) => {
  let subscription = getSubscriptionPercentage(data);
  if (isNaN(subscription)) {
    subscription = 0;
  }
  let collectedAmount = toCurrecyStringWithDecimals(
    data?.collectedAmount || 0,
    1,
    true
  );
  switch (activeSection) {
    case 'bonds': {
      return {
        raisedAmount: collectedAmount,
        raisedAmountInValue: data?.collectedAmount,
        ytm: data?.irr || data?.preTaxYtm,
        rating: data?.rating,
      };
    }
    case 'sdi': {
      return {
        raisedAmount: collectedAmount,
        raisedAmountInValue: data?.collectedAmount,
        irr: data?.irr,
        rating: data?.rating,
      };
    }
    case 'leasing': {
      let totalReturnsAmount = toCurrecyStringWithDecimals(
        data.totalReturnsAmount || 0,
        1,
        true
      );
      return {
        raisedAmount: collectedAmount,
        raisedAmountInValue: data?.collectedAmount,
        subscription: subscription,
        irr: data?.irr,
        returns: totalReturnsAmount,
        returnInValue: data?.totalReturnsAmount,
        returnPercentage: committedInvestment(data, true),
      };
    }
    case 'inventory': {
      return {
        raisedAmount: collectedAmount,
        raisedAmountInValue: data?.collectedAmount,
        subscription: subscription,
        yield: data?.postTaxYield,
      };
    }
    case 'startupEquity': {
      return {
        raisedAmount: collectedAmount,
        raisedAmountInValue: data?.collectedAmount,
        subscription: subscription,
        leadInvestor: data?.fundingDetails?.leadInvestorName,
      };
    }
    case 'realEstate': {
      let totalReturnsAmount = toCurrecyStringWithDecimals(
        data.totalReturnsAmount || 0,
        1,
        true
      );
      return {
        raisedAmount: collectedAmount,
        raisedAmountInValue: data.collectedAmount,
        irr: data?.irr,
        subscription: subscription,
        returns: totalReturnsAmount,
        returnInValue: data?.totalReturnsAmount,
        returnPercentage: committedInvestment(data, true),
      };
    }
    default:
      return {};
  }
};

export const percentageBasedOnSchedule = (scheduleList: any[]) => {
  if (scheduleList.length > 0) {
    const completedSchedule = scheduleList.filter(
      (ele: any) => ele?.status === 'completed'
    );
    return ((completedSchedule.length * 100) / scheduleList.length).toFixed(0);
  }
  return 0;
};

export const irrDescription = () => {
  return `
    <div>
      <p>
        <strong>Yield to maturity (YTM)</strong> is the total return anticipated on a bond if the bond is held until it matures. Yield to maturity is considered a long-term bond yield but is expressed as an annual rate. It takes into account all the interest payments and repayment of the original principal.
      </p>
      <p>
        <strong>For SEBI Regulated SDIs:</strong> IRR shown is for T+1 day, where 'T' would be the day on which the user is placing the order (in case of normal orders) and in case of AMO orders, 'T' would be the next working day.
      </p>
      <p>
        <strong>For RBI Regulated SDIs:</strong> IRR shown is for T+2 day, where 'T' would be the day on which the user is placing the order (in case of normal orders) and in case of AMO orders, 'T' would be the next working day.
      </p>
    </div>
  `;
};
export const yieldToMaturityDescription = () => {
  return `<div>
  Yield represents the annualised gain on an investment. For
  example, if an investment of 100 returns 120 over 2 years, the
  yield is 10%
  <br />
  i.e. [(120-100)/2]/100 or
  [(Return-Investment)/Tenure]/Investment.
  <br />
  <br />
  This metric is commonly used to analyze the profitability of
  investments that generate returns at the end of a period. These
  are often called bullet repayment instruments as the entire
  return is received in one-go at the end of the investment
  tenure.
  <br />
  <br />
  Generally speaking, when comparing investment options with
  similar risk characteristics, the financial instruments with the
  highest yield would be considered the best.
  <br />
  <br />
  To learn more about Yield
  <a
    style="text-decoration:underline;color:#00357c;"
    href="https://www.investopedia.com/terms/y/yield.asp"
    target="_blank"
    rel="noopener noreferrer"
  >
    click here
  </a>
  .
</div>`;
};

/**
 * Function to genrate assetDetailInfo depending upon finance product type for asset detail page
 * @param asset
 * @returns {any} assetInfo
 */
export const getAssetDetailInfo = (
  asset: any,
  isnvestmentOverview: boolean = false
): any => {
  if (!asset) {
    return [];
  }
  let assetInfo: any = [
    {
      label: 'Yield to Maturity',
      suffix: '%',
      value: asset.irr,
      id: 'returns',
      heading: 'What is it?',
      data: isAssetInventory(asset)
        ? yieldToMaturityDescription()
        : irrDescription(),
      isHtml: true,
    },
    {
      label: 'Tenure',
      suffix: 'months',
      value: asset.tenure,
      id: 'asset-tenure',
    },
  ];
  if (isAssetCommercialProduct(asset)) {
    assetInfo = [
      {
        label: 'Avg. Pre-Tax Yield',
        suffix: '%',
        value: asset.irr,
        id: 'returns',
        heading: 'What is it?',
        data: `Average annual net rental income (before fees and taxes) over the hold period divided by the all-in investment amount.`,
      },
      {
        label: 'Target Pre-Tax IRR',
        suffix: '%',
        value: Number(asset.postTaxYield).toFixed(2),
        id: 'irr',
        heading: 'What is it?',
        data: `Calculated on average asset value appreciation of underwritten CAGR over the hold period. The calculation excludes the impact of capital gains tax and originator's performance fee.`,
      },
    ];
  } else if (isAssetBonds(asset) && isnvestmentOverview) {
    assetInfo = [
      {
        label: 'Yield to Maturity',
        suffix: '%',
        value:
          asset?.assetMappingData?.calculationInputFields?.preTaxYtm ||
          asset?.assetMappingData?.calculationInputFields?.irr,
        id: 'returns',
        heading: '',
      },
      {
        label: 'Time to Maturity',
        suffix: 'months',
        value: getMaturityMonths(getMaturityDate(asset)),
        id: 'asset-tenure',
      },
    ];
  } else if (isAssetBonds(asset)) {
    assetInfo = [
      {
        label: 'Yield to Maturity',
        suffix: '%',
        value:
          asset?.assetMappingData?.calculationInputFields?.preTaxYtm ||
          asset?.assetMappingData?.calculationInputFields?.irr,
        heading: 'What is it?',
        data: `Yield to Maturity (YTM) is the total annualized return expected on a Bond/ SDI if held until maturity. YTM accounts for the investment amount, interest payments, and principal repayment. YTM is calculated after deducting brokerage fees and calculated for T+1 day, where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).`,
        modalHeading: 'What’s Yield to Maturity?',
        id: 'returns',
        isCampaignEnabled: asset?.assetMappingData?.calculationInputFields
          ?.irrCutout
          ? true
          : false,
        cutoutValue: asset?.assetMappingData?.calculationInputFields?.irrCutout,
        isNegative:
          Number(asset?.assetMappingData?.calculationInputFields?.irrCutout) >
          Number(asset?.bonds?.preTaxYtm),
      },
      {
        label: 'Time to Maturity',
        suffix: '',
        value: `${getMaturityMonths(getMaturityDate(asset))} months`,
        id: 'asset-tenure',
      },
    ];
  } else if (isAssetStartupEquity(asset)) {
    const { assetMappingData } = asset;
    const fundingRound =
      assetMappingData?.calculationInputFields?.fundingRound?.[0] ?? 'Pre-seed';
    const { leadInvestorName = '' } =
      assetMappingData?.calculationInputFields || {};
    assetInfo = [
      {
        label: 'Funding Round',
        value: fundingRound,
        id: fundingRound,
        hideInOverview: false,
        data: null,
      },
      {
        label: 'Lead Investor',
        value: leadInvestorName || 'Grip',
        id: 'leadInvestor',
        style: {
          flex: {
            alignItems: 'center',
          },
        },
        hideInOverview: false,
      },
    ];
  } else if (isSDISecondary(asset) && isnvestmentOverview) {
    assetInfo = [
      {
        label: 'Yield to Maturity',
        suffix: '%',
        value: asset?.irr,
        id: 'returns',
        heading: '',
      },
      {
        label: 'Time to Maturity',
        suffix: 'months',
        value: getMaturityMonths(getMaturityDate(asset)),
        id: 'asset-tenure',
      },
    ];
  } else if (isSDISecondary(asset)) {
    assetInfo = [
      {
        label: 'Yield to Maturity',
        suffix: '%',
        value: roundOff(asset?.irr ?? 0, 2),
        heading: "What's it?",
        data: irrDescription(),
        modalHeading: 'What’s Yield to Maturity?',
        id: 'returns',
        isHtml: false,
        isCampaignEnabled: asset?.assetMappingData?.calculationInputFields
          ?.irrCutout
          ? true
          : false,
        cutoutValue: asset?.assetMappingData?.calculationInputFields?.irrCutout,
        isNegative:
          Number(asset?.assetMappingData?.calculationInputFields?.irrCutout) >
          Number(asset?.irr),
      },
      {
        label: 'Time to Maturity',
        suffix: `${
          getMaturityMonths(getMaturityDate(asset)) > 1 ? 'Months' : 'Month'
        }`,
        value: `${getMaturityMonths(getMaturityDate(asset))}`,
        id: 'asset-tenure',
      },
    ];
  }

  // Add additional data if the asset is a Basket
  if (isAssetBasket(asset)) {
    assetInfo = [
      {
        label: 'Yield to Maturity',
        suffix: '%',
        value: roundOff(
          (asset?.assetMappingData?.calculationInputFields?.irr ||
            asset?.irr) ??
            0,
          2
        ),
        id: 'returns',
        heading: isnvestmentOverview ? '' : "What's it?",
        ...(isnvestmentOverview
          ? {}
          : {
              data: `Yield to Maturity (YTM) is the total annualized return expected on a Bond/ SDI if held until maturity. YTM accounts for the investment amount, interest payments, and principal repayment. YTM is calculated after deducting brokerage fees and calculated for T+1 day, where 'T' is the date on which the order is placed (for normal orders) or the next working day (for AMO orders).`,
              modalHeading: `What's Yield to Maturity?`,
              isHtml: false,
              isCampaignEnabled:
                !!asset?.assetMappingData?.calculationInputFields
                  ?.preTaxIrrCutout,
              cutoutValue:
                asset?.assetMappingData?.calculationInputFields
                  ?.preTaxIrrCutout,
              isNegative:
                Number(
                  asset?.assetMappingData?.calculationInputFields
                    ?.preTaxIrrCutout
                ) >
                Number(
                  asset?.assetMappingData?.calculationInputFields?.irr ||
                    asset?.irr
                ),
            }),
      },
      {
        label: 'Time to Maturity',
        suffix: `${
          getMaturityMonths(getMaturityDate(asset)) > 1 ? 'Months' : 'Month'
        }`,
        value: `${getMaturityMonths(getMaturityDate(asset))}`,
        id: 'asset-tenure',
      },
    ];
  }
  return assetInfo;
};
