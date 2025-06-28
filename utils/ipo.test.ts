import {
  getTextForProgressBar,
  getSpecialBadgeLabel,
  getTooltipsForAssetSpecialBadge,
} from './ipo';

describe('getTextForProgressBar', () => {
  test('returns "Completed"', () => {
    expect(getTextForProgressBar()).toBe('Completed');
  });
});

describe('getSpecialBadgeLabel', () => {
  test('returns "Exchange Listed" if isCorporateBondAsset is true', () => {
    expect(getSpecialBadgeLabel(true)).toBe('Exchange Listed');
  });

  test('returns empty string if isSDISecondary is true', () => {
    expect(getSpecialBadgeLabel(false, true)).toBe('');
  });

  test('returns "MCA Compliant" if neither condition is true', () => {
    expect(getSpecialBadgeLabel()).toBe('MCA Compliant');
  });

  test('prioritizes SDI check over Corporate Bond', () => {
    expect(getSpecialBadgeLabel(true, true)).toBe('');
  });
});

describe('getTooltipsForAssetSpecialBadge', () => {
  test('returns BONDS tooltip when isCorporateBondAsset is true', () => {
    expect(getTooltipsForAssetSpecialBadge(true)).toBe(
      'The issuance, secondary purchase, and trading of these bonds is in compliance with applicable laws.'
    );
  });

  test('returns SDI tooltip when isSDISecondary is true and isCorporateBondAsset is false', () => {
    expect(getTooltipsForAssetSpecialBadge(false, true)).toBe(
      'Securitized Debt Instruments is an investment opportunity structured in the form of a Securitized Debt Instrument (SDI). SDIs are issued and listed on the National Stock Exchange of India (NSE) in accordance with the applicable laws.'
    );
  });

  test('returns MCA tooltip when both are false', () => {
    expect(getTooltipsForAssetSpecialBadge(false, false)).toBe(
      'These transactions are made accessible through LLPs and we are following Limited Liability Partnership Act, 2008'
    );
  });

  test('prioritizes BONDS tooltip when both are true', () => {
    expect(getTooltipsForAssetSpecialBadge(true, true)).toBe(
      'The issuance, secondary purchase, and trading of these bonds is in compliance with applicable laws.'
    );
  });
});
