import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const roundOff = (value: number | string, n: number = 0) => {
  try {
    if (typeof value == 'string') {
      return parseFloat(value).toFixed(n);
    } else {
      return value.toFixed(n);
    }
  } catch (e) {
    return '0';
  }
};
export const toCurrecyStringWithDecimals = (
  amount: number | string,
  n: number = 2,
  shortHand?: boolean,
  shortForm: boolean = true
): string => {
  try {
    const startingAmount =
      typeof amount == 'string' ? parseInt(amount) : amount;

    if (startingAmount / 100 < 10) {
      return `${parseFloat(roundOff(startingAmount, n))}`;
    }
    if (startingAmount / 1000 < 100) {
      return `${parseFloat(roundOff(startingAmount / 1000, n))}K`;
    }
    if (startingAmount / 100000 < 100) {
      let isSingluar = startingAmount / 100000 < 2 && shortForm;
      return `${parseFloat(roundOff(startingAmount / 100000, n))}${
        shortHand ? 'L' : isSingluar ? 'Lac' : ' Lakh'
      }`;
    }
    if (startingAmount / 10000000 > 0.99) {
      return `${parseFloat(roundOff(startingAmount / 10000000, n))}${
        shortHand ? 'Cr' : ' Crore'
      }`;
    }
    return `${amount}`;
  } catch (e) {
    return `${amount}`;
  }
};

export const SDISecondaryAmountToCommaSeparator = (
  value: string | number,
  decimalPoints = 2
) => {
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimalPoints,
    maximumFractionDigits: decimalPoints,
  });
};

export const numberToCurrency = (
  value: number | string,
  toIntlFormat: boolean = false
): string => {
  try {
    if (typeof value == 'string') {
      return toIntlFormat
        ? parseFloat(value).toLocaleString()
        : parseInt(value).toLocaleString('en-IN');
    }
    return toIntlFormat
      ? value.toLocaleString()
      : value.toLocaleString('en-IN');
  } catch (e) {
    return `${value}`;
  }
};

export const convertCurrencyToNumber = (currencyString: string): number => {
  const numericString = currencyString?.replace(/[^\d.-]/g, '');
  const numberValue = parseFloat(numericString);
  return numberValue;
};

export const numberToIndianCurrencyWithDecimals = (
  data: number | string,
  maximumFractionDigits = 2
) => {
  if (typeof data == 'string' && data.indexOf(',') != -1) {
    data = data.replaceAll(',', '');
  }
  try {
    if (typeof data == 'string') {
      if (data.indexOf('.') != -1) {
        return parseFloat(data).toLocaleString('en-IN', {
          maximumFractionDigits: maximumFractionDigits,
          style: 'currency',
          currency: 'INR',
        });
      } else {
        return parseInt(data).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        });
      }
    } else {
      if (Number.isInteger(data)) {
        return data.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        });
      } else {
        return data.toLocaleString('en-IN', {
          maximumFractionDigits: maximumFractionDigits,
          style: 'currency',
          currency: 'INR',
        });
      }
    }
  } catch (e) {
    return `${data}`;
  }
};

export const numberToIndianCurrency = (
  data: number | string,
  withDecimal = true
) => {
  if (typeof data == 'string' && data.indexOf(',') != -1) {
    data = data.replaceAll(',', '');
  }
  try {
    let formattedNumber: any;
    if (typeof data == 'string') {
      if (data.indexOf('.') != -1 && withDecimal) {
        return parseFloat(data).toLocaleString('en-IN', {
          maximumFractionDigits: 2,
          style: 'currency',
          currency: 'INR',
        });
      } else {
        let result = parseInt(data).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        });
        formattedNumber = result?.slice(0, result.length - 3);
      }
    } else {
      if (Number.isInteger(data) || !withDecimal) {
        let result = data.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        });
        formattedNumber = result?.slice(0, result.length - 3);
      } else {
        formattedNumber = data.toLocaleString('en-IN', {
          maximumFractionDigits: 2,
          style: 'currency',
          currency: 'INR',
        });
      }
    }
    return formattedNumber.replace(/\u00A0/g, '');
  } catch (e) {
    return `${data}`;
  }
};

