import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import CustomizedSteppers from '../../common/Stepper';
import Image from '../../primitives/Image';

import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { RFQInitationSteps } from '../../../utils/rfq';
import { RFQDealConfirmationModalProps } from '../types';

import { InvestmentOverviewContext } from '../../assetAgreement/RfqInvestment';

import styles from './Progress.module.css';
import { placeOrderWithExchange } from '../../../redux/slices/orders';

type StepTypes = 'label' | 'sublabel';

const ProgressBar = ({ close }: RFQDealConfirmationModalProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);

  // Currently not using the substeps
  const activeSubStep = 0;
  const { paymentTypeData, paymentTypeSelected, upiValue, transactionID }: any =
    useContext(InvestmentOverviewContext);

  const { exchangeType = 'BSE' } = paymentTypeData;

  const dispatch = useDispatch();

  const renderingSteps = Object.keys(RFQInitationSteps);

  const onCloseModal = (isSuccess = true, isMarketClosed = false) => {
    setTimeout(() => {
      close(isSuccess, isMarketClosed);
    }, 1000);
  };

  const onErrorApiCb = (isMarketClosed = false) => {
    setError(true);
    onCloseModal(false, isMarketClosed);
  };

  /**
   * Success for initiating order
   */
  const onInitiateSuccessCB = async () => {
    const tranID = transactionID;
    setActiveStep(1);

    // Call RFQ Initate
    if (tranID) {
      // Initiate RFQ Order
      dispatch(
        placeOrderWithExchange(
          {
            paymentMethod: paymentTypeSelected,
            transactionID: tranID,
            upiID: paymentTypeSelected === 'upi' ? upiValue : '',
          },
          () => {
            setActiveStep(3); // Update Active Step to Next Step
            onCloseModal(); // Close modal and redirect to payment gateway
          },
          onErrorApiCb
        ) as any
      );
    }
  };

  useEffect(() => {
    if (transactionID) {
      onInitiateSuccessCB();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionID]);

  useEffect(() => {
    if (activeStep) {
      let tempProgress = activeStep * (100 / renderingSteps.length);
      setProgress(tempProgress);
    } else {
      setProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  const renderCompletedIcon = (type: StepTypes = 'label') => {
    const isSubLabel = type === 'sublabel';
    return (
      <div className={`${styles.StepperIconCompleted} ${type}`}>
        <span
          className={`icon-check-circle ${styles.IconTick} ${
            isSubLabel ? styles.SubLabel : ''
          }`}
        />
      </div>
    );
  };

  const renderErrorIcon = (type: StepTypes = 'label') => {
    const isSubLabel = type === 'sublabel';
    return (
      <div className={`${styles.StepperIconCompleted} ${type}`}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/${
            isSubLabel ? 'DangerRedTriangle.svg' : 'DangerRedCircle.svg'
          }`}
          width={isSubLabel ? 17 : 24}
          height={isSubLabel ? 17 : 24}
          alt={isSubLabel ? 'DangerRedTriangle' : 'DangerRedCircle'}
          unoptimized
        />
      </div>
    );
  };

  const renderCircularProgress = (type: StepTypes = 'label') => {
    const progessStyles = {
      size: type === 'label' ? 24 : 17,
      thickness: 4,
    };
    return (
      <div className={styles.circularProgressContainer}>
        <CircularProgress
          variant="determinate"
          size={progessStyles.size}
          thickness={progessStyles.thickness}
          value={100}
          className={styles.circularProgressDeterminate}
        />
        <CircularProgress
          variant="indeterminate"
          size={progessStyles.size}
          thickness={progessStyles.thickness}
          disableShrink
          className={styles.circularProgressInDeterminate}
          classes={{
            circle: styles.circularProgressInDeterminateCircle,
          }}
        />
      </div>
    );
  };

  const renderCircleForSubStep = (
    label: string,
    subLabel: string,
    type: StepTypes
  ) => {
    const indexOfSubLabel = RFQInitationSteps?.[label]?.indexOf(subLabel);
    if (activeSubStep === indexOfSubLabel) {
      return error ? renderErrorIcon(type) : renderCircularProgress(type);
    }

    if (activeSubStep > indexOfSubLabel) {
      return renderCompletedIcon('sublabel');
    }

    return <div className={styles.PendingSubLabelCircle} />;
  };

  const renderTextWithLoader = (
    text: string,
    label: string,
    type: StepTypes = 'label'
  ) => {
    let indexOfSubLabel = -1;
    if (type === 'sublabel') {
      indexOfSubLabel = RFQInitationSteps?.[label]?.indexOf(text);
    }

    const isActiveSubStep = activeSubStep === indexOfSubLabel;
    const isCompleted = activeSubStep > indexOfSubLabel;
    return (
      <div
        key={`${text}-${type}-${label}`}
        className={`flex items-center ${styles.labelContainer} ${type} ${
          isActiveSubStep ? styles.inProgressSubLabel : null
        }`}
      >
        {type === 'sublabel' ? renderCircleForSubStep(label, text, type) : null}
        <div
          className={`${type} ${
            isActiveSubStep || isCompleted ? styles.ftWeight500 : ''
          } `}
        >
          {text}
        </div>
      </div>
    );
  };

  const renderLabel = (label: string) => {
    const subStepsOflabel = RFQInitationSteps?.[label] ?? [];
    const indexOfLabel = renderingSteps.indexOf(label);
    return (
      <>
        {renderTextWithLoader(label, label)}
        {subStepsOflabel.length && activeStep === indexOfLabel ? (
          <div className={`flex-column ${styles.subLabelContainer}`}>
            {subStepsOflabel?.map((subStep) =>
              subStep ? renderTextWithLoader(subStep, label, 'sublabel') : null
            )}
          </div>
        ) : null}
      </>
    );
  };

  return (
    <div>
      <div className={styles.Header}>Processing Your Order</div>
      <div className={`flex-column ${styles.mainContainer}`}>
        <div className={`flex items-center ${styles.linearProgressContainer}`}>
          <LinearProgress
            variant="determinate"
            value={error ? 0 : progress}
            className={`${styles.linearProgress} ${error ? 'error' : ''}`}
            color="inherit"
          />
          <div
            className={`${styles.progressText} ${
              error ? styles.errorText : ''
            }`}
          >
            {error ? 'Failed' : `${Math.floor(progress)}%`}
          </div>
        </div>
        <div className={styles.progressDetailText}>
          It might take up to 90 seconds. Please do not hit back or refresh
          button
        </div>
        <CustomizedSteppers
          steps={renderingSteps}
          activeStep={activeStep}
          className={styles.StepperContainer}
          orientation={'vertical'}
          classes={{
            stepLabelRoot: styles.StepLabelRoot,
            stepperRoot: `${styles.StepperRoot} ${
              activeStep === renderingSteps.length - 1
                ? styles.StepperRootLast
                : ''
            }`,
            stepLabel: styles.StepLabel,
            stepIcon: styles.StepIcon,
          }}
          customizedLabel={renderLabel}
          customIcon={(isCompleted, isActive, stepNumber) => {
            if (isCompleted) {
              return renderCompletedIcon();
            }

            if (error && activeStep === stepNumber - 1) {
              return renderErrorIcon('label');
            }

            if (isActive) {
              return renderCircularProgress('label');
            }
          }}
          hideStepConnector
        />
      </div>

      <div className={styles.orderProcessed}>
        Order is being processed on{' '}
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/${
            exchangeType === 'NSE' ? 'nse-logo.svg' : 'bse-logo.svg'
          }`}
          alt={exchangeType}
          layout="fixed"
          width={exchangeType === 'NSE' ? 46 : 35}
          height={exchangeType === 'NSE' ? 25 : 15}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
