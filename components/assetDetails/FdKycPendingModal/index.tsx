// Components
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import FDKYCPending from './FDKYCPending';

// Styles
import styles from './FdKycPendingModal.module.css';

type FdKycPendingModalProps = {
  showModal: boolean;
  setShowModal: (val: boolean) => void;
};

const FdKycPendingModal = ({
  showModal,
  setShowModal,
}: FdKycPendingModalProps) => {
  return (
    <MaterialModalPopup
      showModal={showModal}
      className={styles.container}
      isModalDrawer
      handleModalClose={() => setShowModal(false)}
    >
      <FDKYCPending setShowModal={setShowModal} />
    </MaterialModalPopup>
  );
};

export default FdKycPendingModal;
