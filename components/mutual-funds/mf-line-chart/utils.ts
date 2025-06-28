import dayjs from 'dayjs';

export type NavData = {
  nav: number;
  date: string;
  securityID?: number;
  id?: number;
}[];

export const getDateRangeFromFilter = (
  filter: string
): { startDate?: string; endDate: string } => {
  const endDate = dayjs().format('YYYY-MM-DD'); // Current date in YYYY-MM-DD format
  let startDate: string | undefined;

  switch (filter) {
    case '1M':
      startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
      break;
    case '6M':
      startDate = dayjs().subtract(6, 'month').format('YYYY-MM-DD');
      break;
    case '1Y':
      startDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
      break;
    case '3Y':
      startDate = dayjs().subtract(3, 'year').format('YYYY-MM-DD');
      break;
    case '5Y':
      startDate = dayjs().subtract(5, 'year').format('YYYY-MM-DD');
      break;
    case 'MAX':
      // For MAX, only the end date is required
      break;
    default:
      throw new Error(`Invalid filter: ${filter}`);
  }

  return { startDate, endDate };
};
