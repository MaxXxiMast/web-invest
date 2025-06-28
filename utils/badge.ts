import type { FinancialProduct } from './types';
import { assetPaymentStatus, assetStatus } from './asset';
import {
  financeProductTypeConstants,
  isAssetBonds,
  isAssetLeasing,
  isAssetStartupEquity,
  isHighYieldFd,
  isSDISecondary,
  nonTaxRelatedProductTypes,
} from './financeProductTypes';
import { GRIP_INVEST_BUCKET_URL } from './string';

const exchangeBadges = ['nse', 'bse'];
const RFQSpecialBadges = ['listed', 'executed securely via exchange'];

export const ASSET_BADGE_MARGIN_LEFT = 8;
export const ASSET_LIST_BADGE_MARGIN_LEFT = 10;

export const getAssetTypeFlag = (
  asset: any,
  isInvestmentOverView: boolean = false
) => {
  const { financeProductType = '' } = asset || {};
  let badge = financeProductType;

  if (financeProductType === financeProductTypeConstants.leasing) {
    badge = 'Executed via LLP';
  } else if (financeProductType === financeProductTypeConstants.sdi) {
    badge = isInvestmentOverView
      ? 'Securitized Debt Instrument'
      : `Executed via Demat`;
  } else if (financeProductType === financeProductTypeConstants.bonds) {
    badge = isInvestmentOverView ? 'Corporate Bonds' : 'Secured';
  }

  return badge;
};

const getPriorityBadge = (asset: FinancialProduct) => {
  const { badges, paymentStatus } = asset;
  const assetBadges: string[] = badges?.split(',') || [];
  const priorityBadges = [];

  if (assetStatus(asset) === 'active') {
    // if asset is active  priority is accepting investment > accepting pre tax > exclusive > match preferences
    const postTaxCollectedAmount =
      (Number(asset.collectedAmount) || 0) -
      (Number(asset.preTaxCollectedAmount) || 0);
    const withinMaxPostTaxRaise =
      postTaxCollectedAmount < (Number(asset.totalMaxAmount) || 0);
    const overallMinRaiseReached =
      (Number(asset.collectedAmount) || 0) >=
      (Number(asset.totalAmount) || 0) + (Number(asset.preTaxTotalAmount) || 0);
    const withinPreTaxMaxRaise =
      (Number(asset.preTaxCollectedAmount) || 0) <
      (Number(asset.preTaxTotalMaxAmount) || 0);

    const isNonTaxAsset = nonTaxRelatedProductTypes.includes(
      asset?.financeProductType
    );

    if (
      overallMinRaiseReached &&
      ((withinMaxPostTaxRaise && withinPreTaxMaxRaise) ||
        (withinMaxPostTaxRaise && !withinPreTaxMaxRaise))
    ) {
      priorityBadges.push(createBadge('Accepting Investment'));
    } else if (
      overallMinRaiseReached &&
      !withinMaxPostTaxRaise &&
      withinPreTaxMaxRaise &&
      !isNonTaxAsset
    ) {
      priorityBadges.push(createBadge('Accepting Pre-Tax'));
    } else if (assetBadges.includes('exclusive')) {
      priorityBadges.push(createBadge('Exclusive Deal'));
    } else if (isAssetLeasing(asset) && assetBadges.includes('filling fast')) {
      // Only on leasing filling fast should be prioritized before match preferences
      priorityBadges.push(createBadge('Filling Fast'));
    } else if (assetBadges.includes('preferences')) {
      priorityBadges.push(createBadge('Match Preferences'));
    }
  } else {
    // if asset is in completed section then badge will depend upon payment status of asset
    const tag = assetPaymentStatus[paymentStatus] || null;

    if (tag === 'Ongoing') {
      priorityBadges.push({
        label: 'Actively Earning',
        fileName: 'earning.svg',
        id: 'earning',
      });
    } else if (tag === 'Confirmed') {
      priorityBadges.push({
        label: 'Pending Metrics',
        fileName: 'pendingMetrics.svg',
        id: 'investment',
      });
    } else if (tag === 'Completed') {
      priorityBadges.push({
        label: 'Returns Completed',
        fileName: 'returnsCompleted.svg',
        id: 'completed',
      });
    }
  }

  return priorityBadges;
};

