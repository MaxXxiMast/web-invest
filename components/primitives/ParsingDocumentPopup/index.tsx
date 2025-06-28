import { useState, useEffect } from 'react';
import styles from './ParsingDocumentPopup.module.css';
import MaterialModalPopup from '../MaterialModalPopup';
import CircularProgressMeter from '../CircularProgressMeter/CircularProgressMeter';

const ParsingDocumentPopup = ({
  showModal,
  title = '',
  isApiResponse,
  setShowFetchModal,
  setIsApiResponse,
  stepsArr,
}: any) => {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState(JSON.parse(JSON.stringify(stepsArr)));
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let timer;
    if (isApiResponse) {
      setCurrentStep(3);
      timer = setTimeout(() => {
        setShowFetchModal(false);
        setIsApiResponse(false);
      }, 1000);
    }
    return () => {
      clearTimeout(timer);
      setCurrentStep(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiResponse]);

  useEffect(() => {
    if (currentStep && Array.isArray(steps) && steps.length) {
      setProgress(Math.floor((currentStep * 100) / steps.length));
    } else {
      setProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  useEffect(() => {
    setProgress(0);
    setCurrentStep(0);
    let decryptingTimer, parseTimer;
    if (showModal) {
      decryptingTimer = setTimeout(() => {
        setCurrentStep(1);
      }, 3000);

      parseTimer = setTimeout(() => {
        setCurrentStep(2);
      }, 6000);
    }

    return () => {
      decryptingTimer && clearTimeout(decryptingTimer);
      parseTimer && clearTimeout(parseTimer);
      setCurrentStep(2);
      setProgress(100);
    };
  }, [showModal]);

  if (!showModal) {
    return null;
  }

  return (
    <MaterialModalPopup isModalDrawer hideClose={true} showModal={showModal}>
      <h3>{title}</h3>
      <div className={`align-items-baseline ${styles.progressContainer}`}>
        <div className={styles.progressbar}>
          <div className={styles.progress} style={{ width: `${progress}%` }}>
            &nbsp;
          </div>
        </div>
        <span className={styles.progressBarContent}>{`${progress}%`}</span>
      </div>

      <ul className={`items-align-center-column-wise ${styles.StepsContainer}`}>
        {steps.map((step, index) => {
          return (
            <li key={title} className={`flex-column  ${styles.step}`}>
              <div className={`flex items-center `}>
                {currentStep === index ? (
                  <CircularProgressMeter size={16} thickness={4} />
                ) : (
                  <span
                    className={`${styles.circle} ${
                      currentStep > index
                        ? styles.processed
                        : styles.intermediate
                    }`}
                  >
                    {currentStep > index ? (
                      <span className="icon-tick" />
                    ) : null}
                  </span>
                )}

                <span
                  className={`${
                    currentStep > index
                      ? styles.ProcessedTitle
                      : currentStep === index
                      ? styles.LoadingTitle
                      : styles.IntermediateTitle
                  } ${styles.title}`}
                >
                  {step.title}
                </span>
              </div>

              {index < 2 ? <div className={styles.VerticalLine}> </div> : null}
            </li>
          );
        })}
      </ul>
    </MaterialModalPopup>
  );
};

export default ParsingDocumentPopup;
