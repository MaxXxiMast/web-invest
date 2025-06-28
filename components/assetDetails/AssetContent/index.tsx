import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

import AssetContentSticky from '../AssetContentSticky';
import AssetDealContent from '../AssetDealContent';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';
import AssetDocuments from '../AssetDocument';
import StartupEquityDetails from '../startUpEquityDetails';
import PDFViewer from '../../common/pdfViewer';

// Redux Slices
import {
  fetchAndSetDetails,
  setAssetDocuments,
} from '../../../redux/slices/assets';
import { useAppSelector } from '../../../redux/slices/hooks';

// Hooks
import useAssetDocuments from '../../../utils/customHooks/useDocuments';

// Utils
import {
  isAssetBonds,
  isAssetStartupEquity,
} from '../../../utils/financeProductTypes';

// Styles
import styles from './AssetContent.module.css';

const documentsKey = 'Documents';

export default function AssetContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const selectedAsset = useAppSelector((state) => state.assets.selectedAsset);
  const {
    partnerHeadings = [],
    detailsHeadings = [],
    detailsMap = {},
    assetID,
    financeProductType,
  } = useAppSelector((state) => state.assets.selectedAsset);

  let finalDetailsMap = detailsMap;
  let equityDetail: any = {};
  if (isAssetStartupEquity(selectedAsset)) {
    if (selectedAsset?.investorDeckUrl) {
      equityDetail['Fundraise Information'] = [
        {
          page: 'Fundraise Information',
          title: 'Investor Deck',
          content: <PDFViewer url={selectedAsset.investorDeckUrl} />,
          isDynamicContent: true,
        },
      ];
    }
    if (selectedAsset?.partnerFundingDetails?.length) {
      if (equityDetail['Fundraise Information']) {
        equityDetail['Fundraise Information'].push({
          page: 'Fundraise Information',
          title: 'Previous Rounds',
          content: <StartupEquityDetails />,
          isDynamicContent: true,
        });
      } else {
        equityDetail['Fundraise Information'] = [
          {
            page: 'Fundraise Information',
            title: 'Previous Rounds',
            content: <StartupEquityDetails />,
            isDynamicContent: true,
          },
        ];
      }
    }
  }

  if (Object.keys(equityDetail).length) {
    finalDetailsMap = {
      ...finalDetailsMap,
      ...equityDetail,
    };
  }

  const [loader, setLoader] = useState(true);

  useEffect(() => {
    const { value } = router.query;
    const assetID = Number(value[value.length - 1]);
    if (assetID) {
      dispatch(
        fetchAndSetDetails(assetID, () => {
          setLoader(false);
        }) as any
      );
    } else {
      setLoader(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const documents = useAssetDocuments({ assetID: assetID });

  useEffect(() => {
    dispatch(setAssetDocuments(documents?.length ? documents : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents]);

  if (loader) {
    return (
      <>
        <CustomSkeleton
          styles={{ height: 44, width: '100%', marginBottom: 20 }}
        />
        <div className={`flex-column ${styles.Skeleton}`}>
          {Array.from({ length: 7 }).map((_, index) => (
            <CustomSkeleton
              key={`skeleton-${index}-${Date.now()}`}
              styles={{ height: index % 2 === 0 ? 90 : 44, width: '100%' }}
            />
          ))}
        </div>
      </>
    );
  }

  const handleDealContent = () => {
    const isPartnersArr = partnerHeadings.filter((ele: any) => {
      return ele !== documentsKey;
    });
    if (isPartnersArr.length > 0) {
      return partnerHeadings.map((label: any) => {
        const isPartnerSection = label === 'About Partners';
        const selectedDetails: any[] = detailsMap?.[label] || [];
        if (!selectedDetails?.length) return null;
        return (
          <AssetDealContent
            className={`${styles.InfiniteSection} scrollSectionDiv`}
            id={label}
            key={`deal-${label}`}
            data={
              isPartnerSection ? detailsMap['About Partners'] : selectedDetails
            }
            assetID={assetID}
            compactContent={
              !isAssetBonds({
                financeProductType,
              })
            }
          />
        );
      });
    }

    return detailsHeadings.map((label: any) => {
      const selectedDetails: any[] = detailsMap?.[label] || [];
      if (!selectedDetails?.length) return null;
      return (
        <AssetDealContent
          className={`${styles.InfiniteSection} scrollSectionDiv`}
          id={label}
          key={`top-${label}`}
          data={selectedDetails}
          assetID={assetID}
          compactContent={
            !isAssetBonds({
              financeProductType,
            })
          }
        />
      );
    });
  };

  return (
    <div className={styles.AssetContentContainer}>
      <AssetContentSticky />
      <div className={styles.InfiniteScroll} id="InfiniteScroll">
        <div className={styles.AssetDetailsTab}>{handleDealContent()}</div>
      </div>

      {documents.length ? (
        <div
          className={`scrollSectionDiv ${styles.DocContainer}`}
          id={'Documents'}
        >
          <h3
            className={`${styles.TabSectionTitle} ${styles.DocumentTabSectionTitle}`}
          >
            {'Documents'}
          </h3>
          <AssetDocuments documents={documents} />
        </div>
      ) : null}
    </div>
  );
}