export const changeNumberFormat = (
  number: any,
  decimals?: any,
  recursiveCall?: any
) => {
  if (Number(number) === 0 || isNaN(Number(number))) {
    return 0;
  }
  const decimalPoints = decimals || 0;
  const noOfLakhs = number / 100000;
  let displayStr;
  let isPlural;

  function roundOf(integer: number) {
    return +integer.toLocaleString(undefined, {
      minimumFractionDigits: decimalPoints,
      maximumFractionDigits: decimalPoints,
    });
  }

  if (noOfLakhs >= 1 && noOfLakhs < 100) {
    const lakhs = Math.round(noOfLakhs);

    isPlural = lakhs > 1 && !recursiveCall;
    displayStr = `${lakhs} Lakh${isPlural ? 's' : ''}`;
  } else if (noOfLakhs >= 100) {
    const crores = Math.round(noOfLakhs / 100);
    const crorePrefix: any =
      crores >= 100000 ? changeNumberFormat(crores, decimals, true) : crores;
    isPlural = crores > 1 && !recursiveCall;
    displayStr = `${crorePrefix} Crore${isPlural ? 's' : ''}`;
  } else {
    displayStr = `${numberToCurrency(Math.round(number))}`;
  }

  return `₹${displayStr}`;
};

export const isValidWithdrawInput = (
  amount: string,
  walletSummary: any,
  userData: any,
  isInstitutionalUser: boolean
): [boolean, string] => {
  if (Number(amount) === 0) {
    return [false, 'Amount cant be zero'];
  }

  const currentTime = dayjs().tz('Asia/Kolkata');

  if (
    (currentTime.hour() === 0 && currentTime.minute() <= 5) ||
    (currentTime.hour() === 23 && currentTime.minute() >= 30)
  ) {
    return [
      false,
      'Withdrawals are not available from 11:30PM to 00:05AM (Indian Standard Time)',
    ];
  }

  if (
    walletSummary &&
    walletSummary.todaysWithdrawals &&
    walletSummary.todaysWithdrawals.length >= 3
  ) {
    return [false, 'Only 3 withdrawal requests can be placed in a day'];
  }
  if (
    Number(amount) > 2000000 ||
    (walletSummary &&
      walletSummary.todaysWithdrawals &&
      walletSummary.todaysWithdrawals.reduce(
        (total: number, obj: any) => obj.amount + total,
        0
      ) +
        Number(amount) >
        2000000)
  ) {
    return [false, 'You can not withdraw more than ₹20,00,000 in a day'];
  }
  if (
    (isInstitutionalUser || userData?.kycDone) &&
    amount &&
    Number(amount) <= walletSummary?.amountInWallet
  ) {
    return [true, ''];
  } else if (!Number(amount)) {
    return [false, ''];
  }
  return [
    false,
    `You can not withdraw more than the amount available in your Vault`,
  ];
};

export const isValidAddMoneyAmount = (amount: string): [boolean, string] => {
  if (Number(amount) <= 0) {
    return [false, 'Amount cannot be  0'];
  }
  if (Number(amount) > 3000000) {
    return [false, 'Maximum 30L can be added in a single transaction'];
  }
  return [true, ''];
};

type Sizes = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

/**
 * Convert the bytes to compresses sizes
 * @param bytes file size in number
 * @returns returns compressed size name
 */
export const bytesToSize = (bytes: number) => {
  let sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'N/A';
  let i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return bytes + ' ' + sizes[i];
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

/**
 * Convert the size to bytes
 * @param value value to be converted in bytes
 * @param sizes what is the size of the number ( like in Mega Bytes, bytes, kilobytes)
 * @returns
 */

export const getSizeToBytes = (value: number, sizes: Sizes = 'B') => {
  let byteSizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = byteSizes.indexOf(sizes);
  return value * Math.pow(1024, i);
};

export const addNumberPadding = (integer: number, n: number) => {
  return String(integer).padStart(2, '0');
};

export const isEven = (value: number) => {
  return value % 2 === 0;
};
