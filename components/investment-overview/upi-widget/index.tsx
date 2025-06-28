// NODE MODULES
import { useContext, useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';

// Components
import InputFieldSet from '../../common/inputFieldSet';
import Image from '../../primitives/Image';
import Button, { ButtonType } from '../../primitives/Button';

// Utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import {
  upiRegex,
  LoaderStatus,
  verifyUPIIDEvent,
} from '../../../utils/investment';
import { trackEvent } from '../../../utils/gtm';

// APIs
import { checkUpiValidation, getPreVerifiedUPI } from '../../../api/payment';

// Contexts
import { InvestmentOverviewContext } from '../../assetAgreement/RfqInvestment';

// Styles
import classes from './UpiWidget.module.css';

const checkValidValue = (value: string) => {
  return value && value.includes('@') && value.length >= 5;
};

type Props = {
  className?: string;
  placeholderTxt?: string;
  btnTxt?: string;
  suggestedUPI?: string[];
  triggerValueChange?: () => void;
  handleUpiStatus?: (status: string | null) => void;
};

/**
 * UPI component
 * @param placeholderTxt Input field placeholder
 * @param btnTxt Submit button text
 * @param suggestedUPI List of UPI suggestions
 * @returns
 */

const UpiWidget = ({
  className = '',
  placeholderTxt = 'Enter your UPI ID',
  btnTxt = 'Verify',
  suggestedUPI = [],
  triggerValueChange,
  handleUpiStatus,
}: Props) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [showTagSuggestion, setShowTagSuggestion] = useState(false);
  const [upiStatus, setUpiStatus] = useState<LoaderStatus>(null);
  const [responseMess, setResponseMess] = useState('');
  const [submitData, setSubmitData] = useState<any>({});
  const [showIcon, setShowIcon] = useState(true);
  const {
    onSubmitUpiCB,
    isAMO = false,
    totalPayableAmount,
    bankDetails,
  }: any = useContext(InvestmentOverviewContext);
  const [preFillVerifiedID, setpreFillVerifiedID] = useState(false);

  const trackEventOnVerifyBtnClick = (data: verifyUPIIDEvent) => {
    trackEvent('verify_upi_id', data);
  };

  const getStatusUPIVerification = (message = '') => {
    const isUPINotLinked = message?.includes('linked');
    const isUPINotAvailable = message?.includes('available');

    if (isUPINotAvailable) {
      return 0;
    }

    if (isUPINotLinked) {
      return 2;
    }

    return 3;
  };

  // orders/verify/upi
  const handleUpiVerification = async () => {
    const postData = { paymentType: 'upi', vpa: inputVal };
    setUpiStatus('loading');
    try {
      const data = await checkUpiValidation(postData);
      const bankingName = data?.message?.split(':')?.[1]?.trim();
      trackEventOnVerifyBtnClick({
        amo_order: isAMO,
        amount: totalPayableAmount,
        bank_name: bankDetails?.bankName,
        status: 1,
        response_payload: data,
      });
      setUpiStatus('success');
      setResponseMess(data?.message);

      handleUpiStatus('success');
      setSubmitData({
        value: inputVal,
        message: data?.message,
        status: 'success',
      });
      onSubmitUpiCB?.({
        value: inputVal,
        bankingName: bankingName,
      });
    } catch (error) {
      const errType = error?.statusCode === 500 ? 'success' : 'error';
      setUpiStatus(errType);
      setResponseMess(error?.message);
      setSubmitData({
        value: inputVal,
        message: error?.message,
        status: errType,
      });
      trackEventOnVerifyBtnClick({
        amo_order: isAMO,
        amount: totalPayableAmount,
        bank_name: '',
        status: getStatusUPIVerification(error?.message),
        response_payload: error,
      });
      if (error?.statusCode === 500) {
        handleUpiStatus('success');
        setShowIcon(false);
        onSubmitUpiCB?.({
          value: inputVal,
          bankingName: '',
        });
      }
    }
  };

  const handleBtnClick = () => {
    // Prevent API call for same data
    if (inputVal && inputVal.trim() && inputVal === submitData?.value) {
      setUpiStatus(submitData?.status);
      setResponseMess(submitData?.message.split('Last')[0]);
      setUpiStatus('success');

      handleUpiStatus('success');
      return;
    }

    // Check if input value is not blank
    if (inputVal && inputVal.trim() !== '' && checkValidValue(inputVal)) {
      //Check UPI ID with validation with regex
      if (!upiRegex.test(inputVal)) {
        setUpiStatus('error');
        setResponseMess('Please enter valid UPI ID');
        return;
      }

      // Call API for server side UPI check
      handleUpiVerification();
    }
  };

  const handleTagClick = (ele: string) => {
    setInputVal(`${inputVal}${ele}`);
  };

  useEffect(() => {
    setShowTagSuggestion(inputVal.trim() !== '' && inputVal.length >= 5);
    if (preFillVerifiedID) {
      setpreFillVerifiedID(false);
      setUpiStatus(null);
    } else {
      setUpiStatus(null);
    }
    // Check only if user again update input field
    if (upiStatus) {
      triggerValueChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputVal]);

  useEffect(() => {
    getPreVerifiedUPIDeatils();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPreVerifiedUPIDeatils = async () => {
    const res = await getPreVerifiedUPI();
    if (res.length) {
      const formattedDate = res[0].lastVerifiedOn
        ? dayjs(res[0].lastVerifiedOn).format('DD MMM YYYY')
        : '--/--/----';
      setInputVal(res[0]?.upiID);
      setpreFillVerifiedID(true);
      setUpiStatus('success');
      setResponseMess(`UPI ID verified on ${formattedDate}`);

      handleUpiStatus('success');
      setSubmitData({
        value: res[0]?.upiID,
        message: `UPI ID Verified. Banking Name: ${res[0]?.bankingName}. Last Verified on ${formattedDate}`,
        status: 'success',
      });
      onSubmitUpiCB?.({
        value: res[0]?.upiID,
        bankingName: res[0]?.bankingName,
      });
    }
  };

  return (
    <div
      className={`${classes.Wrapper} ${handleExtraProps(
        className
      )} flex direction-column`}
      id="UpitTab"
    >
      <div
        className={`${classes.InputWrapper} ${
          upiStatus === 'error' ? classes.InvalidField : ''
        }`}
      >
        <InputFieldSet
          inputId="UPI_VALUE"
          className={`${classes.Input}`}
          type="text"
          placeHolder={placeholderTxt}
          label={placeholderTxt}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          showClear
          clearClass={classes.ClearIcon}
          enableFocusOnClear
        />
        <Button
          width={''}
          className={`${classes.VerifyBtn} ${
            !checkValidValue(inputVal) || upiStatus ? classes.DisableBtn : ''
          }`}
          variant={ButtonType.PrimaryLight}
          onClick={handleBtnClick}
        >
          {btnTxt}
        </Button>
      </div>

      {upiStatus ? (
        <div className={classes.States}>
          {/* Loading state */}
          {upiStatus === 'loading' ? (
            <div className={`flex ${classes.Loader}  ${classes.StateWrapper}`}>
              <CircularProgress size={12} />
              <span className={classes.Label}>Verifying UPI ID</span>
            </div>
          ) : null}

          {upiStatus === 'success' || upiStatus === 'error' ? (
            <div
              className={`flex ${
                upiStatus === 'success' ? classes.Success : classes.Error
              } ${classes.StateWrapper}`}
            >
              {showIcon ? (
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}icons/${
                    upiStatus === 'success'
                      ? 'check-circle.svg'
                      : 'close-circle-red.svg'
                  }`}
                  layout="fixed"
                  width={16}
                  height={16}
                  alt="Success"
                  className={classes.Icon}
                />
              ) : null}
              <span className={classes.Label}>{responseMess}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {suggestedUPI.length > 0 ? (
        <>
          {!upiStatus ? (
            <div className={`${classes.TagList}`}>
              {showTagSuggestion ? (
                <ul>
                  {suggestedUPI.map((ele) => {
                    return (
                      <li key={`${ele}`}>
                        <div
                          onClick={() => handleTagClick(ele)}
                          className={classes.Tag}
                        >
                          {ele}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default UpiWidget;
