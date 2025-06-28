import dayjs from 'dayjs';
import { getMaturityDate, getMaturityMonths, isMldProduct } from './asset';
import {
  isAssetBasket,
  isAssetBonds,
  isAssetCommercialProduct,
  isAssetStartupEquity,
  isSDISecondary,
} from './financeProductTypes';
import { getBankStatus, getAadhaarStatus, getPanStatus } from './kyc';

import {
  numberToCurrency,
  roundOff,
  toCurrecyStringWithDecimals,
} from './number';

import { GRIP_INVEST_BUCKET_URL } from './string';
import { assetListIdMapping } from './assetList';
import { userData } from '../redux/slices/user';
import { badgePriority } from '../components/BadgeComponent/utils';

export type StatusValues =
  | 'pending'
  | 'pending verification'
  | 'verified'
  | 'continue';

export const ProductSectionArr = [
  'popularWithNewInvestors',
  'shortTermOfferings',
  'fixedReturns',
  'missedTopDeals',
  'diversify',
  'fastFilling',
  'repeatDealsFromPartners',
  'whatsNew',
];

export const InvestedProductSectionArr = [
  'whatsNew',
  'diversify',
  'fastFilling',
];

export const NonInvestedProductSectionArr = ['popularWithNewInvestors'];

/**
 * Function to genrate assetInfo depending upon finance product type
 * @param asset
 * @returns {any} assetInfo
 */

const assetInfoIcons = {
  minInvestment: `${GRIP_INVEST_BUCKET_URL}discovery/min-investment.svg`,
  tenure: `${GRIP_INVEST_BUCKET_URL}discovery/tenure.svg`,
  irr: `${GRIP_INVEST_BUCKET_URL}discovery/irr.svg`,
};

export const getPreTaxYield = (asset: any) => {
  return (
    asset?.assetMappingData?.calculationInputFields?.preTaxYtm ||
    asset?.assetMappingData?.preTaxYtm ||
    asset?.bonds?.preTaxYtm ||
    asset?.preTaxYtm
  );
};

