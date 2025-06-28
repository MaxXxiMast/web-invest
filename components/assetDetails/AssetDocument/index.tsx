import React from 'react';
import PubSub from 'pubsub-js';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';

import { trackEvent } from '../../../utils/gtm';
import { useAppSelector } from '../../../redux/slices/hooks';
import { getSignedUrl } from '../../../api/details';
import { callErrorToast } from '../../../api/strapi';
import { downloadDocument } from '../../../utils/url';

const PDFModal = dynamic(() => import('../../common/PDFModal'), {
  ssr: false,
});

import styles from './AssetDocument.module.css';

export default function AssetDocuments({ documents }) {
  const { assetID } = useAppSelector((state) => state.assets.selectedAsset);
  const isMobileApp = Cookies.get('webViewRendered');

  const documentSeen = (document) => {
    trackEvent('Assets Document Viewed', {
      assetID: assetID,
      document: document,
    });
  };

  const handleDocumentClick = async (document: any) => {
    const urlInfo = await getSignedUrl(document);

    if (isMobileApp) {
      downloadDocument(urlInfo?.url);
    } else {
      if (urlInfo?.url) {
        PubSub.publish('openFile', {
          url: urlInfo.url,
          fullPath: document?.fullPath,
        });
      } else {
        callErrorToast(
          'Cannot open the document, please try again in some time'
        );
      }
      documentSeen(document?.displayName);
    }
  };

  const downloadFile = async (document: any) => {
    const urlInfo = await getSignedUrl(document);
    downloadDocument(urlInfo?.url);
  };

  return (
    <>
      <div
        className={`flex flex-wrap gap-12 justify-between ${styles.documentsCardContainer}`}
      >
        {documents.map((document) => (
          <div
            className={styles.documentsCard}
            key={`document-${document?.url}`}
          >
            <div
              className={`flex items-center ${styles.contentWrapper}`}
              onClick={() => handleDocumentClick(document)}
            >
              <span className={`icon-file ${styles.FileIcon}`} />
              <div className={styles.documentTitle}>
                {document?.displayName || ''}
              </div>
            </div>
            {document?.fileName?.split('.')?.pop() === 'pdf' ? (
              <div
                className={styles.Download}
                onClick={() => downloadFile(document)}
              >
                <span className={`${styles.DownloadIcon} icon-download`} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <PDFModal />
    </>
  );
}
