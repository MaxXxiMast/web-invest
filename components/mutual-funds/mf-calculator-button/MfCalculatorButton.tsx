import { useRouter } from 'next/router';

// Components
import Button from '../../primitives/Button';
import UserKycStatus from '../../assetDetails/user-kyc-status';

//Redux
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { setMfData, setOpenMFStepperLoader } from '../redux/mf';
import { getMFKycDetails, requestMfOtp } from '../../../api/mf';

//Utils
import { getOverallDefaultKycStatusMf } from '../utils/utils';
import { MFStepperLoader } from '../utils/types';

// API
import { callErrorToast, processError } from '../../../api/strapi';

// Styles
import styles from './MfCalculatorButton.module.css';

const MfCalculatorButton = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // GET KYC Data
  const { kycConfigStatus = {} } = useAppSelector(
    (state) => (state as any)?.user ?? {}
  );
  const { assetId, inputValue } = useAppSelector((state) => state?.mfConfig);

  const { isCalculatorBtnDisabled = false, isPaymentMethodsLoading = false } =
    useAppSelector((state) => (state as any)?.mfConfig ?? {});

  const status = getOverallDefaultKycStatusMf(kycConfigStatus);
  const isBtnDisabled =
    status === 'pending verification' || isCalculatorBtnDisabled;
  const isLoading = Object.keys(kycConfigStatus).length === 0;

  const getButtonText = () => {
    if (isLoading || isPaymentMethodsLoading) {
      return '';
    }
    if (['continue', 'pending', 'pending verification'].includes(status)) {
      return 'Complete KYC';
    }
    return 'Invest Now';
  };

  const requestOtp = async () => {
    if (assetId && inputValue) {
      const requestBody = {
        amount: Number(inputValue),
        assetID: assetId,
      };
      const response = await requestMfOtp(requestBody);
      if (response?.purchaseID) {
        dispatch(setMfData({ purchaseID: response.purchaseID }));
      }
    }
  };

  const handleStepperData = (data: MFStepperLoader) => {
    dispatch(setOpenMFStepperLoader(data));
  };

  const handleVerifiedUser = async () => {
    handleStepperData({ open: true, step: 0 });
    try {
      handleStepperData({ error: false, step: 0 });
      const res = await getMFKycDetails(); //Trigger MF KYC API
      if (res.status) {
        await requestOtp(); //Sucess Creating Order & AMC initialization
        handleStepperData({ open: true, step: 1 });
        handleStepperData({ open: true, step: 2 });
        setTimeout(() => {
          handleStepperData({ open: false });
          dispatch(setMfData({ isOTPModalOpen: true }));
        }, 2000);
      } else {
        // No case mentioned here https://gripinvest.atlassian.net/browse/PT-28612
        // @TODO Discuss & update, Temp handling scenario with throwing error
        callErrorToast('Investor Profile Creation failed, please try again !');
        handleStepperData({ error: true, open: false });
      }
    } catch (error) {
      //Error Creating Order or AMC initialization
      callErrorToast(processError(error));
      handleStepperData({ error: true });
      setTimeout(() => {
        handleStepperData({ open: false });
      }, 2000);
    }
  };

  const handleButtonClick = () => {
    if (isBtnDisabled) {
      return;
    }

    if (['continue', 'pending'].includes(status)) {
      router.push('/user-kyc');
    }

    if (status === 'verified') {
      handleVerifiedUser();
    }
  };

  const renderKycStatusMessage = () => {
    if (status !== 'pending verification') {
      return null;
    }
    return (
      <UserKycStatus
        message={
          'Your KYC process is under review. Please wait while we approve your KYC.'
        }
        className={styles.ProgressWidget}
      />
    );
  };

  return (
    <>
      {renderKycStatusMessage()}
      <Button
        onClick={() => handleButtonClick()}
        disabled={isBtnDisabled}
        isLoading={isLoading || isPaymentMethodsLoading}
        width={'100%'}
        id={'notifyMeButton'}
      >
        {getButtonText()}
      </Button>
    </>
  );
};
export default MfCalculatorButton;
