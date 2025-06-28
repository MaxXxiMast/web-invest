// Utils
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import { dateFormatter, formatDate } from '../../../utils/dateFormatter';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// CSS
import classes from './Transaction.module.css';

const handleAmount = (amount: number) =>
  amount ? numberToIndianCurrencyWithDecimals(amount) : '-';

const transformAction = (action: string) => {
  switch (action) {
    case 'BUY':
      return 'Buy';
    case 'SELL':
      return 'Sell';
    case 'RETURN':
      return 'Return';
    default:
      return '-';
  }
};

export const HeaderTxt = [
  {
    header: 'Txn',
    align: 'left',
    value: (row) => (
      <span
        className={`${
          row?.action === 'BUY'
            ? classes.buy
            : row?.action === 'SELL'
            ? classes.sell
            : null
        }`}
      >
        {transformAction(row?.action)}
      </span>
    ),
  },
  {
    header: 'Date',
    align: 'center',
    value: (row) => (
      <span>
        {dateFormatter({
          dateTime: row?.date,
          dateFormat: formatDate,
        })}
      </span>
    ),
  },
  {
    header: 'Units',
    align: 'center',
    value: (row) => <span>{row.units}</span>,
  },
  {
    header: 'Amount',
    align: 'right',
    value: (row) => handleAmount(row?.totalPretaxReturnsAmount),
  },
  {
    header: 'Principal',
    align: 'right',
    value: (row) => handleAmount(row?.principal),
  },
  {
    header: 'Interest',
    align: 'right',
    value: (row) => handleAmount(row?.interest),
  },
];

export const STATEMENT = 'statement';
export const RETURNS = 'returns';
export const TRANSACTIONS = 'transactions';

export const TabText = {
  [STATEMENT]: 'Statement',
  [RETURNS]: 'Returns Schedule',
  [TRANSACTIONS]: 'Transactions',
};

export const NoteTxt =
  'Note: An active order is in progress. It will take up to 15 minutes to come in my holdings';

export type TransactionProps = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  securityID: number;
  assetName: string | number;
};

export type TransactionData = {
  status: string;
  orderID: string;
  action: 'BUY' | 'SELL' | 'RETURN';
  date: string;
  units: number;
  totalReturnsAmount: number;
  principal: number;
  interest: number;
};

export type DownloadFlag =
  | 'Desktop'
  | 'MobileWeb'
  | 'App'
  | 'Windows'
  | 'Mac'
  | 'Linux';

export const txDownloadLabels = (showPdf = false) => {
  const labels = [
    showPdf && {
      id: 'pdf',
      label: 'As PDF',
      icon: `${GRIP_INVEST_BUCKET_URL}new-website/assets/pdfDownload.svg`,
    },
    {
      id: 'excel',
      label: 'As Excel',
      icon: `${GRIP_INVEST_BUCKET_URL}new-website/assets/xlsDownload.svg`,
    },
  ];

  // Filter out `false` entries if showPdf is false
  return labels.filter(Boolean);
};
