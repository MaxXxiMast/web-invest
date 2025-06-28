import { useState, useEffect } from 'react';

// Components
import Button from '../../primitives/Button';
import BackBtn from '../../primitives/BackBtn/BackBtn';
import MfOtpResendTimer from '../mf-otp-resend-timer/MfOtpResendTimer';
import InputFieldSet from '../../common/inputFieldSet';

// Redux
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { setMfData } from '../redux/mf';

// API
import { requestMfOtp, verifyMfOtp } from '../../../api/mf';
import { callErrorToast, processError } from '../../../api/strapi';

// styles
import styles from './MfOtpModal.module.css';

const OTPModal = () => {
  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState('');
  const userData = useAppSelector((state) => state?.user?.userData);
  const { assetId, inputValue, purchaseID } = useAppSelector(
    (state) => state?.mfConfig
  );

  const handleCloseModal = async (otp: string) => {
    dispatch(setMfData({ isOTPModalOpen: false }));
  };

  const handleSubmit = async () => {
    if (purchaseID && otp) {
      const requestBody = {
        purchaseID: purchaseID,
        otp: Number(otp),
      };
      try {
        const verifyData = await verifyMfOtp(requestBody);
        if (verifyData.success) {
          dispatch(setMfData({ isOTPModalOpen: false }));
        } else {
          callErrorToast('Invalid OTP');
        }
      } catch (error) {
        callErrorToast(processError(error));
      }
    }
  };

  const requestOtp = async () => {
    if (assetId && inputValue) {
      const requestBody = {
        amount: Number(inputValue),
        assetID: assetId,
      };
      try {
        const response = await requestMfOtp(requestBody);
        if (response?.purchaseID) {
          dispatch(setMfData({ purchaseID: response.purchaseID }));
        }
      } catch (error) {
        callErrorToast(processError(error));
      }
    }
  };

  const handleResend = () => {
    requestOtp();
  };

  const handleKeyPress = (e: any, type: string) => {
    let value = e.target.value;
    if (type === 'keyDown' && e.key === 'Enter' && otp.length === 4) {
      requestOtp();
    } else if (type === 'change' && value.length < 5) {
      if (!Number.isNaN(Number(value))) {
        setOtp(value);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setMfData({ purchaseID: '' }));
    };
  }, [dispatch]);

  return (
    <div className={styles.modalContent}>
      <div className={styles.modalInner}>
        <div className={`flex items-center ${styles.header}`}>
          <BackBtn handleBackEvent={handleCloseModal} />
          <div className={styles.title}>Authorise with OTP</div>
        </div>

        <div className={`flex-column ${styles.bodyText}`}>
          <p className={styles.instructions}>
            Enter the 4 digit OTP sent to your {` `}
            <br />
            <span data-testid="otp-instructions">
              {userData?.emailID} & {userData?.mobileNo}
            </span>
          </p>

          <InputFieldSet
            placeHolder="OTP"
            label="OTP"
            width={'100%'}
            maxLength={4}
            type="number"
            onChange={(e: any) => handleKeyPress(e, 'change')}
            value={otp}
            onKeyPress={(e: any) => handleKeyPress(e, 'keyDown')}
            className={'CompactInput'}
          />

          <div className={styles.resendContainer}>
            <MfOtpResendTimer onResend={handleResend} />
          </div>

          <Button
            width={'100%'}
            onClick={handleSubmit}
            disabled={otp.length !== 4}
            data-testid="confirm-button"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
