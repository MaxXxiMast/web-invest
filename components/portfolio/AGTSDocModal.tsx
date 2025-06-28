import { getSignedUrl } from '../../api/document';
import { trackEvent } from '../../utils/gtm';
import { postMessageToNativeOrFallback } from '../../utils/appHelpers';

import styles from '../../styles/Portfolio/GIDDocModal.module.css';

type Props = {
  agts?: any;
  className?: any;
  closeModal: () => void;
};

const AGTSDocModal = ({ agts = [], className = '', closeModal }: Props) => {
  const downloadPdf = async (obj: any) => {
    const rudderData = {
      doctype: 'AGTS',
      option_text: obj.displayName,
    };
    trackEvent('document_requested', rudderData);

    const gidDoc = await getSignedUrl({ module: 'user', docID: obj.docID });

    const handleFetchDocument = () => {
      fetch(gidDoc.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));

          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${obj?.displayName}.pdf`);
          document.body.appendChild(link);

          // Start download
          link.click();
          closeModal();
        });
    };

    postMessageToNativeOrFallback(
      'downloadAppDocument',
      {
        url: gidDoc.url,
        fileName: `${obj?.displayName}.pdf`,
      },
      handleFetchDocument
    );

    closeModal();
  };

  return (
    <div className={`${styles.GIDDocModal} ${className}`}>
      <div
        className={`${agts?.length > 6 && styles.CardHeaderNew} ${
          styles.CardHeader
        }`}
      >
        <h4 className="Heading4">Download AGTS Document</h4>
      </div>
      <div
        className={`${agts?.length > 6 && styles.CardBodyNew} ${
          styles.CardBody
        }`}
      >
        <div
          className={`${agts?.length <= 4 && styles.OneDocList} ${
            styles.DocList
          } ${agts.length > 6 && styles.DocListNew}`}
        >
          {agts.map((data: any) => (
            <div
              className={styles.DocItem}
              key={data?.docID}
              onClick={() => downloadPdf(data)}
            >
              <span className={`icon-file ${styles.DocIcon}`} />
              <h4 className={styles.AGTSDisplayName}>{data.displayName}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AGTSDocModal;
