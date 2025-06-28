import React from 'react';

import { Image } from '../../../../design-systems/components';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';
import DematIDExplanation from '../DematIDExplanation';
import BrokerDetails from '../BrokerDetails';

import { getStrapiMediaS3Url } from '../../../../utils/media';
import { DematCard } from './utils';

import styles from './DematModal.module.css';

type DematModalProp = {
  onCloseModal: () => void;
  modalData: DematCard | null;
  isMobile: boolean;
  feedback: () => void;
  onBackClick: () => void;
};

const DematModal = ({
  onCloseModal = () => {},
  modalData = null,
  isMobile = false,
  feedback = () => {},
  onBackClick = () => {},
}: DematModalProp) => {
  const showModal = Boolean(modalData);
  const modalType = modalData?.modalType;
  const isVisible =
    (isMobile && modalData?.showOnMobile) ||
    (!isMobile && modalData?.showOnDesktop);

  if (isVisible && modalType === 'sequence')
    return (
      <MaterialModalPopup
        isModalDrawer
        className={styles.seqModal}
        cardClass={styles.cardClass}
        showModal={showModal}
        handleModalClose={onCloseModal}
      >
        <h3 className={styles.modalTitle}>{modalData?.modalTitle}</h3>
        <div className={styles.stepsContainer}>
          {modalData?.modalContent?.map((data, _idx) => {
            const descrImg = getStrapiMediaS3Url(
              data?.descriptionImage?.desktopUrl
            );
            return (
              <div
                key={data?.heading}
                className={`${styles.cardContainer} flex gap-12 justify-start mt-20`}
              >
                <div className={styles.sequenceSection}>
                  <h4
                    className={`flex items-center justify-center ${styles.seqNumbers}`}
                  >
                    {_idx + 1}
                  </h4>
                </div>
                {_idx + 1 !== modalData?.modalContent?.length ? (
                  <h4 className={styles.seqLine}></h4>
                ) : null}
                <div className="flex-column gap-8">
                  <div className={`${styles.heading}`}>{data?.heading}</div>
                  <div
                    className={`flex ${styles.stepSection} items-center justify-start`}
                  >
                    {descrImg ? (
                      <div className={styles.descImg}>
                        <Image src={descrImg} alt={data?.heading} />
                      </div>
                    ) : null}

                    <div className={styles.SubHeadingText}>
                      <span>{data?.description}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </MaterialModalPopup>
    );

  if (isVisible && modalType === 'multiple')
    return (
      <BrokerDetails
        open={showModal}
        onCloseModal={onCloseModal}
        onBackClick={onCloseModal}
        modalData={modalData}
      />
    );

  /* What is Demat/BO ID ? */
  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={showModal}
      handleModalClose={onCloseModal}
    >
      <DematIDExplanation
        modalData={modalData}
        isAccordian={false}
        handleModalClose={onCloseModal}
        feedback={feedback}
        backButtonClick={onBackClick}
      />
    </MaterialModalPopup>
  );
};

export default DematModal;
