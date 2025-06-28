import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import dayjs from 'dayjs';

import styles from '../../styles/ProfileKYC.module.css';
import mobileStyles from '../../styles/ProfileKYCMobile.module.css';

import Header from '../../components/kyc/Header';
import ActionButton from '../../components/kyc/ActionButton';
import Modal from '../../components/kyc/Modal';
import BackdropComponent from '../../components/common/BackdropComponent';
import UnderVerification from '../../components/kyc/UnderVerification';
import KYCLayout from '../../components/kyc/kycLayout';

import {
  kycStepDataArr,
  panActions,
  header,
  modalData,
} from '../../pages_utils/kyc';
import {
  accreditedPostUploadDataForm,
  postUploadDataForm,
} from '../../pages_utils/others';

import { RootState } from '../../redux';
import {
  getBankInfo,
  getKYCConsent,
  updateUser,
  uploadKycDocuments,
} from '../../redux/slices/user';

import { getKycUrl, isUserAccredited, residentOptions } from '../../utils/user';
import { getProfilePhotoURL } from '../../components/kyc/utils';

import {
  getFileExtension,
  getHeaderData,
  isDocumentUnderVerification,
} from '../../utils/kyc';
import { isMobile } from '../../utils/resolution';

import { callErrorToast } from '../../api/strapi';
import { trackEvent } from '../../utils/gtm';
import { isEmpty } from '../../utils/object';

const mapStateToProps = (state: RootState) => ({
  userKycDetails: state.user.kycDetails,
  userData: state.user.userData,
  user: state.user,
  kycConsent: state.user.kycConsent,
  selectedAsset: state.access?.selectedAsset,
  access: state.access,
});

const mapDispatchToProps = {
  uploadKycDocuments,
  updateUser,
  getBankInfo,
  getKYCConsent,
};

const formDateFormatter = (inputDate: Date) => {
  if (!inputDate) {
    return null;
  }
  return dayjs(new Date(inputDate))
    .format('DD-MM-YYYY')
    .split('-')
    .reverse()
    .join('-');
};

const connector = connect(mapStateToProps, mapDispatchToProps);

interface OtherProps extends ConnectedProps<typeof connector> {}

