// NODE MODULES
import { useSelector } from 'react-redux';

// Utils
import { trackEvent } from '../../../../utils/gtm';
import { noDematAccountData } from '../../utils/financialUtils';

// Components
import Button, { ButtonType } from '../../../primitives/Button';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';

// Styles
import styles from './DematIDModal.module.css';

type DematIDModalProps = {
  showModal: boolean;
  onCloseModal: () => void;
};

function DematIDModal({ showModal, onCloseModal }: DematIDModalProps) {
  // GET UserID
  const { userID = '' } = useSelector(
    (state) => (state as any)?.user?.userData ?? {}
  );

  const onClickUnderstood = async () => {
    trackEvent('click_demat_understood', {
      userID: userID,
      timestamp: new Date(),
    });
    onCloseModal();
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={showModal}
      cardClass={styles.ModalPopupCard}
      drawerExtraClass={styles.ModalDrawer}
      handleModalClose={onCloseModal}
    >
      <div className={`flex-column ${styles.MainContainer}`}>
        {noDematAccountData.map(({ heading, subHeading }) => {
          return (
            <div className={`flex-column ${styles.Container}`} key={heading}>
              <span className={styles.HeadingText}>{heading}</span>
              <span
                className={styles.SubHeadingText}
                dangerouslySetInnerHTML={{
                  __html: subHeading,
                }}
              />
            </div>
          );
        })}
      </div>
      <Button
        variant={ButtonType.Primary}
        width={'100%'}
        onClick={onClickUnderstood}
      >
        Okay, understood
      </Button>
    </MaterialModalPopup>
  );
}
export default DematIDModal;
