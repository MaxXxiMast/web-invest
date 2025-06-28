// NODE MODULES
import { useEffect, useState } from 'react';

// Common Components
import NoData from '../../common/noData';
import GID from './GID';
import AGTS from './AGTS';
import DocumentButton from './DocumentButton';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// UTILS
import { callErrorToast } from '../../../api/strapi';
import { namingOfDocuments } from '../utils/sidebar';
import { postMessageToNativeOrFallback } from '../../../utils/appHelpers';

// APIs
import { fetchDocuments, getSignedUrl } from '../../../api/document';

// Hooks
import { useAppSelector } from '../../../redux/slices/hooks';

// Styles
import styles from './Documents.module.css';

const Documents = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const userDetails = useAppSelector((state) => state?.user?.userData);

  useEffect(() => {
    async function fetchDocumentsData() {
      try {
        const docs = await fetchDocuments('user', userDetails?.userID);
        setDocuments(docs?.list || []);
      } catch (error) {
        console.log('Error fetching documents', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userDetails?.userID) {
      fetchDocumentsData();
    }
  }, [userDetails?.userID]);

  if (isLoading) {
    return (
      <>
        <CustomSkeleton styles={{ width: 200, height: 22 }} />
        {Array.from({ length: 5 }).map((_, index) => (
          <CustomSkeleton key={index} styles={{ width: 200, height: 50 }} />
        ))}
      </>
    );
  }

  // GET KYC Documents and then exclude some documents
  const kycDocuments = documents?.filter(
    (doc: any) =>
      ['cheque', 'aof', 'depository', 'pan', 'vault'].includes(
        doc.docSubType
      ) && doc.filePath
  );

  const gidDocuments = documents?.filter(
    (document) => document.docType === 'gid'
  );

  const agtsDocuments = documents?.filter(
    (document) => document.docType === 'agts'
  );

  const handleDocumentDownload = async (doc: any) => {
    try {
      const urlData = await getSignedUrl(doc);

      if (urlData && urlData.url) {
        const response = await fetch(urlData.url);
        if (!response.ok) throw new Error('Failed to fetch the document');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const fileName =
          doc.docSubType === 'aof' ? `${doc.fileName}.pdf` : doc.fileName;

        const handleDownload = () => {
          const link = document.createElement('a');

          link.href = url;
          link.setAttribute('download', fileName);

          document.body.appendChild(link);
          link.click();

          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
        };

        postMessageToNativeOrFallback(
          'downloadAppDocument',
          {
            url: urlData.url,
            fileName,
          },
          handleDownload
        );
      } else {
        throw new Error('Failed to fetch the document URL');
      }
    } catch (error) {
      callErrorToast('Cannot open the document, please try again in some time');
    }
  };

  if (!gidDocuments.length && !kycDocuments.length) {
    return (
      <NoData
        subHeader=""
        header="No documents available"
        customHeaderClassName={styles.NoDataHeader}
      />
    );
  }

  return (
    <div className={styles.MainContainer}>
      <span className={styles.subHeading}>
        Download a copy of your documents
      </span>

      <AGTS agtsDocuments={agtsDocuments} />

      <GID gidDocuments={gidDocuments} />

      {kycDocuments?.map((document) => {
        return (
          <DocumentButton
            key={document?.displayName}
            name={
              namingOfDocuments?.[document?.docSubType] ?? document?.docSubType
            }
            onClick={() => handleDocumentDownload(document)}
          />
        );
      })}

      <div className={styles.documentNote}>
        <div className={styles.noteHeading}>Note: </div>
        <div className={styles.noteContent}>
          You can download the Rights & Obligations, Risk Disclosure Document
          and the guidance notes to understand the risks of trading and the
          regulations governing trading activities{' '}
          <span className={styles.noteLink}>
            <a href="/legal#kycAndAccountOpeningForm" target={'_blank'}>
              here
            </a>
          </span>
          .
          <div>
            You can also view the investor charter{' '}
            <span className={styles.noteLink}>
              <a href="/legal#investorCorner" target={'_blank'}>
                here
              </a>
            </span>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