const Others: NextPage = (props: OtherProps) => {
  const headerData = getHeaderData(kycStepDataArr, props?.selectedAsset);

  const finalStyles = isMobile() ? mobileStyles : styles;

  const router = useRouter();

  const [hasDIN, setHasDIN] = useState(!!props.userData?.din);

  const [din, setDIN] = useState(props.userData?.din || '');
  const [tin, setTIN] = useState(props.userData?.tin || '');
  const [dematNo, setDematNo] = useState(props.userData?.dematNo || '');
  const [nomineeName, setNomineeName] = useState(
    props.userData?.nomineeName || ''
  );
  const [nomineeEmail, setNomineeEmail] = useState(
    props.userData?.nomineeEmail || ''
  );
  const [nomineeDob, setNomineeDob] = useState(
    props.userData?.nomineeDob
      ? formDateFormatter(props.userData?.nomineeDob)
      : ''
  );
  const [nomineeAddress, setNomineeAddress] = useState(
    props.userData?.nomineeAddress || ''
  );
  const [occupation, setOccupation] = useState(
    props.userData?.occupation || ''
  );
  const [politicallyExposedPerson, setpoliticallyExposedPerson] = useState(
    props.userData?.politicallyExposedPerson || ''
  );
  const [nationality, setNationality] = useState(
    props.userData?.nationality || ''
  );
  const [placeOfBirth, setPlaceOfBirth] = useState(
    props.userData?.placeOfBirth || ''
  );
  const [countryOfBirth, setCountryOfBirth] = useState(
    props.userData?.countryOfBirth || ''
  );
  const [residentialStatus, setResidentialStatus] = useState(
    props.userData?.residentialStatus || ''
  );

  const accredited = isUserAccredited(props.kycConsent);

  const [showModal, setShowModal] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const step = 3;
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    router.events.on('routeChangeStart', () => setShowLoader(true));
    router.events.on('routeChangeComplete', () => setShowLoader(false));

    return () => {
      router.events.off('routeChangeStart', () => setShowLoader(true));
      router.events.off('routeChangeComplete', () => setShowLoader(false));
    };
  }, [router]);

  useEffect(() => {
    if (residentialStatus) {
      if (residentOptions[0].value === residentialStatus) {
        setNationality('india');
      }
    }
    if (!props?.userKycDetails?.bank || isEmpty(props?.userKycDetails?.bank)) {
      props.getBankInfo();
    }
    props.getKYCConsent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setResidentialStatus(props.userData?.residentialStatus);
    if (residentOptions[0].value === props.userData?.residentialStatus) {
      setNationality('india');
    }
  }, [props.userData?.residentialStatus]);

  useEffect(() => {
    updateOtherDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.userData?.din,
    props.userData?.tin,
    props.userData?.dematNo,
    props.userData?.nomineeName,
    props.userData?.nomineeEmail,
    props.userData?.nomineeDob,
    props.userData?.nomineeAddress,
    props.userData?.occupation,
    props.userData?.politicallyExposedPerson,
    props.userData?.nationality,
    props.userData?.placeOfBirth,
    props.userData?.countryOfBirth,
  ]);

  const updateOtherDetails = () => {
    setDIN(props.userData?.din);
    setTIN(props.userData?.tin);
    setDematNo(props.userData?.dematNo);
    setNomineeName(props.userData?.nomineeName);
    setNomineeEmail(props.userData?.nomineeEmail);
    setNomineeDob(formDateFormatter(props.userData?.nomineeDob));
    setNomineeAddress(props.userData?.nomineeAddress);
    setPlaceOfBirth(props.userData?.placeOfBirth);
    setCountryOfBirth(props.userData?.countryOfBirth);

    if (props.userData?.occupation) {
      setOccupation(props.userData?.occupation);
    }

    if (props.userData?.politicallyExposedPerson) {
      setpoliticallyExposedPerson(props.userData?.politicallyExposedPerson);
    }

    // Update nationality
    if (
      residentOptions[0].value !== residentialStatus &&
      props.userData?.nationality
    ) {
      setNationality(props.userData?.nationality);
    }
  };

  useEffect(() => {
    if (isDocumentUnderVerification(props.userKycDetails?.bank)) {
      trackEvent('kyc_bank_added', {
        attempt_number: 3,
        user_changed: false,
        manual_verification: true,
        account_no: '',
        ifsc: '',
        account_type: '',
        cheque_uploaded: true,
        file_format: getFileExtension(props?.userKycDetails?.bank?.fileName),
        file_size: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { userData, kycConsent, userKycDetails, selectedAsset } = props;
    const kycUrl = getKycUrl(
      {
        ...userData,
        isUserAccredited: isUserAccredited(kycConsent),
      },
      userKycDetails,
      selectedAsset
    );

    router.push(kycUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userData]);

  const onBackClick = () => {
    router.back();
  };

  const onHintsClick = () => {
    setShowHints(true);
  };

  const onCloseHintsModal = () => {
    setShowHints(false);
  };

  const onCloseModal = () => {
    setShowModal(false);
  };

  const onActionClick = () => {
    if (accredited && !props.userData?.photo) {
      callErrorToast(`Missing mandatory field: profile photo`);
      return;
    }

    // NOMINEE AGE CHECK
    const currentDate = dayjs();
    const ageDiffYear: number = currentDate.diff(nomineeDob, 'year');
    if (accredited && ageDiffYear < 18) {
      callErrorToast(`Nominee should be atleast 18 yrs old`);
      return;
    }

    props.updateUser({
      occupation,
      nationality,
      dematNo,
      nomineeName,
      nomineeEmail,
      nomineeDob,
      nomineeAddress,
      placeOfBirth,
      countryOfBirth,
      residentialStatus,
      politicallyExposedPerson,
      ...(hasDIN
        ? {
            din,
          }
        : {}),
      ...(residentialStatus === residentOptions[1].value
        ? {
            tin,
          }
        : {}),
    });
  };

  const onChangeCountryOfBirth = (e: any) => {
    const value = e.target.value;
    setCountryOfBirth(value);
  };

  const onChangePlaceOfBirth = (e: any) => {
    const value = e.target.value;
    setPlaceOfBirth(value);
  };

  const onChangeResidentialStatus = (e: any) => {
    const value = e.target.value;
    if (value === residentOptions[0].value) {
      setNationality('india');
    }
    setResidentialStatus(value);
  };

  const onChangeNomineeName = (e: any) => {
    const value = e.target.value;
    setNomineeName(value);
  };
  const onChangeNomineeEmail = (e: any) => {
    const value = e.target.value;
    setNomineeEmail(value);
  };
  const onChangeDematNo = (e: any) => {
    const value = e.target.value;
    setDematNo(value);
  };
  const onChangeOccupation = (e: any) => {
    const value = e.target.value;
    setOccupation(value);
  };
  const onChangePoliticallyExposed = (e: any) => {
    const value = e.target.value;
    setpoliticallyExposedPerson(value);
  };
  const onChangeNationality = (e: any) => {
    const value = e.target.value;
    setNationality(value);
  };
  const onChangeNomineeDOB = (e: any) => {
    const value = e.target.value;
    setNomineeDob(value);
  };
  const onChangeNomineeAddress = (e: any) => {
    const value = e.target.value;
    setNomineeAddress(value);
  };

  const onChangeProfilePhoto = (file: File) => {
    props.uploadKycDocuments(file, 'profile', 'photo');
  };

  const onChangeDIN = (e: any) => {
    const value = e.target.value;
    setDIN(value);
  };

  const onChangeTIN = (e: any) => {
    const value = e.target.value;
    setTIN(value);
  };

  const onChangeDINRadio = (e: any) => {
    const value = e.target.value;
    setHasDIN(value === 'true');
  };

  const onChange = {
    countryOfBirth: onChangeCountryOfBirth,
    placeOfBirth: onChangePlaceOfBirth,
    residentialStatus: onChangeResidentialStatus,
    nationality: onChangeNationality,
    occupation: onChangeOccupation,
    dematNo: onChangeDematNo,
    nomineeName: onChangeNomineeName,
    nomineeEmail: onChangeNomineeEmail,
    nomineeDob: onChangeNomineeDOB,
    nomineeAddress: onChangeNomineeAddress,
    profile: onChangeProfilePhoto,
    dinNo: onChangeDIN,
    din: onChangeDINRadio,
    tin: onChangeTIN,
    politicallyExposedPerson: onChangePoliticallyExposed,
  };

  const getFormValues = (id: string) => {
    const formValues = {
      countryOfBirth,
      placeOfBirth,
      residentialStatus,
      nationality,
      occupation,
      dematNo,
      nomineeName,
      nomineeEmail,
      nomineeDob,
      nomineeAddress,
      accredited,
      profile: getProfilePhotoURL(props.userData),
      dinNo: din,
      din: hasDIN,
      disableResidence: Boolean(props?.userData?.residentialStatus),
      disableNationality: residentialStatus === 'resident_indian',
      tin,
      politicallyExposedPerson,
    };

    return formValues[id];
  };

  const getFormData = () => {
    if (accredited) {
      return accreditedPostUploadDataForm;
    } else {
      return postUploadDataForm;
    }
  };

  const pendingOthersSectionDetails = () => {
    if (residentialStatus !== residentOptions[1].value) {
      return (
        !occupation ||
        !nationality ||
        !nomineeName ||
        !residentialStatus ||
        !politicallyExposedPerson
      );
    } else {
      return (
        !occupation ||
        !nationality ||
        !nomineeName ||
        !residentialStatus ||
        !tin ||
        !politicallyExposedPerson
      );
    }
  };

  const pendingAccreditationDetails = () => {
    return (
      accredited &&
      (!nomineeEmail ||
        !nomineeDob ||
        !nomineeAddress ||
        !placeOfBirth ||
        !countryOfBirth)
    );
  };

  const pendingOtherDetailsNonAccreditated = !nomineeName || !residentialStatus;

  const isActionDisabled = () => {
    if (accredited) {
      return !(pendingOthersSectionDetails() || pendingAccreditationDetails());
    } else {
      return !pendingOtherDetailsNonAccreditated;
    }
  };

  return (
    <div className={`${finalStyles.profileContainer}`}>
      <Header
        data={header}
        onBackClick={onBackClick}
        onHintsClick={onHintsClick}
        step={step}
        contentData={headerData}
      />
      <KYCLayout
        id="others"
        step={step}
        data={kycStepDataArr}
        actionActive={isActionDisabled()}
        onActionClick={onActionClick}
        formData={getFormData()}
        onChangeFunctions={onChange}
        getFormValues={getFormValues}
        isMultipleForms
        showHintsModal={showHints}
        onCloseHintsModal={onCloseHintsModal}
        showHintsMobile={false}
        assetData={props.selectedAsset}
      />
      {!isMobile() ? (
        <ActionButton
          active={isActionDisabled()}
          data={panActions}
          onClick={onActionClick}
        />
      ) : null}
      <Modal
        data={modalData}
        closeModal={onCloseModal}
        showModal={showModal}
        isBottomModal={false}
      />
      {isDocumentUnderVerification(props.userKycDetails?.bank) ? (
        <UnderVerification name={'Bank'} />
      ) : null}
      <BackdropComponent open={showLoader} />
    </div>
  );
};

export default connector(Others);
