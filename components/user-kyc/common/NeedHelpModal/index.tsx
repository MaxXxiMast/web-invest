import React from 'react';
import Image from '../../../primitives/Image';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import styles from './NeedHelpModal.module.css';

type NeedHelpModalProps = {
  showModal: boolean;
  modalData: any;
  onClose: () => void;
  onCardClick: (cardID: string) => void;
};

const NeedHelpModal: React.FC<NeedHelpModalProps> = ({
  showModal: isOpen,
  onClose,
  modalData,
  onCardClick,
}) => {
  const handleCardClick = (card: any) => {
    console.log(`Clicked on ${card.title}`);
    if (onCardClick) {
      onCardClick(card); // Send selected card data back to parent
    }
  };

  const renderCards = () =>
    modalData
      ?.filter(
        (card) => card?.cardID === 'DematMeans' || card?.cardID === 'NoDemat'
      )
      ?.map((card) => (
        <div
          key={card.cardID}
          className={`items-align-center-row-wise ${styles.LinkContainer}`}
          onClick={() => handleCardClick(card)}
        >
          <span className={styles.LinkText}>{card.title}</span>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/ForwardIcon.svg`}
            width={12}
            height={12}
            layout="fixed"
            alt="Arrow"
          />
        </div>
      ));

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={isOpen}
      handleModalClose={onClose}
      className={styles.seqModal}
      cardClass={styles.cardClass}
    >
      <h3 className={styles.modalTitle}>Need Help?</h3>

      <div className={`flex-column ${styles.QuickHelpContainer}`}>
        {renderCards()}
      </div>
    </MaterialModalPopup>
  );
};

export default NeedHelpModal;