export const getDiscoveryAssetInfo = (asset: any) => {
  let assetDetails: any = [
    {
      label: `Yield to Maturity`,
      suffix: '%',
      value: asset.irr,
      icon: assetInfoIcons.irr,
    },
    {
      label: 'Tenure',
      suffix: `${
        (asset.tenure ?? getMaturityMonths(asset?.maturityDate)) > 1
          ? ' Months'
          : ' Month'
      }`,
      value: asset.tenure
        ? asset.tenure
        : getMaturityMonths(asset?.maturityDate) > 0
        ? getMaturityMonths(asset?.maturityDate)
        : '<1',
      icon: assetInfoIcons.tenure,
    },
    {
      label: ' Min Investment',
      suffix: null,
      value: `₹${numberToCurrency(asset?.minInvestmentAmount || 0)}`,
      id: 'minInvestment',
      icon: assetInfoIcons.minInvestment,
    },
  ];
  if (isAssetCommercialProduct(asset)) {
    assetDetails = [
      {
        label: 'Pre-Tax Yield',
        suffix: '%',
        value: asset.irr,
        icon: assetInfoIcons.irr,
      },
      {
        label: 'Target Pre-Tax IRR',
        suffix: '%',
        value: Number(asset.postTaxYield).toFixed(2),
        icon: assetInfoIcons.tenure,
      },
      {
        label: ' Min Investment',
        suffix: null,
        value: `₹ ${toCurrecyStringWithDecimals(
          asset?.minInvestmentAmount || 0
        )}`,
        icon: assetInfoIcons.minInvestment,
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
        icon: assetInfoIcons.irr,
      },
      {
        label: 'Lead Investor',
        value: leadInvestorName,
        icon: assetInfoIcons.tenure,
      },
      {
        label: ' Min Investment',
        suffix: null,
        value: `₹ ${toCurrecyStringWithDecimals(
          asset?.minInvestmentAmount || 0
        )}`,
        icon: assetInfoIcons.minInvestment,
      },
    ];
  } else if (isAssetBonds(asset)) {
    const isMld = isMldProduct(asset);
    const maturityDate = getMaturityDate(asset);
    const getMaturityMonth = maturityDate
      ? getMaturityMonths(maturityDate)
      : asset?.tenure;
    assetDetails = [
      {
        label: `Yield to Maturity`,
        suffix: '%',
        value: getPreTaxYield(asset),
        icon: assetInfoIcons.irr,
        isCampaignEnabled: asset?.assetMappingData?.calculationInputFields
          ?.irrCutout
          ? true
          : false,
        cutoutValue:
          asset?.assetMappingData?.calculationInputFields?.irrCutout || 0,
        isNegative:
          Number(asset?.assetMappingData?.calculationInputFields?.irrCutout) >
          Number(asset?.bonds?.preTaxYtm),
      },
      {
        label: 'Time to Maturity',
        suffix: `${getMaturityMonth > 1 ? ' Months' : ' Month'}`,
        value: getMaturityMonth,
        icon: assetInfoIcons.tenure,
      },
      {
        label: ' Min Investment',
        suffix: null,
        value: `₹${numberToCurrency(
          (asset?.minInvestmentAmount || 0).toFixed(2),
          true
        )}`,
        icon: assetInfoIcons.minInvestment,
        isCampaignEnabled: asset?.assetMappingData?.calculationInputFields
          ?.minAmountCutout
          ? true
          : false,
        cutoutValue: `₹${numberToCurrency(
          (
            asset?.assetMappingData?.calculationInputFields?.minAmountCutout ||
            0
          ).toFixed(2),
          true
        )}`,
        isNegative:
          Number(
            asset?.assetMappingData?.calculationInputFields?.minAmountCutout
          ) > Number(asset?.minInvestmentAmount),
      },
    ];
    if (isMld) {
      assetDetails = assetDetails.filter(
        (detail: any) => detail.label !== 'Coupon Rate'
      );
    }
  } else if (isSDISecondary(asset)) {
    const minInvestment =
      asset?.minInvestmentAmount ||
      Number(asset?.sdiSecondary?.calculatedFaceValue) *
        Number(asset?.sdiSecondary?.minNoOfLots) +
        Number(asset?.sdiSecondary?.additionalCharges) ||
      0;
    const maturityDate = getMaturityDate(asset);
    const getMaturityMonth = maturityDate
      ? getMaturityMonths(maturityDate)
      : asset?.tenure;
    assetDetails = [
      {
        label: `Yield to Maturity`,
        suffix: '%',
        value: roundOff(asset?.irr ?? 0, 2),
        icon: assetInfoIcons.irr,
        isCampaignEnabled: asset?.assetMappingData?.calculationInputFields
          ?.irrCutout
          ? true
          : false,
        cutoutValue:
          asset?.assetMappingData?.calculationInputFields?.irrCutout || 0,
        isNegative:
          Number(asset?.assetMappingData?.calculationInputFields?.irrCutout) >
          Number(asset?.irr),
      },
      {
        label: 'Time to Maturity',
        suffix: `${getMaturityMonth > 1 ? ' Months' : ' Month'}`,
        value: getMaturityMonth,
        icon: assetInfoIcons.tenure,
      },
      {
        label: ' Min Investment',
        suffix: null,
        value: `₹${numberToCurrency(minInvestment.toFixed(2), true)}`,
        icon: assetInfoIcons.minInvestment,
        isCampaignEnabled: asset?.assetMappingData?.calculationInputFields
          ?.minAmountCutout
          ? true
          : false,
        cutoutValue: `₹ ${numberToCurrency(
          asset?.assetMappingData?.calculationInputFields?.minAmountCutout?.toFixed(
            2
          ) || 0,
          true
        )}`,
        isNegative:
          Number(
            asset?.assetMappingData?.calculationInputFields?.minAmountCutout
          ) > Number(minInvestment),
      },
    ];
  } else if (isAssetBasket(asset)) {
    const maturityDate = getMaturityDate(asset);
    const getMaturityMonth = maturityDate
      ? getMaturityMonths(maturityDate)
      : asset?.tenure;
    assetDetails = [
      {
        label: `IRR`,
        suffix: '%',
        value: roundOff(asset?.assetMappingData?.irr || 0, 2),
        icon: assetInfoIcons.irr,
        isCampaignEnabled: asset?.assetMappingData?.calculationInputFields
          ?.irrCutout
          ? true
          : false,
        cutoutValue:
          asset?.assetMappingData?.calculationInputFields?.irrCutout || 0,
        isNegative:
          Number(asset?.assetMappingData?.calculationInputFields?.irrCutout) >
          Number(asset?.assetMappingData?.irr),
      },
      {
        label: 'Time to Maturity',
        suffix: `${getMaturityMonth > 1 ? ' Months' : ' Month'}`,
        value: getMaturityMonth,
        icon: assetInfoIcons.tenure,
      },
      {
        label: ' Min Investment',
        suffix: null,
        value: `₹${numberToCurrency(
          (
            asset?.minInvestmentAmount ||
            Number(asset?.assetMappingData?.calculationInputFields?.faceValue) *
              Number(
                asset?.assetMappingData?.calculationInputFields?.minNoOfLots
              ) ||
            0
          ).toFixed(2),
          true
        )}`,
        icon: assetInfoIcons.minInvestment,
        isCampaignEnabled: asset?.assetMappingData?.calculationInputFields
          ?.minAmountCutout
          ? true
          : false,
        cutoutValue: `₹${numberToCurrency(
          (
            asset?.assetMappingData?.calculationInputFields?.minAmountCutout ||
            0
          ).toFixed(2),
          true
        )}`,
        isNegative:
          Number(
            asset?.assetMappingData?.calculationInputFields?.minAmountCutout
          ) > Number(asset?.minInvestmentAmount),
      },
    ];
  }

  return assetDetails;
};

