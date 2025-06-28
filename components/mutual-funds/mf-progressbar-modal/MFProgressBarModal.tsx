// Components
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import ProgressBarStepper from '../../assetDetails/ProgressBarStepper';

// Redux Hooks and Slices
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { setOpenMFStepperLoader } from '../redux/mf';
import { MFStepperLoader } from '../utils/types';

// Styles
import styles from './MFProgressBarModal.module.css';

const steps = {
  'Creating your Order': [],
  'Initialising with the AMC': [],
};

export default function MFProgressBarModal() {
  const dispatch = useAppDispatch();

  const { stepperLoader } = useAppSelector((state) => state.mfConfig);

  const handleStepperData = (data: MFStepperLoader) => {
    dispatch(setOpenMFStepperLoader(data));
  };

  return (
    <MaterialModalPopup
      hideClose
      isModalDrawer
      showModal={stepperLoader.open}
      handleModalClose={() => handleStepperData({ open: false })}
      className={styles.ProgressPopup}
    >
      <ProgressBarStepper
        activeStep={stepperLoader.step}
        error={stepperLoader.error}
        steps={steps}
      />
    </MaterialModalPopup>
  );
}
