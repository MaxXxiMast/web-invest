import React, { useEffect, useState } from 'react';

// libraries
import Cookie from 'js-cookie';

// components
import Seo from '../../components/layout/seo';
import Image from '../../components/primitives/Image';
import InputFieldSet from '../../components/common/inputFieldSet';
import PreLoginMobileHeader from '../../components/common/PreLoginMobileHeader';
import VerifyPhoneNumber from '../../components/auth/sign-up/verify-phone-number';
import VerifyEmailAddress from '../../components/auth/sign-up/verify-email-address';
import OTPInput from '../../components/auth/sign-up/otp-input';
import ReferralInput from '../../components/auth/sign-up/referral-input';

// utils
import {
  isMobileOrEmail,
  isValidName,
  capitalize,
  isValidEmail,
  GRIP_INVEST_BUCKET_URL,
  checkEmailValidation,
} from '../../utils/string';
import Button from '../../components/primitives/Button';
import { identifyClarityUser } from '../../utils/clarity';
import { fireCreateNewUser, trackEvent } from '../../utils/gtm';
import { secondaryFieldName } from '../../components/auth/sign-up/utils';
import MoengageWebServices from '../../utils/ThirdParty/moengage/moengage';

// api
import { sendAltOtp } from '../../api/user';
import { getSecret } from '../../api/secrets';
import { callErrorToast, callSuccessToast, fetchAPI } from '../../api/strapi';

// redux
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
import { fetchUserInfo, logout, updateUser } from '../../redux/slices/user';

// styles
import styles from './SignUp.module.css';
import 'react-phone-input-2/lib/material.css';

