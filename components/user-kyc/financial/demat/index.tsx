// Node Modules
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Common Components
import InputFieldSet from '../../../common/inputFieldSet';
import StepTitle from '../../common/StepTitle';
import ErrorCard from '../../common/ErrorCard';
import Note from '../../common/Note';
import KYCUploadButton from '../../common/KYCUploadButton';
import FindCMR from '../../../kyc/FindCMR';

// Contexts
import { useKycContext } from '../../../../contexts/kycContext';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import {
  UploadBtnData,
  dematUnderVerificationMessage,
  getOCRPanNumber,
} from '../../utils/financialUtils';
import {
  DematDataModal,
  DematProcessResponseModel,
  ErrorCardType,
  ErrorModel,
} from '../../utils/models';
import { existingUserMessage } from '../../utils/helper';
import {
  cmrNote,
  dematFormErrors,
  dpIDRegex,
  clientIDRegex,
  dematEraseDetail,
} from './utils';
import { debounce } from '../../../../utils/timer';

// APIs
import { handleVerifyDocument } from '../../../../api/rfqKyc';

// Primitives
import Image from '../../../primitives/Image';

// Styles
import styles from './Demat.module.css';
import LayoutFooter from '../../footer';

const OtherBrokerModal = dynamic(
  () => import('../../../kyc/OtherBrokerModal'),
  {
    ssr: false,
  }
);

const GenericModal = dynamic(() => import('../../common/GenericModal'), {
  ssr: false,
});

const documentType = 'demat';

