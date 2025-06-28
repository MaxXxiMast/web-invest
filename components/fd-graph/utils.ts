export const MAGIC_NUMBER = 30.42;

export const getMonthsAndDays = (value: number) => {
  if (value % 365 === 0) {
    return { months: (value / 365) * 12, days: 0 };
  }

  let months = Math.floor(value / MAGIC_NUMBER);

  let days =
    (value % MAGIC_NUMBER).toFixed(2) !== `${MAGIC_NUMBER}`
      ? Math.round(value % MAGIC_NUMBER)
      : 0;

  if (value % 365 === 0) {
    days = 0;
  }
  if (days >= 30) {
    months += 1;
    days = 0;
  }

  return { months, days };
};

export const getTenure = (value: number) => {
  const { months, days } = getMonthsAndDays(value);
  const dateString = days === 1 ? 'Day' : 'Days';
  if (months === 0) {
    return `${days} ${dateString}`;
  }
  return `${months} Months ${days !== 0 ? `and ${days} ${dateString}` : ''}`;
};

const getMonths = (value: number) => {
  const { months } = getMonthsAndDays(value);
  return months;
};

export const getRange = (options: number[]) => {
  const min = Math.min(...options);
  const max = Math.max(...options);
  let minTenure = getMonths(min) + 'M';
  let maxTenure = getMonths(max) + 'M';
  if (minTenure === '0M') {
    minTenure = getMonthsAndDays(min).days + 'D';
  }
  if (maxTenure === '0M') {
    maxTenure = getMonthsAndDays(max).days + 'D';
  }
  if (minTenure === maxTenure) {
    return minTenure;
  }
  return `${minTenure} - ${maxTenure}`;
};
