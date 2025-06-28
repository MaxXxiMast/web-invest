// NODE MODULES
import React, { useEffect } from 'react';
import dayjs from 'dayjs';

// STYLES
import styles from './DealDetails.module.css';

//UTILS
import { postMessageToNativeOrFallback } from '../../../utils/appHelpers';
import { trackEvent } from '../../../utils/gtm';

//API
import { callErrorToast } from '../../../api/strapi';

//TYPES
import { DealDetailsType } from '.';

interface DealDetailsProps {
  dealDetails?: DealDetailsType;
  orderType?: string;
  activeProduct?: string;
}

const DealDetails: React.FC<DealDetailsProps> = ({
  dealDetails,
  orderType,
  activeProduct,
}) => {
  useEffect(() => {
    if (dealDetails && dealDetails.orderDate) {
      trackEvent('transaction_more_info_opened', {
        isin: dealDetails?.isin || dealDetails.isin || '',
        transaction_date: formatDate(dealDetails.orderDate),
        order_type: orderType || '',
        category: activeProduct || '',
      });
    }
  }, [dealDetails, dealDetails?.isin, orderType, activeProduct]);

  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return '';
    return dayjs(dateString).format('D MMM YYYY, h:mm A');
  };

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

      trackEvent('more_info_download', {
        ecn_type: fileName === 'dealSheet.pdf' ? 'Deal Sheet' : 'Order Receipt',
        isin: dealDetails?.isin,
        order_type: orderType,
      });

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

  if (!dealDetails) return null;

  return (
    <div className={styles.container}>
      <div className="flex-column gap-6">
        {dealDetails.tranche && <p>Tranche: {dealDetails.tranche}</p>}
        {dealDetails.orderDate && (
          <p>Order Placed on: {formatDate(dealDetails.orderDate)}</p>
        )}

        {dealDetails.settlementDate && (
          <p>Settled on: {formatDate(dealDetails.settlementDate)}</p>
        )}
      </div>

      <div className={styles.divider} />

      <div className="flex-column gap-6">
        {dealDetails.orderReceipt && (
          <div className="flex items-center justify-between">
            <p>Order Receipt</p>
            <a
              className={styles.download}
              onClick={() =>
                handleDocumentDownload(
                  dealDetails?.orderReceipt,
                  'orderReceipt.pdf'
                )
              }
            >
              <span className="icon-download" style={{ fontSize: '14px' }} />{' '}
              Download
            </a>
          </div>
        )}

        {dealDetails.dealSheet && (
          <div className="flex items-center justify-between">
            <p>Deal Sheet</p>
            <a
              onClick={() =>
                handleDocumentDownload(dealDetails?.dealSheet, 'dealSheet.pdf')
              }
              className={styles.download}
            >
              <span className="icon-download" style={{ fontSize: '14px' }} />{' '}
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealDetails;
