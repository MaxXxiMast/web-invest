import { useState, useEffect } from 'react';
import { fetchDocuments } from '../../api/document';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux';
import { isUserLogged } from '../user';

// Define a cache object to store fetched documents
export const documentCache: Record<string, any[]> = {};

const useAssetDocuments = ({ assetID }) => {
  const isLoggedInUser = isUserLogged();
  const [documents, setDocuments] = useState([]);
  const assetStatus = useSelector(
    (state: RootState) => state?.assets?.selectedAsset?.assetStatus
  );

  useEffect(() => {
    const getAssetDocuments = async () => {
      try {
        if (!assetID || assetStatus === 'past') {
          setDocuments([]);
          return;
        }

        // Check if documents are already cached
        if (documentCache[assetID]) {
          setDocuments(documentCache[assetID]);
          return;
        }

        const { list: assetDocuments } = await fetchDocuments('asset', assetID);

        let filteredDocuments = assetDocuments
          .sort((detail1, detail2) => {
            return detail1.displayOrder - detail2.displayOrder;
          })
          .filter((document) => {
            return document.docType !== 'website';
          });

        const thirdPartyLogo = assetDocuments.find(
          (document) =>
            document?.docType === 'website' &&
            document?.docSubType === 'third_party_logo'
        );
        if (thirdPartyLogo) {
          filteredDocuments = [...filteredDocuments, thirdPartyLogo];
        }

        // Cache the fetched documents
        documentCache[assetID] = filteredDocuments;

        setDocuments(filteredDocuments);
      } catch (e) {
        console.error('Error fetching documents:', e);
      }
    };

    if (isLoggedInUser) {
      getAssetDocuments();
    }
  }, [assetID, assetStatus, isLoggedInUser]);

  return documents;
};

export default useAssetDocuments;