type InvestmentCardData = {
  icon: string;
  assetName: string;
  visibility: boolean;
  order: number;
  id: assetListIdMapping;
  dataPoints: string[];
  tagText?: string;
  tagIcon?: string;
  className?: string;
};

export const InvestmentCardData: InvestmentCardData[] = [
  {
    icon: `${GRIP_INVEST_BUCKET_URL}commons/sdi.svg`,
    assetName: 'SDIs',
    visibility: true,
    order: 2,
    id: 'sdi',
    dataPoints: [
      '8 to 48 months tenure',
      'Monthly/Quarterly payout',
      '120%+ asset cover',
    ],
  },
  {
    icon: `${GRIP_INVEST_BUCKET_URL}commons/bondx.svg`,
    assetName: 'Corporate Bonds',
    tagText: 'Sell Anytime',
    className: 'icon-sell-anytime',
    visibility: true,
    order: 1,
    id: 'bonds',
    dataPoints: [
      '6 to 36 months tenure',
      'Monthly interest',
      '110%+ asset cover',
    ],
  },
  {
    icon: `${GRIP_INVEST_BUCKET_URL}commons/fd.svg`,
    assetName: 'High Yield FDs',
    visibility: true,
    order: 4,
    id: 'highyieldfd',
    dataPoints: [
      '12 to 48 months tenure',
      'Principal Payout at Maturity',
      'DICGC Insured (Bank FDs)',
    ],
  },
  {
    icon: `${GRIP_INVEST_BUCKET_URL}discovery/EquityIcon.svg`,
    assetName: 'Start-up Equity',
    visibility: false,
    order: 4,
    id: 'startupEquity',
    dataPoints: [
      '12-48 Months Tenure',
      'Principal Payout at Maturity',
      'DICGC Insured (Bank FDs)',
    ],
  },
  {
    icon: `${GRIP_INVEST_BUCKET_URL}discovery/CommercialPropertyIcon.svg`,
    assetName: 'Commercial Property',
    visibility: false,
    order: 5,
    id: 'commercialProperty',
    dataPoints: [
      '12-48 Months Tenure',
      'Principal Payout at Maturity',
      'DICGC Insured (Bank FDs)',
    ],
  },
  {
    icon: `${GRIP_INVEST_BUCKET_URL}commons/basketicon.svg`,
    assetName: 'Baskets',
    visibility: true,
    order: 3,
    id: 'Baskets',
    dataPoints: [
      '6 to 36 months tenure',
      'Monthly/Quarterly payout',
      'Theme based pool of Bonds and SDIs',
    ],
  },
];

