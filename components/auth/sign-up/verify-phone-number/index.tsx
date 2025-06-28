import React from 'react';

// libraries
import phone from 'phone';
import PhoneInput from 'react-phone-input-2';

// utils
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';

// styles
import styles from './VerifyPhoneNumber.module.css';
import inputFieldstyles from '../../../../styles/helpers/inputFieldSet.module.css';

const VerifyPhoneNumber = ({
  otpSent,
  userLocation,
  loginValue,
  validateSecondaryInput,
  errorMsg,
  countryCode,
  renderClearButton,
  renderGetOtpButton,
  secondaryDataValidated,
  displayVerifyButton,
}) => {
  const isMobile = useMediaQuery();
  const [borderBox, setBorderBox] = React.useState('none');
  const [focus, setFocus] = React.useState(false);
  const handleFocus = (focus: boolean) => {
    if (focus) {
      setBorderBox('0px 0px 0px 4px #E5F1FF');
    } else {
      setBorderBox('');
    }
    setFocus(focus);
  };
  const getPhoneInputBorderStyle = () => {
    if (!errorMsg) {
      if (!loginValue?.slice(countryCode.length, loginValue.length) && !focus) {
        return '1px solid #C5C6D3';
      } else {
        return `1px solid #A8A9BD`;
      }
    } else {
      return '1px solid #FF5C5C';
    }
  };

  const getPhoneInputContainerStyle = () => {
    return {
      marginTop: isMobile ? 15 : 8,
      marginBottom: isMobile ? 0 : 8,
      border: getPhoneInputBorderStyle(),
      borderRadius: 5,
      boxShadow: errorMsg
        ? '0px 0px 0px 4px rgba(255, 92, 92, 0.2)'
        : borderBox,
    };
  };

  const getIsValidPhoneInput = (value: string) => {
    let mobileNumber = value;
    if (value.indexOf(countryCode) === 0) {
      mobileNumber = value?.slice(countryCode.length, value.length);
    }
    if (mobileNumber.length > 0) {
      let number = `${phone('+' + value)}`;
      if (number.length > 0) {
        return true;
      }
      return false;
    }
    return true;
  };

  return (
    <div className={styles.container}>
      <div className={styles.FieldWrapper}>
        <PhoneInput
          enableSearch
          autoFormat
          disabled={otpSent}
          countryCodeEditable={false}
          country={
            (userLocation && userLocation.country_code.toLowerCase()) || 'in'
          }
          value={loginValue}
          onChange={validateSecondaryInput}
          inputClass={`${inputFieldstyles.mailMobileInput}  ${styles.inputBoxContainer}`}
          containerClass={`${inputFieldstyles.inputFieldSet} ${styles.fieldDiv}`}
          searchClass={styles.countryCodeSearch}
          containerStyle={getPhoneInputContainerStyle()}
          onFocus={() => handleFocus(true)}
          onBlur={() => handleFocus(false)}
          inputProps={{
            id: 'altId',
            placeholder: 'Enter Mobile',
            autoComplete: 'off',
          }}
          placeholder={'Enter Mobile'}
          searchPlaceholder={'Enter country code or name'}
          isValid={getIsValidPhoneInput}
          defaultErrorMessage="Invalid contact number"
        />

        {loginValue.length > countryCode.length ? (
          <div
            className={`${styles.verifyButtonAndClearInputButtonContainer} items-align-center-row-wise`}
          >
            {otpSent ? renderClearButton('91') : null}

            {renderGetOtpButton(
              !secondaryDataValidated || otpSent || !displayVerifyButton
            )}
          </div>
        ) : null}
      </div>

      {errorMsg ? <div className={styles.error}>{errorMsg}</div> : null}
    </div>
  );
};

export default VerifyPhoneNumber;
