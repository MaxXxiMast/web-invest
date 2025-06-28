import { useState } from 'react';
import dynamic from 'next/dynamic';

import UploadButtonKYC from '../../../primitives/UploadButtonKYC';

import { DEMAT_FILE_TYPES, KYC_FILE_TYPES } from '../../../../utils/kyc';
import { modalsData } from '../../identity/pan/utils';
import { DocSubTypeModel, DocumentProcessModel } from '../../utils/models';
import { trackEvent } from '../../../../utils/gtm';
import { ecasStepsArr } from '../../../primitives/ParsingDocumentPopup/utils';

import { uploadDocumentToS3 } from '../../../../api/document';
import {
  handleDocumentProcess,
  handleDocumentUpload,
} from '../../../../api/rfqKyc';
import { setOpenPasswordPopup } from '../../../../redux/slices/user';
import { useAppDispatch, useAppSelector } from '../../../../redux/slices/hooks';
import { delay } from '../../../../utils/timer';
import { RootState } from '../../../../redux';
import { callErrorToast } from '../../../../api/strapi';
import { trackKYCErrorEvt } from '../../utils/helper';
import styles from './KYCUploadButton.module.css';
import ParsingDocumentPopup from '../../../primitives/ParsingDocumentPopup';

const GenericModal = dynamic(() => import('../GenericModal'), {
  ssr: false,
});

type KYCUploadButtonProps = {
  kycType: DocSubTypeModel;
  btnText: string;
  handleCB: (
    type: 'error' | 'success',
    data?: unknown,
    file?: File,
    method?: string
  ) => void;
  handleOnClick?: () => void;
  fileSizeExceedCheck?: boolean;
  isShowKYCUploadText?: boolean;
  disabled?: boolean;
  handleEcasUploadBtnVisibility?: () => void;
};

const KYCUploadButton = ({
  kycType,
  btnText,
  handleCB,
  handleOnClick,
  fileSizeExceedCheck,
  isShowKYCUploadText = false,
  disabled = false,
  handleEcasUploadBtnVisibility = () => {},
}: KYCUploadButtonProps) => {
  const [showFetchModal, setShowFetchModal] = useState(false);
  const dispatch = useAppDispatch();
  const [isApiResponse, setIsApiResponse] = useState(false);
  const { userID } = useAppSelector(
    (state: RootState) => state?.user?.userData
  ) || { userID: '' };

  const isDematSection = kycType === 'depository';
  const [uploadClick, setUploadClick] = useState(1);

  /**
   * This function will work in below sequence to get document details
   * File Upload => Upload to S3 =>  File Process => File Verify
   * @param file Upload file details
   */
  const onDocumentUpload = async (file: File, password?: string) => {
    if (isDematSection) {
      trackEvent('Upload_Demat_Statement');
    }
    if (kycType === 'pan') {
      trackEvent('PAN_Card_Upload_Clicked', {
        count: uploadClick,
      });
      setUploadClick(uploadClick + 1);
    }
    if (!file) {
      handleCB('error', {}, null);
      return;
    }
    setShowFetchModal(true);
    handleOnClick?.();
    try {
      const documentTypes = {
        docSubType: kycType,
        docType: 'kyc',
        filename: isDematSection ? `${userID}_demat_eCAS.pdf` : file.name,
      };
      // Document upload
      const response = await handleDocumentUpload({
        contentLength: file.size,
        ...documentTypes,
      });

      if (response) {
        // Upload to s3
        const uploadS3 = await uploadDocumentToS3(
          response?.url,
          response?.fields,
          file
        );

        if ([204].includes(uploadS3?.status)) {
          // Document process
          const uploadData = {
            ...documentTypes,
            filepath: response.filepath,
            filename: response.filename,
          };

          if (password) {
            uploadData['filePassword'] = password;
          }

          const process = await handleDocumentProcess(
            uploadData as DocumentProcessModel
          );
          if (kycType !== 'pan') {
            trackEvent('Upload_successful', {
              file_type: documentTypes.docType,
            });
          }
          if (isDematSection) {
            setIsApiResponse(true);
            await delay(500);
          }
          isDematSection
            ? handleCB('success', process, file, 'demat_statement')
            : handleCB('success', process, file);
        }
      }
    } catch (error) {
      setShowFetchModal(false);
      if (isDematSection) {
        trackKYCErrorEvt({
          module: 'depository',
          error_type: 'api_error',
          error_heading: error.type ? error.type : error,
          error_payload: error,
          error_message: error?.message ?? error,
        });
      }
      if (isDematSection && error?.type === 'ECAS_INVALID_PASSWORD') {
        if (password) {
          callErrorToast(
            'You have entered the incorrect password. Please try again.'
          );
        }
        dispatch(setOpenPasswordPopup(true));
        handleEcasUploadBtnVisibility?.();
      } else {
        handleCB('error', error);
      }
    }
  };

  return (
    <>
      <UploadButtonKYC
        showCloseBtnOnPasswordPopup={isDematSection}
        kycStep={kycType}
        name={btnText}
        allowedFileTypes={
          isShowKYCUploadText ? DEMAT_FILE_TYPES : KYC_FILE_TYPES
        }
        error={''}
        onChange={onDocumentUpload}
        imageURL={''}
        fileSizeExceedCheck={fileSizeExceedCheck}
        isShowKYCUploadText={isShowKYCUploadText}
        disabled={disabled}
      />
      {/* Fetching Modal */}
      {isShowKYCUploadText ? (
        <ParsingDocumentPopup
          showModal={showFetchModal}
          title="Processing your document"
          isApiResponse={isApiResponse}
          setShowFetchModal={setShowFetchModal}
          setIsApiResponse={setIsApiResponse}
          stepsArr={ecasStepsArr}
        />
      ) : (
        <GenericModal
          showModal={showFetchModal}
          lottieType={modalsData[kycType].lottieType}
          title={modalsData[kycType].title}
          subtitle={modalsData[kycType].subTitle}
          className={styles.FetchModal}
          drawerExtraClass={styles.Drawer}
        />
      )}
    </>
  );
};

export default KYCUploadButton;
