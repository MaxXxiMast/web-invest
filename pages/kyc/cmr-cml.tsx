import { NextPage } from 'next';
import Cookie from 'js-cookie';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import styles from '../../styles/ProfileKYC.module.css';
import mobileStyles from '../../styles/ProfileKYCMobile.module.css';

import Header from '../../components/kyc/Header';
import ActionButton from '../../components/kyc/ActionButton';
import Modal from '../../components/kyc/Modal';
import BackdropComponent from '../../components/common/BackdropComponent';
import UnderVerification from '../../components/kyc/UnderVerification';
import KYCLayout from '../../components/kyc/kycLayout';

import { kycStepDataArr, panActions, modalData } from '../../pages_utils/kyc';
import {
  accreditedPostUploadDataForm,
  cmrheader,
  failCardData,
  postUploadDataForm,
} from '../../pages_utils/cmr_cml';

import { RootState } from '../../redux';
import {
  addDepository,
  getBankInfo,
  getPanAadhaarDetails,
  setDepositoryDetails,
  updateUser,
  uploadKycDocuments,
  deleteCMRDocument,
  resetDepositoryDetails,
  resetPANDetails,
  resetBankDetails,
} from '../../redux/slices/user';

import {
  getAccountNumberValue,
  getClientIdValue,
  getDpIdValue,
  getIfscValue,
  getHeaderData,
  getMICRValue,
  isDocumentUnderVerification,
  accountTypes,
} from '../../utils/kyc';
import { isMobile } from '../../utils/resolution';

import { callErrorToast, callSuccessToast } from '../../api/strapi';
import OtherBrokerModal from '../../components/kyc/OtherBrokerModal';
import { getKycUrl } from '../../utils/user';
import { resetSelectedDetails, setSelected } from '../../redux/slices/assets';
import { bytesToSize } from '../../utils/number';
import { trackEvent } from '../../utils/gtm';
import { resetProductType } from '../../redux/slices/access';
import { generateAssetURL } from '../../utils/asset';

const mapStateToProps = (state: RootState) => ({
  userKycDetails: state.user.kycDetails,
  userData: state.user.userData,
  user: state.user,
  kycConsent: state.user.kycConsent,
  depositoryDetails: state.user.depositoryDetails,
  ocrResponse: state?.user?.kycDetails?.depository?.userDocument?.ocrResponse,
  selectedAsset: state.access?.selectedAsset,
  access: state.access,
});

const mapDispatchToProps = {
  getPanAadhaarDetails,
  uploadKycDocuments,
  updateUser,
  getBankInfo,
  setDepositoryDetails,
  addDepository,
  deleteCMRDocument,
  resetDepositoryDetails,
  resetPANDetails,
  resetBankDetails,
  resetSelectedDetails,
  setSelected,
  resetProductType,
};

type extraData = Partial<{
  accountNo: string | number;
  ifsc: string | number;
  panNumber: string | number;
  clientIdNumber: string | number;
  dpIdNumber: string | number;
  attemptNumber: number;
  manualVerification: boolean;
  fileFormat: string;
  fileSize: string | number;
}>;

const connector = connect(mapStateToProps, mapDispatchToProps);

interface CMRProps extends ConnectedProps<typeof connector> {}