const createBadge = (badge: string) => {
  const badgesIcon = {
    liquidity: 'new-website/badges/liquidity.svg',
    'Accepting Investment': 'new-website/assets/accepting.svg',
    'filling fast': 'assets/FillingFast.svg',
    'Accepting Pre-Tax': 'new-website/assets/accepting.svg',
    'Match Preferences': 'dealsV2/matchPrefernces.svg',
    'single partner': 'bonds/dummyBondTagIcon.svg',
    '1.0x collateral': 'bonds/dummyBondTagIcon.svg', //dummy
    '1.05x collateral': 'bonds/dummyBondTagIcon.svg',
    '1.1x collateral': 'bonds/dummyBondTagIcon.svg',
    '1.15x collateral': 'bonds/dummyBondTagIcon.svg',
    '1.2x collateral': 'bonds/dummyBondTagIcon.svg',
    collateralised: 'bonds/dummyBondTagIcon.svg',
    'Senior Secured Bond': 'bonds/dummyBondTagIcon.svg',
    'No collateral': 'bonds/dummyBondTagIcon.svg',
    nse: 'icons/nse-logo-without-bg.svg',
    bse: 'icons/bse-logo.svg',
  };

  const imageForBadge = Object.keys(badgesIcon).includes(badge)
    ? `${GRIP_INVEST_BUCKET_URL}${badgesIcon[badge]}`
    : '';
  return {
    label: exchangeBadges.includes(badge) ? 'Listed' : badge,
    image: imageForBadge,
  };
};

export const isRFQBadge = (label: string) => {
  return RFQSpecialBadges.includes(label?.toLowerCase());
};

/**
 * returns badges to render for a asset in listing page and asset page
 * Changes affect in this Ticket https://gripinvest.atlassian.net/browse/PT-4395
 */

export const getAssetBadges = (asset: FinancialProduct) => {
  /** Max Badges should be only 3 for all asset types  */
  const { badges } = asset;

  let assetBadges: string[] = badges?.split(',') || [];

  if (isAssetLeasing(asset)) {
    /**
     * Leasing Asset:
     *  Permanent badges - Liquidity, Asset category
     *  Priority Badges
     *  1. Accepting Investment (if above 100% (both accepting or post tax accepting)
     *  2. Accepting Pre-Tax (If just pre tax accepting)
     *  3. Exclusive
     *  4. Filling fast
     *  5. Match Prefrences
     */
    // "single partner,exclusive,filling fast,liquidity,just in"

    const leasingBadges = [];
    if (assetBadges?.includes('liquidity')) {
      leasingBadges.push(createBadge('liquidity'));
    }
    const priorityBadges = getPriorityBadge(asset);

    if (priorityBadges.length) {
      // add the first element in badges
      leasingBadges.push(priorityBadges[0]);
    }

    if (leasingBadges.length < 3) {
      leasingBadges.push(createBadge(asset?.category));
    }

    return leasingBadges;
  } else if (
    isAssetBonds(asset) ||
    isSDISecondary(asset) ||
    isHighYieldFd(asset)
  ) {
    let bondsSDIBadges = assetBadges.map((el) => createBadge(el));
    if (asset?.isRfq) {
      const nonRfqBadges = bondsSDIBadges.filter(
        ({ label }) => !isRFQBadge(label)
      );
      const exchangeBadges = bondsSDIBadges.filter(
        ({ label }) => RFQSpecialBadges[0] === label.toLowerCase()
      );
      const executedBadge = bondsSDIBadges.find(
        ({ label }) => RFQSpecialBadges[1] === label.toLowerCase()
      );

      const rfqFinalBadges = [...exchangeBadges];

      if (executedBadge?.label) {
        rfqFinalBadges.push(executedBadge);
      }

      return [...rfqFinalBadges, ...nonRfqBadges];
    }

    return bondsSDIBadges;
  } else {
    const extraBadges = [];
    const badge = topBadges(asset);
    if (badge) {
      extraBadges.push(createBadge(badge.label));
    }
    extraBadges.push(createBadge(asset?.category));
    return extraBadges;
  }
};

