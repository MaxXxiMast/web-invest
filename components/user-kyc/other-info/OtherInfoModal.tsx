import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import Button, { ButtonType } from '../../primitives/Button';
import Image from '../../primitives/Image';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import classes from './OtherInfo.module.css';
import FlexClasses from '../../../styles/helpers/FlexHelpers.module.css';

type Props = {
  showModal: boolean;
  handleModalClose: () => void;
};

export const OtherInfoModal = ({
  showModal = false,
  handleModalClose,
}: Partial<Props>) => {
  return (
    <MaterialModalPopup
      showModal={showModal}
      hideClose
      drawerExtraClass={classes.ModalDrawer}
      isModalDrawer={true}
      handleModalClose={handleModalClose}
    >
      <div className={FlexClasses['items-align-center-column-wise']}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/KycPendingProfile.svg`}
          width={72}
          height={72}
          alt="Tick"
          layout="fixed"
        />
        <p className={classes.ModalContent}>
          Apologies, users against whom SEBI has taken action in the past cannot
          invest via this platform.
        </p>
        <Button
          className={classes.ModalConfirm}
          variant={ButtonType.Secondary}
          onClick={handleModalClose}
        >
          Okay Got It
        </Button>
      </div>
    </MaterialModalPopup>
  );
};
