import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';

// Contexts
import { useKycContext } from '../../../../contexts/kycContext';

// Components
import Hints from '../../common/hints';
import InputFieldSet from '../../../common/inputFieldSet';
import Image from '../../../primitives/Image';
import CustomCheckbox from '../../../primitives/Checkbox';
import ErrorCard from '../../common/ErrorCard';
import StepTitle from '../../common/StepTitle';
import Note from '../../common/Note';
import AnimatedArrow from '../../../primitives/AnimatedArrow';
import CustomDatePicker from '../../../common/customDatePicker';
import LayoutFooter from '../../footer';
import KYCUploadButton from '../../common/KYCUploadButton';
import TooltipCompoent from '../../../primitives/TooltipCompoent/TooltipCompoent';
import CustomSkeleton from '../../../primitives/CustomSkeleton/CustomSkeleton';
import Timer from './Timer/index';

// Utils
import {
  InvalidPanErr,
  contactDetailsMessages,
  formErrorMessages,
  formValidators,
  modalsData,
  panHintsData,
  panUnderAgeError,
  panUnderVerificationMessage,
} from '../pan/utils';
import {
  GRIP_INVEST_BUCKET_URL,
  convertToUnderScoredType,
  isContainSpecialCharacters,
} from '../../../../utils/string';
import {
  DocumentProcessModel,
  ErrorCardType,
  ErrorModel,
  PanDataModal,
  PanDocumentResponseModel,
} from '../../utils/models';
import {
  convertAPIToDateInputFormat,
  convertDateInputToAPIFormat,
  existingUserMessage,
} from '../../utils/helper';
import {
  trackEvent,
  trackEventPostMessageToNativeOrFallback,
} from '../../../../utils/gtm';
import { GripLogo } from '../../../../utils/constants';
import { bytesToSize } from '../../../../utils/number';
import { panErrorStates } from '../../utils/identityUtils';
import { infoForAutoFetchPan, isNomineeNameValid } from './utils';
import { callErrorToast } from '../../../../api/strapi';

// APIs
import {
  createDigilockerRequest,
  getPanFromMobile,
  getRetryCounts,
  handleDocumentProcess,
  handleFetchKRAPanV2,
  handleVerifyDocument,
  isServiceActive,
} from '../../../../api/rfqKyc';

// Styles
import styles from './PanNumber.module.css';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../../../utils/appHelpers';
import { isGCOrder } from '../../../../utils/gripConnect';

const GenericModal = dynamic(() => import('../../common/GenericModal'), {
  ssr: false,
});

const NRIModal = dynamic(() => import('../../common/NRIModal'), {
  ssr: false,
});

