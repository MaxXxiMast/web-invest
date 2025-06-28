import { useEffect, useState } from 'react';

// Context
import { useKycContext } from '../../../contexts/kycContext';

// Components
import DematAdd from '../financial/demat-add';
import KycLiveness from '../identity/liveness';
import NomineeForm from '.';
import KycSignature from '../identity/signature';
import CircularProgressLoader from '../../primitives/CircularProgressLoader';

// Utils
import { checkActiveStep, checkSkipActiveStep } from '../utils/helper';
import { getEnv } from '../../../utils/constants';
import { GoogleOAuthProvider } from '../../../utils/googleOauth';
import { getSecret } from '../../../api/secrets';

// Styles
import classes from './Nominee.module.css';

const Nominee = () => {
  const { completedKycSteps } = useKycContext();
  const [ecasGoogleClientId, setEcasGoogleClientId] = useState('');

  const activeStepValue = () => {
    const isNomineeVerified = checkActiveStep(completedKycSteps, 'nominee');

    const isLivenessVerified = checkSkipActiveStep(
      completedKycSteps,
      'liveness'
    );
    const isSignatureVerified = checkActiveStep(completedKycSteps, 'signature');

    // IF Nominee is not verified then show nominee form
    if (!isNomineeVerified) {
      return 0;
    }

    if (!isLivenessVerified) {
      return 1;
    }

    if (!isSignatureVerified) {
      return 2;
    }

    return 3;
  };

  useEffect(() => {
    const fetchEcasGoogleId = async () => {
      try {
        // google auth provider expecting some string value for client id
        const res = await getSecret('google.email_client_credentials');
        const ecasGoogleClientId = JSON.parse(res?.value);
        const platform = 'web';
        const env = getEnv() === 'development' ? 'test' : 'production';
        const clientId =
          ecasGoogleClientId?.[platform]?.[env]?.client_id ?? ' ';
        setEcasGoogleClientId(clientId);
      } catch (error) {
        console.log(error);
      }
    };
    fetchEcasGoogleId();
  }, []);

  const renderSteps = () => {
    const stepData = activeStepValue();

    switch (stepData) {
      case 0:
        return <NomineeForm />;
      case 1:
        return <KycLiveness />;
      case 2:
        return <KycSignature />;
      case 3:
        return (
          <>
            {ecasGoogleClientId ? (
              <GoogleOAuthProvider clientId={ecasGoogleClientId}>
                <DematAdd />
              </GoogleOAuthProvider>
            ) : (
              <CircularProgressLoader size={30} />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <hr className={classes.MobileHr} />
      {renderSteps()}
    </>
  );
};

export default Nominee;