export const getProductTypeLabel = {
  'Inventory Financing': 'Inventory Financing',
  'Lease Financing': 'Lease Finance',
  'Commercial Property': 'Commercial Property',
  'Startup Equity': 'Startup Equity',
  Bonds: 'Corporate Bond',
  'SDI Secondary': 'SDI',
  Basket: 'Basket',
};

export const preferences = [
  {
    id: 'whatsapp',
    title: 'Whatsapp Notifications',
    icon: `${GRIP_INVEST_BUCKET_URL}discovery/WhatsAppIcon.svg`,
    iconCode: 'icon-whatsapp',
    iconColor: '#3FC250',
  },
  {
    id: 'email',
    title: 'Email Notifications',
    icon: `${GRIP_INVEST_BUCKET_URL}discovery/EmailIcon.svg`,
  },
  {
    id: 'sms',
    title: 'Text Notifications',
    icon: `${GRIP_INVEST_BUCKET_URL}discovery/SMSIcon.svg`,
  },
];

const createBadge = (badge: string, value = 0) => {
  const badgesIcon = {
    Oversubscribing: 'commons/UpArrow.svg',
    '% Repeat Investors': 'commons/Refresh.svg',
    '% First Time Investors': 'commons/TwoStars.svg',
    New: 'commons/Star.svg',
    'Filling Fast': 'commons/Thunder.svg',
  };

  const imageForBadge = Object.keys(badgesIcon).includes(badge)
    ? `${GRIP_INVEST_BUCKET_URL}${badgesIcon[badge]}`
    : '';
  return {
    label: `${value > 0 ? value.toFixed(0) : ''}${badge}`,
    image: imageForBadge,
  };
};

export const getDiscoveryAssetBadges = (asset: any) => {
  const { badges = '' } = asset || {};
  let assetBadges: string[] = badges?.split(',') || [];
  const badgeArr: any[] = [];

  const postTaxCollectedAmount =
    (Number(asset.collectedAmount) || 0) -
    (Number(asset.postTaxAmount?.collectedAmount) || 0);
  const withinMaxPostTaxRaise =
    postTaxCollectedAmount < (Number(asset.postTaxAmount?.totalMaxAmount) || 0);
  const overallMinRaiseReached =
    (Number(asset.collectedAmount) || 0) >=
    (Number(asset.postTaxAmount?.totalAmount) || 0) +
      (Number(asset.preTaxAmount?.totalAmount) || 0);
  const withinPreTaxMaxRaise =
    (Number(asset.preTaxAmount?.collectedAmount) || 0) <
    (Number(asset.preTaxAmount?.totalAmount) || 0);

  if (
    overallMinRaiseReached &&
    ((withinMaxPostTaxRaise && withinPreTaxMaxRaise) ||
      (withinMaxPostTaxRaise && !withinPreTaxMaxRaise))
  ) {
    badgeArr.push(createBadge('Oversubscribing'));
  }

  if (Number(asset?.repeatInvestorPercentage) >= 75) {
    badgeArr.push(
      createBadge(
        '% Repeat Investors',
        Number(asset?.repeatInvestorPercentage || 0)
      )
    );
  } else if (
    asset?.repeatInvestorPercentage &&
    100 - Number(asset?.repeatInvestorPercentage || 0) > 25
  ) {
    badgeArr.push(
      createBadge(
        '% First Time Investors',
        100 - Number(asset?.repeatInvestorPercentage || 0)
      )
    );
  }
  if (assetBadges.includes('new')) {
    badgeArr.push(createBadge('New'));
  }
  if (assetBadges.includes('filling fast')) {
    badgeArr.push(createBadge('Filling Fast'));
  }
  if (assetBadges.includes('sell anytime')) {
    badgeArr.push({
      label: 'Sell Anytime',
      imageIcon: 'icon-sell-anytime-outline',
    });
  }

  const priorityMap = Object.fromEntries(
    badgePriority.map(({ label, priority }) => [label.toLowerCase(), priority])
  );

  // Sort badges based priority
  const sortedBadges = [...badgeArr].sort((a, b) => {
    const priorityA = priorityMap[a?.label?.toLowerCase()] || Infinity;
    const priorityB = priorityMap[b?.label?.toLowerCase()] || Infinity;
    return priorityA - priorityB;
  });

  const badgesArr = sortedBadges?.slice(0, 2);
  return badgesArr;
};

