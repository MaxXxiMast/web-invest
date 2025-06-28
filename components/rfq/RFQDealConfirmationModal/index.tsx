import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import ProgressBar from '../ProgressBar';
import { RFQDealConfirmationModalProps } from '../types';
import styles from './RFQDealConfirmationModal.module.css';

function RFQDealConfirmationModal({
  open = false,
  close,
}: RFQDealConfirmationModalProps) {
  return (
    <MaterialModalPopup
      hideClose
      isModalDrawer
      showModal={open}
      handleModalClose={close}
      drawerExtraClass={styles.mobilepopup}
      cardClass={styles.popupCard}
      className={styles.mainPopupInner}
    >
      <ProgressBar close={close} />
    </MaterialModalPopup>
  );
}

export default RFQDealConfirmationModal;
