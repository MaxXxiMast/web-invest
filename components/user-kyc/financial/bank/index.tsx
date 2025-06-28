// NODE MODULES
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';

// API's
import { callErrorToast, callSuccessToast } from '../../../../api/strapi';
import { getRetryCounts, handleVerifyDocument } from '../../../../api/rfqKyc';

// UTILS
import { useKycContext } from '../../../../contexts/kycContext';
import {
  accPrefixNote,
  fieldOptions,
  savingsBankAccountType,
  handleNoteTxt,
  bankSuccessNote,
  successAccountDetails,
} from '../../utils/financialUtils';
import {
  BankDataModal,
  VerifyReqBodyModel,
  BankFieldErrorModel,
  ErrorMessModel,
} from '../../utils/models';
import {
  existingUserMessage,
  trackKYCCheckpointEvt,
  trackKYCErrorEvt,
} from '../../utils/helper';
import { bankAccNumberRegex, ifscCodeRegex } from '../../../../utils/kyc';
import { trackEvent } from '../../../../utils/gtm';
import { bytesToSize } from '../../../../utils/number';
import { postMessageToNativeOrFallback } from '../../../../utils/appHelpers';

// CUSTOM COMPONENTS
import GripSelect from '../../../common/GripSelect';
import InputFieldSet from '../../../common/inputFieldSet';
import StepTitle from '../../common/StepTitle';
import ErrorCard from '../../common/ErrorCard';
import Note from '../../common/Note';
import DocUploadForm from './DocUploadForm';
import LayoutFooter from '../../footer';

// Redux
import { setOverallKYCStatus } from '../../../../redux/slices/rfq';

// STYLESHEETS
import classes from './Bank.module.css';

const GenericModal = dynamic(() => import('../../common/GenericModal'), {
  ssr: false,
});

const defaultErrState = {
  accNoErr: false,
  accTypeErr: false,
  ifscErr: false,
};

const defaultErrMess = {
  heading: '',
  message: '',
  type: '',
};

const checkNullVal = (value: any) => {
  return value === null || value === 'null';
};

const handleBranchName = (branchName = '', branchCity = '') => {
  if (!checkNullVal(branchName) && !checkNullVal(branchCity)) {
    return `${branchName}, ${branchCity}`;
  }

  return null;
};

const safeParseErrorMessage = (errorMessage: string): string => {
  try {
    const parsed = JSON.parse(errorMessage);
    return parsed?.message || errorMessage;
  } catch {
    return errorMessage;
  }
};

type BankEventProperties = {
  account_no: string;
  ifsc: string;
  account_type: string;
  cheque_uploaded?: boolean;
  manual_verification?: boolean;
  file_format?: string;
  file_size?: string;
};

