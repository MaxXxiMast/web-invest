import dayjs from 'dayjs';
import { numberToIndianCurrencyWithDecimals } from '../../../../utils/number';

export const getPaymentScheduleData = (portfolioRows: any) => {
  return {
    header: 'Visualise Returns',
    headers: [
      {
        key: '#',
        label: '#',
      },
      {
        key: 'date',
        label: 'Tentative Date',
        formatter: (value) => {
          return dayjs(value).format('DD MMM YYYY');
        },
      },
      {
        key: 'returnsSplit.principalAmount',
        label: 'Principal',
        formatter: (value) => {
          return numberToIndianCurrencyWithDecimals(value);
        },
      },
      {
        key: 'returnsSplit.interestAmount',
        label: 'Interest',
        formatter: (value) => {
          return numberToIndianCurrencyWithDecimals(value);
        },
      },
      {
        key: 'totalReturnsAmount',
        label: 'Monthly Payout',
        formatter: (value) => {
          return numberToIndianCurrencyWithDecimals(value);
        },
      },
    ],
    rows: portfolioRows,
  };
};
