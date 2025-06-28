// NODE MODULES
import React, { useRef, useState } from 'react';
import classnames from 'classnames';
import { pdfjs, Document as ReactPDF, Page } from 'react-pdf';
import dynamic from 'next/dynamic';

// Common Components
import Image from '../Image';

// Utils
import { trackEvent } from '../../../utils/gtm';
import { DocSubTypeModel } from '../../../components/user-kyc/utils/models';
import { bytesToSize, getSizeToBytes } from '../../../utils/number';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { callErrorToast } from '../../../api/strapi';
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Styles
import classes from './UploadButtonKYC.module.css';

//slices
import { setOpenPasswordPopup } from '../../../redux/slices/user';

// Dynamic  import
const PasswordProtectedPopup = dynamic(
  () => import('../PasswordProtectedPopup'),
  {
    ssr: false,
  }
);

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type MyProps = {
  name: string;
  allowedFileTypes: string[];
  error: string;
  onChange: (file: any, password?: string) => void;
  maxFileSize?: number;
  imageURL?: string;
  customNoImage?: () => React.ReactNode;
  btnClick?: () => void;
  disabled?: boolean;
  fileSizeExceedCheck?: boolean;
  kycStep?: DocSubTypeModel;
  isShowKYCUploadText?: boolean;
  showCloseBtnOnPasswordPopup?: boolean;
};

const defaultPasswordFn = (password) => {};

