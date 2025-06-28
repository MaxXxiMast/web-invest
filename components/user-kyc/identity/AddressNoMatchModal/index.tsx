// Components
import Button, { ButtonType } from '../../../primitives/Button';
import Image from '../../../primitives/Image';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';

// Styles
import styles from './AddressNoMatchModal.module.css';

type AddressNoMatchModal = {
  showModal: boolean;
  closeModal: () => void;
  address: string;
  handleCBUpdate: () => void;
  aadhaarXMLFlowCheck: boolean;
};

const AddressNoMatchModal = ({
  showModal,
  closeModal,
  address,
  handleCBUpdate,
  aadhaarXMLFlowCheck,
}: AddressNoMatchModal) => {
  return (
    <MaterialModalPopup
      hideClose
      isModalDrawer
      showModal={showModal}
      className={styles.ModalInner}
      drawerExtraClass={styles.Drawer}
      cardClass={styles.CardClass}
    >
      <div className={styles.Title}>
        Address not the same as your current address?
      </div>
      <div className={styles.AddressContainer}>
        <div
          className={`flex items-center justify-center ${styles.UserLocationImage}`}
        >
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/user-location.svg`}
            width={24}
            height={24}
            layout="fixed"
            alt="User Location"
          />
        </div>
        <span>{address?.replace(/,/g, ', ')}</span>
      </div>
      <div className={`flex-column ${styles.ButtonsContainer}`}>
        <Button
          width={'100%'}
          variant={ButtonType.Primary}
          className={styles.RightBtn}
          onClick={closeModal}
        >
          I am okay to proceed
        </Button>

        <Button
          variant={ButtonType.Inverted}
          width={'100%'}
          onClick={handleCBUpdate}
          className={styles.RightBtn}
        >
          {aadhaarXMLFlowCheck ? 'I want to update' : 'Update via DigiLocker'}
        </Button>
      </div>
    </MaterialModalPopup>
  );
};

export default AddressNoMatchModal;