export const getSectionFromHomePage = (homepage: any) => {
  const sections = homepage?.attributes?.sections;
  let primarySection = {},
    whatGrip = {},
    whyInvestWithGrip = {},
    ourProducts = {},
    ourPartners = {},
    howToInvest = {},
    keyFigures = {},
    getStarted = {},
    brandStrip = {},
    sectionInfoCards = {},
    testimonials = {},
    portfolioSection = {};
  if (homepage?.attributes?.keyFigures) {
    keyFigures = homepage?.attributes?.keyFigures;
  }
  if (homepage?.attributes?.brandStrip) {
    brandStrip = homepage?.attributes?.brandStrip;
  }
  if (homepage?.attributes?.sectionInfoCards) {
    sectionInfoCards = homepage?.attributes?.sectionInfoCards;
  }
  if (homepage?.attributes?.testimonials) {
    testimonials = homepage?.attributes?.testimonials;
  }
  if (homepage?.attributes?.portfolioSection) {
    portfolioSection = homepage?.attributes?.portfolioSection;
  }
  if (Array.isArray(sections)) {
    sections.forEach((s) => {
      switch (s?.identifier) {
        case 1:
          primarySection = s;
          break;
        case 2:
          whatGrip = s;
          break;
        case 3:
          ourProducts = s;
          break;
        case 4:
          whyInvestWithGrip = s;
          break;
        case 5:
          howToInvest = s;
          break;
        case 6:
          ourPartners = s;
          break;
        case 7:
          getStarted = s;
          break;
        default:
          break;
      }
    });
  }

  return {
    brandStrip,
    primarySection,
    whatGrip,
    whyInvestWithGrip,
    keyFigures,
    ourProducts,
    ourPartners,
    howToInvest,
    getStarted,
    sectionInfoCards,
    testimonials,
    portfolioSection,
  };
};

export const getMetrics = (figures: any, keyMetrics: any) => {
  const investorValue =
    figures?.find((value) =>
      value?.footerText?.toLowerCase()?.includes('investor')
    )?.label || '';

  const defaultValue =
    figures?.find((value) =>
      value?.footerText?.toLowerCase()?.includes('default')
    )?.label || '';

  return [
    {
      icon: `${GRIP_INVEST_BUCKET_URL}discovery/metric-investment.svg`,
      value: `${toCurrecyStringWithDecimals(
        keyMetrics?.totalInvestmentAmount,
        1,
        true
      )}+`,
      label: 'Investments enabled',
      id: 'investment',
      prefix: '₹',
      background: 'radialGradientYellow',
    },
    {
      icon: `${GRIP_INVEST_BUCKET_URL}discovery/metric-investor.svg`,
      value: investorValue,
      label: 'Investor community',
      id: 'investor',
      background: 'radialGradientTeal',
    },
    {
      icon: `${GRIP_INVEST_BUCKET_URL}discovery/metric-default.svg`,
      value: defaultValue,
      label: 'Default till date',
      id: 'default',
      background: 'radialGradientBlue',
    },
  ];
};

