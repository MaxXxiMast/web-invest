import React, { useEffect, useState } from 'react';

// Components
import LayoutFooter from '../../footer';
import Image from '../../../primitives/Image';
import GenericModal from '../../common/GenericModal';
import InputFieldSet from '../../../common/inputFieldSet';
import Button, { ButtonType } from '../../../primitives/Button';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';

// APIs
import { sendAadhaarOTP, verifyAadhaarOTP } from '../../../../api/rfqKyc';

// Contexts
import { useKycContext } from '../../../../contexts/kycContext';

// Utils
import { trackEvent } from '../../../../utils/gtm';
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';

// Utils
import { modalsData } from '../pan/utils';
import { errors, splitStringIntoEqualParts } from './utils';
import { callErrorToast } from '../../../../api/strapi';

// Styles
import styles from './UpdateAddressUsingAadhaar.module.css';

const UpdateAddressUsingAadhaar: ({
  updateViaDigilocker,
  checkDigilockerHealth,
}: {
  updateViaDigilocker: () => void;
  checkDigilockerHealth: (showToast?: boolean) => Promise<boolean>;
}) => any = ({ updateViaDigilocker, checkDigilockerHealth }) => {
  const { updateCompletedKycSteps, updateKycContextValue, kycValues } =
    useKycContext();

  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [error, setError] = useState({
    aadhaar: '',
    otp: '',
  });
  const [success, setSuccess] = useState(false);
  const [showNameMismatchPopup, setShowNameMismatchPopup] = useState(false);
  const [showAttemptLimitExceededPopup, setShowAttemptLimitExceededPopup] =
    useState(false);
  const [showUnexpectedErrorPopup, setShowUnexpectedErrorPopup] =
    useState(false);

  const [seconds, setSeconds] = useState(0);
  const [resendOtpCount, setResendOtpCount] = useState(-1);

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
    setShowNameMismatchPopup(false);
    setAadhaarNumber('');
    setOtpSent(false);
    setSeconds(0);
    setOtp('');
    setError({
      aadhaar: '',
      otp: '',
    });
  };

  const handleError = (err: any) => {
    callErrorToast(
      'We are facing some issues with our partner. Please continue with Digilocker.'
    );
    setTimeout(() => updateViaDigilocker(), 1500);
    trackEvent('kyc_error', {
      error_heading: 'Unexpected Error',
      payload: err,
    });
  };

  const sendOTP = async () => {
    try {
      setSeconds(60);
      const isPartnerServiceActive = await checkDigilockerHealth();
      if (!isPartnerServiceActive) return;
      const res = await sendAadhaarOTP(aadhaarNumber.replaceAll('-', ''));
      setRequestId(res.requestId);
      setOtpSent(true);
      setError({
        ...error,
        aadhaar: '',
      });
      if (resendOtpCount + 1 > 0) {
        trackEvent('resend_otp_xml', {
          Count: resendOtpCount + 1,
        });
      } else {
        trackEvent('get_otp_xml', {
          status: 'success',
        });
      }
      setResendOtpCount(resendOtpCount + 1);
    } catch (error) {
      setSeconds(0);
      if (
        error?.message?.[0] ===
        'Invalid Aadhaar Number, Please enter a valid Aadhaar Number.'
      ) {
        setError({
          ...error,
          aadhaar: 'Please enter valid Aadhaar number',
        });
        trackEvent('kyc_error', {
          error_heading: 'Aadhaar number is not valid',
        });
      } else if (error?.message === 'User Blocked For 24 Hrs') {
        setShowAttemptLimitExceededPopup(true);
        trackEvent('kyc_error', {
          error_heading: 'Attempt Limit Exceeded',
        });
      } else {
        handleError(error);
      }
    }
  };

  const handleFooterClick = async () => {

    try {
      trackEvent('kyc_poa_added', {
        method: 'aadhaar_xml',
        adhaar_fetched: 'false',      
        manual_verification: 'true',  
    });
      setVerifying(true);
      const isPartnerServiceActive = await checkDigilockerHealth();
      if (!isPartnerServiceActive) return;
      const res = await verifyAadhaarOTP(
        requestId,
        aadhaarNumber.replaceAll('-', ''),
        otp
      );
      if (!Object.keys(res)?.length) {
        setVerifying(false);
        return;
      }
      trackEvent('aadhaar_fetched', {
        status: 'success',
        poa_name: res.poaName,
        address_shown: res.addressShown,
        name_match_score: res.nameMatchScore,
      });
      setVerifying(false);
      setSuccess(true);
      setTimeout(() => {
        updateCompletedKycSteps({
          name: 'address',
          status: 1,
        });
        updateKycContextValue({
          address: {
            ...(kycValues as any)?.address,
            ...res,
            moduleType: 'aadhaar_xml',
            status: 1,
            xmlStatus: 1,
          },
        });
      }, 2000);
    } catch (error) {
      trackEvent('aadhaar_fetched', {
        status: 'failure',
      });
      setVerifying(false);
      if (
        error?.message === 'Invalid OTP' ||
        error?.message?.includes('Invalid OTP')
      ) {
        setError((prev) => ({
          ...prev,
          otp: 'Please enter valid OTP',
        }));
      } else if (
        error?.type === 'AADHAAR_XML_NAME_MISMATCH' ||
        error?.message?.includes('AADHAAR_XML_NAME_MISMATCH')
      ) {
        setShowNameMismatchPopup(true);
      } else {
        handleError(error);
      }
    }
  };

  useEffect(() => {
    const timeInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        clearInterval(timeInterval);
      }
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [seconds]);

  useEffect(() => {
    trackEvent('kyc_checkpoint', {
      module: 'aadhaar xml',
    });
  }, []);

  const counterString = () => {
    let secondsString =
      seconds < 10
        ? `0${seconds}`
        : (seconds % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    return Math.floor(seconds / 60) + ':' + secondsString;
  };

  const renderTitleAttemptExceeded = () => {
    if (showAttemptLimitExceededPopup) {
      return errors.attemptLimitExceeded.heading;
    }

    return errors.unexpected.heading;
  };

  const handleProceedToDigilocker = () => {
    setShowUnexpectedErrorPopup(false);
    setShowAttemptLimitExceededPopup(false);
    updateViaDigilocker();
  };

  return (
    <>
      <div className={`flex-column ${styles.FormFieldsContainer}`}>
        <p className={styles.heading}>
          Fetch via sharing OTP sent to Aadhaar linked mobile number.
        </p>
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
                  disabled={seconds !== 0}
                >
                  {!otpSent
                    ? 'Get OTP'
                    : seconds !== 0
                      ? 'Resend ' + `in ${counterString()}`
                      : 'Resend OTP'}
                </Button>
              )}
            </div>
          ) : null}
        </InputFieldSet>
        {!otpSent ? (
          <p
            className={`
              ${otpSent
                ? styles.proceedWithDigiDisabled
                : styles.proceedWithDigi
              } ${error.aadhaar.length || error.otp.length ? styles.mt_15 : ''}
            `}
            onClick={updateViaDigilocker}
          >
            Don’t have Aadhaar handy? Proceed with Digilocker
          </p>
        ) : (
          <InputFieldSet
            placeHolder={`Enter OTP`}
            label={`Enter OTP`}
            type="text"
            onChange={handleOTPInput}
            value={otp}
            disabled={false}
            inputContainerClassName={styles.inputFieldSet}
            error={error?.otp?.length > 0}
            errorMsg={error?.otp}
            inputMode="numeric"
            inputId="otpInput"
          />
        )}
      </div>
      <LayoutFooter
        showMsg={true}
        renderOnlyButton={false}
        isFooterBtnDisabled={!otpSent || otp.length !== 6}
        isLoading={false}
        handleBtnClick={handleFooterClick}
      />
      {/* VERIFYING AADHAAR MODAL */}
      <GenericModal
        showModal={verifying}
        lottieType={modalsData.aadhaar.lottieType}
        title={modalsData.aadhaar.title}
        subtitle={modalsData.aadhaar.subTitle}
        className={styles.FetchModal}
        iconHeight={68}
        iconWidth={68}
      />
      {/* VERIFYING AADHAAR MODAL */}
      <GenericModal
        showModal={success}
        lottieType={modalsData.aadhaarVerified.lottieType}
        title={modalsData.aadhaarVerified.title}
        subtitle={modalsData.aadhaarVerified.subTitle}
        className={styles.FetchModal}
        iconHeight={68}
        iconWidth={68}
      />
      {/* NAME MISMATCH MODAL */}
      <MaterialModalPopup
        showModal={showNameMismatchPopup}
        hideClose
        className={styles.nameMismatchPopup}
      >
        <div className="items-align-center-column-wise">
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/DangerTriangle.svg`}
            alt="alert"
            width={60}
            height={60}
            layout="intrinsic"
          />
          <p className={styles.nameMismatchMsg}>
            Aadhaar details don’t match with PAN details, Please enter relevant
            Aadhaar number
          </p>
          <Button width={'100%'} onClick={clearInput}>
            Retry
          </Button>
        </div>
      </MaterialModalPopup>
      {/* ATTEMPT LIMIT EXCEEDED POPUP */}
      <GenericModal
        showModal={showAttemptLimitExceededPopup || showUnexpectedErrorPopup}
        title={renderTitleAttemptExceeded()}
        subtitle={
          showAttemptLimitExceededPopup
            ? errors.attemptLimitExceeded.msg
            : errors.unexpected.msg
        }
        btnText={'Proceed to Digilocker'}
        handleBtnClick={handleProceedToDigilocker}
        className={styles.attemptLimitExceededPopup}
        icon="DangerTriangle.svg"
      />
    </>
  );
};

export default UpdateAddressUsingAadhaar;
