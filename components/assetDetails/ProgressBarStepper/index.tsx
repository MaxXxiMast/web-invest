// NODE MODULES
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';

// Components
import CustomizedSteppers from '../../common/Stepper';
import Image from '../../primitives/Image';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// Styles
import styles from './ProgressBarStepper.module.css';

type StepTypes = 'label' | 'sublabel';

type ProgressBarStepperProps = {
  activeStep: number;
  error?: boolean;
  steps?: any;
};

const ProgressBarStepper = ({
  activeStep,
  error = false,
  steps = {},
}: ProgressBarStepperProps) => {
  const [progress, setProgress] = useState(0);

  // Currently not using the substeps
  const activeSubStep = 0;

  const finalSteps = steps;

  const renderingSteps = Object.keys(finalSteps);

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
    const indexOfSubLabel = finalSteps?.[label]?.indexOf(subLabel);
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
      indexOfSubLabel = finalSteps?.[label]?.indexOf(text);
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
    const subStepsOflabel = finalSteps?.[label] ?? [];
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
    </div>
  );
};

export default ProgressBarStepper;
