// Node Modules
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Contexts
import { useKycContext } from '../../../../contexts/kycContext';

// Components
import TextArea from '../../../common/TextArea';
import InputFieldSet from '../../../common/inputFieldSet';
import Image from '../../../primitives/Image';
import AnimatedArrow from '../../../primitives/AnimatedArrow';
import LayoutFooter from '../../footer';
import ErrorCard from '../../common/ErrorCard';

// Utils
import {
  convertAddressUpdate,
  getAddressDetails,
} from '../../utils/identityUtils';
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import { modalsData } from '../pan/utils';
import { trackEvent } from '../../../../utils/gtm';
import { GripLogo } from '../../../../utils/constants';
import { postMessageToNativeOrFallback } from '../../../../utils/appHelpers';
import { callErrorToast } from '../../../../api/strapi';

// APIs
import {
  createDigilockerRequest,
  isServiceActive,
  verifyAddressDetails,
} from '../../../../api/rfqKyc';

// Redux Slices
import { setKYCProcessing } from '../../../../redux/slices/rfq';

// Styles
import styles from './Address.module.css';

const AddressNoMatchModal = dynamic(import('../AddressNoMatchModal'), {
  ssr: false,
});

const GenericModal = dynamic(() => import('../../common/GenericModal'), {
  ssr: false,
});