const CmrCml: NextPage = (props: CMRProps) => {
  const verified = 'verified';
  const headerData = getHeaderData(kycStepDataArr, props.selectedAsset);
  const kycType = 'depository';
  const step = 4;
  let isMultipleForms = true;
  const finalStyles = isMobile() ? mobileStyles : styles;
  const router = useRouter();

  //CMR VALUES FOR DIFFERENT BROKERS
  const ifcsNumber = getIfscValue(props?.ocrResponse);
  const micrNumber = getMICRValue(props?.ocrResponse);
  const accountNumber = getAccountNumberValue(props?.ocrResponse);
  const clientIdNumber = getClientIdValue(props?.ocrResponse);
  const dpIdNumber = getDpIdValue(props?.ocrResponse);

  const userPANNumber = props?.ocrResponse?.firstHolderPan?.value;

  const accBrokerName =
    props?.userKycDetails?.depository?.brokerName ||
    props?.user?.depositoryDetails?.brokerName;
  const accDpName =
    props?.userKycDetails?.depository?.dpName ||
    props?.user?.depositoryDetails?.dpName;

  const [showModal, setShowModal] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [isErrorFromData, setIsErrorFormData] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [brokerName, setBrokerName] = useState(accBrokerName || '');
  const [dpName, setDpName] = useState(accDpName || '');
  const [micr, setMICR] = useState(micrNumber || '');
  const [ifsc, setIFSC] = useState(ifcsNumber || '');
  const [dpID, setDPID] = useState(dpIdNumber || '');
  const [clientID, setClientID] = useState(clientIdNumber || '');
  const [accountNo, setAccountNo] = useState(accountNumber || '');
  const [panNumber, setPanNumber] = useState(userPANNumber || '');
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [assetURL, setAssetURL] = useState('/assets');

  const [accountType, setAccountType] = useState(
    props?.userKycDetails?.bank?.accountType || accountTypes[1].value
  );

  // Store file size
  const [rudderEventData, setRudderEventData] = useState<extraData>({
    fileFormat: '',
    fileSize: '0',
    attemptNumber: 0,
    manualVerification: false,
  });

  useEffect(() => {
    router.events.on('routeChangeStart', () => setShowLoader(true));
    router.events.on('routeChangeComplete', () => setShowLoader(false));

    return () => {
      router.events.off('routeChangeStart', () => setShowLoader(true));
      router.events.off('routeChangeComplete', () => setShowLoader(false));
    };
  }, [router]);

  useEffect(() => {
    if (props?.selectedAsset?.assetID) {
      setAssetURL(generateAssetURL(props?.selectedAsset));
    }
  }, [props?.selectedAsset]);

  useEffect(() => {
    props.getPanAadhaarDetails();
    props.getBankInfo();
    if (!props?.selectedAsset?.assetID) {
      props.setSelected({
        financeProductType: 'Bonds',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { userData, userKycDetails } = props;
    const kycUrl = getKycUrl(
      {
        ...userData,
      },
      userKycDetails,
      props.selectedAsset
    );
    router.push(kycUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userData]);

  useEffect(() => {
    handleDepositoryDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.userKycDetails?.depository,
    props?.userKycDetails?.depository?.userDocument?.ocrResponse,
  ]);

  // Rudderstack event kyc_cmr_added
  const sendRudderStackEvent = (dataToBeUpdated: extraData) => {
    const fileSize = Number(dataToBeUpdated?.fileSize);
    const dataToSend = {
      account_no: dataToBeUpdated?.accountNo,
      ifsc: dataToBeUpdated?.ifsc,
      pan: dataToBeUpdated?.panNumber,
      client_id: dataToBeUpdated?.clientIdNumber,
      dpid: dataToBeUpdated?.dpIdNumber,
      attempt_number: dataToBeUpdated?.attemptNumber,
      manual_verification: dataToBeUpdated?.manualVerification,
      file_format: dataToBeUpdated?.fileFormat,
      file_size: fileSize ? bytesToSize(fileSize) : '',
      source: isMobile() ? 'mobile' : 'desktop',
    };
    trackEvent('kyc_cmr_added', dataToSend);
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

  const handleDepositoryDetails = () => {
    setIFSC(ifcsNumber || '');
    setAccountNo(accountNumber || '');
    setBrokerName(accBrokerName || '');
    setDpName(accDpName || '');
    setPanNumber(userPANNumber || '');
    setMICR(micrNumber || '');
    setDPID(dpIdNumber || '');
    setClientID(clientIdNumber || '');
  };

  const onBackClick = () => {
    if (assetURL) {
      router.push(assetURL);
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

  const onCloseModal = () => {
    setShowModal(false);
  };

  const updateCMRDetails = () => {
    props.getPanAadhaarDetails();
  };

  const redirectTo = (url?: string) => {
    setTimeout(() => {
      window.open(url || '/assets', '_self');
    }, 100);
  };

  const handleRedirection = () => {
    if (!props?.selectedAsset?.assetID) {
      // props.resetSelectedDetails() COMMENT FOR OLD FLOW WITHOUT BROWSER SECURITY,;
      props.resetProductType();
      redirectTo();
    } else {
      redirectTo(assetURL);
    }
  };

  const sendSignUpCompletedEvent = () => {
    const { user } = props;
    const experianReport = user?.experianData?.experianReport ?? {};
    trackEvent('KYC Completed', {
      experian_score: experianReport?.creditScore ?? '',
      experian_salary: experianReport.incomeSegment ?? '',
    });
  };

  const handleVerified = (
    bankDetailsx: any,
    panDetailsx: any,
    aadharDetails: any
  ) => {
    return (
      bankDetailsx?.status !== verified ||
      panDetailsx?.status !== verified ||
      aadharDetails?.status !== verified
    );
  };

  const handleDataSuccessEvent = (message = '') => {
    props.addDepository(
      {
        clientID,
        dpID,
        accountNo,
        panNo: panNumber,
        ifscCode: ifsc,
      },
      () => {
        if (message) {
          callSuccessToast(message);
        }
        handleRedirection();
        sendSignUpCompletedEvent();
      },
      () => {
        handleRedirection();
      }
    );
  };

  const onActionClick = () => {
    if (!isActionDisabled()) {
      callErrorToast(`Missing mandatory field`);
      return;
    }

    const panDetailsx = props.user?.kycDetails?.pan;
    const bankDetailsx = props.user?.kycDetails?.bank;
    const aadharDetails = props.user?.kycDetails?.aadhaar;

    if (handleVerified(bankDetailsx, panDetailsx, aadharDetails)) {
      handleDataSuccessEvent('Data sent to terminal for validation');
    }

    if (panDetailsx?.docIDNo === panNumber) {
      sendRudderStackEvent({
        accountNo: accountNumber,
        ifsc: ifcsNumber,
        panNumber: panNumber,
        clientIdNumber: clientIdNumber,
        dpIdNumber: dpIdNumber,
        attemptNumber: wrongAttempts,
        manualVerification: false,
        fileFormat: rudderEventData.fileFormat,
        fileSize: rudderEventData.fileSize,
      });
      // CHECK IF BANK DETAILS NOT MATCH THEN SEND TO TERMINAL
      handleDataSuccessEvent('CMR/CML KYC completed successfully');
    }

    window.scroll(0, 0);
    setIsErrorFormData(true);
  };

  const onOpenModal = () => {
    setShowModal(true);
  };

  const uploadDone = (success?: any, apiError?: unknown) => {
    const ocrResponse = success?.ocrResponse;
    onCloseModal();

    if (!Object.keys(ocrResponse).length) {
      // Sending RudderEvent for attempt number 3
      sendRudderStackEvent({
        accountNo: getAccountNumberValue(ocrResponse),
        ifsc: getIfscValue(ocrResponse),
        panNumber: ocrResponse?.firstHolderPan?.value,
        clientIdNumber: getClientIdValue(ocrResponse),
        dpIdNumber: getDpIdValue(ocrResponse),
        attemptNumber: 3,
        manualVerification: true,
        fileFormat: rudderEventData.fileFormat,
        fileSize: rudderEventData.fileSize,
      });

      callErrorToast('Data sent to terminal for validation');
      router.push('/assets');
      return;
    }

    if (apiError) {
      setWrongAttempts(wrongAttempts + 1);
    } else {
      setWrongAttempts(0);
      // Update details after successfull upload
      updateCMRDetails();
    }
  };

  const onCMRChange = (
    file?: File,
    isReupload = false,
    btnType: string = ''
  ) => {
    // CHECK IF ANY ERROR BLOCK
    if (btnType === 'cmr') {
      props.deleteCMRDocument('depository');
      props.resetDepositoryDetails();
      handleDepositoryDetails();
    } else if (btnType === 'kyc') {
      props.deleteCMRDocument('pan');
      props.resetPANDetails();
      window.location.reload();
    } else if (btnType === 'cheque') {
      props.deleteCMRDocument('bank');
      props.resetBankDetails();
      window.location.reload();
    }

    if (btnType) {
      isMultipleForms = false;
      setIsErrorFormData(false);
      return;
    }

    if (isReupload) {
      setIsErrorFormData(false);
      return;
    }

    onOpenModal();
    const sendToTerminal = wrongAttempts >= 2;

    updateRudderEventData({
      fileFormat: file?.type,
      fileSize: file?.size,
    });

    props.uploadKycDocuments(
      file,
      'kyc',
      kycType,
      uploadDone,
      undefined,
      false,
      sendToTerminal
    );
  };

  const onChangeBroker = (e: any) => {
    const value = e.target.value;
    setBrokerName(value);
    props.setDepositoryDetails({
      brokerName: value,
    });
  };

  const onChangeDepository = (e: any) => {
    const value = e.target.value;
    setDpName(value);
    props.setDepositoryDetails({
      dpName: value,
    });
  };

  const onChangePanNumber = (e: any) => {
    const value = e.target.value;
    setPanNumber(value);
  };

  const onChangeMICR = (e: any) => {
    const value = e.target.value;
    setMICR(value);
  };

  const onChangeIFSC = (e: any) => {
    const value = e.target.value;
    setIFSC(value);
  };

  const onChangeDpID = (e: any) => {
    const value = e.target.value;
    setDPID(value);
  };

  const onChangeClientID = (e: any) => {
    const value = e.target.value;
    setClientID(value);
  };

  const onChangeAccountNo = (e: any) => {
    const value = e.target.value;
    setAccountNo(value);
  };

  const onAccountTypeChange = (e: any) => {
    const value = e.target.value;
    setAccountType(value);
  };

  const onChange = {
    cmr: onCMRChange,
    brokerName: onChangeBroker,
    dpName: onChangeDepository,
    micr: onChangeMICR,
    ifsc: onChangeIFSC,
    dpID: onChangeDpID,
    clientID: onChangeClientID,
    accountNo: onChangeAccountNo,
    panNumber: onChangePanNumber,
    accountType: onAccountTypeChange,
  };

  const getFormValues = (id: string) => {
    const formValues = {
      cmr: '',
      depository: '',
      brokerName,
      dpName,
      micr,
      ifsc,
      dpID,
      clientID,
      accountNo,
      panNumber,
      accountType,
    };
    return formValues[id];
  };

  const handleFormSubmitEvent = () => {
    const panDetailsx = props.user?.kycDetails?.pan;
    const bankDetailsx = props.user?.kycDetails?.bank;
    const aadharDetails = props.user?.kycDetails?.aadhaar;
    const isInvestedUser = props?.userData?.investmentData?.isInvested;
    isMultipleForms = false;

    if (handleVerified(bankDetailsx, panDetailsx, aadharDetails)) {
      isMultipleForms = true;
      return postUploadDataForm;
    }
    if (isInvestedUser && panDetailsx?.docIDNo !== panNumber) {
      return failCardData('INVESTED', panDetailsx.docIDNo);
    } else if (panDetailsx?.docIDNo !== panNumber) {
      return failCardData('PAN', panDetailsx.docIDNo);
    }

    // COMMENTED TO BYPASS BAN DETAIL CHECKS
    // else if (
    //   bankDetailsx?.accountNo !== accountNo ||
    //   bankDetailsx?.ifscCode !== ifsc ||
    //   bankDetailsx?.status !== 'verified'
    // ) {
    //   return failCardData('BANK', bankDetailsx?.accountNo);
    // }
    else {
      isMultipleForms = true;
      return postUploadDataForm;
    }
  };

  const getFormData = () => {
    const depositoryDetails =
      props.user?.kycDetails?.depository?.userDocument?.ocrResponse;

    if (depositoryDetails && Object.keys(depositoryDetails).length) {
      return postUploadDataForm;
    } else {
      return accreditedPostUploadDataForm;
    }
  };

  const handleTrim = (value: string = '') => {
    return value.trim();
  };

  const isActionDisabled = () => {
    const formData: any = getFormData();
    if (
      !handleTrim(panNumber) ||
      !handleTrim(accountNo) ||
      !handleTrim(micr) ||
      !handleTrim(ifsc) ||
      !handleTrim(dpID) ||
      !handleTrim(clientID) ||
      !handleTrim(accountType) ||
      formData?.isErrorData ||
      isErrorFromData
    ) {
      return false;
    }
    return true;
  };

  return (
    <div className={`${finalStyles.profileContainer}`}>
      <Header
        data={cmrheader}
        onBackClick={onBackClick}
        onHintsClick={onHintsClick}
        step={step}
        contentData={headerData}
      />
      <KYCLayout
        id="cmrCml"
        step={step}
        data={kycStepDataArr}
        actionActive={isActionDisabled()}
        onActionClick={onActionClick}
        formData={isErrorFromData ? handleFormSubmitEvent() : getFormData()}
        onChangeFunctions={onChange}
        getFormValues={getFormValues}
        isMultipleForms={isMultipleForms}
        showHintsModal={showHints}
        onCloseHintsModal={onCloseHintsModal}
        showHintsMobile={false}
        handleOtherBrokerModal={(id: string) => {
          setSelectedBrokerId(id);
          setShowOtherModal(true);
        }}
        assetData={props?.selectedAsset}
      />
      {!isMobile() ? (
        <ActionButton
          active={isActionDisabled()}
          data={panActions}
          onClick={onActionClick}
          redirectionURL={assetURL}
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
      <OtherBrokerModal
        showModal={showOtherModal}
        handleModalClose={() => setShowOtherModal(false)}
        selectedId={selectedBrokerId}
      />
      {isDocumentUnderVerification(props.userKycDetails?.bank) ? (
        <UnderVerification name={'Bank'} />
      ) : null}
      <BackdropComponent open={showLoader} />
    </div>
  );
};

export default connector(CmrCml);
