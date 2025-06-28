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
  panActions,
  header,
  modalData,
  failCardData,
} from '../../pages_utils/kyc';
import {
  postUploadDataForm,
  uploadWithPanPendingFormData,
} from '../../pages_utils/bank';

import { useEffect, useState } from 'react';
import KYCLayout from '../../components/kyc/kycLayout';
import { RootState } from '../../redux';
import {
  clearOcrResponse,
  getBankInfo,
  getPanAadhaarDetails,
  getUserKycDocuments,
  initiateKYCForBank,
  updateUserKYC,
  uploadKycDocuments,
  setBankWrongAttempts,
  setUserData,
  getDataFromIFSC,
  fetchUserInfo,
  getKYCConsent,
} from '../../redux/slices/user';
import { connect, ConnectedProps } from 'react-redux';

import { useRouter } from 'next/router';

import { getKycUrl, isUserAccredited, kycStatuses } from '../../utils/user';

import { callErrorToast, callSuccessToast } from '../../api/strapi';
import BackdropComponent from '../../components/common/BackdropComponent';
import UnderVerification from '../../components/kyc/UnderVerification';
import {
  accountTypes,
  getHeaderData,
  getBranchName,
  isBankDocumentUnderVerification,
  isDocumentUnderVerification,
  isValidIFSC,
} from '../../utils/kyc';
import { isAssetBonds, isSDISecondary } from '../../utils/financeProductTypes';
import { bytesToSize } from '../../utils/number';
import { trackEvent } from '../../utils/gtm';
import { isEmpty } from '../../utils/object';

const mapStateToProps = (state: RootState) => ({
  userKycDetails: state.user.kycDetails,
  userData: state.user.userData,
  kycConsent: state.user.kycConsent,
  selectedAsset: state.access?.selectedAsset,
  access: state.access,
});

const mapDispatchToProps = {
  uploadKycDocuments,
  updateUserKYC,
  getBankInfo,
  initiateKYCForBank,
  getPanAadhaarDetails,
  getUserKycDocuments,
  clearOcrResponse,
  setBankWrongAttempts,
  getDataFromIFSC,
  fetchUserInfo,
  getKYCConsent,
};

type extraData = Partial<{
  fileFormat: string;
  fileSize: string;
  attempt_number: number;
  userChanged: boolean;
  manualVerification: boolean;
  cheque: boolean;
}>;

const connector = connect(mapStateToProps, mapDispatchToProps);

interface BankProps extends ConnectedProps<typeof connector> {}

