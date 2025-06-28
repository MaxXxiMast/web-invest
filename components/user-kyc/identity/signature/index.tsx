import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

// API
import {
  getSignatureToken,
  signatureUpload,
} from '../../../../api/signatureKyc';

// UTILS
import { KYC_FILE_TYPES } from '../../../../utils/kyc';
import { SignatureStatus } from '../../utils/signatureUtils';
import { popupBlockedError, trackKYCErrorEvt } from '../../utils/helper';
import { callErrorToast } from '../../../../api/strapi';
import { trackEvent } from '../../../../utils/gtm';
import { postMessageToNativeOrFallback } from '../../../../utils/appHelpers';

// CONTEXT
import { useKycContext } from '../../../../contexts/kycContext';

// CUSTOM COMPONENTS
import UploadButtonKYC from '../../../primitives/UploadButtonKYC';
import ErrorPopup from '../../common/ErrorPopup';

// STYLESHEETS
import classes from './Signature.module.css';

const GenericModal = dynamic(() => import('../../common/GenericModal'), {
  ssr: false,
});

const KycSignature = () => {
  const { updateCompletedKycSteps } = useKycContext();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState(SignatureStatus[2]);
  const [loading, setLoading] = useState(false);
  const [showPopupError, setShowPopupError] = useState(false);

  const { userID = '' } = useSelector(
    (state) => (state as any)?.user?.userData ?? {}
  );

  const handleSignResponse = async (digio_doc_id: string) => {
    try {
      setShowModal(true);
      setCurrentStatus(SignatureStatus[2]);
      await signatureUpload(digio_doc_id);
      setCurrentStatus(SignatureStatus[1]);
      setTimeout(() => {
        trackEvent('kyc_signature_added');
        updateCompletedKycSteps({ name: 'signature', status: 1 });
      }, 2000);
    } catch (error) {
      callErrorToast(error);
      setCurrentStatus(SignatureStatus[0]);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    postMessageToNativeOrFallback('kycEvent', {
      kycStep: 'signiture',
    });
    trackEvent('kyc_checkpoint', {
      module: 'signature',
    });
  }, []);

  const openDigioSignature = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 5000);
    // TODO: Rudder Track Event for properties and when to call it
    trackEvent('kyc_upload_signature');

    try {
      const res = await getSignatureToken();
      if (res) {
        const { requestId, identifier, tempAccessToken } = res;
        PubSub.publish('openDigio', {
          type: 'signature',
          openDigioModal: true,
          data: {
            did: requestId,
            identifier: identifier,
            tokenID: tempAccessToken,
          },
          redirectTo: `${window.location.pathname}`,
          onEsignDone: (data: any) => handleSignResponse(data?.digio_doc_id),
          onEsignCancel: () => setLoading(false),
          onPopupError: () => setShowPopupError(true),
          captureDigioEvents: (e: any) => {
            trackKYCErrorEvt({
              module: 'signature',
              error_heading: e?.event ? e?.event : 'digio activities',
              error_type: 'esign_digio_error',
              error_payload: JSON.stringify(e),
            });
          },
        });
      }
    } catch (error) {
      callErrorToast(error);
      setLoading(false);
      setCurrentStatus(SignatureStatus[0]);
      setShowModal(true);
      trackKYCErrorEvt({
        module: 'signature',
        error_heading: 'esign_init_error',
        error_type: 'api_error',
        error_payload: error,
      });
    }
  };

  const updateStatus = () =>
    setTimeout(() => setCurrentStatus(SignatureStatus[0]), 1500);

  const handlePoupError = (
    popupBlockedErrData: ReturnType<typeof popupBlockedError>
  ) => {
    setShowPopupError(false);
    trackEvent('error_cta_clicked', {
      module: 'signature',
      error_heading: popupBlockedErrData.title,
      error_type: 'popupBlocked',
      error_payload: popupBlockedErrData,
      cta_text: popupBlockedErrData.btnText,
    });
  };

  const renderTitle = () => {
    return (
      <>
        <span className={`${classes.Title} ${classes.DocumentUploadTitle}`}>
          Add Your Signature
        </span>
        <span className={classes.SubHeading}>
          Signautre is mandated by SEBI to enable Bonds, SDIs & Baskets
        </span>
      </>
    );
  };

  if (showPopupError) {
    const popupBlockedErrData = { ...popupBlockedError('Add Signature') };
    return (
      <>
        {renderTitle()}
        <ErrorPopup
          data={popupBlockedErrData}
          handleBtnClick={() => handlePoupError(popupBlockedErrData)}
        />
      </>
    );
  }

  return (
    <div className={classes.FormFieldsContainer}>
      <div className={`flex-column ${classes.DocumentUploadContainer}`}>
        {renderTitle()}
        <UploadButtonKYC
          disabled={loading}
          name={'Draw/Upload Signature'}
          allowedFileTypes={KYC_FILE_TYPES}
          error={''}
          onChange={updateStatus}
          imageURL={''}
          btnClick={openDigioSignature}
        />
      </div>
      <GenericModal
        showModal={showModal}
        lottieType={currentStatus.lottieType}
        title={currentStatus.title}
        subtitle={currentStatus.subtitle}
        icon={currentStatus.icon}
        btnText={currentStatus.btnText}
        handleBtnClick={() => {
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default KycSignature;
