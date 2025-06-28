import React from 'react';

// components
import InputFieldSet from '../../../common/inputFieldSet';

// styles
import styles from './OTPInput.module.css';

const OTPInput = ({
  otpValue,
  handleOtpChange,
  seconds,
  otpSent,
  triggerOtp,
}) => {
  const counterString = () => {
    let secondsString =
      seconds < 10
        ? `0${seconds}`
        : (seconds % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    return Math.floor(seconds / 60) + ':' + secondsString;
  };
  return (
    <div className={styles.margin}>
      <InputFieldSet
        placeHolder={`otp`}
        label={`Enter OTP`}
        width={'100%'}
        type="number"
        onChange={(e) => handleOtpChange(e)}
        value={otpValue}
        error={false}
        className={'CompactInput'}
        extraStyles={{
          selectedBorder: 1,
        }}
      >
        {seconds === 0 ? (
          <button
            className={`${styles.resendButton}`}
            disabled={!otpSent}
            onClick={() => triggerOtp('Resend')}
          >
            Resend
          </button>
        ) : (
          <div className={styles.resendText}>
            Resend
            {seconds !== 0 ? <div> in {counterString()}</div> : null}
          </div>
        )}
      </InputFieldSet>
    </div>
  );
};

export default OTPInput;
