//NODE MODULES
import React from 'react';

//STYLES
import styles from './CardTable.module.css';

//UTILS
import { postMessageToNativeOrFallback } from '../../../utils/appHelpers';

//API
import { callErrorToast } from '../../../api/strapi';

interface TableData {
  date: string;
  type: string;
  dealSheet: string;
  orderReceipt: string;
  [key: string]: any;
}

interface CardTableProps {
  tableHeaders: string[];
  tableData: TableData[];
}

const handleDocumentDownload = async (doc: string, fileName: string) => {
  try {
    const response = await fetch(doc);
    if (!response.ok) throw new Error('Failed to fetch the document');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const fileNameDocs = fileName;

    const handleDownload = () => {
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', fileNameDocs);

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    };

    postMessageToNativeOrFallback(
      'downloadAppDocument',
      {
        url: doc,
        fileName: fileNameDocs,
      },
      handleDownload
    );
  } catch (error) {
    callErrorToast('Cannot open the document, please try again in some time');
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const transformAPIResponse = (apiResponse: any[]): TableData[] => {
  if (!apiResponse || !Array.isArray(apiResponse)) return [];

  return apiResponse.map((item) => ({
    date: formatDate(item.orderDate),
    type: item.orderType === 'BUY' ? 'Buy' : 'Sell',
    dealSheet: item.dealSheet,
    orderReceipt: item.orderReceipt,
  }));
};

const CardTable: React.FC<CardTableProps> = ({
  tableHeaders = [],
  tableData = [],
}) => {
  const renderCell = (key: string, transaction: TableData): JSX.Element => {
    switch (key) {
      case 'type':
        return (
          <td className={transaction.type === 'Buy' ? styles.buy : styles.sell}>
            {transaction.type}
          </td>
        );
      case 'dealSheet':
        return (
          <td>
            {transaction?.dealSheet ? (
              <a
                onClick={() =>
                  handleDocumentDownload(transaction.dealSheet, 'dealSheet.pdf')
                }
                className={`flex_wrapper gap-6 ${styles.downloadLink}`}
              >
                Download <span className="icon-download" />
              </a>
            ) : (
              '-'
            )}
          </td>
        );

      case 'orderReceipt':
        return (
          <td>
            {transaction?.orderReceipt ? (
              <a
                onClick={() =>
                  handleDocumentDownload(
                    transaction.orderReceipt,
                    'orderReceipt.pdf'
                  )
                }
                className={`flex_wrapper gap-6 ${styles.downloadLink}`}
              >
                Download <span className="icon-download" />
              </a>
            ) : (
              '-'
            )}
          </td>
        );

      default:
        return <td>{transaction[key] ?? ''}</td>;
    }
  };

  return (
    <div className={styles.CardBody}>
      <table className={styles.table}>
        <thead>
          <tr>
            {tableHeaders.map((header, index) => (
              <th key={`header-${index}`}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((transaction, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {Object.keys(transaction).map((key, cellIndex) => (
                <React.Fragment key={`cell-${rowIndex}-${cellIndex}`}>
                  {renderCell(key, transaction)}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CardTable;
