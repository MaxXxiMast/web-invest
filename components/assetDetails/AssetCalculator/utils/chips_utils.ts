import {
  getTotalAmountPaybale,
  getUnitsFromTotalAmount,
} from '../../../../utils/investment';

export const handleChipsSuggestions = (
  asset,
  singleLotCalculation,
  chips = []
) => {
  const { collectedAmount, preTaxTotalMaxAmount } = asset ?? {};
  const { minLots, maxInvestment } = singleLotCalculation ?? {};

  if (!(chips?.length && minLots)) {
    return [];
  }

  const computedChips = chips.map((chip) => chip * minLots);

  // Calculate available amount and available lots
  const availableInvestmentAmount = preTaxTotalMaxAmount - collectedAmount;
  const availableAmount = Math.min(availableInvestmentAmount, maxInvestment);
  const availableLots = getUnitsFromTotalAmount(
    availableAmount,
    singleLotCalculation?.investmentAmount,
    singleLotCalculation?.stampDuty
  );

  let result = [];

  // Case 1: Available lots > Chip 3
  if (availableLots >= computedChips[2]) {
    result = computedChips.slice(0, 3); // Return all 3 chips
  }

  // Case 2: Chip 2 < Available lots < Chip 3
  else if (
    availableLots >= computedChips[1] &&
    availableLots < computedChips[2]
  ) {
    const newChip3 = Math.floor(availableLots);
    result = [computedChips[0], computedChips[1], newChip3]; // Adjust Chip 3
  }

  // Case 3: Chip 1 < Available lots < Chip 2
  else if (
    availableLots >= computedChips[0] &&
    availableLots < computedChips[1]
  ) {
    // Calculate Min investment amount
    const minInvestmentAmount = getTotalAmountPaybale(
      singleLotCalculation?.investmentAmount,
      singleLotCalculation?.stampDuty,
      minLots
    );

    const stepper = (availableAmount - minInvestmentAmount) / 2;

    let newChip2 = Math.round(minInvestmentAmount + stepper);
    let newChip3 = Math.round(minInvestmentAmount + 2 * stepper);

    // Convert to lots
    newChip2 = getUnitsFromTotalAmount(
      newChip2,
      singleLotCalculation?.investmentAmount,
      singleLotCalculation?.stampDuty
    );

    newChip3 = getUnitsFromTotalAmount(
      newChip3,
      singleLotCalculation?.investmentAmount,
      singleLotCalculation?.stampDuty
    );

    const arr = [computedChips[0], newChip2, newChip3];

    if (arr[0] > arr[1]) {
      // exceptional case when chip 1 is greater than chip 2
      arr[0] = minLots;
    }
    result = arr;
  }

  // Case 4: Available lots < Chip 1
  else if (availableLots < computedChips[0]) {
    result = [Math.floor(availableLots)];
  }

  return Array.from(new Set(result.filter((item) => item > 0)));
};
