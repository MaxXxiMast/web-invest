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
import KYCUploadButton from '../../common/KYCUploadButton';
import Note from '../../common/Note';
import AnimatedArrow from '../../../primitives/AnimatedArrow';
import CustomDatePicker from '../../../common/customDatePicker';
import LayoutFooter from '../../footer';

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
} from './utils';
import {
  GRIP_INVEST_BUCKET_URL,
  convertToUnderScoredType,
} from '../../../../utils/string';
import {
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
import { panErrorStates } from '../../utils/identityUtils';
import {
  trackEvent,
  trackEventPostMessageToNativeOrFallback,
} from '../../../../utils/gtm';
import { bytesToSize } from '../../../../utils/number';
import { GripLogo } from '../../../../utils/constants';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../../../utils/appHelpers';
import { isGCOrder } from '../../../../utils/gripConnect';

// APIs
import {
  createDigilockerRequest,
  handleFetchKRAPan,
  handleVerifyDocument,
} from '../../../../api/rfqKyc';

// Styles
import styles from './pan.module.css';

const GenericModal = dynamic(() => import('../../common/GenericModal'), {
  ssr: false,
});

const NRIModal = dynamic(() => import('../../common/NRIModal'), {
  ssr: false,
});

const KycPan = () => {
  const router = useRouter();

  const {
    kycValues,
    completedKycSteps,
    updateKycContextValue,
    updateCompletedKycSteps,
  } = useKycContext();

  const panStepDetails = completedKycSteps.filter(
    (ele) => ele.name === 'pan'
  )[0];

  const isExisitingUser = panStepDetails?.isExistingData;

  const panData: any = kycValues?.pan ?? {};

  const [showNRIModal, setShowNRIModal] = useState(false);
  const [showPepModal, setShowPepModal] = useState(false);
  const [showKRAFetchModal, setShowKRAFetchModal] = useState(false);
  const [showKRAErrorModal, setShowKRAErrorModal] = useState(false);
  const [panVerifyModal, setPanVerifyModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDigilockerRedirect, setShowDigilockerRedirect] = useState(false);
  const [isFooterDisabled, setIsFooterDisabled] = useState(false);
  const [isFooterLoading, setIsFooterLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<PanDataModal>>({
    panNo: panData?.panNumber ?? '',
    name: panData?.panHolderName ?? '',
    date: convertAPIToDateInputFormat(panData?.dob) ?? '',
    nominee: panData?.nomineeName ?? '',
  });
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

  const retryFetchKRAPan = async (
    panNumber: string,
    dob: string,
    retries: number = 3
  ) => {
    try {
      return await handleFetchKRAPan({ panNumber, dob });
    } catch (err) {
      if (retries > 1) {
        return await retryFetchKRAPan(panNumber, dob, retries - 1);
      } else {
        return err;
      }
    }
  };

  const handleFetchKRA = async () => {
    setShowKRAFetchModal(true);
    retryFetchKRAPan(
      formData.panNo,

      convertDateInputToAPIFormat(formData.date),
      3
    )
      .then((response) => {
        const { kraID, status, kraStatus, userName } = response ?? {};
        trackEvent('kra_fetched', {
          kraID: kraID,
          status: status,
          kra_eligible: kraStatus === 'approved' ? true : false,
          details_payload: response,
          poa_name: userName,
        });
        setTimeout(() => {
          setShowKRAFetchModal(false);
          updateKycContextValue({
            address: {
              ...response,
              isProcessData: true,
            },
          });
          setShowKRAErrorModal(false);
          updateCompletedKycSteps({ name: 'pan', status: 1 });
        }, 2000);
      })
      .catch((err = '') => {
        trackEvent('kyc_error', {
          module: 'kra',
          error_heading: panErrorStates.FETCH_ERROR.heading,
          error_type: 'FETCH_ERROR',
          error_payload: err,
          cta: 'Aadhaar XML Flow',
        });
        setTimeout(() => {
          setShowKRAFetchModal(false);
          updateKycContextValue({
            address: {
              response: {
                kraStatus: 'rejected',
              },
              isProcessData: true,
            },
          });
          setShowKRAErrorModal(false);
          updateCompletedKycSteps({ name: 'pan', status: 1 });
        }, 2000);
      });
  };

  useEffect(() => {
    postMessageToNativeOrFallback('kycEvent', {
      kycStep: 'pan',
    });
  }, []);

  useEffect(() => {
    if (isPanDataAvailable() && panStepDetails?.status !== 2) {
      setIsFooterDisabled(false);
      setShowForm(true);
    } else {
      setIsFooterDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

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
        error_payload: panStepDetails,
      });
    }
  }, [panStepDetails]);

  const handleFooterClick = async () => {
    if (!isFooterDisabled) {
      setIsFooterLoading(true);
      setPanVerifyModal(true);
      const user_changed = !Boolean(
        ['panNo', 'name', 'date', 'nominee'].every(
          (attr) => ocrData[attr] === formData[attr]
        )
      );

      const messageData = {
        configuration: 'OBPP',
        pep_clicked: true,
        fatca_clicked: true,
        'user changed': user_changed,
        pan: formData.panNo,
        'pan name': formData.name,
        'attempt number': ocrData?.retryCount ?? null,
        'manual verification': Boolean(user_changed || ocrData?.status === 2),
      };

      if (isRenderedInWebview() && !isGCOrder()) {
        const trackingData = await trackEventPostMessageToNativeOrFallback();
        postMessageToNativeOrFallback('kyc_pan_added', {
          ...trackingData,
          messageData,
        });
      } else {
        trackEvent('kyc_pan_added', messageData);
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

  const handleDate = (date: any) => {
    if (date) {
      handleChangeEvent(convertAPIToDateInputFormat(date), 'date');
    }
  };

  const handleChangeEvent = (event: any, type: string = '') => {
    const formName = type === 'date' ? 'date' : event?.target?.id ?? '';
    const formValue = type === 'date' ? event : event?.target?.value ?? '';

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
      setShowForm(false);
      setPanCardError({});
      setFormData({});
    }
  };

  const handleUploadCB = (
    type: 'error' | 'success',
    data?: unknown,
    file: File = null
  ) => {
    if (type === 'success') {
      const response = data as PanDocumentResponseModel;
      trackEvent('kyc_pan_details_fetched', {
        configuration: 'OBPP',
        pan: response?.docIDNo,
        'pan name': response?.docName,
        file_format: file?.type.split('/')[1],
        file_size: file?.size ? bytesToSize(file.size) : '',
        'attempt number': response?.retryCount ?? null,
        'manual verification': Boolean(response?.status === 2),
        nominee: response?.nomineeName,
      });
      if (response?.status === 2) {
        // Under Verification
        setPanCardError({
          ...panUnderVerificationMessage,
        });
        setErrorType('underVerification');
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
      }
    } else {
      const err = data as any;
      trackEvent('kyc_error', {
        module: 'pan',
        error_heading: err?.heading,
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

  const isPanDataAvailable = () =>
    formData?.name && formData?.date && formData?.nominee && formData?.panNo;

  const onClickKRAError = () => {
    trackEvent('error_cta_clicked', {
      module: 'kra',
      error_heading: modalsData.kraError.title,
      error_type: 'KRA_FETCH_ERROR',
      cta_text: 'Please try again after some time',
    });
    setShowKRAErrorModal(false);
    router.push('/discover');
  };

  const renderStepTitle = (
    <StepTitle text="PAN Card" className={`${styles.StepTitle}`}>
      {showForm && !isExisitingUser ? (
        <div className={styles.ReuploadTextContainer} onClick={onClickReupload}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/reupload.svg`}
            alt="Reupload"
            width={16}
            height={16}
            layout="fixed"
          />
          <span>Re-upload PAN</span>
        </div>
      ) : null}
    </StepTitle>
  );

  const renderDocumentUplaod = () => {
    return (
      <div
        className={`flex justify-between items-center ${styles.DocumentUploadContainer}`}
      >
        <div className={`flex-column ${styles.DocumentUploadTitle}`}>
          {renderStepTitle}
          <KYCUploadButton
            kycType={'pan'}
            btnText={'Front of PAN Card'}
            handleCB={handleUploadCB}
            fileSizeExceedCheck
          />
        </div>
        <Hints hints={panHintsData} />
      </div>
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
            disabled={isExisitingUser && panData?.panHolderName}
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
            disabled={isExisitingUser && panData?.panNumber}
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
            disabled={isExisitingUser && panData?.dob}
          />
          <InputFieldSet
            name="nominee"
            inputId="nominee"
            label={'Son/Daughter/Wife of'}
            type={'text'}
            value={formData.nominee}
            error={Boolean(errorMessages.nominee)}
            onChange={handleChangeEvent}
            errorMsg={errorMessages.nominee}
            disabled={isExisitingUser && panData?.nomineeName}
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
              isFetchError ? 'Proceed with DigiLocker' : ' Re-Upload PAN'
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

    return renderDocumentUplaod();
  };

  const renderKRAIcon = () => {
    return (
      <div className={styles.KRAIconContainer}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/KRA.svg`}
          alt="KRA Logo"
          width={91}
          height={53}
          layout="fixed"
        />
        <AnimatedArrow />
        <Image
          src={GripLogo}
          alt="Grip"
          width={83}
          height={30}
          layout="fixed"
        />
      </div>
    );
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
      {/* KRA Fetching Modal */}
      <GenericModal
        showModal={showKRAFetchModal}
        title={modalsData.kra.title}
        subtitle={modalsData.kra.subTitle}
        className={styles.KRAFetchModal}
        drawerExtraClass={styles.KRADrawer}
        customIcon={renderKRAIcon}
      />

      {/* KRA Error Modal */}
      <GenericModal
        showModal={showKRAErrorModal}
        lottieType={modalsData.kraError.lottiType}
        title={modalsData.kraError.title}
        className={styles.FetchModal}
        drawerExtraClass={styles.KRAErrorModal}
        iconHeight={68}
        iconWidth={68}
        btnText="Please try again after some time"
        btnVariant="Primary"
        handleBtnClick={onClickKRAError}
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

      {/* Digilocker Redirect Fetching Modal */}
      <GenericModal
        showModal={showDigilockerRedirect}
        title={modalsData.digilocker.title}
        subtitle={modalsData.digilocker.subTitle}
        className={styles.DigilockerFetchModal}
        drawerExtraClass={styles.DigilockerDrawer}
        customIcon={renderDigilockerIcon}
      />
    </>
  );
};

export default KycPan;
