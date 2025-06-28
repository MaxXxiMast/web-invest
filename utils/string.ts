export const isValidEmail = (email: string) => {
  let re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email?.toLowerCase());
};

export const isValidMobile = (number: string) => {
  let re = /^[6-9][0-9]{9}$/;
  return re.test(number);
};

export const isValidInternationalNumber = (number: string) => {
  let re = /^\+(?:[0-9] ?){6,14}[0-9]$/;
  return re.test(number);
};

export const isMobileOrEmail = (
  value: string,
  internationalCheck: boolean = true
): 'email' | 'mobile' | null => {
  if (isValidEmail(value)) {
    return 'email';
  }
  if (
    isValidMobile(value) ||
    (internationalCheck && isValidInternationalNumber(value))
  ) {
    return 'mobile';
  }
  return null;
};

export const isValidName = (str: string) => {
  return RegExp(/^[A-Z a-z]*$/).test(str);
};

export const capitalize = (str: string) => {
  if (!str) {
    return str;
  }
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
};

export const GRIP_INVEST_BUCKET_URL = 'https://static-assets.gripinvest.in/';

export const GRIP_INVEST_GI_STRAPI_BUCKET_URL =
  'https://img.gripinvest.in/innerPages/';

export const GRIP_INVEST_GI_STRAPI_BUCKET_URL_WITHOUT_INNER =
  'https://img.gripinvest.in/';

export const generateCountString = (data: number) => {
  if (data > 0 && data < 10) return '0' + data?.toString();
  return data?.toString();
};
export const replaceAll = (
  target: string,
  search: string,
  replacement: string
) => target.replace(new RegExp(search, 'g'), replacement);

export const urlify = (str: string) => {
  const removedSpaces = replaceAll(str, ' ', '-').toLowerCase();
  return removedSpaces.replace(/[{()}]/g, '');
};

export const getUrlExtension = (url: string) => {
  if (!url) {
    return false;
  }
  // Remove everything to the last slash in URL
  url = url.substring(1 + url.lastIndexOf('/'));

  // Break URL at ? and take first part (file name, extension)
  url = url.split('?')[0];

  // Sometimes URL doesn't have ? but #, so we should aslo do the same for #
  url = url.split('#')[0];

  // Now we have only extension
  return url.split('.').reverse()[0];
};

export const handleExtraProps = (propsName = '') => {
  if (propsName && propsName.trim() !== '') {
    return propsName;
  }
  return '';
};

/**
 * function to get trucated string
 * @param value string value to be truncated
 * @param charCount string display limit count with ... character
 * @returns returns truncated string
 */
export const handleStringLimit = (value = '', charCount?: number) => {
  if (charCount && value.length > charCount) {
    return `${value?.slice(0, charCount)}...`;
  }
  return value;
};

/**
 * Abbreviated a string with spacing single spacing
 * @param val string to be abbreviated
 * @returns abbreviated string format
 */
export const abbreviate = (val: string) => {
  const strArr = val.trim().split(' ').filter(Boolean);
  let abbreviatedStr = '';
  for (const str of strArr) {
    abbreviatedStr = abbreviatedStr.concat(str.charAt(0));
  }

  return abbreviatedStr;
};

export const convertToUnderScoredType = (data = '') => {
  const arrayStr = data.split(' ');

  if (arrayStr.length > 1) {
    return arrayStr.join('_').toUpperCase();
  } else {
    return data;
  }
};

export const checkEmailValidation = (email: string) => {
  const specialCharsRegex = /^[a-zA-Z0-9._%\-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return specialCharsRegex.test(email);
};

export const isContainSpecialCharacters =
  /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

export const isOnlyNumbersRegex = /^[0-9]+$/;

/**
 * Mask string
 * @param inputString Value of string
 * @param maskCharLength Count of masking charater
 * @returns last character masked string with given length
 */
export const maskString = (inputString = '', maskCharLength = 4) => {
  const totalCharacters = inputString?.length;
  if (totalCharacters <= maskCharLength) {
    return inputString; // If the string is 4 characters or shorter, return it as it is.
  } else {
    const maskedPortion = '*'.repeat(totalCharacters - maskCharLength);
    const lastFourCharacters = inputString.substring(
      totalCharacters - maskCharLength,
      totalCharacters
    );
    return maskedPortion + lastFourCharacters;
  }
};

/**
 * Convert to title case
 * @param value string to be title cases
 * @param seperator string seperator
 * @returns title cased string
 */
export const toTitleCase = (value = '', seperator = ' ') => {
  if (value) {
    const data = value.split(seperator);
    const finalStr: any[] = [];
    data.forEach((value) => {
      finalStr.push(`${value?.charAt(0)?.toUpperCase()}${value?.slice(1)}`);
    });
    return finalStr.join(seperator);
  }
  return value;
};

/**
 * Convert to camel case
 * @param value string to be camel cases
 * @param seperator string seperator
 * @returns camel cased string
 */
export const camelCaseToTitleCase = (str: string): string => {
  // Convert camelCase to Title Case  interestPostTax => "Interest Post Tax"
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

/**
 * Alternative Asterisk to string
 * @param inputString Value of string
 * @returns mask alernative Characters
 */
export function maskedEmail(value = ''): string {
  const [inputString, endingEmail] = value?.split('@');
  const maskLength = inputString.length > 15 ? 15 : inputString.length;

  // Replace characters after the first two with '*'
  const maskedstring =
    inputString.length > 2
      ? inputString.slice(0, 2) + '*'.repeat(maskLength - 2)
      : inputString;

  // Join the array back into a string and return it
  return `${maskedstring}${endingEmail ? `@${endingEmail}` : ''}`;
}
