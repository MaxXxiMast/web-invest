import React, { useEffect, useState } from 'react';

// Components
import Image from '../../../primitives/Image';
import InputFieldSet from '../../../common/inputFieldSet';
import Button, { ButtonType } from '../../../primitives/Button';

// APIs
import { callErrorToast } from '../../../../api/strapi';
import { sendAadhaarOTP, verifyAadhaarOTP } from '../../../../api/rfqKyc';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import { splitStringIntoEqualParts } from '../../../user-kyc/identity/UpdateAddressUsingAadhaar/utils';
import { trackEvent } from '../../../../utils/gtm';

// Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

// Styles
import styles from './AadhaarXmlForm.module.css';

type AadhaarXmlFormProps = {
  setIsAadhaarOTPSent: (val: boolean) => void;
  setShowModal: (val: boolean) => void;
  verifyingAadhaar: boolean;
  setIsAadhaarVerified: (val: boolean) => void;
  setIsAadhaarOTPEntered: (val: boolean) => void;
  setVerifyingAadhaar: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
};

const AadhaarXmlForm = ({
  setIsAadhaarOTPSent,
  setShowModal,
  verifyingAadhaar,
  setIsAadhaarVerified,
  setIsAadhaarOTPEntered,
  setVerifyingAadhaar,
  setIsLoading,
}: AadhaarXmlFormProps) => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState({
    aadhaar: '',
    otp: '',
  });
  const [seconds, setSeconds] = useState(0);
  const [otp, setOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [requestId, setRequestId] = useState('');

  const { assetID, name, productSubcategory } = useAppSelector(
    (state) => state.assets.selectedAsset
  );

  const handleAadhaarInput = (e: any) => {
    const value = e.target.value;
    if (!isNaN(value.replaceAll('-', '')) && value.length <= 14) {
      setAadhaarNumber(
        splitStringIntoEqualParts(value.replaceAll('-', '')).join('-')
      );
    }
  };

  const handleOTPInput = (e: any) => {
    const value = e.target.value;
    if (!isNaN(value) && value.length <= 6) {
      setOtp(value);
    }
  };

  const clearInput = () => {
    setAadhaarNumber('');
    setOtpSent(false);
    setSeconds(0);
    setOtp('');
    setError({
      aadhaar: '',
      otp: '',
    });
  };

  const sendOTP = async () => {
    trackEvent('FD Aadhaar Get OTP', {
      fd_name: name,
      fd_type: productSubcategory,
      asset_id: assetID,
    });
    try {
      setSeconds(60);
      const res = await sendAadhaarOTP(aadhaarNumber.replaceAll('-', ''));
      setRequestId(res.requestId);
      setOtpSent(true);
      setError({
        ...error,
        aadhaar: '',
      });
      setIsAadhaarOTPSent(true);
    } catch (error) {
      setSeconds(0);
      callErrorToast(
        error.message || error.message[0] || 'Something went wrong'
      );
    }
  };

  useEffect(() => {
    if (seconds > 0) {
      const timerId = setTimeout(() => {
        setSeconds(seconds - 1);
      }, 1000);

      return () => clearTimeout(timerId);
    }
  }, [seconds]);

  const counterString = () => {
    let secondsString =
      seconds < 10
        ? `0${seconds}`
        : (seconds % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    return Math.floor(seconds / 60) + ':' + secondsString;
  };

  const verifyAadhaar = async () => {
    try {
      await verifyAadhaarOTP(requestId, aadhaarNumber.replaceAll('-', ''), otp);
      setSeconds(0);
      setIsOtpVerified(true);
      setIsAadhaarVerified(true);
    } catch (error) {
      if (error.message === 'Invalid OTP') {
        setError((prev) => ({
          ...prev,
          otp: 'Invalid OTP',
        }));
        setIsLoading(false);
        setVerifyingAadhaar(false);
      } else {
        setShowModal(false);
        callErrorToast(error.message || 'Something went wrong');
      }
    }
  };

  useEffect(() => {
    if (verifyingAadhaar) {
      verifyAadhaar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyingAadhaar]);

  useEffect(() => {
    if (otp.length === 6) {
      setIsAadhaarOTPEntered(true);
    } else {
      setIsAadhaarOTPEntered(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const getOTPText = !otpSent
    ? 'Get OTP'
    : seconds !== 0
    ? 'Resend ' + `in ${counterString()}`
    : 'Resend OTP';

  return (
    <div className={styles.container}>
      <h2>Please verify your Aadhaar via OTP</h2>
      <p>OTP based Verification is mandated by RBI for Booking FDs</p>
      <InputFieldSet
        placeHolder={`Enter 12 digit Aadhaar no`}
        label={`Enter 12 digit Aadhaar no`}
        type="text"
        onChange={handleAadhaarInput}
        value={
          otpSent ? 'xxxx-xxxx-' + aadhaarNumber?.slice(-4) : aadhaarNumber
        }
        disabled={otpSent}
        inputContainerClassName={styles.inputFieldSet}
        error={error.aadhaar.length > 0}
        errorMsg={error.aadhaar}
        inputMode="numeric"
      >
        {aadhaarNumber.length > 0 ? (
          <div
            className={`${styles.verifyButtonAndClearInputButtonContainer} items-align-center-row-wise`}
          >
            <button
              className={styles.clearInputButton}
              onClick={() => clearInput()}
            >
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}icons/close-circle-red.svg`}
                alt="clear"
                width={20}
                height={20}
                layout="fixed"
              />
            </button>
            {aadhaarNumber.length === 14 && (
              <Button
                className={styles.getOTP}
                variant={ButtonType.PrimaryLight}
                onClick={sendOTP}
                isLoading={!(otpSent || seconds === 0)}
                disabled={seconds !== 0 || isOtpVerified}
              >
                {getOTPText}
              </Button>
            )}
          </div>
        ) : null}
      </InputFieldSet>
      {otpSent && (
        <>
          <InputFieldSet
            placeHolder={`Enter OTP`}
            label={`Enter OTP`}
            type="text"
            onChange={handleOTPInput}
            value={otp}
            inputContainerClassName={styles.inputFieldSet}
            error={error.otp.length > 0}
            errorMsg={error.otp}
            inputMode="numeric"
            disabled={isOtpVerified}
            inputId="otpInput"
          >
            {otp.length > 0 && !isOtpVerified ? (
              <div
                className={`${styles.verifyButtonAndClearInputButtonContainer} items-align-center-row-wise`}
              >
                <button
                  className={styles.clearInputButton}
                  onClick={() => setOtp('')}
                >
                  <Image
                    src={`${GRIP_INVEST_BUCKET_URL}icons/close-circle-red.svg`}
                    alt="clear"
                    width={20}
                    height={20}
                    layout="fixed"
                  />
                </button>
              </div>
            ) : null}
            {isOtpVerified && (
              <div
                className={`${styles.otpVerifiedIcon} items-align-center-row-wise`}
              >
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}icons/check-circle.svg`}
                  alt="clear"
                  width={25}
                  height={25}
                  layout="fixed"
                  className={styles.otpVerifiedIcon}
                />
              </div>
            )}
          </InputFieldSet>
          {isOtpVerified && (
            <span className={styles.otpVerifiedText}>Aadhaar Verified</span>
          )}
        </>
      )}
    </div>
  );
};

export default AadhaarXmlForm;
