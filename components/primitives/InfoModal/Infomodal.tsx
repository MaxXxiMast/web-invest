import React from 'react';
import dompurify from 'dompurify';
import MaterialModalPopup from '../MaterialModalPopup';
import styles from './Infomodal.module.css';

type Props = {
  showModal: boolean;
  modalTitle?: string;
  modalContent?: string;
  handleModalClose?: () => void;
  isModalDrawer?: boolean;
  className?: string;
  isHTML?: boolean;
  iconName?: string;
};

const InfoModal = ({
  showModal = false,
  modalTitle = '',
  handleModalClose = () => {},
  modalContent = '',
  isModalDrawer = true,
  className = '',
  isHTML = false,
  iconName = `icon-question`,
}: Props) => {
  const sanitizer = dompurify.sanitize;
  return (
    <MaterialModalPopup
      showModal={showModal}
      isModalDrawer={isModalDrawer}
      className={className}
      handleModalClose={handleModalClose}
    >
      <div className={`flex items-center ${styles.CardHeader}`}>
        <div className={`flex items-center ${styles.CardHeaderLeft}`}>
          <span
            className={`flex items-center justify-center ${styles.ImageIcon}`}
          >
            <span className={`${iconName} ${styles.Icon}`} />
          </span>
          {Boolean(modalTitle) && (
            <span className={styles.Label}>{modalTitle}</span>
          )}
        </div>
      </div>
      <div
        className={`${styles.CardBody} CardBody`}
        dangerouslySetInnerHTML={{
          __html: isHTML ? sanitizer(modalContent) : modalContent,
        }}
      />
      <div className={`${styles.CardFooter} CardFooter`}>
        <span onClick={() => handleModalClose()}>OKAY</span>
      </div>
    </MaterialModalPopup>
  );
};

export default InfoModal;
