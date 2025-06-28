import dayjs from 'dayjs';

export const formatMonth = (monthDate) => {
  const date = dayjs(monthDate);

  if (!date.isValid()) {
    return '';
  }

  const month = date.format('MMM').toUpperCase();
  const year = date.format('YY');

  return `${month} ${year}`;
};

export const getMonthRange = (startOffset, endOffset) => {
  const startDate = dayjs().add(startOffset, 'month').startOf('month');
  const endDate = dayjs().add(endOffset, 'month').endOf('month');
  return { startDate, endDate };
};

export const getDatesRange = (selectedFilter, format = false) => {
  let startDate, endDate;
  const finalDateFormat = 'YYYY-MM-DD';

  switch (selectedFilter) {
    case 'Next 3 months':
      ({ startDate, endDate } = getMonthRange(1, 3));
      break;
    case 'Next 6 months':
      ({ startDate, endDate } = getMonthRange(1, 6));
      break;
    case 'Past 3 months':
      ({ startDate, endDate } = getMonthRange(-3, -1));
      break;
    case 'Past 6 months':
      ({ startDate, endDate } = getMonthRange(-6, -1));
      break;

    default:
      // Handle fiscal year cases
      const fiscalYearMatch = /^FY(\d{4})-(\d{4})$/.exec(selectedFilter);
      if (fiscalYearMatch) {
        const fiscalStartYear = parseInt(fiscalYearMatch[1]);
        const fiscalEndYear = parseInt(fiscalYearMatch[2]);
        startDate = dayjs().year(fiscalStartYear).month(3).startOf('month');
        endDate = dayjs().year(fiscalEndYear).month(2).endOf('month');
      }
  }

  if (format)
    return {
      startDate: startDate?.format(finalDateFormat),
      endDate: endDate?.format(finalDateFormat),
    };

  return {
    startDate: startDate?.toDate(),
    endDate: endDate?.toDate(),
  };
};

const getMonthList = (selectedParam: string) => {
  const { startDate, endDate } = getDatesRange(selectedParam);

  const monthList = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    monthList.push(formatMonth(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return monthList;
};

export const formatCashflowData = (data: any[], selectedFilter: string) => {
  if (data.length === 0) return {};

  let aggregatedData = {};
  const months = getMonthList(selectedFilter);

  months?.forEach(function (month) {
    aggregatedData[month] = {
      month,

      countOfDeals: 0,

      amount: 0,

      deals: [],
    };
  });

  data?.forEach(function (item) {
    const monthKey = formatMonth(item.dateOfReturn);

    if (aggregatedData[monthKey]) {
      aggregatedData[monthKey].countOfDeals++;
      aggregatedData[monthKey].amount += item.amount;
      aggregatedData[monthKey].deals.push(item);
    }
  });

  return aggregatedData;
};
