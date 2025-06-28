/**
 * Convert number in format of 00
 * @param num number to be convert with trailing 0
 * @returns converted string
 */
const updateNumberInTimer = (num: number) => {
  const roundedNum = Math.round(num);
  return `${num <= 9 ? '0' : ''}${roundedNum}`;
};

/**
 * Get the format from sections in 00:00 Format
 * @param remainingSeconds seconds to convert
 * @returns time format
 */
export const getTimeInFormat = (remainingSeconds: number) => {
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const minutesInStr = updateNumberInTimer(minutes);
  const secondsInStr = updateNumberInTimer(seconds);
  return `${minutesInStr}:${secondsInStr} mins`;
};

// Constant for the UPI Payment Duration in secs
export const UPI_PAYMENT_DURATION = 300;

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const debounce = (
  fn: { apply: (arg0: any, arg1: any[]) => void },
  ms = 0
) => {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};