const KycPanNumber = () => {
  const router = useRouter();

  const { kycValues, completedKycSteps, updateCompletedKycSteps } =
    useKycContext();

  const panStepDetails = completedKycSteps.filter(
    (ele) => ele.name === 'pan'
  )[0];

  const isExisitingUser = panStepDetails?.isExistingData;

  const panData: any = kycValues?.pan ?? {};

  const [showNRIModal, setShowNRIModal] = useState(false);
  const [showPepModal, setShowPepModal] = useState(false);
  const [showKRAFetchModal, setShowKRAFetchModal] = useState(false);
  const [panVerifyModal, setPanVerifyModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDigilockerRedirect, setShowDigilockerRedirect] = useState(false);
  const [isFooterDisabled, setIsFooterDisabled] = useState(false);
  const [isFooterLoading, setIsFooterLoading] = useState(false);
  const [reEnterCount, setReEnterCount] = useState(1);
  const [formData, setFormData] = useState<Partial<PanDataModal>>({
    panNo: panData?.panNumber ?? '',
    name: panData?.panHolderName ?? '',
    date: convertAPIToDateInputFormat(panData?.dob) ?? '',
    nominee: isNomineeNameValid(panData?.nomineeName)
      ? panData?.nomineeName
      : '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const isGC = isGCOrder();

  const [ocrData, setOcrData] = useState<
    Partial<PanDataModal> & { status?: number; retryCount?: number }
  >({
    panNo: panData?.panNumber ?? '',
    name: panData?.panHolderName ?? '',
    date: convertAPIToDateInputFormat(panData?.dob) ?? '',
    nominee: panData?.nomineeName ?? '',
    retryCount: panData?.retryCount ?? null,
  });
  const [errorMessages, setErrorMessages] = useState<Partial<PanDataModal>>({});

  const [panCardError, setPanCardError] = useState<Partial<ErrorModel>>({});
  const [errType, setErrorType] = useState<Partial<ErrorCardType>>('error');

  const [inputPanNumber, setInputPanNumber] = useState('');
  const [errorInputPanNumber, setErrorInputPanNumber] = useState('');
  const [panInputButtonLoading, setPanInputButtonLoading] = useState(false);
  const [panFetchingModal, setPanFetchingModal] = useState(false);
  const [isAutoFetched, setIsAutoFetched] = useState(false);
  const [showPanVerified, setShowPanVerified] = useState(false);
  const [mobilePanNumber, setMobilePanNumber] = useState<string>();
  const [isRetryAttempExhaused, setIsRetryAttempExhaused] = useState(
    ocrData?.retryCount > 2
  );
  const [updateNominee, setUpdateNominee] = useState(false);

  useEffect(() => {
    if (!isNomineeNameValid(panData?.nomineeName)) {
      setUpdateNominee(true);
    }
  }, [panData?.nomineeName]);

  useEffect(() => {
    const updatePanRetry = async () => {
      const res = await getRetryCounts();
      if (res?.kycPanProcess) {
        setIsRetryAttempExhaused(Number(res?.kycPanProcess) > 2);
      }
      // Added check health here, as we are using exhaust retry count to show upload button
      // We will show upload button only if health check fails as well which make issues while updating state
      await checkPanMicroHealth();
      setIsLoading(false);
    };

    updatePanRetry();
  }, []);

  useEffect(() => {
    if (isPanDataAvailable() && panStepDetails?.status !== 2) {
      setIsFooterDisabled(!isNomineeNameValid(formData?.nominee));
      setShowForm(true);
    } else {
      setIsFooterDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  useEffect(() => {
    const getPan = async () => {
      const res = await getPanFromMobile();
      trackEvent('kyc_pan_number_fetched', {
        status: Boolean(res?.data?.panNo),
      });
      if (res?.data?.panNo && typeof res.data.panNo === 'string') {
        setMobilePanNumber(res?.data?.panNo);
      }
    };
    getPan();
  }, []);

  useEffect(() => {
    if (!inputPanNumber && mobilePanNumber) {
      setInputPanNumber(mobilePanNumber.toUpperCase());
      setIsAutoFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobilePanNumber]);

  useEffect(() => {
    trackEvent('kyc_checkpoint', { module: 'pan' });
  }, []);

  // THIS WILL CHECK THE UNDER VERIFICATION STATUS
  useEffect(() => {
    if (panStepDetails?.status === 2) {
      setPanCardError({
        ...panUnderVerificationMessage,
      });
      setErrorType('underVerification');
      trackEvent('kyc_error', {
        module: 'pan',
        error_heading: panUnderVerificationMessage?.heading,
        error_type: 'underVerification',
        mode: 'OCR',
        error_payload: panStepDetails,
      });
    }
  }, [panStepDetails]);

  const checkPanMicroHealth = async () => {
    try {
      const isServiceData = await isServiceActive();
      if (isServiceData?.panZoop === 'SUCCESS') {
        return true;
      }

      setIsRetryAttempExhaused(true);
      setShowForm(false);
      return false;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  };

  const retryFetchKRAPan = async (retries = 1) => {
    try {
      return await handleFetchKRAPanV2();
    } catch (err) {
      if (retries > 1) {
        return await retryFetchKRAPan(retries - 1);
      } else {
        throw err;
      }
    }
  };

  const handleFetchKRA = async () => {
    const isServiceData = await isServiceActive();
    if (isServiceData?.okyc === 'SUCCESS') {
      setShowKRAFetchModal(true);
      // Success case - timer will handle the modal closing
      try {
        await retryFetchKRAPan();
        setShowKRAFetchModal(false);
        updateCompletedKycSteps([
          {
            name: 'pan',
            status: 1,
          },
          {
            name: 'address',
            status: 1,
          },
        ]);
      } catch (err) {
        // Error case - redirect to digilocker
        setShowKRAFetchModal(false);
        await initiateDigilocker();
      }
    } else {
      await initiateDigilocker();
    }
  };

  const handleFooterClick = async () => {
    if (!isFooterDisabled) {
      const isPartnerServiceActive = await checkPanMicroHealth();
      if (!isPartnerServiceActive) return;

      setIsFooterLoading(true);
      setPanVerifyModal(true);
      const user_changed = !Boolean(mobilePanNumber === formData?.panNo);
      const panData = {
        configuration: 'OBPP',
        pep_clicked: true,
        fatca_clicked: true,
        'user changed': user_changed,
        pan: formData.panNo,
        mode: 'PAN number',
        'pan name': formData.name,
        'attempt number': ocrData?.retryCount ?? null,
        'manual verification': Boolean(user_changed || ocrData?.status === 2),
      };
      if (isRenderedInWebview() && !isGC) {
        const trackingData = await trackEventPostMessageToNativeOrFallback();
        postMessageToNativeOrFallback('kyc_pan_added', {
          ...trackingData,
          panData,
        });
      } else {
        trackEvent('kyc_pan_added', panData);
      }
      handleVerifyDocument({
        docData: {
          ...(formData as PanDataModal),
          date: convertDateInputToAPIFormat(formData.date),
        },
        docSubType: 'pan',
        docType: 'kyc',
      })
        .then(async (response: PanDocumentResponseModel) => {
          setPanVerifyModal(false);
          if (response?.status === 2) {
            // Under Verification
            setPanCardError({
              ...panUnderVerificationMessage,
            });
            setErrorType('underVerification');
            setShowForm(false);
            return;
          }

          setShowPanVerified(true);
          setTimeout(() => {
            setShowPanVerified(false);
          }, 1000);
          // KRA API Call
          await handleFetchKRA();
        })
        .catch((err) => {
          setIsFooterLoading(false);
          setPanVerifyModal(false);
          // Error
          if (err?.type === 'PAN_UNDERAGE') {
            setPanCardError({
              type: err?.type,
              ...panUnderAgeError,
            });
          } else {
            setPanCardError(err);
          }
          setErrorType('error');
          setShowForm(false);
        });
    }
  };

  const handleUploadCB = async (
    type: 'error' | 'success',
    data?: unknown,
    file: File = null
  ) => {
    if (type === 'success') {
      const response = data as PanDocumentResponseModel & Partial<ErrorModel>;
      trackEvent('kyc_pan_details_fetched', {
        configuration: 'OBPP',
        pan: response?.docIDNo,
        'pan name': response?.docName,
        file_format: file?.type.split('/')[1],
        file_size: file?.size ? bytesToSize(file.size) : '',
        mode: 'OCR',
        'attempt number': response?.retryCount ?? null,
        'manual verification': Boolean(response?.status === 2),
        nominee: response?.nomineeName,
      });
      if (response?.status === 2) {
        // Under Verification
        const user_changed = !Boolean(
          ['panNo', 'name', 'date', 'nominee'].every(
            (attr) => ocrData[attr] === formData[attr]
          )
        );
        const panData = {
          configuration: 'OBPP',
          pep_clicked: true,
          fatca_clicked: true,
          'user changed': user_changed,
          pan: response?.docIDNo,
          mode: 'OCR',
          'pan name': response?.docName,
          'attempt number': response?.retryCount ?? null,
          'manual verification': Boolean(response?.status === 2),
        };
        if (isRenderedInWebview() && !isGC) {
          const trackingData = await trackEventPostMessageToNativeOrFallback();
          postMessageToNativeOrFallback('kyc_pan_added', {
            ...trackingData,
            panData,
          });
        } else {
          trackEvent('kyc_pan_added', panData);
        }
        setPanCardError({
          ...panUnderVerificationMessage,
        });
        setErrorType('underVerification');
      } else if (response?.type === 'PAN_UPLOAD_ERROR') {
        setPanCardError({
          type: response?.type || '',
          heading: response?.heading || panErrorStates.DOC_ERROR.heading,
          message:
            response?.message && typeof response?.message === 'string'
              ? response?.message
              : panErrorStates.DOC_ERROR.message,
        });
      } else {
        setFormData({
          panNo: response?.docIDNo,
          name: response?.docName,
          date: convertAPIToDateInputFormat(response?.dob),
          nominee: response?.nomineeName,
        });
        setOcrData({
          panNo: response?.docIDNo,
          name: response?.docName,
          date: convertAPIToDateInputFormat(response?.dob),
          nominee: response?.nomineeName,
          status: response?.status,
          retryCount: response?.retryCount,
        });
        setShowForm(true);
        setUpdateNominee(!isNomineeNameValid(response?.nomineeName));
      }
    } else {
      const err = data as any;
      trackEvent('kyc_error', {
        module: 'pan',
        error_heading: err?.heading,
        mode: 'OCR',
        error_type: err?.type,
        error_payload: err,
      });
      setPanCardError({
        type: err?.type || '',
        heading: err?.heading || panErrorStates.DOC_ERROR.heading,
        message:
          err?.message && typeof err?.message === 'string'
            ? err?.message
            : panErrorStates.DOC_ERROR.message,
      });
      setIsFooterDisabled(true);
    }
  };

  const handlePanInputSubmit = async () => {
    const isPartnerServiceActive = await checkPanMicroHealth();
    if (!isPartnerServiceActive) return;

    setPanInputButtonLoading(true);
    setPanFetchingModal(true);
    const processData: DocumentProcessModel = {
      docType: 'kyc',
      docSubType: 'pan',
      docIDNo: inputPanNumber.toUpperCase(),
    };
    handleDocumentProcess(processData)
      .then((response: PanDocumentResponseModel) => {
        setPanInputButtonLoading(false);
        setPanFetchingModal(false);
        setOcrData({
          panNo: response?.docIDNo,
          name: response?.docName,
          date: convertAPIToDateInputFormat(response?.dob),
          nominee: response?.nomineeName,
          status: response?.status,
          retryCount: response?.retryCount,
        });
        if (response?.docIDNo && response?.docName && response?.dob) {
          trackEvent('kyc_pan_details_fetched', {
            configuration: 'OBPP',
            pan: response?.docIDNo,
            'pan name': response?.docName,
            mode: 'PAN number',
            'attempt number': response?.retryCount ?? null,
            'manual verification': Boolean(response?.status === 2),
            nominee: response?.nomineeName,
          });
          if (response?.status === 2) {
            setPanCardError({
              ...panUnderVerificationMessage,
            });
            setErrorType('underVerification');
            setShowForm(false);
            return;
          }

          if (!response?.nomineeName) {
            callErrorToast(
              'Please enter the Father name linked to the PAN number.'
            );
          }

          setFormData({
            panNo: response?.docIDNo,
            name: response?.docName,
            date: convertAPIToDateInputFormat(response?.dob),
            nominee: response?.nomineeName,
          });
          setInputPanNumber(response?.docIDNo?.toUpperCase());
          setShowForm(true);
          setUpdateNominee(false);
          return;
        } else {
          // if retry count is greter than 2 then show upload button screen
          if (response?.retryCount > 2) {
            callErrorToast(
              'We could not fetch your PAN details. Please upload your PAN document.'
            );
            setIsRetryAttempExhaused(true);
          }
        }
        const err: any = response;
        trackEvent('kyc_error', {
          module: 'pan',
          error_heading: err?.heading,
          mode: 'PAN number',
          error_type: err?.type,
          error_payload: err,
          err_code: err.code,
        });
        callErrorToast(err?.message);
        handleResetClick();
      })
      .catch((err) => {
        setPanFetchingModal(false);
        setPanInputButtonLoading(false);

        trackEvent('kyc_error', {
          module: 'pan',
          error_heading: err?.heading,
          mode: 'PAN number',
          error_type: err?.type,
          error_payload: err,
          err_code: err.code,
        });
        callErrorToast(
          'We could not fetch your PAN details. Please upload your PAN document.'
        );
        setOcrData({
          panNo: '',
          name: '',
          date: '',
          nominee: '',
          status: 2,
          retryCount: err?.retryCount || 3,
        });
      });
  };

  const handleDate = (date: any) => {
    if (date) {
      handleChangeEvent(convertAPIToDateInputFormat(date), 'date');
    }
  };

  const handleChangeEvent = (event: any, type: string = '') => {
    const formName = type === 'date' ? 'date' : event?.target?.id ?? '';
    const formValue = type === 'date' ? event : event?.target?.value ?? '';

    if (
      formName === 'nominee' &&
      !isNomineeNameValid(formValue) &&
      formValue !== ''
    )
      return;

    if (
      Object.keys(formValidators).includes(formName) &&
      !formValidators[formName](formValue)
    ) {
      setErrorMessages({
        ...errorMessages,
        [formName]: formErrorMessages[formName],
      });
    } else {
      setErrorMessages({
        ...errorMessages,
        [formName]: '',
      });
    }

    setFormData({ ...formData, [formName]: formValue });
  };

  const initiateDigilocker = async () => {
    const response = await createDigilockerRequest();
    setShowDigilockerRedirect(true);

    setTimeout(() => {
      if (response?.url) {
        router.push(response?.url);
      }
    }, 2000);
  };

  const onClickReupload = async () => {
    if (panCardError?.type === 'FETCH_ERROR') {
      await initiateDigilocker();
    } else {
      trackEvent('PAN_Number_ReEnter_Clicked', { count: reEnterCount });
      setReEnterCount(reEnterCount + 1);
      setShowForm(false);
      setPanCardError({});
      setFormData({});
    }
  };

  const handleResetClick = () => {
    setInputPanNumber('');
    setIsAutoFetched(false);
  };

  const isValidPAN = (pan: string): boolean => {
    // Regular expression to match the PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };

  const isPanNumberButtonDisabled = () => {
    // If pan is not available then disable and not valid
    if (!inputPanNumber?.trim() || inputPanNumber?.length !== 10) return true;

    // When pan number is not individual then should disable the button
    if (inputPanNumber?.[3]?.toUpperCase() !== 'P') return true;

    // Check if the PAN number is valid then should not disable the button
    return !isValidPAN(inputPanNumber);
  };

  const handlePanChange = (event: any) => {
    const panNo = event.target.value;
    setIsAutoFetched(false);
    // No special characters and spaces allowed in the panNumber input field
    const hasSpecialChar = isContainSpecialCharacters.test(panNo);
    if (!hasSpecialChar) {
      if (panNo.length <= 10) {
        setInputPanNumber(panNo);
      }
      if (panNo.length < 10) {
        setErrorInputPanNumber('');
      }

      if (panNo.length === 10) {
        trackEvent('kyc_pan_number_changed');
        // If the 4th character of the PAN number is not 'P' then: show error message
        if (panNo?.[3]?.toUpperCase() !== 'P') {
          setErrorInputPanNumber(
            'Only individual PAN cards allowed, for more queries please contact invest@gripinvest.in'
          );
          return;
        }

        // The PAN is 10 characters long. The first five characters are letters, followed by four numerals, and the last character is a letter
        if (!isValidPAN(panNo)) {
          setErrorInputPanNumber(
            'Invalid PAN number. Please check the PAN number and try again'
          );
          return;
        }
        setErrorInputPanNumber('');
      }
    }
  };

  const isPanDataAvailable = () =>
    formData?.name && formData?.date && formData?.panNo;

  const renderStepTitle = (
    <StepTitle
      text={isRetryAttempExhaused ? 'PAN Card' : 'Verify PAN Number'}
      className={`${styles.StepTitle}`}
    >
      {showForm && !isExisitingUser ? (
        <div className={styles.ReuploadTextContainer} onClick={onClickReupload}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/reupload.svg`}
            alt="Reupload"
            width={16}
            height={16}
            layout="fixed"
          />
          <span>Re-enter PAN</span>
        </div>
      ) : null}
    </StepTitle>
  );

  const renderInputField = () => {
    if (isRetryAttempExhaused) {
      return (
        <KYCUploadButton
          kycType={'pan'}
          btnText={'Upload PAN Card'}
          handleCB={handleUploadCB}
          fileSizeExceedCheck
        />
      );
    }

    return (
      <div>
        <InputFieldSet
          showClear
          name="name"
          inputId="name"
          label={'Your PAN Number'}
          type={'text'}
          autoFocus={true}
          value={inputPanNumber}
          error={Boolean(errorInputPanNumber)}
          onChange={handlePanChange}
          errorMsg={errorInputPanNumber}
          inputFieldSetClassName={styles.InputFieldSetPan}
        />
        {renderAutoFetchInfo()}
      </div>
    );
  };

  const renderAutoFetchInfo = () => {
    return isAutoFetched ? (
      <div className={`flex justify-between ${styles.AutoFetchContainer}`}>
        <div
          className={`items-align-center-row-wise ${styles.AutoFetchContainerInner}`}
        >
          <span className={`icon-check-circle ${styles.IconTick}`}></span>
          <span>PAN associated with your number</span>
          <TooltipCompoent toolTipText={infoForAutoFetchPan}>
            <span className="icon-info" />
          </TooltipCompoent>
        </div>
        <span className={styles.ResetButton} onClick={handleResetClick}>
          Reset
        </span>
      </div>
    ) : null;
  };

  const renderPanInput = () => {
    const isFooterDisabledInput = isPanNumberButtonDisabled();

    return (
      <>
        <div
          className={`flex justify-between items-center ${styles.DocumentUploadContainer}`}
        >
          <div className={`flex-column ${styles.DocumentUploadTitle}`}>
            {renderStepTitle}
            {isRetryAttempExhaused ? (
              <span className={styles.DocumentUploadSubTitle}>
                Please upload a non password protected copy of your PAN card
              </span>
            ) : null}
            {renderInputField()}
          </div>
          {/* <Hints
              hints={isRetryAttempExhaused ? panHintsData : panHintsNumberData}
              className={styles.PanHintsContainer}
            /> */}
          {isRetryAttempExhaused ? (
            <Hints hints={panHintsData} className={styles.PanHintsContainer} />
          ) : null}
        </div>
        {!isRetryAttempExhaused ? (
          <LayoutFooter
            isFooterBtnDisabled={isFooterDisabledInput}
            isLoading={panInputButtonLoading}
            handleBtnClick={handlePanInputSubmit}
            className={styles.FooterPanContainer}
          />
        ) : null}
      </>
    );
  };

  const renderForm = () => {
    return (
      <>
        <div className={`flex justify-between ${styles.FormTitleContainer}`}>
          {renderStepTitle}
        </div>
        <div className={`flex-column ${styles.FormFieldsContainer}`}>
          <InputFieldSet
            name="name"
            inputId="name"
            label={'PAN Holder Name'}
            type={'text'}
            value={formData.name}
            error={Boolean(errorMessages.name)}
            onChange={handleChangeEvent}
            errorMsg={errorMessages.name}
            disabled={true}
            inputFieldSetClassName={styles.InputFieldSetPan}
          />
          <InputFieldSet
            name="panNo"
            inputId="panNo"
            label={'PAN Number'}
            type={'text'}
            value={formData.panNo}
            error={Boolean(errorMessages.panNo)}
            onChange={handleChangeEvent}
            errorMsg={errorMessages.panNo}
            disabled={true}
            inputFieldSetClassName={styles.InputFieldSetPan}
          />
          <CustomDatePicker
            name="date"
            inputId="date"
            label={'Date'}
            value={formData.date ? dayjs(formData.date) : null}
            onChange={handleDate}
            error={Boolean(errorMessages.date)}
            errorMsg={errorMessages.date}
            className={styles.InputFieldSetPan}
            disabled={true}
          />
          <InputFieldSet
            name="nominee"
            inputId="nominee"
            label={'Father Name'}
            type={'text'}
            value={formData.nominee}
            error={Boolean(errorMessages.nominee)}
            onChange={handleChangeEvent}
            errorMsg={errorMessages.nominee}
            disabled={!!ocrData?.nominee && !updateNominee}
            inputFieldSetClassName={styles.InputFieldSetPan}
          />
          {isExisitingUser ? (
            <Note
              className={styles.ExistingPan}
              text={existingUserMessage.pan}
            />
          ) : null}
          <CustomCheckbox
            key={'is-pep'}
            value={true}
            label={'I am not politically-exposed (PEP) or related to a PEP'}
            onChange={function (_, checked: boolean): void {
              setShowPepModal(!checked);
            }}
          />
          <CustomCheckbox
            key={'is-nri'}
            value={true}
            label={
              'I am an Indian citizen. For tax purposes I am not resident in any jurisdiction(s) outside India'
            }
            onChange={function (_, checked: boolean): void {
              setShowNRIModal(!checked);
            }}
          />
          <LayoutFooter
            isFooterBtnDisabled={isFooterDisabled}
            isLoading={isFooterLoading}
            handleBtnClick={handleFooterClick}
            className={styles.FooterContainerForm}
          />
        </div>
      </>
    );
  };

  const showErrorContact =
    [
      'NON_INDIVIDUAL_PAN_ERROR',
      'PAN_ALREADY_EXISTS',
      'EXISTING_PAN_NOT_VALID_ERROR',
    ].includes(convertToUnderScoredType(panCardError?.type)) ||
    errType === 'underVerification';

  const getContactDetailsMessage = () => {
    if (errType === 'underVerification') {
      return contactDetailsMessages.underVerification;
    } else {
      return contactDetailsMessages[panCardError?.type];
    }
  };

  const renderComponents = () => {
    if (panCardError && Object.keys(panCardError).length) {
      const isFetchError = panCardError?.type === 'FETCH_ERROR';
      const isITDError = panCardError?.type === 'EXISTING_PAN_NOT_VALID_ERROR';
      const showBtnError = !isITDError
        ? isFetchError || errType === 'error'
        : false;

      const extraMessage = [
        'EXISTING_PAN_NOT_VALID_ERROR',
        'PAN_NOT_VALID_ERROR',
      ].includes(panCardError?.type)
        ? InvalidPanErr
        : null;

      return (
        <>
          <div className={`flex justify-between ${styles.FormTitleContainer}`}>
            {renderStepTitle}
          </div>
          <ErrorCard
            type={isFetchError ? 'underVerification' : errType}
            data={{
              title: panCardError?.heading,
              message: panCardError?.message,
            }}
            buttonText={
              isFetchError ? 'Proceed with DigiLocker' : ' Re-Enter PAN'
            }
            onClickButton={onClickReupload}
            showBottomInfo={isFetchError ? false : showErrorContact}
            contact={getContactDetailsMessage()}
            showBtn={showBtnError}
            extraMessage={extraMessage}
            trackPayloadDetails={{
              module: 'pan',
              error_type: panCardError?.type,
              error_payload: panCardError,
            }}
          />
        </>
      );
    }

    if (showForm) {
      return renderForm();
    }

    return renderPanInput();
  };

  const renderDigilockerIcon = () => {
    return (
      <div className={styles.KRAIconContainer}>
        <Image
          src={GripLogo}
          alt="Grip"
          width={83}
          height={30}
          layout="fixed"
        />

        <AnimatedArrow />
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/digilocker.svg`}
          alt="KRA Logo"
          width={91}
          height={53}
          layout="fixed"
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`flex justify-between ${styles.PanSkeletonContainer}`}>
        <div className={`flex-column ${styles.PanSkeletonTitle}`}>
          <CustomSkeleton styles={{ width: '100%', height: 24 }} />
          <CustomSkeleton styles={{ width: '100%', height: 50 }} />
        </div>
        <CustomSkeleton
          className={styles.HideMobile}
          styles={{ width: 300, height: 120 }}
        />
      </div>
    );
  }

  return (
    <>
      <div className={styles.Wrapper}>{renderComponents()}</div>
      {/* Pep Unchecked Modal */}
      <GenericModal
        showModal={showPepModal}
        icon={modalsData.pep.icon}
        title={modalsData.pep.title}
        className={styles.FetchModal}
        drawerExtraClass={styles.Drawer}
        iconHeight={68}
        iconWidth={68}
        btnText="Okay, understood"
        btnVariant="Secondary"
        handleBtnClick={() => setShowPepModal(false)}
      />

      {/* NRI Unchecked Modal */}
      <NRIModal
        showModal={showNRIModal}
        onCloseModal={() => setShowNRIModal(false)}
      />

      <GenericModal
        showModal={panVerifyModal}
        lottieType={modalsData.panVerify.lottieType}
        title={modalsData.panVerify.title}
        className={styles.FetchModal}
        drawerExtraClass={styles.Drawer}
        iconHeight={68}
        iconWidth={68}
      />

      <GenericModal
        showModal={panFetchingModal}
        lottieType={modalsData.pan.lottieType}
        title={modalsData.pan.title}
        className={styles.FetchModal}
        drawerExtraClass={styles.Drawer}
        iconHeight={68}
        iconWidth={68}
      />

      {/* Digilocker Redirect Fetching Modal */}
      <GenericModal
        showModal={showDigilockerRedirect}
        title={modalsData.digilocker.title}
        subtitle={modalsData.digilocker.subTitle}
        className={styles.DigilockerFetchModal}
        drawerExtraClass={styles.DigilockerDrawer}
        customIcon={renderDigilockerIcon}
      />

      {/* Verified Pan Number */}
      <GenericModal
        showModal={showPanVerified}
        title={modalsData.panVerified.title}
        subtitle={modalsData.panVerified.subtitle}
        icon={modalsData.panVerified.icon}
        className={styles.FetchModal}
        drawerExtraClass={styles.Drawer}
        lottieType={modalsData.panVerified.lottieType}
      />

      {/* KRA Fetching Modal */}
      <GenericModal
        showModal={showKRAFetchModal}
        title={modalsData.kra.title}
        className={styles.KRAFetchModal}
        drawerExtraClass={styles.KRADrawer}
        lottieType={modalsData.kra.lottieType}
        Content={() => (
          <Timer
            initialSeconds={60}
            isActive={showKRAFetchModal}
            onComplete={async () => {
              await initiateDigilocker();
            }}
          />
        )}
      />
    </>
  );
};

export default KycPanNumber;