const AddressKYC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDigilockerRedirect, setShowDigilockerRedirect] = useState(false);
  const [isFooterDisabled, setIsFooterDisabled] = useState(false);
  const [isFooterLoading, setIsFooterLoading] = useState(false);
  const [errDataMessage, setErrDataMessage] = useState<any>({});
  const [isDigilockerLoading, setDigilockerLoading] = useState(true);

  const { kycValues, aadhaarXMLFlowCheck, updateCompletedKycSteps } =
    useKycContext();
  const router = useRouter();
  const dispatch = useDispatch();

  const { isMobile = false } = kycValues;
  const addressDetails: any = kycValues?.address ?? {};
  const isProcessData = addressDetails?.isProcessData || false;
  const isDigiLockerApproved = addressDetails?.moduleType === 'digilocker';

  const finalAddress = getAddressDetails(addressDetails, !isProcessData);
  const isDigilockerAddress = finalAddress === 'digilocker';

  const { isError = false, data: kycProcessingData = {} } = useSelector(
    (state) => (state as any)?.rfq?.kycProcessing ?? {}
  );

  const isRetryAttemptExceeded =
    kycProcessingData?.retryAttempt >= 3 || errDataMessage?.retryAttempt >= 3;

  // Update the Footer Btn
  const updateFooterBtn = () => {
    setIsFooterDisabled(isDigilockerAddress);
  };

  useEffect(() => {
    checkDigilockerHealth(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Should be called on every re-render
  useEffect(() => {
    updateFooterBtn();

    if (isRetryAttemptExceeded || isError) {
      setIsFooterDisabled(true);
    }
    const errValidity = Number(kycProcessingData.errValidity);
    if (
      (!errValidity || errValidity < new Date().getTime()) &&
      !isRetryAttemptExceeded
    ) {
      dispatch(setKYCProcessing({}));
      updateFooterBtn();
    }

    return () => {
      setIsFooterDisabled(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    postMessageToNativeOrFallback('kycEvent', {
      kycStep: 'address',
    });
  }, []);

  const handleFooterClick = () => {
    // API CALLS
    if (!isFooterDisabled) {
      setIsFooterLoading(true);
      verifyAddressDetails(addressDetails?.moduleType ?? 'aadhaar_xml')
        .then(() => {
          trackEvent('kyc_poa_added', {
            method: addressDetails?.moduleType ?? 'aadhaar_xml',
            adhaar_fetched: 'true',
            manual_verification: 'false',
          });
          updateCompletedKycSteps({
            name: 'address',
            status: 1,
          });
        })
        .catch((err) => {
          setIsFooterLoading(false);
          setErrDataMessage(err);
          trackEvent('kyc_error', {
            module: addressDetails?.moduleType ?? 'aadhaar_xml',
            error_payload: err,
          });
          setIsFooterDisabled(true);
        });
    }
  };

  const initiateDigilocker = async () => {
    const response = await createDigilockerRequest();
    setShowDigilockerRedirect(true);
    trackEvent('proceed_with_digilocker');

    setTimeout(() => {
      if (response?.url) {
        router.push(response?.url);
      }
    }, 2000);
  };

  const onUpdateViaDigilocker = async () => {
    setTimeout(() => {
      setShowModal(false);
    }, 500);
    trackEvent('kyc_checkpoint', {
      module: 'digilocker',
    });
    await initiateDigilocker();
  };

  const checkDigilockerHealth = async (showToast = true) => {
    try {
      const { xmlStatus, currentAddress, moduleType } = addressDetails || {};
      const isServiceData = await isServiceActive();
      if (isServiceData?.okyc === 'SUCCESS') {
        setDigilockerLoading(false);
        return true;
      }
      if (showToast) {
        callErrorToast(
          'We are facing some issues with our partner. Please continue with Digilocker.'
        );
        setTimeout(() => onUpdateViaDigilocker(), 1500);
      } else if (xmlStatus && currentAddress && moduleType) {
        setDigilockerLoading(false);
      } else {
        await onUpdateViaDigilocker();
      }
      return false;
    } catch (error) {
      setDigilockerLoading(false);
      console.error('Health check failed:', error);
      return false;
    }
  };

  const renderDigilockerIcon = () => {
    return (
      <div className={styles.IconContainer}>
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
          alt="Digilocker Logo"
          width={91}
          height={53}
          layout="fixed"
        />
      </div>
    );
  };

  const renderForm = () => {
    return (
      <>
        <InputFieldSet
          label={'Verified Name'}
          width={inputFieldSetWidth}
          type={'text'}
          value={addressDetails?.userName ?? ''}
          disabled={true}
          error={false}
        />
        <TextArea
          labelText={'Address'}
          value={convertAddressUpdate(finalAddress)}
          multiline
          disabled={true}
          onChange={() => {}}
          error={''}
          classes={{
            input: styles.TextAreaInput,
          }}
        />
        {!isDigiLockerApproved ? (
          <div
            className={`flex items-center justify-center ${styles.AddressNotMatchText}`}
            onClick={() => setShowModal(true)}
          >
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/user-location.svg`}
              width={16}
              height={16}
              layout="fixed"
              alt="userlocation"
            />
            {aadhaarXMLFlowCheck ? (
              <span>Wrong Address? Update using Aadhaar</span>
            ) : (
              <span>Address not the same as your current address?</span>
            )}
          </div>
        ) : null}
        <LayoutFooter
          showMsg={false}
          renderOnlyButton={true}
          isFooterBtnDisabled={isFooterDisabled}
          isLoading={isFooterLoading}
          handleBtnClick={handleFooterClick}
        />
      </>
    );
  };

  const onUpdateViaAadhaar = () => {
    setShowModal(false);
  };

  if (isError) {
    return (
      <div className={`flex-column ${styles.FormFieldsContainer}`}>
        <ErrorCard
          type={'underVerification'}
          icon="icons/DangerRedTriangle.svg"
          data={{ title: 'Unable to fetch Info from DigiLocker' }}
          extraMessage={`Please check the following: <br/ > 
          • You have ticked the aadhaar while allowing the access <br/ > 
          • Your aadhaar is linked with DigiLocker.<br/ >
          • You have account on Digilocker.`}
          buttonText={'Retry via DigiLocker'}
          onClickButton={async () => await initiateDigilocker()}
          errorMessageCustomClassName={styles.extraMessage}
          contact={{
            title: 'Prefer to complete KYC manually?',
            children: (
              <div className={styles.contactChildren}>
                Send masked Aadhaar to <span>invest@gripinvest.in</span>
              </div>
            ),
          }}
          contactTitleCustomClassName={styles.contactTitle}
          titleCustomClassName={styles.failTitleHeading}
        />
      </div>
    );
  }
  const inputFieldSetWidth = isMobile ? '100%' : 371;

  return (
    <>
      {!isDigilockerLoading ? (
        <>
          <span className={styles.Title}>Address Details</span>
          <div className={`flex-column ${styles.FormFieldsContainer}`}>
            {renderForm()}
          </div>
          <AddressNoMatchModal
            showModal={showModal}
            closeModal={() => setShowModal(false)}
            address={convertAddressUpdate(finalAddress)}
            handleCBUpdate={
              aadhaarXMLFlowCheck ? onUpdateViaAadhaar : onUpdateViaDigilocker
            }
            aadhaarXMLFlowCheck={aadhaarXMLFlowCheck}
          />
        </>
      ) : null}
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

export default AddressKYC;