function UploadButtonKYC(props: MyProps) {
  const dispatch = useAppDispatch();
  let uploadRef: any = useRef(null);
  let [uploadedFile, setFile] = useState<File>();
  let [image, setImage] = useState();
  let [password, setPassword] = useState('');
  const [pdfKey, setPdfKey] = useState<number>(0);
  const [passwordCB, setPasswordCB] = useState<(password: string) => void>(
    () => defaultPasswordFn
  );
  // Maximum file size should be 15 MB by default
  const maxFileSize = props.maxFileSize ?? getSizeToBytes(15, 'MB');
  const userData = useAppSelector((state) => state?.user?.userData);
  const userID = userData?.userID || '';

  const isMobile = useMediaQuery();
  const { showCloseBtnOnPasswordPopup = false } = props ?? {};

  const { openPasswordPopup } = useAppSelector((state) => state.user);
  const { kycStep = '', name, isShowKYCUploadText } = props;

  const openUploadPopup = () => {
    props.btnClick ? props.btnClick() : uploadRef && uploadRef.current.click();
  };

  const getFile = (eventFile: File) => {
    let file = eventFile;

    setFile(file);
    setPdfKey((prevKey) => prevKey + 1);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData: Buffer | any = e.target?.result;
      setImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Function to upload a PDF file for decryption
  const uploadAndDecryptPdf = async (encryptedFile: File, password: string) => {
    try {
      let file = encryptedFile;
      if (password && !isShowKYCUploadText) {
        const formData = new FormData();
        formData.append('pdf', encryptedFile);
        formData.append('password', password);

        const response = await fetch('/api/decrypt-pdf', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Error decrypting PDF');
        }

        const blob = await response.blob();
        file = new File([blob], 'decrypted-pdf.pdf', {
          type: blob.type,
          lastModified: Date.now(),
        });
      }
      props.onChange(file);
    } catch (error) {
      console.error('Error:', error);
      deleteFile({}, 'Unable to decrypt the file, please try again!');
    }
  };

  const renderNonPdfFile = (documentURL: string) => {
    return documentURL ? (
      <Image
        src={documentURL}
        className={classnames(classes.image, classes.coverProfile)}
        width={28}
        height={28}
        layout="fixed"
        alt="documenturl"
      />
    ) : (
      props.customNoImage?.() ??
        (isShowKYCUploadText ? null : (
          <div className={`flex ${classes.Icon}`}>
            <i className={`grip-icon icon-upload ${classes.uploadIcon}`}></i>
          </div>
        ))
    );
  };

  const renderImage = () => {
    const isPDFFile =
      (uploadedFile as any)?.type === 'application/pdf' ||
      props?.imageURL === 'application/pdf';
    const documentURL = uploadedFile ? image : props?.imageURL;
    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event?.target?.files?.[0];
      if (file) {
        if (maxFileSize < file?.size && props?.fileSizeExceedCheck) {
          callErrorToast(
            `Maximum file size is ${bytesToSize(
              maxFileSize
            )}. Please try again. `
          );

          let kycStepName = name;
          if (kycStep === 'pan') {
            kycStepName = 'PAN Card';
          } else {
            kycStepName = kycStepName.startsWith('Upload ')
              ? kycStepName.substring(7)
              : kycStepName;
          }

          trackEvent('file_size_exceeded', {
            CustId: userID,
            Timestamp: new Date(),
            Step: kycStepName,
            FileSize: bytesToSize(file?.size),
          });
          return;
        }

        if (!props.allowedFileTypes.includes(file?.type)) {
          const errMessage = isShowKYCUploadText
            ? 'Only Upload PDF'
            : 'Only Upload PDF, PNG and JPEG';
          callErrorToast(errMessage);
          return;
        }
        getFile(file);
        if (file?.type !== 'application/pdf') {
          props.onChange(file);
        }
      }
      event.target.value = '';
    };
    return (
      <div className={classnames(classes.profileWrapper, {})}>
        <input
          className={classes.inputUpload}
          onChange={handleFile}
          type="file"
          ref={uploadRef}
          data-testid="file-input"
          accept={props.allowedFileTypes.toString()}
        />
        {isShowKYCUploadText && !isMobile ? (
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/arrowRight.svg`}
            className={classes.image}
            width={16}
            height={16}
            layout="fixed"
            alt="arrowrightlogo"
          />
        ) : null}
        <div
          className={classnames('flex items-center', {
            [classes.profileBackground]: isPDFFile,
          })}
        >
          {isPDFFile ? (
            <ReactPDF
              key={pdfKey}
              className={classes.image}
              file={documentURL}
              loading={null}
              onPassword={(callback, reason) => {
                switch (reason as any) {
                  case 1: {
                    if (isShowKYCUploadText) {
                      uploadAndDecryptPdf(uploadedFile, password);
                    } else {
                      setPasswordCB(() => callback);
                    }
                    break;
                  }
                  case 2: {
                    deleteFile({}, 'Invalid password. Please try again.');
                    break;
                  }
                  default:
                }
              }}
              onLoadSuccess={() => {
                uploadAndDecryptPdf(uploadedFile, password);
              }}
              onLoadError={(error) => {
                deleteFile({}, 'Invalid PDF File. Please try again.');
              }}
            >
              <Page pageNumber={1} width={96} height={96} />
            </ReactPDF>
          ) : (
            renderNonPdfFile(documentURL)
          )}
        </div>
      </div>
    );
  };

  const deleteFile = (event: any = {}, errMsg: string = '') => {
    setFile(undefined);
    setImage(undefined);
    props.onChange(null);
    if (uploadRef.current) {
      uploadRef.current.value = '';
    }
    if (errMsg) callErrorToast(errMsg);
    setPassword('');
    event?.stopPropagation?.();
  };

  const handleSubmitPassword = (password: string) => {
    passwordCB(password);
    if (password) {
      setPassword(password);
      props.onChange(uploadedFile, password);
    } else {
      deleteFile();
    }
    dispatch(setOpenPasswordPopup(false));
  };
  return (
    <>
      {isShowKYCUploadText ? (
        <div
          className={classnames('flex', classes.uploadContent, {
            [classes.disabled]: props.disabled,
          })}
          onClick={openUploadPopup}
        >
          <span>{name}</span>
          {renderImage()}
        </div>
      ) : (
        <div
          className={classnames('flex', classes.uploadContainer, {
            [classes.greenBorder]: uploadedFile,
            [classes.uploadedContainer]: uploadedFile,
            [classes.disabled]: props.disabled,
          })}
          onClick={openUploadPopup}
        >
          <div
            className={`items-align-center-row-wise ${classes.Container} ${
              uploadedFile ? classes.UploadedContainer : ''
            }`}
          >
            <div className={`flex items-center`}>
              {renderImage()}
              {uploadedFile ? (
                <span className={classes.uploadedFileName}>
                  {(uploadedFile as any)?.name}
                </span>
              ) : null}
            </div>
            {uploadedFile ? (
              <div
                className={classes.closeIcon}
                onClick={deleteFile}
                data-testid="close-icon"
              >
                <span className={`icon-cross ${classes.CrossIcon}`} />
              </div>
            ) : (
              <span className={`${classes.uploadText}`}>{props.name}</span>
            )}
          </div>
        </div>
      )}
      <PasswordProtectedPopup
        showPopup={openPasswordPopup}
        onSubmit={handleSubmitPassword}
        hideCloseButton={!showCloseBtnOnPasswordPopup}
        handleModalClose={() => dispatch(setOpenPasswordPopup(false))}
      />
    </>
  );
}

export default UploadButtonKYC;
