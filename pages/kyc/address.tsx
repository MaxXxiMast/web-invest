import { NextPage } from 'next';
import Cookie from 'js-cookie';
import styles from '../../styles/ProfileKYC.module.css';
import mobileStyles from '../../styles/ProfileKYCMobile.module.css';

import Header from '../../components/kyc/Header';
import ActionButton from '../../components/kyc/ActionButton';
import Modal from '../../components/kyc/Modal';
import { isMobile } from '../../utils/resolution';

import {
  kycStepDataArr,
  header,
  modalData,
  failCardData,
  panActions,
} from '../../pages_utils/kyc';
import {
  nriPostUploadDataForm,
  nriUploadFormData,
  postUploadDataForm,
  postUploadDataFormForCkycDownload,
  uploadFormData,
} from '../../pages_utils/address';
import {
  isUserCkycDownloadCompleted,
  isUserEligibleForCkycDownload,
} from '../../components/kyc/utils';

import { useEffect, useState } from 'react';
import KYCLayout from '../../components/kyc/kycLayout';
import { RootState } from '../../redux';
import {
  getPanAadhaarDetails,
  updateUserKYC,
  uploadKycDocuments,
  updateUser,
  fetchUserInfo,
  setCkycLoading,
  getKYCConsent,
} from '../../redux/slices/user';
import { connect, ConnectedProps } from 'react-redux';

import { callErrorToast, processError } from '../../api/strapi';
import {
  getAadhaarStatus,
  getFileExtension,
  getHeaderData,
  isDocumentUnderVerification,
} from '../../utils/kyc';
import { useRouter } from 'next/router';
import {
  getAddressFromCkycData,
  getKycUrl,
  isUserAccredited,
  pendingKycStatuses,
} from '../../utils/user';
import { isEmpty } from '../../utils/object';
import BackdropComponent from '../../components/common/BackdropComponent';
import UnderVerification from '../../components/kyc/UnderVerification';
import { bytesToSize } from '../../utils/number';
import { trackEvent } from '../../utils/gtm';

const mapStateToProps = (state: RootState) => ({
  userKycDetails: state.user.kycDetails,
  userData: state.user.userData,
  kycConsent: state.user.kycConsent,
  selectedAsset: state.access?.selectedAsset,
  access: state.access,
});

const mapDispatchToProps = {
  getPanAadhaarDetails,
  uploadKycDocuments,
  updateUserKYC,
  updateUser,
  fetchUserInfo,
  getKYCConsent,
  setCkycLoading,
};

type extraData = Partial<{
  fileFormat1: string;
  fileFormat2: string;
  fileSize1: string;
  fileSize2: string;
  attempt_number: number;
  userChanged: boolean;
  manualVerification: boolean;
  doctype: string;
}>;

const connector = connect(mapStateToProps, mapDispatchToProps);

interface AddressProps extends ConnectedProps<typeof connector> {}

