import AddressKYC from './Address';
import KycPanNumber from './pan-number';
import { useKycContext } from '../../../contexts/kycContext';
import { checkActiveStep, checkSkipActiveStep } from '../utils/helper';

import classes from './Identity.module.css';

const Identity = () => {
  const { completedKycSteps, kycValues } = useKycContext();

  const activeStepValue = () => {
    // When Pan is verified
    const isPanVerified = checkActiveStep(completedKycSteps, 'pan');

    const isAddressVerified = checkSkipActiveStep(completedKycSteps, 'address');
    const isLivenessVerified = checkSkipActiveStep(
      completedKycSteps,
      'liveness'
    );
    const isSignatureVerified = !checkActiveStep(
      completedKycSteps,
      'signature'
    );

    // When pan is not available
    if (!isPanVerified) {
      return 0;
    }

    const addressDetails: any = kycValues?.address ?? {};

    if (isPanVerified && !isAddressVerified && !addressDetails?.moduleType) {
      return 0;
    }

    /**
     * Address Screen Cases
     *
     * Case 1: When any of them available
     * Case 2: When KRA not fetched and digilocker data is fetched
     * Case 3: When KRA fetched and digilocker not fetched
     *
     */
    if (!isAddressVerified) {
      return 1;
    }

    if (!isLivenessVerified) {
      return 2;
    }

    if (isSignatureVerified) {
      return 3;
    }
  };

  const renderSteps = () => {
    const stepData = activeStepValue();

    switch (stepData) {
      case 0:
        return <KycPanNumber />;
      case 1:
        return <AddressKYC />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={classes.Stepper}>
        <hr className={classes.line} />
      </div>
      {renderSteps()}
    </>
  );
};

export default Identity;
