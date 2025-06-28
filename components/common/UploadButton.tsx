/**
 * Copied from grip-client-web/src/design-systems/components/UploadButton/index.tsx
 * Created by Moulik on 2022-04-07.
 */

import React, { useRef, useState } from 'react';
import classnames from 'classnames';

import Image from '../../design-systems/components/Image';

import { pdfjs, Document as ReactPDF, Page } from 'react-pdf';

import { getObjectClassNames } from '../utils/designUtils';
import { mediaQueries } from '../utils/designSystem';
import { bytesToSize, getSizeToBytes } from '../../utils/number';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { callErrorToast } from '../../api/strapi';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const classes: any = getObjectClassNames({
  inputUpload: {
    display: 'none',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  profileBackground: {
    height: 28,
    width: 28,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  profileWrapper: {
    position: 'relative',
    marginRight: 16,
    [mediaQueries.phone]: {
      marginRight: 12,
    },
  },
  uploadContainer: {
    padding: '18px 20px',
    background: '#FFFFFF',
    border: '1px dashed #A8A9BD',
    boxShadow: '3px 4px 4px rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    alignItems: 'center',
    margin: '20px 0',
    cursor: 'pointer',
    [mediaQueries.phone]: {
      padding: '14px 16px',
    },
  },
  uploadText: {
    fontFamily: 'var(--fontFamily) !important',
    fontWeight: 400,
    fontSize: 16,
    lineHeight: '24px',
    color: '#282C3F',
    [mediaQueries.phone]: {
      fontSize: 16,
      lineHeight: '24px',
    },
  },
  uploadedFileName: {
    fontWeight: 400,
    fontSize: 16,
    lineHeight: '16px',
    color: '#282C3F',
    marginBottom: 12,
    maxWidth: 130,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    [mediaQueries.phone]: {
      maxWidth: '100%',
      marginBottom: 4,
      lineHeight: '20px',
    },
  },
  uploadedFileSize: {
    fontWeight: 400,
    fontSize: 12,
    lineHeight: '16px',
    color: '#00B8B7',
  },
  closeIcon: {
    width: 24,
    height: 24,
    fill: 'var(--gripGullGrey, #99A5B9)',
    cursor: 'pointer',
    fontSize: '24px',
  },
  coverProfile: {
    objectFit: 'cover',
    objectPosition: 'top',
  },
  flexContainer: {
    alignItems: 'center',
  },
  greenBorder: {
    borderColor: '#02C988',
  },
});

type MyProps = {
  name: string;
  allowedFileTypes: string[];
  error: string;
  onChange: (file: any) => void;
  maxFileSize?: number;
  imageURL?: string;
  mainContainerClass?: any;
  textContainerClass?: any;
  imageContainerClass?: any;
  hideDetails?: boolean;
  profileWrapperClass?: any;
  customNoImage?: () => React.ReactNode;
};

function UploadButton(props: MyProps) {
  let uploadRef: any = useRef();
  let [uploadedFile, setFile] = useState();
  let [image, setImage] = useState();
  // Maximum file size should be 15 MB by default
  const maxFileSize = props.maxFileSize ?? getSizeToBytes(15, 'MB');

  const openUploadPopup = () => {
    uploadRef && uploadRef.click();
  };

  const getFile = (event: any) => {
    const { files } = event.target;
    const file = files[0];

    if (maxFileSize < file?.size) {
      uploadRef.value = '';
      callErrorToast(
        `Maximum file size is ${bytesToSize(maxFileSize)}. Please try again. `
      );
      return;
    }

    if (props.allowedFileTypes.includes(file?.type)) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData: Buffer | any = e.target?.result;
        setImage(imageData);
      };
      reader.readAsDataURL(file);
      props.onChange(file);
    } else {
      callErrorToast('Only Upload PDF, PNG and JPEG');
      uploadRef.value = '';
    }
  };

  const renderNonPdfFile = (documentURL: string) => {
    return documentURL ? (
      <Image
        src={documentURL}
        className={classnames(classes.image, classes.coverProfile)}
        alt="coverProfilelogo"
      />
    ) : (
      props.customNoImage?.() ?? (
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}commons/upload.svg`}
          className={classes.image}
          alt="uploadlogo"
        />
      )
    );
  };

  const renderImage = () => {
    const isPDFFile =
      (uploadedFile as any)?.type === 'application/pdf' ||
      props?.imageURL === 'application/pdf';
    const documentURL = uploadedFile ? image : props?.imageURL;
    return (
      <div
        className={classnames(classes.profileWrapper, {
          [props?.profileWrapperClass]: Boolean(props?.profileWrapperClass),
        })}
      >
        <input
          className={classes.inputUpload}
          onChange={getFile}
          type="file"
          ref={(ref: any) => (uploadRef = ref)}
          accept={props.allowedFileTypes.toString()}
        />
        <div
          className={`flex_wrapper ${classnames(
            classes.profileBackground,
            props?.imageContainerClass
          )}`}
        >
          {isPDFFile ? (
            <ReactPDF className={classes.image} file={documentURL}>
              <Page pageNumber={1} width={96} height={96} />
            </ReactPDF>
          ) : (
            renderNonPdfFile(documentURL)
          )}
        </div>
      </div>
    );
  };

  const deleteFile = () => {
    setFile(undefined);
    setImage(undefined);
    uploadRef.value = '';
  };

  return (
    <div
      className={`flex ${classnames(
        classes.uploadContainer,
        props?.mainContainerClass,
        {
          [classes.greenBorder]: uploadedFile,
        }
      )}`}
      onClick={openUploadPopup}
    >
      {renderImage()}
      {uploadedFile && !props.hideDetails ? (
        <div className={`flex ${classes.flexContainer}`}>
          <div className={`flex-column ${props.textContainerClass}`}>
            <div className={classes.uploadedFileName}>
              {(uploadedFile as any).name}
            </div>
            <div className={classes.uploadedFileSize}>
              {bytesToSize((uploadedFile as any).size)}
            </div>
          </div>
          <span
            className={`icon-cross ${classes.closeIcon}`}
            onClick={deleteFile}
          />
        </div>
      ) : (
        <div className={classes.uploadText}>{props.name}</div>
      )}
    </div>
  );
}
export default UploadButton;
