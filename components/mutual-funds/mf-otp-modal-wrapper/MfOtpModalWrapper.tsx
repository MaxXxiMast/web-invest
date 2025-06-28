// Redux
import { useAppSelector } from '../../../redux/slices/hooks';

// Components
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import OTPModal from '../mf-otp-modal/MfOtpModal';

// Styles
import styles from './MfOtpModalWrapper.module.css';

const MfOtpModalWrapper = () => {
  const isOTPModalOpen = useAppSelector(
    (state: any) => state.mfConfig.isOTPModalOpen
  );

  return (
    <MaterialModalPopup
      hideClose={true}
      showModal={isOTPModalOpen}
      mainClass={styles.OtpModal}
      isModalDrawer={true}
    >
      <OTPModal />
    </MaterialModalPopup>
  );
};

export default MfOtpModalWrapper;