export const faqStrapiQuery = {
  populate: {
    faqSections: {
      populate: {
        data: {
          populate: {
            faqCategories: {
              populate: '*',
            },
            articles: {
              populate: {
                Article: {
                  populate: {
                    authorImage: {
                      populate: '*',
                    },
                    coverImage: {
                      populate: '*',
                    },
                  },
                },
                blog_categories: {
                  populate: '*',
                },
              },
            },
          },
        },
      },
    },
    chatWithUs: {
      populate: '*',
    },
    seo: {
      populate: '*',
    },
  },
};

export const getDiscoveryKycStatus = (userData: userData, userKycDetails) => {
  let bankStatus = getBankStatus(userData);
  let aadhaarStatus = getAadhaarStatus(userData);
  let panStatus = getPanStatus(userData);

  const { nomineeName, residentialStatus } = userData;

  const { depository = {} } = userKycDetails || {};

  const isPendingDespository =
    !depository ||
    Object.keys(depository).length === 0 ||
    depository?.status === 0;

  if (
    bankStatus === 'pending' &&
    aadhaarStatus === 'pending' &&
    panStatus === 'pending' &&
    isPendingDespository &&
    !nomineeName &&
    !residentialStatus
  ) {
    return 'pending';
  }

  if (
    bankStatus === 'pending' ||
    aadhaarStatus === 'pending' ||
    panStatus === 'pending' ||
    isPendingDespository ||
    (depository?.status === 2 && depository?.subStatus === 0) ||
    !nomineeName ||
    !residentialStatus
  ) {
    return 'continue';
  }

  if (
    bankStatus === 'verified' &&
    aadhaarStatus === 'verified' &&
    panStatus === 'verified' &&
    (depository?.status === 'verified' || depository?.status === 1) &&
    nomineeName &&
    residentialStatus
  ) {
    return 'verified';
  }

  return 'pending verification';
};

export const getOverallDefaultKycStatus = (kycConfigStatus: any) => {
  if (kycConfigStatus?.default?.isFilteredKYCComplete) {
    return 'verified';
  } else {
    const kycTypes = kycConfigStatus?.default?.kycTypes;
    let isPendingVerification = false;
    for (let i = 0; i < kycTypes?.length; i++) {
      if (!kycTypes[i]?.isKYCComplete) {
        if (kycTypes[i]?.isKYCPendingVerification) {
          isPendingVerification = kycTypes[i]?.isKYCPendingVerification;
        }
      }
      if (isPendingVerification) {
        break;
      }
    }
    if (isPendingVerification) {
      return 'pending verification';
    }
    const kycCompletedSteps = getOverallDefaultKycSteps(kycConfigStatus);
    if (kycCompletedSteps.total !== kycCompletedSteps.completed) {
      return 'continue';
    }
    return 'pending';
  }
};

export const getOverallDefaultKycSteps = (kycConfigStatus: any) => {
  const kycTypes = kycConfigStatus?.default?.kycTypes;
  const total = kycTypes?.length;
  let completed = 0;
  kycTypes?.forEach((element) => {
    if (element.isKYCComplete && !element?.isKYCPendingVerification) {
      completed = completed + 1;
    } else if (element?.isKYCPendingVerification) {
      completed = completed + 1;
    }
  });

  return {
    completed,
    total,
  };
};

export const isVerifiedKYCStatus = (value: StatusValues) =>
  value === 'verified';

export const getDetailsForPendingOrderEvent = (pendingOrders: any[]) => {
  if (!Array.isArray(pendingOrders)) {
    return {};
  }
  const amoOrders = pendingOrders.filter((order) => Boolean(order?.isAmo || 0));
  const rfqGeneratedAMOOrders = amoOrders?.filter((order) =>
    Boolean(order?.rfqID || 0)
  );
  const inTimeRFQGeneratedOrders = pendingOrders?.filter(
    (order) => Boolean(order?.rfqID || 0) && !Boolean(order?.isAmo || 0)
  );

  return {
    amo_orders_pending_pay:
      Number(amoOrders.length) - Number(rfqGeneratedAMOOrders.length),
    amo_orders_pending_pay_rfq: rfqGeneratedAMOOrders.length,
    orders_pending_pay: inTimeRFQGeneratedOrders.length,
  };
};
