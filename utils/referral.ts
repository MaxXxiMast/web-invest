import { getDiffernceInTwoDates } from './date';
import { numberToCurrency } from './number';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from './string';

/**
 * Base amount for each referral Tier
 */
const BASE_REFERRAL = {
  tier1: 1000,
  tier2: 1500,
  tier3: 2000,
} as const;

// Default Multipliers for the referral and referee
export const DEFAULT_REFERRAL_MULTIPLIER = '1,1,1';
export const DEFAULT_REFEREE_MULTIPLIER = '1';

// Base Amount for referee
const BASE_REFREE_AMOUNT = 1000;

// BASE AMOUNT FOR influencer bonus
const BASE_INFLUENCER_BONUS = 500;

type BASE_AMOUNTS = 'tier1' | 'tier2' | 'tier3';

/**
 * @param referralMultiplier Referral Multiplier returned by the API
 * @returns {Array<string>} Multipliers in an array for each level
 */
const getMultipliers = (
  referralMultiplier: string = DEFAULT_REFERRAL_MULTIPLIER
) => referralMultiplier?.split(',');

/**
 * @param level Tier Level for referral
 * @returns {number} level of multiplier
 */
const getLevelNumber = (level: string) => Number(level.split('tier')[1]) - 1;

/**
 * @param base_referral Tier to use for the referral amount
 * @param referralMultiplier Multiplier of the referral
 * @param isAmountInNumber if `true` return the amount without ₹ sign
 * @returns Amount after the multiplier is applied
 */

export const getReferralAmount = (
  base_referral: BASE_AMOUNTS,
  referralMultiplier: string = DEFAULT_REFERRAL_MULTIPLIER,
  isAmountInNumber: boolean = false
) => {
  const multipliers = getMultipliers(referralMultiplier);
  const level = getLevelNumber(base_referral);
  const referralAmount = numberToCurrency(
    BASE_REFERRAL[base_referral] * Number(multipliers[level])
  );
  return isAmountInNumber ? referralAmount : `₹${referralAmount}`;
};

/**
 * @param refereeMultiplier Multiplier of the referee
 * @param isAmountInNumber if `true` return the amount without ₹ sign
 * @returns Amount after the multiplier is applied
 */
export const getRefereeAmount = (
  refereeMultiplier: string = DEFAULT_REFEREE_MULTIPLIER,
  isAmountInNumber: boolean = false
) => {
  const refereeAmount = numberToCurrency(
    BASE_REFREE_AMOUNT * Number(refereeMultiplier)
  );
  return isAmountInNumber ? refereeAmount : `₹${refereeAmount}`;
};

/**
 * @param base_referral Tier to use for the referral amount
 * @param referralMultiplier Multiplier of the referral
 * @returns {Boolean} if the multiplier is greater than 1
 */

export const isMultiplierGreaterThanOne = (
  base_referral: BASE_AMOUNTS,
  referralMultiplier: string = ''
) => {
  const multipliers = getMultipliers(referralMultiplier);
  const level = getLevelNumber(base_referral);
  return Number(multipliers[level]) > 1;
};

/**
 * @param referralMultiplier Multiplier of the referral
 * @param isAmountInNumber if `true` return the amount without ₹ sign
 * @returns {String} Amount for the tier 1
 */

export const uptoTwoReferralBonus = (
  referralMultiplier: string = DEFAULT_REFERRAL_MULTIPLIER,
  isAmountInNumber: boolean = false
) => {
  return getReferralAmount('tier1', referralMultiplier, isAmountInNumber);
};

/**
 * @param referralMultiplier Multiplier of the referral
 * @param isAmountInNumber if `true` return the amount without ₹ sign
 * @returns {String} Amount for the tier 2
 */

export const uptoFiveReferralBonus = (
  referralMultiplier: string = DEFAULT_REFERRAL_MULTIPLIER,
  isAmountInNumber: boolean = false
) => {
  return getReferralAmount('tier2', referralMultiplier, isAmountInNumber);
};

/**
 * @param referralMultiplier Multiplier of the referral
 * @param isAmountInNumber if `true` return the amount without ₹ sign
 * @returns {String} Amount for the tier 3
 */

export const moreThanFiveReferralBonus = (
  referralMultiplier: string = DEFAULT_REFERRAL_MULTIPLIER,
  isAmountInNumber: boolean = false
) => {
  return getReferralAmount('tier3', referralMultiplier, isAmountInNumber);
};

/**
 * @param referralDetails Details of the referral campaign
 * @returns influencer ( who refer more than 25 referrals ) bonus
 */