const Address: NextPage = (props: AddressProps) => {
  const headerData = getHeaderData(kycStepDataArr, props.selectedAsset);

  const finalStyles = isMobile() ? mobileStyles : styles;

  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const step = 1;

  const [residentialStatus, setResidentialStatus] = useState(
    props.userData?.residentialStatus || 'resident_indian'
  );

  const [aadhaarName, setAadhaarName] = useState(
    props.userKycDetails.aadhaar?.docName ||
      props.userKycDetails.passport?.docName ||
      ''
  );
  const [aadharNumber, setAadharNumber] = useState(
    props.userKycDetails.aadhaar?.docIDNo ||
      props.userKycDetails.passport?.docIDNo ||
      ''
  );
  const [aadharAddress, setAadharAddress] = useState(
    props.userKycDetails.aadhaar?.address ||
      props.userKycDetails.passport?.address ||
      ''
  );
  const [aadharCorresAddress, setAadharCorresAddress] = useState(
    props.userKycDetails.aadhaar?.address ||
      props.userKycDetails.passport?.address ||
      ''
  );

  const [kycType, setKycType] = useState('');

  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({
    aadhaar_back: 0,
    aadhaar_front: 0,
    passport_back: 0,
    passport_front: 0,
  });

  const [error, setError] = useState('');
  const [nriAddressOption, setNriAddressOption] = useState('driving_licence');

  const [aadhaarStatus, setAadhaarStatus] = useState(
    getAadhaarStatus(props.userData)
  );
  const [showHints, setShowHints] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  // Store file size
  const [rudderEventData, setRudderEventData] = useState<extraData>({
    fileFormat1: '',
    fileFormat2: '',
    fileSize1: '0',
    fileSize2: '0',
    attempt_number: 0,
    userChanged: false,
    manualVerification: false,
    doctype: '',
  });

  useEffect(() => {
    router.events.on('routeChangeStart', () => setShowLoader(true));
    router.events.on('routeChangeComplete', () => setShowLoader(false));

    return () => {
      router.events.off('routeChangeStart', () => setShowLoader(true));
      router.events.off('routeChangeComplete', () => setShowLoader(false));
    };
  }, [router]);

  // Rudderstack event for pan when manual verification
  useEffect(() => {
    if (isDocumentUnderVerification(props.userKycDetails?.pan)) {
      trackEvent('kyc_pan_added', {
        pan: '',
        pan_name: '',
        file_format: getFileExtension(props?.userKycDetails?.pan?.fileName),
        file_size: '',
        attempt_number: 3,
        user_changed: false,
        manual_verification: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDocumentUnderVerification]);

  const updateRudderEventData = (data: extraData) => {
    setRudderEventData({
      ...rudderEventData,
      ...data,
    });
  };

  const setUserChanged = () => {
    updateRudderEventData({
      userChanged: true,
    });
  };

  const sendRudderStackEvent = () => {
    // Get max attempt number
    const attempts = Object.values(wrongAttempts);

    // Rudderstack event kyc_pao_added
    trackEvent('kyc_poa_added', {
      doctype: rudderEventData.doctype,
      address_in_doc: aadharAddress,
      file_format_1: rudderEventData.fileFormat1,
      file_format_2: rudderEventData.fileFormat2,
      file_size: bytesToSize(
        Number(rudderEventData.fileSize1) + Number(rudderEventData.fileSize2)
      ),
      attempt_number: Math.max(...attempts),
      user_changed: rudderEventData?.userChanged,
      manual_verification: false,
    });
    if (Cookie.get('kycSource')) {
      trackEvent('Click_complete_kyc', {
        url: router.pathname,
        Is_FTI: !Boolean(props?.userData?.investmentData?.totalInvestments),
      });
    }
  };

  const checkCkycDataAndPrefill = () => {
    // if ckyc download is success

    const ckycCompleted = isUserCkycDownloadCompleted(props.userData);
    if (ckycCompleted) {
      const {
        fullName,
        permanentAddress,
        correspondenceAddress,
        aadhaarNumber,
      }: any = getAddressFromCkycData(props.userData?.userCKyc);

      setAadhaarName(fullName);
      setAadharNumber(aadhaarNumber);
      setAadharAddress(permanentAddress);
      setAadharCorresAddress(correspondenceAddress);
    }
  };

  const updateAddressDetails = () => {
    props.getPanAadhaarDetails();
    setAddressDetails();
  };

  useEffect(() => {
    checkCkycDataAndPrefill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.userData?.userCKyc?.ckycStatus, props?.userData]);

  useEffect(() => {
    updateAddressDetails();
    setTimeout(
      () =>
        props.fetchUserInfo(props.access?.userID, () => {
          checkCkycDataAndPrefill();
          props.setCkycLoading(false);
        }),
      3000
    );
    props.getKYCConsent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAddressDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userKycDetails]);

  useEffect(() => {
    const { userData, kycConsent, userKycDetails } = props;
    const kycUrl = getKycUrl(
      {
        ...userData,
        isUserAccredited: isUserAccredited(kycConsent),
      },
      userKycDetails,
      props.selectedAsset
    );

    router.push(kycUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userData]);

  const showUploadUI = () => {
    const { bill, other, driving_licence } = props?.userData || {};

    if (residentialStatus !== 'nri') {
      return aadhaarStatus === 'pending' && !(aadhaarName && aadharAddress);
    } else if (
      pendingKycStatuses.includes(aadhaarStatus) &&
      !(driving_licence || bill || other)
    ) {
      return true;
    }
    return false;
  };

  const onBackClick = () => {
    if (aadhaarName || aadharAddress || aadharNumber) {
      setAadhaarName('');
      setAadharAddress('');
      setAadharCorresAddress('');
      setAadharNumber('');
      setAadhaarStatus('pending');
    } else {
      const redirectTo = Cookie.get('redirectTo');
      if (Cookie.get('kycSource') == 'discovery') {
        router.push('/discover');
      } else if (redirectTo) {
        router.push(redirectTo);
        Cookie.remove('redirectTo');
      } else {
        router.push('/assets');
      }
    }
  };

  const onHintsClick = () => {
    setShowHints(true);
  };

  const onCloseHintsModal = () => {
    setShowHints(false);
  };

  const onOpenModal = () => {
    setShowModal(true);
  };

  const onCloseModal = () => {
    setShowModal(false);
  };

  const isSendToTerminal = () => {
    if (residentialStatus === 'nri') {
      return (
        wrongAttempts.passport_back >= 3 || wrongAttempts.passport_front >= 3
      );
    } else {
      return (
        wrongAttempts.aadhaar_front >= 3 || wrongAttempts.aadhaar_back >= 3
      );
    }
  };

  const uploadDocumentForKYC = (
    file: any,
    docType: string,
    docSubType: string
  ) => {
    const sendToTerminal = isSendToTerminal();
    // front and back
    if (docSubType.includes('front')) {
      updateRudderEventData({
        fileFormat1: file?.type,
        fileSize1: file?.size,
        doctype: docType.includes('passport') ? 'passport' : 'aadhaar',
      });
    } else {
      updateRudderEventData({
        fileFormat2: file?.type,
        fileSize2: file?.size,
        doctype: docType.includes('passport') ? 'passport' : 'aadhaar',
      });
    }
    props.uploadKycDocuments(
      file,
      docType,
      docSubType,
      (success: boolean, uploadError: boolean) =>
        uploadDone(docSubType, success, uploadError),
      undefined,
      false,
      sendToTerminal
    );
  };

  const uploadDone = (
    docSubType: string,
    _success: boolean,
    uploadError: unknown
  ) => {
    onCloseModal();
    if (uploadError) {
      setError(String(uploadError));
      setWrongAttempts({
        ...wrongAttempts,
        [docSubType]: wrongAttempts[docSubType] + 1,
      });
    } else {
      if (!docSubType.includes('passport')) {
        updateAddressDetails();
      }
    }
  };

  const successCB = () => {
    onCloseModal();
    sendRudderStackEvent();
    props.getPanAadhaarDetails();
  };

  const failedCB = (err: any) => {
    onCloseModal();
    setError(processError(err));
  };

  const onActionClick = () => {
    if (!aadhaarName || !aadharAddress || !aadharNumber) {
      callErrorToast(`Missing mandatory field`);
      return;
    }

    const { userData, userKycDetails = {} } = props;
    const aadhaar = userKycDetails?.aadhaar;

    const params: any = {
      docName: aadhaarName,
      docIDNo: aadharNumber,
      address: aadharAddress,
      userID: userData?.userID,
      kycID: aadhaar.docID,
    };
    onOpenModal();
    props.updateUserKYC(params, kycType, successCB, failedCB);
    props.updateUser(
      { residentialStatus },
      () => {
        onCloseModal();
      },
      false,
      () => {
        onCloseModal();
      }
    );
  };

  const onChangeFrontAddress = (file?: File, isReupload = false) => {
    if (isReupload) {
      setError('');
      return;
    }
    onOpenModal();
    setKycType('aadhaar');
    uploadDocumentForKYC(file, 'kyc', `aadhaar_front`);
  };

  const onChangeBackAddress = (file?: File, isReupload = false) => {
    if (isReupload) {
      setError('');
      return;
    }
    onOpenModal();
    setKycType('aadhaar');
    uploadDocumentForKYC(file, 'kyc', `aadhaar_back`);
  };

  const onChangeAadhaarAddress = (e: any) => {
    const value = e.target.value;
    setAadharAddress(value);
    setAadharCorresAddress(value);
    setUserChanged();
  };

  const onChangeAadhaarNumber = (e: any) => {
    const value = e.target.value;
    setAadharNumber(value);
    setUserChanged();
  };

  const onChangeAadhaarName = (e: any) => {
    const value = e.target.value;
    setAadhaarName(value);
    setUserChanged();
  };

  const onChangeResidential = (e: any) => {
    const value = e.target.value;
    setResidentialStatus(value);
    setUserChanged();
  };

  const onChangePassportFront = (file: any, isReupload: boolean) => {
    if (isReupload) {
      setError('');
      return;
    }
    onOpenModal();
    setUserChanged();
    uploadDocumentForKYC(file, 'kyc', 'passport_front');
  };

  const onChangePassportBack = (file: any, isReupload: boolean) => {
    if (isReupload) {
      setError('');
      return;
    }
    onOpenModal();
    setUserChanged();
    uploadDocumentForKYC(file, 'kyc', 'passport_back');
  };

  const onChangeNRIAddressOption = (e: any) => {
    const value = e.target.value;
    setNriAddressOption(value);
  };

  const onChangeNRIAddress = (file: File, isReupload: boolean) => {
    if (isReupload) {
      setError('');
      return;
    }
    onOpenModal();
    setKycType('driving_licence');
    setUserChanged();
    uploadDocumentForKYC(file, 'kyc', nriAddressOption);
  };

  const onClickReupload = () => {
    setError('');
  };

  const onChange = {
    aadharNumber: onChangeAadhaarNumber,
    aadhaarName: onChangeAadhaarName,
    aadharAddress: onChangeAadhaarAddress,
    residentialStatus: onChangeResidential,
    frontAddress: onChangeFrontAddress,
    backAddress: onChangeBackAddress,
    passportFront: onChangePassportFront,
    passportBack: onChangePassportBack,
    nriAddressOption: onChangeNRIAddressOption,
    nriAddressProof: onChangeNRIAddress,
    reupload: onClickReupload,
  };

  const getFormValues = (id: string) => {
    const ckycCompleted = isUserCkycDownloadCompleted(props.userData);
    const formValues = {
      aadharNumber,
      aadhaarName,
      aadharAddress,
      residentialStatus,
      nriAddressOption,
      corrAddress: aadharCorresAddress,
      disable: ckycCompleted,
    };

    return formValues[id];
  };

  const getKYCType = () => {
    const { aadhaar = {}, passport = {} } = props.userKycDetails;
    if (isEmpty(aadhaar) && !isEmpty(passport)) {
      setResidentialStatus('nri');
      return 'passport';
    } else {
      return 'aadhaar';
    }
  };

  const setAddressDetails = () => {
    let addressDetails: any = {};
    const { aadhaar, passport } = props.userKycDetails;
    if (!isEmpty(aadhaar)) {
      addressDetails = aadhaar;
    } else if (!isEmpty(passport)) {
      addressDetails = passport;
    }

    setAadharNumber(addressDetails?.docIDNo);
    setAadhaarName(addressDetails?.docName);
    setAadharAddress(addressDetails?.address);
    setAadharCorresAddress(addressDetails?.address);
    setAadhaarStatus(getAadhaarStatus(props.userData));
    setKycType(getKYCType());
    checkCkycDataAndPrefill();
  };

  const getFormData = () => {
    if (Boolean(error)) {
      return failCardData;
    } else if (showUploadUI()) {
      return residentialStatus === 'nri' ? nriUploadFormData : uploadFormData;
    } else if (isUserCkycDownloadCompleted(props.userData)) {
      return postUploadDataFormForCkycDownload;
    } else {
      return residentialStatus === 'nri'
        ? nriPostUploadDataForm
        : postUploadDataForm;
    }
  };

  const isActionDisabled = () => {
    if (
      isUserEligibleForCkycDownload(props.userData) &&
      isUserCkycDownloadCompleted(props.userData)
    ) {
      return true;
    }

    if (!aadhaarName || !aadharAddress || !aadharNumber) {
      return false;
    } else {
      return true;
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
        hideBackButton={isUserEligibleForCkycDownload(props.userData)}
      />
      <KYCLayout
        id="address"
        step={step}
        data={kycStepDataArr}
        actionActive={isActionDisabled()}
        onActionClick={onActionClick}
        formData={getFormData()}
        onChangeFunctions={onChange}
        getFormValues={getFormValues}
        formError={error}
        isMultipleForms
        showHintsModal={showHints}
        onCloseHintsModal={onCloseHintsModal}
        showHintsMobile={showUploadUI()}
        showEditDetails={isUserCkycDownloadCompleted(props.userData)}
        assetData={props.selectedAsset}
      />
      {!isMobile() ? (
        <ActionButton
          active={isActionDisabled()}
          data={panActions}
          onClick={onActionClick}
        />
      ) : null}
      <BackdropComponent open={showModal}>
        <Modal
          data={modalData}
          closeModal={onCloseModal}
          showModal={showModal}
        />
      </BackdropComponent>
      {isDocumentUnderVerification(props.userKycDetails?.pan) ? (
        <UnderVerification name={'Pan Card'} />
      ) : null}
      <BackdropComponent
        open={showLoader || props.userKycDetails.ckycLoading}
      />
    </div>
  );
};

export default connector(Address);