const Demat = () => {
  const { updateCompletedKycSteps, completedKycSteps, kycValues } =
    useKycContext();

  const dematData: any = kycValues?.depository ?? {};

  const [formData, setFormData] = useState<Partial<DematDataModal>>({
    panNo: getOCRPanNumber(dematData?.ocrResponse),
    dpID: dematData?.dpID,
    clientID: dematData?.clientID,
    brokerName: dematData?.brokerName,
  });
  const [formErrors, setFormErrors] = useState<Partial<DematDataModal>>({});
  const [showForm, setShowForm] = useState(false);
  const [dematCardError, setDematCardError] = useState<Partial<ErrorModel>>({});
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [showEraseDematModal, setEraseDematModal] = useState(false);
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [showCMRNote, setShowCMRNote] = useState(false);
  const [errType, setErrorType] = useState<Partial<ErrorCardType>>('error');
  const [isFooterDisabled, setIsFooterDisabled] = useState(false);
  const [isFooterLoading, setIsFooterLoading] = useState(false);

  const dematDetails = completedKycSteps.find(
    (step) => step.name === 'depository'
  );

  const isExisitingUser = dematDetails?.isExistingData;

  useEffect(() => {
    if (dematDetails?.status === 2) {
      setDematCardError({
        ...dematUnderVerificationMessage,
      });
      setErrorType('underVerification');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFooterClick = () => {
    if (!isFooterDisabled) {
      setIsFooterLoading(true);
      if (!verifyFormData()) return;

      handleVerifyDocument({
        docData: {
          ...(formData as DematDataModal),
        },
        docSubType: 'depository',
        docType: 'kyc',
      })
        .then((response) => {
          // Verify Response Data
          if (response?.status === 2) {
            // Under Verification

            updateCompletedKycSteps({ name: 'depository', status: 2 });
          } else {
            updateCompletedKycSteps({ name: 'depository', status: 1 });
          }
        })
        .catch((err) => {
          setIsFooterLoading(false);
          // Error
          setDematCardError(err);
        })
        .finally(() => {
          setShowForm(false);
        });
    }
  };

  const verifyFormData = () => {
    let tempErrors: Partial<DematDataModal> = {
      clientID: '',
      dpID: '',
    };

    if (!clientIDRegex.test(formData.clientID))
      tempErrors = { ...tempErrors, clientID: dematFormErrors.clientErrorMsg };

    if (!dpIDRegex.test(formData.dpID))
      tempErrors = { ...tempErrors, dpID: dematFormErrors.dpIDErrorMsg };

    setFormErrors({ ...tempErrors });
    const isValid = Object.values(tempErrors).every((value) => value === '');
    setIsFooterDisabled(!isValid);
    return isValid;
  };

  const handleChangeEvent = (event: any) => {
    setFormData({ ...formData, [event?.target?.id]: event?.target?.value });
  };

  const handleReEnterClick = () => {
    setDematCardError({});
    setShowForm(false);
    setFormData({});
  };

  const isDematDataAvailable = () =>
    formData?.brokerName && formData?.clientID && formData?.dpID;

  const isPartialData = () =>
    formData?.brokerName ||
    formData?.clientID ||
    formData?.dpID ||
    formData?.panNo;

  useEffect(() => {
    if (isExisitingUser && isPartialData()) {
      setShowForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExisitingUser]);

  useEffect(() => {
    if (isDematDataAvailable()) {
      debounce(verifyFormData, 1500)();
      setShowForm(true);
    } else {
      setIsFooterDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleUploadCB = (type: 'error' | 'success', data?: unknown) => {
    if (type === 'success') {
      const responseData = data as DematProcessResponseModel;
      if (responseData?.status === 2) {
        updateCompletedKycSteps({ name: 'depository', status: 2 });
      } else {
        setShowForm(true);
        setFormData({
          dpID: responseData?.dpID ?? '',
          clientID: responseData?.clientID ?? '',
          brokerName: responseData?.brokerName ?? '',
          panNo: responseData?.panNo ?? '',
        });
      }
    } else {
      setDematCardError(data);
      setIsFooterDisabled(false);
    }
  };

  const handleProceedDematModal = () => {
    setEraseDematModal((pre) => !pre);
  };

  const handleEraseDematModal = () => {
    handleReEnterClick();
    handleProceedDematModal();
  };

  const renderStepTitle = () => {
    const showEditBtn =
      showForm &&
      (dematData?.dpID || dematData?.clientID || dematData?.brokerName);
    return (
      <div className={styles.StepTitleHeader}>
        <StepTitle text="Verify Demat Account" />
        {showEditBtn ? (
          <button className={styles.EditBtn} onClick={handleProceedDematModal}>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/EditPencil.svg`}
              alt="Logo"
              layout={'fixed'}
              width={16}
              height={16}
            />
            <p className={styles.EditText}>Edit Details</p>
          </button>
        ) : null}
      </div>
    );
  };

  const renderComponents = () => {
    if (dematCardError && Object.keys(dematCardError).length) {
      return (
        <ErrorCard
          showBottomInfo
          showBtn={errType === 'error'}
          type={errType}
          data={{
            title: dematCardError.heading,
            message: dematCardError.message,
          }}
          buttonText="Re-Upload CMR/CML"
          contact={{
            title: 'Facing issues?',
            email: 'invest@gripinvest.in',
          }}
          buttonVariant="Secondary"
          onClickButton={handleReEnterClick}
        />
      );
    }

    if (showForm) {
      return (
        <div>
          {renderStepTitle()}
          <div className={`flex-column ${styles.FormWrapper}`}>
            <InputFieldSet
              name="dpID"
              placeHolder={'DP ID'}
              label="DP ID"
              type="text"
              error={!!formErrors.dpID}
              errorMsg={formErrors.dpID}
              inputId={'dpID'}
              onChange={handleChangeEvent}
              value={formData?.dpID}
              className={styles.InputFieldSet}
              disabled={isExisitingUser && dematData?.dpID}
            />
            <InputFieldSet
              name="clientID"
              placeHolder={'Client ID'}
              label="Client ID"
              type="text"
              error={!!formErrors.clientID}
              errorMsg={formErrors.clientID}
              inputId={'clientID'}
              onChange={handleChangeEvent}
              value={formData?.clientID}
              className={styles.InputFieldSet}
              disabled={isExisitingUser && dematData?.clientID}
            />
            <InputFieldSet
              name={'brokerName'}
              placeHolder={'Broker Name'}
              label="Broker Name"
              type="text"
              inputId={'brokerName'}
              onChange={handleChangeEvent}
              value={formData?.brokerName}
              className={styles.InputFieldSet}
              disabled={isExisitingUser && dematData?.brokerName}
            />
            <LayoutFooter
              footerLinkText={'Next'}
              showMsg={false}
              renderOnlyButton={true}
              isFooterBtnDisabled={isFooterDisabled}
              isLoading={isFooterLoading}
              handleBtnClick={handleFooterClick}
            />
          </div>
          <Note
            className={styles.FormNote}
            text={
              isExisitingUser
                ? existingUserMessage.demat
                : 'Returns will be credited to your Demat-linked bank account.'
            }
          />
        </div>
      );
    }

    return (
      <>
        <div className={`flex-column ${styles.MainContainer}`}>
          {renderStepTitle()}
          <span className={styles.SubHeading}>
            Select and upload CMR/CML to complete this step
          </span>
          <span className={styles.CMRNote} onClick={() => setShowCMRNote(true)}>
            What’s CMR/CML?
          </span>
          <KYCUploadButton
            kycType={'depository'}
            btnText={UploadBtnData?.[documentType]?.btnTxt}
            handleCB={handleUploadCB}
            fileSizeExceedCheck
          />
          <Note
            className={styles.UploadNote}
            text={UploadBtnData?.[documentType]?.note}
          />
        </div>

        <FindCMR
          heading={'Find your CMR/CML'}
          subHeading={
            'If you are not sure what a CMR/ CML document is, click on the logo of your stock broker provided below to know where you can find it.'
          }
          handleOtherBrokerModal={(id) => {
            setShowOtherModal(true);
            setSelectedBrokerId(id);
          }}
          className={styles.FindCMRContainer}
          classStyles={{
            headingClass: styles.FindCMRHeading,
            subHeadingClass: styles.FindCMRSubHeading,
            brokerListClass: styles.FindCMRBrokerList,
          }}
        />
      </>
    );
  };

  return (
    <>
      <div className={`flex justify-between ${styles.Wrapper}`}>
        {renderComponents()}
      </div>
      {/* Know and find your CMR/CML */}
      <OtherBrokerModal
        showModal={showOtherModal}
        handleModalClose={() => setShowOtherModal(false)}
        selectedId={selectedBrokerId}
      />
      {/* What is CMR CML */}
      <GenericModal
        showModal={showCMRNote}
        title={cmrNote.title}
        subtitle={cmrNote.subTitle}
        className={styles.FetchModal}
        drawerExtraClass={styles.Drawer}
        hideIcon
        hideClose={false}
        handleModalClose={() => setShowCMRNote(false)}
      />

      <GenericModal
        showModal={showEraseDematModal}
        title={dematEraseDetail.title}
        subtitle={dematEraseDetail.subTitle}
        icon="DangerTriangle.svg"
        drawerExtraClass={styles.Drawer}
        btnText="Confirm and Erase Demat details"
        btnVariant="Secondary"
        handleBtnClick={handleEraseDematModal}
        BtnSecVariant="Primary"
        btnSecText="Proceed with current details"
        handleSecBtnClick={handleProceedDematModal}
      />
    </>
  );
};

export default Demat;
