import React, { useEffect, useState } from 'react';

import PDFViewer from '../../common/pdfViewer';

import { htmlSanitizer } from '../../../utils/htmlSanitizer';
import { handleExtraProps } from '../../../utils/string';
import { useAppSelector } from '../../../redux/slices/hooks';
import { getSignedUrl } from '../../../api/details';
import { processContent } from '../utils';

// Styles
import styles from './AssetDealContent.module.css';

// Accordian styles to be overridden
import Accordian from '../../primitives/Accordian';
import { trackEvent } from '../../../utils/gtm';

type Props = {
  data?: any;
  className?: string;
  id?: any;
  assetID: number | string;
  isPartnerSection?: boolean;
  compactContent?: boolean;
};

const AssetDealContent = ({
  data,
  className,
  id,
  isPartnerSection = false,
  compactContent = false,
}: Props) => {
  const [investorDeckUrl, setInvestorDeckUrl] = useState(false);
  const documents = useAppSelector(
    (state) => state.assets.selectedAssetDocuments
  );

  useEffect(() => {
    const fetchInvestorDeckUrl = async () => {
      const investorDeck = documents?.find(
        (doc: any) => doc?.docType === 'investor_deck'
      );
      if (investorDeck) {
        const response = await getSignedUrl({
          docID: (investorDeck as any)?.docID,
          module: 'asset',
        });
        setInvestorDeckUrl(response.url);
      }
    };
    fetchInvestorDeckUrl();
  }, [documents]);

  const handleSectionContent = (itemData: any, finalTitle, key?: any) => {
    const isSameTitle = itemData.title === finalTitle;

    const finalContent = (
      <div
        className={`${styles.ContentSection}`}
        id={itemData.title}
        key={`${itemData.title}_${key}`}
      >
        {itemData?.isDynamicContent ? (
          itemData?.content
        ) : (
          <div
            className={`${styles.ContentList} ${styles.contentDescription}`}
            dangerouslySetInnerHTML={{
              __html: htmlSanitizer(processContent(itemData.content)),
            }}
          />
        )}
      </div>
    );

    if (isSameTitle) {
      return finalContent;
    }

    return (
      <Accordian
        title={itemData.title}
        defaultValue={key === 0}
        titleClassName={styles.ContentTitle}
        containerClass={styles.AccordianContainer}
        size={24}
        key={`${itemData.title}_${key}`}
        toggleCallback={() => {
          trackEvent('Asset Detail Tab Accordian Clicked', {
            title: itemData.title,
            tab_name: itemData.page,
            asset_id: itemData.moduleID,
          });
        }}
      >
        {finalContent}
      </Accordian>
    );
  };

  const renderSectionTitle = (title: string, extraClass?: any) => {
    return (
      <h3
        className={`${styles.TabSectionTitle} ${handleExtraProps(extraClass)}`}
      >
        {title}
      </h3>
    );
  };

  const handleRenderContent = () => {
    if (data.length === 0) {
      return null;
    }

    const finalTitle = isPartnerSection ? 'About Partners' : data?.[0]?.page;

    const finalDataMap = isPartnerSection
      ? data.map((item: any, index: number) => {
          const itemData = item[Object.keys(item)?.[0]];
          return (
            <div
              className={`PartnerWrapper ${styles.ContentSection}`}
              id={Object.keys(item)?.[0]}
              key={item?.title}
            >
              {itemData?.map((eleInnner: any) => {
                return handleSectionContent(eleInnner, finalTitle, index);
              })}
            </div>
          );
        })
      : data.map((item: any, index: number) => {
          return handleSectionContent(item, finalTitle, index);
        });

    return (
      <>
        {renderSectionTitle(finalTitle)}
        <div
          className={`${styles.TabScrollContent} TabScrollContent`}
          id={`InnerScrollParent_${id}`}
        >
          <div
            className={`${styles.TabScrollContentRight} ${
              compactContent ? styles.Compact : ''
            }`}
          >
            {finalDataMap}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={`${handleExtraProps(className)}`} id={id}>
      {investorDeckUrl ? (
        <PDFViewer url={investorDeckUrl} />
      ) : (
        handleRenderContent()
      )}
    </div>
  );
};

export default AssetDealContent;
