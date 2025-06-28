// Utils import
import { UploadBtnData } from '../../utils/financialUtils';

// Custom components
import KYCUploadButton from '../../common/KYCUploadButton';
import Note from '../../common/Note';

// Stylesheets
import classes from './Bank.module.css';

type Props = {
  handleUploadCB?: (
    type: 'error' | 'success',
    data?: unknown,
    file?: File
  ) => void;
};

const DocUploadForm = ({ handleUploadCB }: Props) => {
  const documentSubType = 'cheque';

  return (
    <>
      <div className={`${classes.UploadBtn}`}>
        <KYCUploadButton
          kycType={'cheque'}
          btnText={UploadBtnData?.[documentSubType]?.btnTxt}
          handleCB={handleUploadCB}
          fileSizeExceedCheck
        />
      </div>
      <Note
        className={classes.UploadNote}
        text={UploadBtnData?.[documentSubType]?.note}
      />
    </>
  );
};

export default DocUploadForm;
