export const getTextForProgressBar = () => {
  return 'Completed';
};

const IPO_TOOLTIPS = {
  BONDS:
    'The issuance, secondary purchase, and trading of these bonds is in compliance with applicable laws.',
  SEBI: 'PTCs made accessible through our website are being publicly issued in accordance with SEBI regulations, and the offering memorandum has been approved by SEBI',
  MCA: 'These transactions are made accessible through LLPs and we are following Limited Liability Partnership Act, 2008',
  DEMAT:
    'PTCs made accessible through our website will reflect in your demat account, upon allotment',
  LLP: 'Content Required',
  PRICE_PER_UNIT:
    'The face value of each PTC is INR 1000. As per the offering memorandum, you must subscribe to a minimum of 10 PTCs.',
  SDI: 'Securitized Debt Instruments is an investment opportunity structured in the form of a Securitized Debt Instrument (SDI). SDIs are issued and listed on the National Stock Exchange of India (NSE) in accordance with the applicable laws.',
};

export const getSpecialBadgeLabel = (
  isCorporateBondAsset = false,
  isSDISecondary = false
) => {
  if (isSDISecondary) {
    return '';
  }

  if (isCorporateBondAsset) {
    return 'Exchange Listed';
  }
  return 'MCA Compliant';
};

export const getTooltipsForAssetSpecialBadge = (
  isCorporateBondAsset: boolean = false,
  isSDISecondary = false
) => {
  if (isCorporateBondAsset) {
    return IPO_TOOLTIPS.BONDS;
  }
  if (isSDISecondary) {
    return IPO_TOOLTIPS.SDI;
  }
  return IPO_TOOLTIPS.MCA;
};
