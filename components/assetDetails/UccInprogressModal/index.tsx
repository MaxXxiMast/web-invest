import Button, { ButtonType } from '../../primitives/Button';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import Image from '../../primitives/Image';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { UccInProgressData } from '..';
import classes from './UccInprogressModal.module.css';

type Props = {
  showModal: boolean;
  isAmoOrder?: boolean;
  handleModalClose?: () => void;
};

const UccInprogressModal = ({
  showModal = false,
  isAmoOrder = false,
  handleModalClose,
}: Props) => {
  const { title, amoTitle, description, subtitle } = UccInProgressData;
  return (
    <MaterialModalPopup
      showModal={showModal}
      showCloseBtn={false}
      className={classes.UCCModal}
      isModalDrawer
    >
      <div className={classes.Wrapper}>
        <div className={classes.Icon}>
          <div className={`justify-center items-center ${classes.IconWrapper}`}>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/user-setting.svg`}
              layout="fixed"
              width={32}
              height={32}
              alt="User setting"
            />
          </div>
        </div>
        <h3>{isAmoOrder ? amoTitle : title}</h3>
        <p>{description}</p>
        <p>{subtitle}</p>
        <Button
          width={'100%'}
          className={classes.Btn}
          variant={ButtonType.Secondary}
          onClick={handleModalClose}
        >
          Okay, understood
        </Button>
      </div>
    </MaterialModalPopup>
  );
};

export default UccInprogressModal;
