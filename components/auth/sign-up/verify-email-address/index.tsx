import React from 'react';

// components
import InputFieldSet from '../../../common/inputFieldSet';

// utils
import { secondaryFieldName } from '../utils';

// styles
import styles from './VerifyEmailAddress.module.css';

const VerifyEmailAddress = ({
  typeLoginID,
  loginValue,
  otpSent,
  errorMsg,
  validateSecondaryInput,
  renderClearButton,
  renderGetOtpButton,
  secondaryDataValidated,
  displayVerifyEmailButton,
}) => {
  return (
    <div className={styles.margin}>
      <div className={styles.FieldWrapper}>
        <InputFieldSet
          placeHolder={`${secondaryFieldName(typeLoginID).placeHolder}`}
          label={`${secondaryFieldName(typeLoginID).placeHolder}`}
          width={'100%'}
          type="text"
          onChange={(e: any) => validateSecondaryInput(e.target.value)}
          value={loginValue}
          disabled={otpSent}
          error={Boolean(errorMsg)}
          extraStyles={{
            selectedBorder: 1,
          }}
          customInputStyles={{
            height: 46,
            padding: '0 125px 0 20px',
          }}
        />
        {loginValue.length > 0 ? (
          <div
            className={`${styles.verifyButtonAndClearInputButtonContainer} items-align-center-row-wise`}
          >
            {otpSent ? renderClearButton('') : null}

            {renderGetOtpButton(
              !secondaryDataValidated ||
                otpSent ||
                !displayVerifyEmailButton ||
                Boolean(errorMsg)
            )}
          </div>
        ) : null}
      </div>

      {errorMsg ? <div className={styles.error}>{errorMsg}</div> : null}
    </div>
  );
};

export default VerifyEmailAddress;
