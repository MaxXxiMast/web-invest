export const calculateTimeToMaturity = (maturityDate: Date): string => {
  const currentDate = new Date();
  const diffDays =
    (maturityDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
  const months = diffDays / 30.41;

  if (months >= 2.5 && months < 3) {
    return '3 months';
  } else if (months >= 2.0 && months < 2.5) {
    return '2 months';
  } else if (months >= 0.001 && months < 1) {
    return '<1 month';
  }

  return `${Math.round(months)} months`;
};

export const formatNumberWithCommas = (num?: string | number): string => {
  if (num === undefined || num === null || num === '') return '';
  const numStr = typeof num === 'number' ? num.toString() : num;
  const numericValue = parseFloat(numStr.replace(/,/g, ''));
  if (isNaN(numericValue)) return numStr;

  return numericValue.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
