import { useEffect, useState } from 'react';

// common componenets
import InputFieldSet from '../../common/inputFieldSet';
import GenericModal from '../../user-kyc/common/GenericModal';
import UploadButtonKYC from '../../primitives/UploadButtonKYC';

// utils
import { KYC_FILE_TYPES } from '../../../utils/kyc';
import { getSizeToBytes } from '../../../utils/number';

// styles
import classes from './UtrModal.module.css';

// API
import { handleDocumentUpload } from '../../../api/rfqKyc';
import { uploadDocumentToS3 } from '../../../api/document';
import { retryRFQPayment, updateUTRForTransaction } from '../../../api/rfq';
import { callErrorToast } from '../../../api/strapi';

type formData = {
  filename?: string;
  filepath?: string;
  utr?: string;
  errorMsg?: string;
  fileLoading?: boolean;
};

let formData: formData = {
  filename: '',
  filepath: '',
  utr: '',
  errorMsg: '',
  fileLoading: false,
};

const limit_exceed = 'UTR cannot be more than 30 characters long';
const no_special_character = 'No special characters allowed';

const UtrInputField = ({ label }) => {
  const [utr, setUtr] = useState();
  const [errMsg, setErrMsg] = useState('');

  function isValidVariableName(name) {
    return /^[a-zA-Z0-9]*$/.test(name);
  }

  const handleUtr = (e: any) => {
    const value = e.target.value;
    formData['utr'] = value;
    setUtr(value);

    // validations
    if (value.length > 30) {
      setErrMsg(limit_exceed);
      formData.errorMsg = limit_exceed;
    } else if (!isValidVariableName(value)) {
      setErrMsg(no_special_character);
      formData.errorMsg = no_special_character;
    } else {
      setErrMsg('');
      formData.errorMsg = '';
    }
  };

  useEffect(() => {
    return () => {
      formData = {};
    };
  }, []);

  return (
    <InputFieldSet
      label={label}
      width={'100%'}
      type="text"
      inputId={'utr'}
      onChange={handleUtr}
      value={utr}
      error={!!errMsg}
      errorMsgStyle={classes.errMsg}
      errorMsg={errMsg}
    />
  );
};

const UtrFormModal = (props) => {
  const { showModal, setShowUtrModal, transactionId, handleAfterUtr } = props;

  const YetToPayBtn = () => {
    return (
      <button
        onClick={() => setShowUtrModal(false)}
        className={classes.yetToPayBtn}
      >
        I’m yet to Pay
      </button>
    );
  };

  const onDocumentUpload = async (file: File) => {
    if (!file) {
      formData['filename'] = '';
      formData['filepath'] = '';
      formData['fileLoading'] = false;
      return;
    }
    formData['fileLoading'] = true;
    try {
      const documentTypes = {
        docType: 'order',
        filename: file.name,
        docSubType: 'rfq',
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
          formData['filename'] = file?.name;
          formData['filepath'] = response?.filepath;
        }
      }
      formData['fileLoading'] = false;
    } catch (error) {
      formData['fileLoading'] = false;
      console.log('Upload error', error);
    }
  };

  const onSubmitUTR = async () => {
    // Call UTR Submit API
    if (
      formData?.filename &&
      formData?.filepath &&
      formData?.utr &&
      !formData.errorMsg
    ) {
      const data = {
        filename: formData?.filename,
        filepath: formData?.filepath,
        utr: formData?.utr,
      };
      await retryRFQPayment({
        transactionID: transactionId,
        paymentMethod: 'offline',

        upiID: null,
        raiseMandate: false,
      });
      await updateUTRForTransaction(transactionId, data);
      handleAfterUtr?.();
      setShowUtrModal(false);
    } else if (formData?.fileLoading) {
      callErrorToast('File is uploading....');
    } else {
      callErrorToast(formData.errorMsg || 'All fields are mandatory');
    }
  };

  return (
    <GenericModal
      title="Confirm Payment UTR"
      showModal={showModal}
      btnText="Submit"
      hideClose={false}
      wrapperExtraClass={classes.wrapper}
      handleBtnClick={onSubmitUTR}
      handleModalClose={() => setShowUtrModal(false)}
      hideIcon
      Footer={YetToPayBtn}
    >
      <div className={`${classes.container}`}>
        <UtrInputField label={`Enter UTR for Payment`} />
        <UploadButtonKYC
          name={'Upload Payment Proof'}
          allowedFileTypes={KYC_FILE_TYPES}
          maxFileSize={getSizeToBytes(15, 'MB')}
          fileSizeExceedCheck={true}
          error={''}
          onChange={onDocumentUpload}
        />
      </div>
    </GenericModal>
  );
};

export default UtrFormModal;
