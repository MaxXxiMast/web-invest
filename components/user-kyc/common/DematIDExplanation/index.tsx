import { useState } from 'react';

import Image from '../../../primitives/Image';
import Button, { ButtonType } from '../../../primitives/Button';

import { DematCard, ModalContentType } from '../DematModal/utils';
import { getStrapiMediaS3Url } from '../../../../utils/media';
import { trackEvent } from '../../../../utils/gtm';

import styles from './DematIDExplanation.module.css';

type DematIDExplanationProps = {
  modalData: DematCard;
  isAccordian?: boolean;
  handleModalClose?: () => void;
  feedback?: () => void;
  backButtonClick?: () => void;
};

export default function DematIDExplanation({
  modalData,
  isAccordian = false,
  handleModalClose = () => { },
  feedback = () => { },
  backButtonClick = () => { },
}: DematIDExplanationProps) {
  const isDesktopAccordian = modalData?.isDesktopAccordian;
  const modalTitle = isDesktopAccordian
    ? modalData?.modalTitle
    : modalData?.title;

  const [showDetail, setShowDetails] = useState(false);

  const renderContent = (modalContent: ModalContentType) => {
    const descrImg = getStrapiMediaS3Url(
      modalContent?.descriptionImage?.desktopUrl
    );
    return (
      <div
        key={`_idx__${modalContent?.heading}`}
        className={`flex-column ${styles.SubHeadingText}`}
      >
        <div>{modalContent?.description}</div>

        {descrImg ? (
          <Image
            src={`${descrImg}`}
            // width={160}
            height={120}
            layout="intrinsic"
            alt={'Example Demat/BO ID'}
            className={styles.DematIDExample}
          />
        ) : null}

        {!isAccordian ? (
          <Button
            variant={ButtonType.Primary}
            width={'100%'}
            onClick={() => {
              modalData.cardID === 'NoDemat'
                ? feedback()
                : modalContent?.link?.clickUrl
                  ? window.open(modalContent.link.clickUrl, '_blank', 'noopener')
                  : handleModalClose();
            }}
          >
            <div className={`flex_wrapper  ${styles.ButtonDetails}`}>
              <span>{modalContent?.link?.title ?? 'Okay, understood'}</span>
            </div>
          </Button>
        ) : null}
        {modalData.cardID === 'NoDemat' ? (
          <>
            {isAccordian ? (
              <Button
                variant={ButtonType.BorderLess}
                width={'100%'}
                onClick={feedback}
              >
                <div className={`flex_wrapper  ${styles.ButtonDetails}`}>
                  <span>{modalContent?.link?.title}</span>
                </div>
              </Button>
            ) : (
              <Button
                variant={ButtonType.BorderLess}
                width={'100%'}
                onClick={handleModalClose}
              >
                <div className={`flex_wrapper  ${styles.ButtonDetails}`}>
                  <span>I don’t need help</span>
                </div>
              </Button>
            )}
          </>
        ) : null}
      </div>
    );
  };

  const handleShowDetails = () => {
    if (modalData.cardID === 'NoDemat' && !showDetail) {
      trackEvent('dont_have_demat', {
        type: 'No Demat',
        comment: 'Lead Gen - Do not have a demat account',
        module: 'depository',
        Accrdian: 'Dont have grip account',
      });
    }
    setShowDetails(!showDetail);
  };
  return (
    <div className={`${isDesktopAccordian ? styles.accordianContainer : ''}`}>
      <div>
        <div className={`${styles.Header} flex`} onClick={handleShowDetails}>
          <div className={styles.BackIcon} onClick={backButtonClick}>
            <span className={`icon-arrow-left ${styles.ArrowLeft}`} />
          </div>
          <h3 className={styles.HeadingText}>{modalTitle}</h3>
          {isAccordian ? (
            <span
              className={`${styles.CaretDown} ${showDetail ? styles.Rotate : ''
                }`}
            >
              <span className={`icon-caret-down ${styles.DownIcon}`} />
            </span>
          ) : null}
        </div>

        {showDetail || !isAccordian ? (
          <>{modalData?.modalContent?.map((data) => renderContent(data))}</>
        ) : null}
      </div>
    </div>
  );
}
