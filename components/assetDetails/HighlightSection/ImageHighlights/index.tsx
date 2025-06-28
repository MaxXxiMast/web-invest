//Node Modules
import React, { useEffect, useRef, useState } from 'react';

//Components
import HighlightLabel from '../HighlightLabel';
import Button, { ButtonType } from '../../../primitives/Button';

//utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../../utils/string';

//Styles
import styles from './ImageHighlights.module.css';

const ImageHighlights = ({
  bannerData = {},
  handleModal = (type: string) => {},
  showSeeMore = true,
  className = '',
  isFallbackCard = false,
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(
        contentRef.current.scrollHeight > contentRef.current.offsetHeight
      );
    }
  }, [bannerData]);

  const handlButton = () => {
    handleModal('imgHighlights');
  };

  const getUrlFromData = (content: any) => {
    const urlRegex = /(https?:\/\/[^\s<>"]+)/;
    const match = content?.match(urlRegex);
    return match ? match[0] : null;
  };

  const renderBanner = (data: any, bannerTitle: string, _idx: number) => (
    <>
      {!isFallbackCard ? (
        <>
          {getUrlFromData(data?.content) ? (
            <img
              src={getUrlFromData(data?.content)}
              alt={`${bannerTitle}_${_idx}`}
              loading="lazy"
              decoding="async"
              className={
                bannerTitle === 'key highlights'
                  ? styles.borderAndBackground
                  : ''
              }
            />
          ) : null}
        </>
      ) : (
        <div
          className={`flex flex-column gap-2 items-center justify-center ${styles.fallbackCard}`}
        >
          <img
            src={`${GRIP_INVEST_BUCKET_URL}${data?.content}`}
            alt={data?.alt}
            loading="lazy"
            decoding="async"
            className={
              bannerTitle === 'key highlights' ? styles.borderAndBackground : ''
            }
          />
          <p className={styles.featureText}>{data?.featureText}</p>
        </div>
      )}
    </>
  );

  return (
    <div
      ref={contentRef}
      className={`${styles.imgHighlightsContainer} ${handleExtraProps(
        className
      )}`}
    >
      {Object.keys(bannerData).map((bannerTitle) => (
        <React.Fragment key={bannerTitle}>
          <HighlightLabel label={bannerTitle} />
          <div className={styles.bannerContainer}>
            {(bannerData?.[bannerTitle] ?? [])?.map(
              (data: any, _idx: number) => (
                <React.Fragment key={bannerTitle}>
                  <div className={styles.bannerImage}>
                    {renderBanner(data, bannerTitle, _idx)}
                  </div>
                </React.Fragment>
              )
            )}
          </div>
        </React.Fragment>
      ))}
      {showSeeMore && isOverflowing && (
        <div className={styles.bgShadow}>
          <Button
            className={styles.seeMoreCta}
            width={'100%'}
            variant={ButtonType.BorderLess}
            onClick={handlButton}
          >
            See more
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageHighlights;