export const topBadges = (asset: any = {}) => {
  if (!asset) {
    return;
  }
  let { badges, paymentStatus } = asset;
  if (assetStatus(asset) === 'active') {
    // if asset is active  pripority is accepting investment > accepting pre tax > exclusive > match preferences
    badges = (badges && asset.badges.split(',')) || [];
    const badgesToshow =
      badges.indexOf('curated') > -1
        ? 'curated'
        : badges.indexOf('exclusive') > -1
        ? 'exclusive'
        : badges.indexOf('match preferences') > -1
        ? 'preferences'
        : null;
    let selectedBadge: any = null;
    const postTaxCollectedAmount =
      (Number(asset.collectedAmount) || 0) -
      (Number(asset.preTaxCollectedAmount) || 0);
    const withinMaxPostTaxRaise =
      postTaxCollectedAmount < (Number(asset.totalMaxAmount) || 0);
    const overallMinRaiseReached =
      (Number(asset.collectedAmount) || 0) >=
      (Number(asset.totalAmount) || 0) + (Number(asset.preTaxTotalAmount) || 0);
    const withinPreTaxMaxRaise =
      (Number(asset.preTaxCollectedAmount) || 0) <
      (Number(asset.preTaxTotalMaxAmount) || 0);

    const isAssetEquity = isAssetStartupEquity(asset);
    if (
      overallMinRaiseReached &&
      ((withinMaxPostTaxRaise && withinPreTaxMaxRaise) ||
        (withinMaxPostTaxRaise && !withinPreTaxMaxRaise))
    ) {
      selectedBadge = {
        label: 'Accepting Investment',
        fileName: `${GRIP_INVEST_BUCKET_URL}new-website/assets/accepting.svg`,
      };
    } else if (
      overallMinRaiseReached &&
      !withinMaxPostTaxRaise &&
      withinPreTaxMaxRaise &&
      !isAssetEquity
    ) {
      selectedBadge = {
        label: 'Accepting Pre-Tax',
        fileName: `${GRIP_INVEST_BUCKET_URL}new-website/assets/accepting.svg`,
      };
    } else if (badgesToshow === 'exclusive') {
      selectedBadge = {
        label: 'Exclusive Deal',
        fileName: `${GRIP_INVEST_BUCKET_URL}dealsV2/exclusive.svg`,
      };
    } else if (badgesToshow === 'preferences') {
      selectedBadge = {
        label: 'Match Preferences',
        fileName: `${GRIP_INVEST_BUCKET_URL}dealsV2/matchPrefernces.svg`,
      };
    } else if (badgesToshow === 'curated') {
      selectedBadge = {
        label: 'Curated Deal',
        fileName: `${GRIP_INVEST_BUCKET_URL}dealsV2/curated.svg`,
      };
    }
    return selectedBadge;
  } else {
    // if asset is in completed section then badge will depend upon payment status of asset
    const tag = assetPaymentStatus[paymentStatus] || null;
    let selectedBadge: any = null;
    if (tag === 'Ongoing') {
      selectedBadge = {
        label: 'Actively Earning',
        fileName: `${GRIP_INVEST_BUCKET_URL}dealsV2/actively-earning.svg`,
        id: 'earning',
      };
    } else if (tag === 'Confirmed') {
      selectedBadge = {
        label: 'Pending Metrics',
        fileName: `${GRIP_INVEST_BUCKET_URL}dealsV2/PendingMetrics.svg`,
        id: 'investment',
      };
    } else if (tag === 'Completed') {
      selectedBadge = {
        label: 'Returns Completed',
        fileName: `${GRIP_INVEST_BUCKET_URL}dealsV2/returns-completed.svg`,
        id: 'completed',
      };
    }
    return selectedBadge;
  }
};