const Bank: NextPage = (props: BankProps) => {
  const headerData = getHeaderData(kycStepDataArr, props.selectedAsset);

  const finalStyles = isMobile() ? mobileStyles : styles;

  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const step = 2;

  const [ifsc, setIFSC] = useState(props?.userKycDetails?.bank?.ifscCode || '');
  const [accountNo, setAccountNo] = useState(
    props?.userKycDetails?.bank?.accountNo || ''
  );
  const [accountType, setAccountType] = useState(
    props.userKycDetails?.bank?.accountType || ''
  );
  const [bankOCR, setBankOcr] = useState(false);

  const [isBackClicked, setIsBackClicked] = useState(false);

  const [accountVerified, setAccountVerified] = useState(
    Boolean(ifsc && accountNo)
  );

  const accredited = isUserAccredited(props.kycConsent);
  const [skipCheque, setSkipCheque] = useState(!accredited);

  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [error, setError] = useState('');
  const [showHints, setShowHints] = useState(false);

  const [showLoader, setShowLoader] = useState(true);
  const [disableManualInput, setDisableManualInput] = useState(false);

  const [showIFSCLoader, setIFSCLoader] = useState(false);
  const [ifscError, setIfscError] = useState('');
  const [ifscDetails, setIfscDetails] = useState('');

  // Store file size
  const [rudderEventData, setRudderEventData] = useState<extraData>({
    fileFormat: '',
    fileSize: '0',
    attempt_number: 0,
    userChanged: false,
    manualVerification: false,
    cheque: false,
  });

  const setWrongAttemptsMade = (n: number) => {
    props.setBankWrongAttempts(n);
    setWrongAttempts(n);
  };

  useEffect(() => {
    props.fetchUserInfo(props.access?.userID, () => {
      updateBankDetails();
      const document = getDocument();
      if (isDocumentUnderVerification(document)) {
        trackEvent('kyc_poa_added', {
          doctype: document?.kycType,
          address_in_doc: '',
          file_format_1: '',
          file_format_2: '',
          file_size: '',
          attempt_number: 3,
          user_changed: false,
          manual_verification: true,
        });
      }
      setShowLoader(false);
    });
    props.getKYCConsent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSkipCheque(!accredited);
  }, [accredited]);

  // Rudderstack event kyc_bank_added
  const sendRudderStackEvent = (newDataToBeUpdated?: extraData) => {
    const fileSize = Number(
      newDataToBeUpdated?.fileSize || rudderEventData.fileSize
    );
    const dataToSend = {
      account_no: accountNo,
      ifsc: ifsc,
      account_type: accountType,

      attempt_number: newDataToBeUpdated?.attempt_number || wrongAttempts,
      user_changed:
        newDataToBeUpdated?.userChanged || rudderEventData?.userChanged,
      manual_verification:
        newDataToBeUpdated?.manualVerification ||
        rudderEventData?.manualVerification,
      cheque_uploaded: newDataToBeUpdated?.cheque || rudderEventData?.cheque,
      file_format: newDataToBeUpdated?.fileFormat || rudderEventData.fileFormat,
      file_size: fileSize ? bytesToSize(fileSize) : '',
    };

    trackEvent('kyc_bank_added', dataToSend);

    if (Cookie.get('kycSource')) {
      trackEvent('Click_complete_kyc', {
        url: router.pathname,
        Is_FTI: !Boolean(props?.userData?.investmentData?.totalInvestments),
      });
    }
  };

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

  const updateBankDetails = () => {
    props.getUserKycDocuments(props?.access?.userID, () => {}, true);
    props.getPanAadhaarDetails();
    props.getBankInfo();
    setBankDetails();
  };

  useEffect(() => {
    setBankDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userKycDetails?.bank, props?.userKycDetails?.ocrResponse]);

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

  // After OCR IFSC Value is filled it should call ifsc validation api ( razorpay )
  useEffect(() => {
    validateIFSCBank(ifsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBackClick = () => {
    if (ifsc || accountNo) {
      setIFSC('');
      setAccountNo('');
      setBankOcr(false);
      setAccountVerified(accredited);
      setIsBackClicked(true);
    } else if (
      (isAssetBonds(props.selectedAsset) ||
        isSDISecondary(props.selectedAsset)) &&
      !ifsc &&
      !accountNo &&
      !isBackClicked
    ) {
      setIFSC('');
      setAccountNo('');
      setBankOcr(false);
      setIsBackClicked(true);
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

  const onOpenModal = () => {
    setShowModal(true);
  };

  const onCloseModal = () => {
    setShowModal(false);
  };

  const uploadDone = (chequeDetails?: any, apiError?: unknown) => {
    onCloseModal();
    if (props.userData?.kycPanStatus === 'pending verification') {
      setWrongAttemptsMade(3);
      callErrorToast('Your documents have been sent for manual verification');
      // Send rudderstack event
      sendRudderStackEvent({
        manualVerification: true,
        attempt_number: 3,
        userChanged: false,
        cheque: true,
      });
      if (
        isAssetBonds(props.selectedAsset) ||
        isSDISecondary(props.selectedAsset)
      ) {
        router.push('/kyc/cmr-cml');
      } else {
        router.push('/kyc/others');
      }
      return;
    }
    if (apiError) {
      setError(String(apiError));
      setWrongAttemptsMade(wrongAttempts + 1);
      setBankOcr(false);
      setIsBackClicked(false);
    } else if (!isEmpty(chequeDetails)) {
      setBankOcr(true);
      setSkipCheque(false);
      setIsBackClicked(false);
    }
    // setWrongAttemptsMade(0);
    // Update bank details after successfull upload
    updateBankDetails();
  };

  const bankVerificationHandler = () => {
    setAccountVerified(true);
    onCloseModal();
    props.clearOcrResponse();
    updateBankDetails();
    sendRudderStackEvent();
    callSuccessToast('Bank Details Successfully Verified');
  };

  const verificationErrorHandler = (errorMessage: string) => {
    setAccountVerified(false);
    onCloseModal();
    setBankOcr(false);
    setWrongAttemptsMade(wrongAttempts + 1);
    props.getBankInfo();

    if (wrongAttempts >= 2) {
      setAccountNo('');
      setIFSC('');
      setAccountVerified(true);
      setDisableManualInput(true);
      if (isBankDocumentUnderVerification(props.userKycDetails.bank)) {
        // Bank Under verification rudderstack event
        updateRudderEventData({
          manualVerification: true,
        });
        sendRudderStackEvent();
        callErrorToast(
          `Unable to verify bank details for more than 3 times. The document is sent for manual verification`
        );
      } else {
        callErrorToast(
          `Unable to verify bank details for more than 3 times. Please upload a Cancelled Cheque for further verification`
        );
      }
    } else {
      if (errorMessage) {
        callErrorToast(errorMessage);
      } else {
        callErrorToast(
          `Unable to verify bank details. Make sure you've entered them correctly`
        );
      }
    }
  };

  const onActionClick = () => {
    const bankDetails = props.userKycDetails?.bank;

    if (ifsc && accountNo && accountType) {
      if (
        ifsc === bankDetails?.ifscCode &&
        accountNo === bankDetails?.accountNo &&
        bankDetails?.status === kycStatuses[2] &&
        !accredited
      ) {
        if (
          isAssetBonds(props.selectedAsset) ||
          isSDISecondary(props.selectedAsset)
        ) {
          router.push('/kyc/cmr-cml');
        } else {
          router.push('/kyc/others');
        }
      } else {
        onOpenModal();
        props.initiateKYCForBank(
          {
            ifscCode: ifsc,
            accountNo,
            accountType,
            sendToTerminal: wrongAttempts > 2,
            enhancedKyc: accredited,
          },
          bankVerificationHandler,
          verificationErrorHandler
        );
        setWrongAttemptsMade(0);
      }
    } else {
      callErrorToast(`Missing mandatory field(s)`);
    }
  };

  const onChangeAccountType = (e: any) => {
    const value = e.target.value;

    if (value === accountTypes[4].value || value === accountTypes[5].value) {
      callErrorToast(
        'Grip currently doesn’t accept funds or make returns to the chosen account type'
      );
      setAccountType('');
      return;
    }

    setAccountType(value);
  };

  const onChangeBankDocument = (file: any, isReupload: boolean) => {
    if (isReupload) {
      setError('');
      return;
    }
    onOpenModal();
    const sendToTerminal = wrongAttempts >= 2;
    updateRudderEventData({
      fileFormat: file?.type,
      fileSize: file?.size,
      cheque: true,
    });

    props.uploadKycDocuments(
      file,
      'bank',
      `cheque`,
      uploadDone,
      undefined,
      false,
      sendToTerminal
    );
  };

  const onChangeManualUpdate = () => {
    setBankOcr(true);
  };

  const onChangeManualCheque = () => {
    setBankOcr(false);
    setIFSC('');
    setAccountNo('');
    setIsBackClicked(true);
  };

  const successIFSC = (data: any) => {
    setIFSCLoader(false);
    if (data?.statusCode === 200 || Object.keys(data?.result).length) {
      const bankDetails = getBranchName(data?.result);
      setIfscDetails(bankDetails);
    } else {
      setWrongAttemptsMade(3);
    }
  };

  const failIFSC = (ifscFailed: any) => {
    setIfscDetails('');
    // Disable manual input after 3 wrong attempts
    if (wrongAttempts + 1 >= 3) {
      setDisableManualInput(true);
    }
    // Increase the wrong Attempts
    setWrongAttemptsMade(wrongAttempts + 1);
    // Loader for IFSC Input
    setIFSCLoader(false);
    // if 404 then show failed else send to terminal
    if (!ifscFailed?.includes('Internal Server Error')) {
      setIfscError(ifscFailed);
    } else {
      setWrongAttemptsMade(3);
      setDisableManualInput(true);
    }
  };

  const validateIFSCBank = (value: string) => {
    if (isValidIFSC(value)) {
      // Call the Razorpay API
      setIFSCLoader(true);
      props.getDataFromIFSC(value, successIFSC, failIFSC);
    } else {
      setIfscDetails('');
    }
  };

  const onChangeIFSC = (e: any) => {
    const value = String(e.target.value);
    setUserChanged();

    // 11 digit validation for IFSC
    if (value.length <= 11) {
      setIFSC(value);
      setIfscError('');
      setIfscDetails('');
    }

    if (value.length === 11) {
      validateIFSCBank(value);
    }
  };

  const onChangeAccountNo = (e: any) => {
    const value = e.target.value;
    setAccountNo(value);
    setUserChanged();
  };

  const onClickReupload = () => {
    setError('');
    if (
      isAssetBonds(props.selectedAsset) ||
      isSDISecondary(props.selectedAsset)
    ) {
      setUserData({
        cheque: {},
      });
    }
  };

  const onChange = {
    accountType: onChangeAccountType,
    cheque: onChangeBankDocument,
    manualUpdateBank: onChangeManualUpdate,
    manualUploadCheque: onChangeManualCheque,
    ifsc: onChangeIFSC,
    accountNo: onChangeAccountNo,
    reupload: onClickReupload,
  };

  const getFormValues = (id: string) => {
    const formValues = {
      accountType,
      accountNo,
      ifsc,
      accredited,
      accountVerified,
      disableManualInput,
      showIFSCLoader,
      ifscError,
      ifscDetails,
    };

    return formValues[id];
  };

  const setBankDetails = () => {
    const details = props?.userKycDetails?.bank ?? {};
    const ocrResponse = props?.userKycDetails?.ocrResponse ?? {};

    // After OCR IFSC Value is filled it should call ifsc validation api ( razorpay )
    validateIFSCBank(ocrResponse?.ifsc || details?.ifscCode || '');

    setIFSC(ocrResponse?.ifsc || details?.ifscCode || '');
    setAccountNo(ocrResponse?.account_no || details?.accountNo || '');
    setAccountVerified(Boolean(details?.ifscCode && details?.accountNo));
    if (isUserAccredited(props.kycConsent)) {
      setBankOcr(false);
    } else {
      setBankOcr(Boolean(details?.ifscCode && details?.accountNo));
    }
  };

  const shouldRenderBankDetails = () => {
    // When we want to show uploadCheque
    if (isBackClicked || wrongAttempts >= 3) {
      return false;
    }

    /**
     * When not accredidated
     * 1. Show details page first
     * 2. If cheque change clicked then show uploadCheque
     */
    if (!accredited) {
      return true;
    }

    // When cheque is not empty show details page
    if (!isEmpty(props?.userData?.cheque)) {
      return true;
    }

    return (
      (wrongAttempts < 3 && skipCheque) ||
      (accountVerified &&
        (!accredited || (accredited && !isEmpty(props?.userData?.cheque))))
    );
  };

  const getFormData = () => {
    const shouldRenderUploadCheque = isEmpty(props?.userData?.cheque);
    if (Boolean(error)) {
      return failCardData;
    } else if (shouldRenderUploadCheque) {
      return uploadWithPanPendingFormData;
    } else {
      return postUploadDataForm;
    }
  };

  const onHintsClick = () => {
    setShowHints(true);
  };

  const onCloseHintsModal = () => {
    setShowHints(false);
  };

  const getDocument = () => {
    let addressDetails: any = {};
    const { aadhaar, passport } = props?.userKycDetails;
    if (!isEmpty(aadhaar)) {
      addressDetails = aadhaar;
    } else if (!isEmpty(passport)) {
      addressDetails = passport;
    }
    return addressDetails;
  };

  const isActionDisabled = () => {
    if (
      isAssetBonds(props.selectedAsset) ||
      isSDISecondary(props.selectedAsset)
    ) {
      return Boolean(accountType && ifsc && accountNo);
    }

    return (
      Boolean(ifsc && accountNo && accountType) &&
      isValidIFSC(ifsc) &&
      !showIFSCLoader &&
      !Boolean(ifscError)
    );
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
        id="bank"
        step={step}
        data={kycStepDataArr}
        actionActive={isActionDisabled()}
        onActionClick={onActionClick}
        formData={getFormData()}
        onChangeFunctions={onChange}
        getFormValues={getFormValues}
        formError={error}
        isMultipleForms={true}
        showHintsModal={showHints}
        onCloseHintsModal={onCloseHintsModal}
        showHintsMobile={!shouldRenderBankDetails()}
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
          isBottomModal={false}
        />
      </BackdropComponent>
      {isDocumentUnderVerification(getDocument()) ? (
        <UnderVerification name={'Address Proof'} />
      ) : null}
      <BackdropComponent open={showLoader} />
    </div>
  );
};

export default connector(Bank);
