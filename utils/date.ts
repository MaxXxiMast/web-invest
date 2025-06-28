import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { abbreviate } from './string';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(isBetween);

export const converToDateFormat = (data: any) => {
  const dateReceived = new Date(data);
  const date = String(dateReceived.getDate()).padStart(2, '0');
  const month = dateReceived.toLocaleString('default', { month: 'long' }); //January is 0!
  const year = dateReceived.getFullYear();

  return month + ' ' + date + ', ' + year;
};

export const getDiffernceInTwoDates = (
  dateOne: any = new Date(),
  dateTwo: any = new Date()
) => {
  const date_One: any = new Date(dateOne);
  const date_Two: any = new Date(dateTwo);
  const diffTime = Math.abs(date_Two - date_One);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getFinancialYearList = (date: any) => {
  let startDate = dayjs(date, 'YYYY').format('YYYY');
  let financialYearList: any[] = [];
  for (
    let year = startDate;
    year <= dayjs().format('YYYY');
    year = dayjs(year).add(1, 'year').format('YYYY')
  ) {
    const value = `${year}-${dayjs(year).add(1, 'year').format('YYYY')}`;
    financialYearList.push({
      value,
      labelKey: `FY ${value}`,
    });
  }
  return financialYearList;
};

export const isBetweenDates = (
  date: any = dayjs(),
  startDate: string,
  endDate: string
) => {
  return date.isBetween(startDate, endDate, 'day', '[)');
};

export const getDateTimeZone = (date: dayjs.Dayjs, isAbbreviated = false) => {
  const timezoneStr = dayjs(date).format('zzz');
  if (isAbbreviated) {
    return abbreviate(timezoneStr);
  }

  return timezoneStr;
};

export const getCurrentFinancialYear = () => {
  const today = dayjs();
  const currentYear = today.format('YYYY');
  const pastYear = today.subtract(1, 'year').format('YYYY');
  const nextYear = today.add(1, 'year').format('YYYY');
  const currentMonth = today.month();

  return currentMonth > 2
    ? `FY${currentYear}-${nextYear}`
    : `FY${pastYear}-${currentYear}`;
};

export const getNextFinancialYears = () => {
  const today = dayjs();
  const currentYear = today.format('YYYY');
  const nextYear = today.add(1, 'year').format('YYYY');
  const secondNextYear = today.add(2, 'year').format('YYYY');
  const thirdNextYear = today.add(3, 'year').format('YYYY');
  const currentMonth = today.month();

  return [
    currentMonth > 2
      ? `FY${nextYear}-${secondNextYear}`
      : `FY${currentYear}-${nextYear}`,
    currentMonth > 2
      ? `FY${secondNextYear}-${thirdNextYear}`
      : `FY${nextYear}-${secondNextYear}`,
  ];
};

export const getFinancialYearListForFilter = (date: any) => {
  const today = dayjs();
  let startDate = dayjs(date, 'YYYY').format('YYYY');
  const currentMonth = today.month();
  const currentYear = today.format('YYYY');
  let financialYearList: any[] = [];
  for (
    let year = startDate;
    year < today.format('YYYY');
    year = dayjs(year).add(1, 'year').format('YYYY')
  ) {
    const value = `${year}-${dayjs(year).add(1, 'year').format('YYYY')}`;
    financialYearList.push(`FY${value}`);
  }

  if (currentMonth > 2) {
    const value = `${currentYear}-${dayjs(currentYear)
      .add(1, 'year')
      .format('YYYY')}`;
    financialYearList.push(`FY${value}`);
  }
  return financialYearList;
};

export const getFinancialYearListOnCount = (date: any, count: number) => {
  let startDate = dayjs(date, 'YYYY').format('YYYY');
  let financialYearList: any[] = [];
  let year = startDate;
  for (let i = 0; i < 5; i++) {
    const value = `${year}-${dayjs(year).add(1, 'year').format('YYYY')}`;
    financialYearList.push({
      value,
      labelKey: `FY ${value}`,
    });
    year = dayjs(year).add(1, 'year').format('YYYY');
  }
  return financialYearList;
};

export const getCurrentFinancialYearFormat = () => {
  const today = dayjs();
  const currentYear = today.format('YYYY');
  const pastYear = today.subtract(1, 'year').format('YYYY');
  const nextYear = today.add(1, 'year').format('YYYY');
  const currentMonth = today.month();

  return currentMonth > 2
    ? `${currentYear}-${nextYear}`
    : `${pastYear}-${currentYear}`;
};

export const decodeURLEncodedString = (txnTime) => {
  // Step 1: Decode the URL-encoded string
  //  txnTime = 'Mon%20May%2020%202024%2015:22:30%20GMT+0000%20(Coordinated%20Universal%20Time)';
  let decodedTxnTime = decodeURIComponent(txnTime);

  // Step 2: Parse the date string
  let date = new Date(decodedTxnTime);

  // Step 3: Format it to the desired format
  // Helper function to add leading zeros
  function pad(number) {
    return number < 10 ? '0' + number : number;
  }

  let year = date.getUTCFullYear();
  let month = pad(date.getUTCMonth() + 1); // getUTCMonth() returns month from 0-11
  let day = pad(date.getUTCDate());
  let hours = pad(date.getUTCHours());
  let minutes = pad(date.getUTCMinutes());
  let seconds = pad(date.getUTCSeconds());

  let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedDate;
};
