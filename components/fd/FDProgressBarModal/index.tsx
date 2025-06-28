// NODE MODULES
import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';

// Redux Hooks and Slices
import { useAppSelector } from '../../../redux/slices/hooks';
import {
  FDStepperLoader,
  setOpenFDStepperLoader,
} from '../../../redux/slices/fd';

// Styles
import styles from './FDProgressBarModal.module.css';

const MaterialModalPopup = dynamic(
  () => import('../../primitives/MaterialModalPopup'),
  {
    ssr: false,
  }
);

const ProgressBarStepper = dynamic(
  () => import('../../assetDetails/ProgressBarStepper'),
  {
    ssr: false,
  }
);

export default function FDProgressBarModal() {
  const dispatch = useDispatch();

  const { stepperLoader } = useAppSelector((state) => state.fdConfig);
  const ProgressBarSteps = {
    'Booking your High Yield FD with you chosen NBFC/Bank': [],
    'Securing payment via our FD Partner': [],
  };

  const handleStepperData = (data: FDStepperLoader) => {
    dispatch(setOpenFDStepperLoader(data));
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
        steps={ProgressBarSteps}
      />
    </MaterialModalPopup>
  );
}