const Bank = () => {
  const dispatch = useDispatch();

  const { updateCompletedKycSteps, kycValues, completedKycSteps, ifscConfig } =
    useKycContext();
  const { ifscMatchArr = [], ifscNote = '' } = ifscConfig;

  const bankData: any = kycValues?.bank ?? {};

  const [showFetchModal, setShowFetchModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFooterDisabled, setIsFooterDisabled] = useState(false);
  const [isFooterLoading, setIsFooterLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<BankDataModal>>({
    accountType: bankData?.accountType || savingsBankAccountType.value,
    accountNo: bankData?.accountNumber,
    ifscCode: bankData?.ifscCode,

    branchName: handleBranchName(bankData?.branchName, bankData?.branchCity),
  });

  const [uploadFile, setUploadFile] = useState<File>(null);

  const [errors, setErrors] = useState<BankFieldErrorModel>(defaultErrState);
  const [errMess, setErrMess] = useState<ErrorMessModel>(defaultErrMess);
  const [showSbiBankNote, setShowSbiBankNote] = useState(false);
  const [showIFSCNote, setShowIFSCNote] = useState(false);

  const errorTypeArr = ['retry', 'INVALID_DOCUMENT'];

  const isErr = errorTypeArr.includes(errMess?.type);
  const isZoopErr = errMess?.type === 'ZOOP_ERROR';

  const bankStepDetails = completedKycSteps.filter(
    (ele) => ele.name === 'bank'
  )[0];

  const isExisitingUser = bankStepDetails?.isExistingData;

  const handleChangeEvent = (event: any, type = '') => {
    if (type === 'select') {
      setFormData({ ...formData, accountType: event?.target?.value });
    } else {
      let value = event?.target?.value;
      if (event?.target?.id === 'ifscCode') {
        value = value?.toUpperCase();
        if (ifscMatchArr.some((ele: string) => value.startsWith(ele))) {
          setShowIFSCNote(true);
        } else {
          setShowIFSCNote(false);
        }
      }
      setFormData({ ...formData, [event?.target?.id]: value });
    }
  };

  const completeBankVerification = (timeoutInMiliSecons = 200, status = 1) => {
    setTimeout(() => {
      updateCompletedKycSteps({ name: 'bank', status: status });
      if (isExisitingUser) {
        dispatch(setOverallKYCStatus('bank'));
      }
    }, timeoutInMiliSecons);
  };

  const trackBankAddedEvent = (data: BankEventProperties) => {
    trackEvent('kyc_bank_added', data);
  };

  const trackBankErrorEvent = (error: ErrorMessModel) => {
    // Event When Error
    trackKYCErrorEvt({
      module: 'bank',
      error_heading: error?.heading,

      error_type: error?.type,
      error_payload: error,
    });
  };

  const handleBankVerification = async () => {
    const errorObj: BankFieldErrorModel = {
      accNoErr: false,
      accTypeErr: false,
      ifscErr: false,
    };
    // Prevent if accout number not a number
    if (isNaN(Number(formData?.accountNo))) {
      errorObj.accNoErr = true;
    }

    if (!ifscCodeRegex.test(formData.ifscCode)) {
      errorObj.ifscErr = true;
    }

    if (!bankAccNumberRegex.test(formData.accountNo)) {
      errorObj.accNoErr = true;
    }

    setErrors(errorObj);
    if (errorObj.accNoErr || errorObj.accTypeErr || errorObj.ifscErr) {
      return;
    }
    setIsFooterLoading(true);
    const data = { ...formData };

    const isSBIPadding =
      formData?.ifscCode?.includes('SBIN') && formData?.accountNo?.length < 17;

    if (isSBIPadding) {
      data.accountNo = formData?.accountNo?.padStart(17, '0');
    }

    setShowFetchModal(true);
    try {
      const postData: VerifyReqBodyModel = {
        docType: 'kyc',
        docSubType: 'cheque',
        docData: {
          ifscCode: data.ifscCode,

          accountNo: data.accountNo,

          accountType: data.accountType,
        },
      };
      const response = await handleVerifyDocument(postData);
      if (!Object.keys(response)?.length) {
        setShowFetchModal(false);
        return;
      }

      trackBankAddedEvent({
        account_no: data.accountNo,

        ifsc: data.ifscCode,

        account_type: data.accountType,
        cheque_uploaded: false,
        manual_verification: false,

        file_format: null,

        file_size: null,
      });
      setFormData({
        ...data,
        branchName: response?.branchName,
        accountName: response?.accountName,
      });
      // If IFSC is SBI
      if (isSBIPadding) {
        setShowSbiBankNote(true);
      }
      // Show Success Modal and redirect to cmr after 5 seconds
      setShowSuccessModal(true);
      completeBankVerification(3000);
    } catch (error) {
      // BANK UPLOAD ERROR means retry attempt exceeded
      callErrorToast(safeParseErrorMessage(error?.message || ''));
      const res = await getRetryCounts();
      const errorType = res.kycChequeVerify > 2 ? 'retry' : error?.type;
      // Set retry error if attempt is more than 2
      setErrMess({
        heading: error?.heading,
        message: error?.message,
        type: errorType,
      });

      trackBankErrorEvent({
        ...error,
        type: errorType,
      });
      setIsFooterLoading(false);
      setIsFooterDisabled(true);
      if (error?.type === 'BANK_VERIFY_ERROR') {
        setErrors({
          ...errorObj,
          accNoErr: true,
        });
      }
    }
    setShowFetchModal(false);
  };

  const handleReEnterClick = () => {
    setIsFooterDisabled(true);
    setErrMess(defaultErrMess);
  };

  const handleFooterClick = () => {
    if (!isFooterDisabled) {
      handleBankVerification();
    }
  };

  useEffect(() => {
    if (
      formData?.accountType &&
      formData?.accountNo &&
      formData?.ifscCode &&
      !errMess?.type
    ) {
      setIsFooterDisabled(false);
    } else {
      setIsFooterDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  useEffect(() => {
    if (isErr && !uploadFile) {
      setIsFooterDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadFile]);

  // On Page loaded
  useEffect(() => {
    trackKYCCheckpointEvt('bank');
    postMessageToNativeOrFallback('kycEvent', {
      kycStep: 'bank',
    });
  }, []);

  const handleUploadCB = (
    type: 'error' | 'success',
    data?: unknown,
    file?: File
  ) => {
    setUploadFile(file);
    if (type === 'success') {
      trackBankAddedEvent({
        account_no: formData?.accountNo,

        ifsc: formData?.ifscCode,

        account_type: formData?.accountType,
        cheque_uploaded: true,
        manual_verification: true,
        file_format: file?.type.split('/')[1],
        file_size: file?.size ? bytesToSize(file.size) : '',
      });
      // Go to next step and show under verification message
      callSuccessToast('Bank document submitted for verification');
      completeBankVerification(200, 2);
      setIsFooterDisabled(false);
    } else {
      setIsFooterDisabled(true);
      const response: any = data;
      if (response && Object.keys(response).length > 0) {
        const errorType = response?.type || errMess.type;
        trackBankErrorEvent({
          ...response,
          type: errorType,
        });
        setErrMess({
          heading: response?.heading,
          message: response?.message,
          type: errorType,
        });
      }
    }
  };

  return (
    <>
      <hr className={classes.MobileHr} />
      <div className={`flex-column ${classes.Wrapper}`}>
        <StepTitle
          text="Bank Account Verification"
          className={classes.StepTitle}
        />
        {errMess?.type ? (
          <>
            {!uploadFile ? (
              <ErrorCard
                data={{
                  title: errMess?.heading,
                  message: errMess?.message,
                }}
                buttonText={`${
                  errMess?.type === 'INVALID_DOCUMENT'
                    ? 'Re-upload document'
                    : 'Re-enter Bank Account'
                }`}
                type="error"
                contact={{
                  title: 'Facing issues?',
                  email: 'invest@gripinvest.in',
                }}
                buttonVariant={isZoopErr ? 'Primary' : 'Secondary'}
                showBottomInfo={!(isZoopErr || isErr)}
                showBtn={!isErr}
                onClickButton={handleReEnterClick}
                trackPayloadDetails={{
                  module: 'bank',
                  error_type: errMess?.type,
                  error_payload: errMess,
                }}
              />
            ) : null}

            {isErr ? <DocUploadForm handleUploadCB={handleUploadCB} /> : null}
          </>
        ) : (
          <div className={`flex-column ${classes.FormWrapper}`}>
            <GripSelect
              value={formData?.accountType}
              onChange={(event) => handleChangeEvent(event, 'select')}
              options={fieldOptions}
              placeholder={'Select Account Type'}
              classes={{
                formControlRoot: classes.Select,
              }}
              id="accountType"
              disabled={
                isExisitingUser &&
                (bankData?.accountType || savingsBankAccountType.value)
              }
            />
            <div className={`flex-column ${classes.Field}`}>
              <InputFieldSet
                placeHolder={'Account Number'}
                label="Account Number"
                width={'100%'}
                type="number"
                inputId={'accountNo'}
                onChange={handleChangeEvent}
                value={formData?.accountNo}
                disabled={isExisitingUser && bankData?.accountNumber}
                error={errors?.accNoErr}
                showClear
              />
              {errors?.accNoErr ? (
                <span className={classes.Error}>
                  Please enter valid account number{' '}
                </span>
              ) : null}
            </div>

            <div className={`flex-column ${classes.FieldWithLabel}`}>
              <InputFieldSet
                placeHolder={'IFSC Code'}
                label="IFSC Code"
                width={'100%'}
                type="text"
                inputId={'ifscCode'}
                onChange={handleChangeEvent}
                value={formData?.ifscCode}
                disabled={isExisitingUser && bankData?.ifscCode}
                error={errors?.ifscErr}
                showClear
              />
              {errors?.ifscErr ? (
                <span className={classes.Error}>
                  Please enter valid IFSC code{' '}
                </span>
              ) : null}
              {formData?.branchName ? (
                <label>{formData?.branchName}</label>
              ) : null}
              {showIFSCNote ? (
                <Note
                  text={ifscNote}
                  className={classes.ifscVerificationIssueNote}
                  isSetDangerously
                />
              ) : null}
            </div>
          </div>
        )}
        <div className={`${classes.Note} ${classes.NoteExisting}`}>
          {showSbiBankNote ? (
            <Note className={classes.SbiNote} text={accPrefixNote} />
          ) : null}
          {isExisitingUser ? <Note text={existingUserMessage.bank} /> : null}
          {!(isZoopErr || isErr) ? (
            <Note text={handleNoteTxt()} className={classes.SbiNote} />
          ) : null}
        </div>
        {!errMess?.type && (
          <LayoutFooter
            footerLinkText={'Next'}
            showMsg={false}
            isLoading={isFooterLoading}
            renderOnlyButton={true}
            isFooterBtnDisabled={isFooterDisabled}
            handleBtnClick={handleFooterClick}
          />
        )}
      </div>
      {/* Verifying bank information modal */}
      <GenericModal
        showModal={showFetchModal}
        lottieType="verifying"
        title="Verifying Banking Information"
        subtitle="It will take up to 10 seconds!"
        className={classes.FetchModal}
        drawerExtraClass={classes.Drawer}
      />

      {/* Verified Bank Account */}
      <GenericModal
        showModal={showSuccessModal}
        title={bankSuccessNote.title}
        subtitle={bankSuccessNote.subtitle}
        className={classes.FetchModal}
        drawerExtraClass={classes.Drawer}
        customIcon={() => (
          <span className={`${classes.CheckMark} icon-check-circle`} />
        )}
      >
        <div className={`flex-column ${classes.AccountDetailsContainer}`}>
          {successAccountDetails.map((data) => {
            return (
              <div key={data.id}>
                {`${data.label} : `}
                <span>{formData[data.id]}</span>
              </div>
            );
          })}
        </div>
      </GenericModal>
    </>
  );
};

export default Bank;
