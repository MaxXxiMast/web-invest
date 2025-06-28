import { getSignedUrl } from '../../api/document';
import { trackEvent } from '../../utils/gtm';
import { postMessageToNativeOrFallback } from '../../utils/appHelpers';

import styles from '../../styles/Portfolio/GIDDocModal.module.css';

type Props = {
  gid?: any;
  className?: any;
  closeModal: () => void;
};

const GIDDocModal = ({ gid = [], className = '', closeModal }: Props) => {
  const downloadPdf = async (obj: any) => {
    // Rudderstack analytics document_requested
    const rudderData = {
      doctype: 'GID',
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
          // Create blob link to download
          const url = window.URL.createObjectURL(new Blob([blob]));

          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${obj?.displayName}.pdf`);
          // Append to html link element page
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
        fileName: `${obj.displayName}.pdf`,
      },
      handleFetchDocument
    );

    closeModal();
  };

  return (
    <div className={`${styles.GIDDocModal} ${className}`}>
      <div
        className={`${gid?.length > 6 && styles.CardHeaderNew} ${
          styles.CardHeader
        }`}
      >
        <h4 className="Heading4">Download GID Document</h4>
      </div>
      <div
        className={`${gid?.length > 6 && styles.CardBodyNew} ${
          styles.CardBody
        }`}
      >
        <div
          className={`${gid?.length <= 4 && styles.OneDocList} ${
            styles.DocList
          } ${gid.length > 6 && styles.DocListNew}`}
        >
          {gid.map((data: any) => (
            <div
              className={styles.DocItem}
              key={data?.docID}
              onClick={() => downloadPdf(data)}
            >
              <span className={`icon-file ${styles.DocIcon}`} />
              <h4 className="Heading4">{data.displayName}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GIDDocModal;