export const getInfluencerBonus = (referralDetails: any) => {
  return numberToCurrency(
    referralDetails?.influencerBonus ?? BASE_INFLUENCER_BONUS
  );
};
export const checkForRedeemButton = (
  userDetails,
  dashboardMetrics,
  isEsignPending: boolean
) => {
  let {
    lastRedeemedDate,
    totalOrders,
    unredeemedCreditBreakup,
    totalEarnings = 0,
    redeemedEarnings = 0,
  } = dashboardMetrics;
  const completedCredits =
    unredeemedCreditBreakup?.completedDealCreditAmount || 0;
  const stuckCredits = unredeemedCreditBreakup?.liveDealCreditAmount || 0;
  if (Number(totalOrders) < 1) {
    return {
      disable: true,
      msg: 'You need to make atleast one investment to use redeem button',
    };
  }
  const kycParams = [
    userDetails?.kycAadhaarStatus,
    userDetails?.kycBankStatus,
    userDetails?.kycPanStatus,
  ];
  const isKycPending = kycParams.includes('pending');
  const isKycUnderVerification = kycParams.includes('pending verification');
  if (isKycPending) {
    return {
      disable: true,
      msg: 'Complete the KYC to Redeem amount',
    };
  }
  if (isKycUnderVerification) {
    return {
      disable: true,
      msg: "Your KYC is under verification, wait till it's completed",
    };
  }

  // Complete ESign For redeeming referral rewards
  if (isEsignPending) {
    return {
      disable: true,
      msg: 'Complete your pending tasks from your notification center to redeem the amount',
    };
  }

  if (
    totalEarnings === redeemedEarnings ||
    (completedCredits <= 0 && stuckCredits <= 0)
  ) {
    return {
      disable: true,
      msg: 'No amount to redeem',
    };
  }
  if (completedCredits <= 0 && stuckCredits > 0) {
    return {
      disable: true,
      msg: 'Investment is still live',
    };
  }
  if (lastRedeemedDate && getDiffernceInTwoDates(lastRedeemedDate) <= 1) {
    return {
      disable: true,
      msg: 'You have already placed a request in the last 24 hours',
    };
  }
  return { disable: false, msg: '' };
};

export const statuses = [
  {
    id: 1,
    label: 'Credited',
    image: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/rewardHistory/UnblockIcon.svg`,
    status: 'unlocked',
    color: '#00B8B7',
  },
  {
    id: 2,
    label: 'Generated',
    image: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/rewardHistory/CreditedIcon.svg`,
    status: 'locked',
    color: '#00357C',
  },
  {
    id: 3,
    label: 'Added to Vault',
    image: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/rewardHistory/Added.svg`,
    status: 'redeemed',
    color: '#00B8B7',
  },
  {
    id: 4,
    label: 'Returned to Grip',
    image: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/rewardHistory/Returned.svg`,
    status: 'cancelled',
    color: '#FB5A4B',
  },
  {
    id: 5,
    label: 'Redemption in progress',
    image: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/rewardHistory/Reedemption.svg`,
    status: 'redeeming',
    color: '#282C3F',
  },
  {
    id: 6,
    label: 'Redeem request',
    image: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/rewardHistory/Returned.svg`,
    status: 'rejected',
    color: '#FB5A4B',
  },
  {
    id: 7,
    label: 'Not Eligible',
    image: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/rewardHistory/CreditedIcon.svg`,
    status: 'not-eligible',
    color: '#00357C',
  },
];

export const textAvailableForStatus = ['unlocked', 'locked'];

/**
 * status = 1 'unlocked' should return 'Fully Subscribed'
 * status = 2 'locked' should return 'Accepting Investments'
 *
 * otherwise all status should be not show any anything
 * ( redeemed, cancelled, redeeming, rejected )
 *
 * @param status status code for the referral log
 * @returns {string} status to be shown for the user
 */
export const transactionStatusLabel = (status: number) => {
  if (status === 1) return 'Fully Subscribed';
  if (status === 2) return 'Accepting Investments';
  return '';
};

export const tabArr = [
  'All',
  'Unlocked',
  'Locked',
  'Redeemed',
  'Cancelled',
  'Redeeming',
  'Rejected',
];

export const filtersToExclude = ['all', ''];
export const REFERRAL_DEFAULT_KEY_TIER1 = 'defaulttier1';
export const REFERRAL_DEFAULT_KEY_TIER2 = 'defaulttier2';
export const REFERRAL_DEFAULT_KEY_TIER3 = 'defaulttier3';

export const REFERRER_FLAT_FEE = 'referrerFlatFee';
export const REFERRED_FLAT_FEE = 'referredFlatFee';

export const referralTierMapping = {
  defaulttier1: 'REFERRAL_DEFAULT_KEY_TIER1',
  defaulttier2: 'REFERRAL_DEFAULT_KEY_TIER2',
  defaulttier3: 'REFERRAL_DEFAULT_KEY_TIER3',
};

export const getReferralDefaultAmount = (
  rules: any[],
  key = 'referrerFlatFee'
) => {
  let amount = 0;
  rules?.map((rule: any) => {
    if (rule?.[key] > amount) {
      amount = rule?.[key];
    }
    return rule;
  });
  return `₹${numberToCurrency(amount)}`;
};

export const getReferrerMaxEarningAmount = (rules: any[]) => {
  return `₹${numberToCurrency(rules?.[0]?.maxReferralEarnings || 0)}`;
};