const AdditionalDetails = (props: any) => {
  const dispatch = useAppDispatch();
  const loginID = Cookie.get('loginID') || '';
  const typeLoginID = isMobileOrEmail(loginID);

  const user = useAppSelector((state) => state.user.userData);
  const access = useAppSelector((state) => state.access);

  const [firstName, setFName] = React.useState(access.firstName || '');
  const [lastName, setLName] = React.useState(access.lastName || '');
  const [validFName, setValidityFName] = React.useState(true);
  const [validLName, setValidityLName] = React.useState(true);
  const [loginValue, setLoginValue] = React.useState('');
  const [otpValue, setOtpValue] = React.useState('');
  const [reporting, setReporting] = React.useState('');
  const [seconds, setSeconds] = React.useState(0);
  const [experianConsent, setExperianConsent] = React.useState(false);
  const [whatsappConsent, setWhatsappConsent] = React.useState(true);
  const [disableReferral, setDisableReferral] = React.useState(false);
  const [countryCode, setCountryCode] = React.useState('91');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [displayVerifyButton, setDisplayVerifyButton] = useState(false);
  const [displayVerifyEmailButton, setDisplayVerifyEmailButton] =
    useState(false);
  const [secondaryDataValidated, setSecondaryDataValidaton] =
    React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);

  const extraStyleInput = {
    selectedBorder: 1,
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

  const updateReporting = (e: any) => {
    const value = e.target.value;
    setReporting(value);
  };

  const updateDisableReferral = () => {
    const referralId = Cookie.get('refId') || Cookie.get('refCode');
    if (referralId) {
      setDisableReferral(true);
      setReporting(referralId || '');
    }
  };

  useEffect(() => {
    const { userID, accessToken } = access || {};
    if (userID && accessToken) {
      dispatch(
        fetchUserInfo(userID, (data: any) => {
          if (data.emailID && data.mobileNo) {
            window.open(
              Cookie.get('redirectTo') ? Cookie.get('redirectTo') : '/discover',
              '_self'
            );
            Cookie.remove('redirectTo');
          }
        })
      );
    } else {
      window.open('/login', '_self');
    }
    updateDisableReferral();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!['email', 'mobile'].includes(typeLoginID)) {
      Cookie.set('show_login_id_error', 'true');
      dispatch(logout({ isAutoLogout: true, redirect: '/login' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeLoginID]);

  const validateSecondaryInput = (value: any, country?: any) => {
    let enteredValue = value;
    let valueToCheck = enteredValue;
    let code = countryCode;
    if (typeLoginID !== 'mobile') {
      code = country.dialCode;
      if (valueToCheck.indexOf(code) === 0 && countryCode === '91') {
        valueToCheck = valueToCheck?.slice(code.length, valueToCheck.length);
      } else {
        valueToCheck = `+${valueToCheck}`;
      }
    }

    const loginType = isMobileOrEmail(valueToCheck);
    if (loginType == secondaryFieldName(typeLoginID).field) {
      setSecondaryDataValidaton(true);
    } else {
      setSecondaryDataValidaton(false);
    }
    setLoginValue(enteredValue);
    if (country) {
      setCountryCode(country.dialCode);
    }
  };

  const nameHandler = (name: string, type: 'firstName' | 'lastName') => {
    if (!isValidName(name)) {
      callErrorToast('Please enter alphabets only in name');
      if (type === 'firstName') {
        setValidityFName(false);
      } else {
        setValidityLName(false);
      }
    } else {
      if (type === 'firstName') {
        setFName(capitalize(name));
        setValidityFName(true);
      } else {
        setLName(capitalize(name));
        setValidityLName(true);
      }
    }
  };

  useEffect(() => {
    if (loginValue.length > 0) {
      if (firstName.length === 0 || lastName.length === 0) {
        setErrorMsg('First Name and Last Name are mandatory');
      } else if (typeLoginID === 'mobile') {
        if (!isValidEmail(loginValue)) {
          setErrorMsg('Please enter valid email address');
        } else if (
          isValidEmail(loginValue) &&
          !checkEmailValidation(loginValue)
        ) {
          setErrorMsg('Special characters are not allowed');
        } else {
          setErrorMsg('');
        }
      } else {
        setErrorMsg('');
      }
    }
  }, [firstName, lastName, loginValue, typeLoginID]);

  const isValidInput = () => {
    if (typeLoginID !== 'mobile') {
      return (
        loginValue.length > 0 && firstName.length > 0 && lastName.length > 0
      );
    } else {
      return (
        isValidEmail(loginValue) && firstName.length > 0 && lastName.length > 0
      );
    }
  };

  const getReferrerOrReporting = () => {
    if (!reporting || reporting.trim() === '') {
      return '';
    }
    return 'inputFromClient';
  };

  const submit = async () => {
    setLoading(true);
    if (!allowNext()) {
      setLoading(false);
      return;
    }
    let userID = loginValue;
    let data: any = { altID: loginValue };
    if (typeLoginID !== 'mobile') {
      if (loginValue.indexOf(countryCode) === 0) {
        userID = loginValue?.slice(countryCode.length, loginValue.length);
      }

      data = { altID: userID, mobileCode: countryCode };
    }
    if (typeLoginID === 'mobile' || typeLoginID === 'email') {
      try {
        await updateUserData(userID, {
          ...data,
          otpCode: otpValue,
          experianConsent,
          whatsappConsent,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      await updateUserData(userID, { ...data });
    }
    setLoading(false);
  };

  const updateUserData = async (userID: string, altData: any) => {
    const additionalUserData =
      typeLoginID !== 'mobile'
        ? {
            mobileCode: countryCode,
            ['mobileNo']: userID,
          }
        : {};
    let dataToSend: Record<string, unknown> = {
      firstName,
      lastName,
      panName: [firstName, lastName].join(' '),
      [typeLoginID !== 'mobile' ? 'mobileNo' : 'emailID']: userID,
      ...additionalUserData,
      inviteParam: Cookie.get('refId')
        ? 'refId'
        : Cookie.get('refCode')
        ? 'refCode'
        : null,
      altData,
      experianConsent,
      whatsappConsent: whatsappConsent,
    };
    if (getReferrerOrReporting()) {
      dataToSend = { ...dataToSend, [getReferrerOrReporting()]: reporting };
    }

    // Get GC Partner Code from cookies with gcPartnerCode key
    const gcPartnerCode = Cookie.get('gcPartnerCode');
    // IF gcPartnerCode is avaiable then send along with create profile api
    if (gcPartnerCode) {
      dataToSend = { ...dataToSend, partnerCode: gcPartnerCode };
    }

    await dispatch(
      updateUser(
        dataToSend,
        async (updatedUser: any) => {
          identifyClarityUser(user.userID);
          try {
            const params = {
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              email: updatedUser.emailID || user.emailID,
              mobileCode: `${updatedUser.mobileCode || user.mobileCode}`,
              mobileNo: updatedUser.mobileNo || user.mobileNo,
            };
            window['rudderanalytics']?.identify(
              String(updatedUser?.userID || user?.userID),
              params
            );
            MoengageWebServices.transformUserIdentityEvent(params);
            fireCreateNewUser();
            trackEvent('Sign Up Completed', {
              ref_code: updatedUser?.referralCode ?? '',
              whatsapp_opt_in: whatsappConsent,
              experian_opt_in: experianConsent,
              email: updatedUser.emailID || user.emailID,
              mobile: updatedUser.mobileNo || user.mobileNo,
              landed_page: 'discover',
              registration_time: new Date().toISOString(),
            });
          } catch (e) {
            console.log(e, 'error');
          }

          Cookie.remove('refId');
          Cookie.remove('refCode');

          const redirectTo = Cookie.get('redirectTo');
          window.open(redirectTo ? redirectTo : '/discover', '_self');
          Cookie.remove('redirectTo');
        },
        true,
        (error: string) => {
          Cookie.remove('refId');
          Cookie.remove('refCode');

          setDisableReferral(false);
        }
      )
    );
  };

  const triggerOtp = async (cta_text) => {
    let otpSecondaryCount = parseInt(
      localStorage.getItem('otpSecondaryCount') || '0',
      10
    );
    otpSecondaryCount += 1;
    localStorage.setItem('otpSecondaryCount', otpSecondaryCount.toString());

    trackEvent('login_signup_otp_sent', {
      otp_count: otpSecondaryCount,
      verification_type: 'mobile',
      verification_step: 'secondary',
      type: 'signup',
      cta_text: cta_text,
    });
    if (seconds === 0) {
      if (isValidInput()) {
        let data: any = { altID: loginValue };
        if (typeLoginID !== 'mobile') {
          let userID = loginValue;
          if (loginValue.indexOf(countryCode) === 0) {
            userID = loginValue?.slice(countryCode.length, loginValue.length);
          }
          data = { altID: userID, mobileCode: countryCode };
          if (userID.length < 5 || userID.length > 100) {
            callErrorToast('Enter a valid email address');
            return;
          }
        }
        try {
          await sendAltOtp(data);
          callSuccessToast('OTP sent successfully!');
          setOtpSent(true);
          setSeconds(60);
        } catch (error) {
          setErrorMsg(error);
        }
      } else {
        console.log('not a valid input');
      }
    }
  };

  const handleOtpChange = (e: any) => {
    setOtpValue(e.target.value);
  };
  const checkConsent = (checkbox: 'whatsapp' | 'experian') => {
    if (checkbox === 'whatsapp') {
      setWhatsappConsent(!whatsappConsent);
    } else {
      setExperianConsent(!experianConsent);
    }
  };

  const allowNext = () => {
    return validFName && validLName && secondaryDataValidated
      ? countryCode === '91'
        ? otpValue.length === 4
        : true
      : false;
  };

  const seoData = props?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];

  const handleBackClick = () => {
    window.open('/login', '_self', 'noopener');
  };

  useEffect(() => {
    setDisplayVerifyButton(
      countryCode === '91' &&
        loginValue.length === 12 &&
        validFName &&
        validLName &&
        firstName.length > 0 &&
        lastName.length > 0
    );
  }, [loginValue, validFName, validLName, firstName, lastName, countryCode]);

  const clearInput = (loginValue = '') => {
    let changeSecCount = parseInt(
      localStorage.getItem('changeSecCount') || '0',
      10
    );
    changeSecCount += 1;
    localStorage.setItem('changeSecCount', changeSecCount.toString());

    trackEvent('email_phone_change', {
      changed: 'mobile',
      change_count: changeSecCount,
      verification_step: 'secondary',
    });

    setOtpSent(false);
    setLoginValue(loginValue);
    setSeconds(0);
    setErrorMsg('');
    setSecondaryDataValidaton(false);
  };

  const renderClearButton = (countryCode = '') => {
    return (
      <button
        className={styles.clearInputButton}
        onClick={() => clearInput(countryCode)}
      >
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/close-circle-red.svg`}
          alt="clear"
          width={20}
          height={20}
          layout="fixed"
        />
      </button>
    );
  };

  const renderGetOtpButton = (disable = false) => {
    return (
      <button
        className={styles.verifyButton}
        disabled={disable}
        onClick={() => triggerOtp('Get Otp')}
      >
        Get OTP
      </button>
    );
  };

  useEffect(() => {
    setDisplayVerifyEmailButton(
      isValidEmail(loginValue) &&
        validFName &&
        validLName &&
        firstName.length > 0 &&
        lastName.length > 0
    );
  }, [loginValue, validFName, validLName, firstName, lastName]);

  return (
    <>
      <Seo seo={seoData} isPublicPage />
      <PreLoginMobileHeader
        isLoggedIn={true}
        handleLogoutClick={() => {
          dispatch(logout({ isAutoLogout: false, redirect: '/login' }));
        }}
        handleBackClick={handleBackClick}
      />
      <div className={`${styles.container}`}>
        <div className={styles.SignupWrapper}>
          <div className={`${styles.inputContainer}`}>
            <h1 className={styles.loginText}>
              Let&apos;s get to know you better
            </h1>
            <div className={styles.mainContainer}>
              <InputFieldSet
                placeHolder="First Name"
                label="First Name"
                width={'100%'}
                type="text"
                onChange={(e: any) => nameHandler(e.target.value, 'firstName')}
                error={!validFName}
                value={firstName}
                className={'CompactInput'}
                extraStyles={extraStyleInput}
              />
              <InputFieldSet
                placeHolder="Last Name"
                label="Last Name"
                width={'100%'}
                type="text"
                onChange={(e: any) => nameHandler(e.target.value, 'lastName')}
                error={!validLName}
                value={lastName}
                className={'CompactInput'}
                extraStyles={extraStyleInput}
              />
            </div>

            {typeLoginID === 'email' ? (
              <VerifyPhoneNumber
                otpSent={otpSent}
                userLocation={props.userLocation}
                loginValue={loginValue}
                validateSecondaryInput={validateSecondaryInput}
                renderClearButton={renderClearButton}
                renderGetOtpButton={renderGetOtpButton}
                secondaryDataValidated={secondaryDataValidated}
                displayVerifyButton={displayVerifyButton}
                errorMsg={errorMsg}
                countryCode={countryCode}
              />
            ) : (
              <VerifyEmailAddress
                displayVerifyEmailButton={displayVerifyEmailButton}
                errorMsg={errorMsg}
                loginValue={loginValue}
                otpSent={otpSent}
                renderClearButton={renderClearButton}
                renderGetOtpButton={renderGetOtpButton}
                secondaryDataValidated={secondaryDataValidated}
                typeLoginID={typeLoginID}
                validateSecondaryInput={validateSecondaryInput}
              />
            )}

            {otpSent ? (
              <OTPInput
                handleOtpChange={handleOtpChange}
                otpSent={otpSent}
                otpValue={otpValue}
                seconds={seconds}
                triggerOtp={() => triggerOtp('Resend')}
              />
            ) : null}
            <ReferralInput
              disableReferral={disableReferral}
              reporting={reporting}
              updateReporting={updateReporting}
            />
            <div className={styles.divider}>
              <ul className={`${styles.consentUL}`}>
                <div className={styles.itemList}>
                  <input
                    type={'checkbox'}
                    name="allow-post-tax"
                    checked={whatsappConsent}
                    onChange={() => checkConsent('whatsapp')}
                  />
                  <span className="TextStyle1">
                    Get Important Whatsapp and SMS Alerts
                  </span>
                </div>
                {/**
                 * TEMPORARY COMMENTIED
                 * Do not remove
                 * https://gripinvest.atlassian.net/browse/PT-9580
                 */}
                {/* <div className={styles.itemList}>
                  <input
                    type={'checkbox'}
                    name="allow-post-tax"
                    checked={experianConsent}
                    onChange={() => checkConsent('experian')}
                  />
                  <span className="TextStyle1">
                    For personalizing my investment experience, I hereby accept
                    the Terms & Conditions and consent for Grip to receive my
                    credit information from experian
                  </span>
                </div> */}
              </ul>
            </div>

            <Button
              isLoading={loading}
              onClick={submit}
              disabled={!allowNext() || loading}
              width={'100%'}
              className={styles.loginButton}
            >
              Proceed
            </Button>
            <p className={styles.tncAgreement}>
              By continuing, you agree to our{' '}
              <a
                href="https://www.gripinvest.in/legal#termsAndConditions"
                rel="noreferrer"
                target="_blank"
                className={styles.link}
              >
                TnCs
              </a>{' '}
              and{' '}
              <a
                href="https://www.gripinvest.in/legal#privacy"
                rel="noreferrer"
                target="_blank"
                className={styles.link}
              >
                Privacy Policy
              </a>
            </p>
          </div>
          <p className={`BottomCopyright TextStyle2`}>
            © {new Date().getFullYear()} Grip Broking Private Limited.
          </p>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps() {
  try {
    const [pageData, referralExperimentCode] = await Promise.all([
      fetchAPI(
        '/inner-pages-data',
        {
          filters: {
            url: '/signup',
          },
          populate: '*',
        },
        {},
        false
      ),
      getSecret('referral.exp_referral_code'),
    ]);

    return {
      props: {
        pageData: pageData?.data?.[0]?.attributes?.pageData,
        referralExperimentCode: referralExperimentCode,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

export default AdditionalDetails;
