import React, { useEffect, useState } from 'react';
import styles from './MfOtpResendTimer.module.css';

const MfOtpResendTimer = ({ duration = 30, onResend }) => {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (secondsLeft > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleResendClick = () => {
    if (canResend) {
      setSecondsLeft(duration); // Reset timer
      if (onResend) onResend(); // Fire event
    }
  };

  return (
    <button
      onClick={handleResendClick}
      disabled={!canResend}
      className={`${styles.resendButton} ${
        secondsLeft === 0 ? styles.active : ''
      }`}
      data-testid="resend-button"
    >
      {canResend
        ? 'Resend OTP'
        : `Resend OTP in ${secondsLeft < 10 ? '0' : ''}${secondsLeft} seconds`}
    </button>
  );
};

export default MfOtpResendTimer;
