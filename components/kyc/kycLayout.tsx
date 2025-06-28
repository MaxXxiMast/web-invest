//Node Modules
import { useEffect } from 'react';
import classNames from 'classnames';

//Components
import Form from './Form';
import ActionButton from './ActionButton';
import Image from '../primitives/Image';
import DialogModal from '../common/Dialog/DialogModal';

//Types
import type { getFormValues, onChangeFuncs } from './types';

//Utils
import { getObjectClassNames } from '../utils/designUtils';
import { colors, mediaQueries } from '../utils/designSystem';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { hintsData, panActions } from '../../pages_utils/kyc';
import { isAssetSpvParentAIF } from '../../utils/asset';

//Hooks
import { useAppDispatch } from '../../redux/slices/hooks';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

//redux
import { setCkycData } from '../../redux/slices/userConfig';

//Styles
import desktopStyles from '../../styles/ProfileKYC.module.css';
import mobileStyles from '../../styles/ProfileKYCMobile.module.css';

const classes: any = getObjectClassNames({
  contentContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'white',
    [mediaQueries.nonPhone]: {
      borderTop: '1px solid var(--gripMercuryThree, #e6e6e6)',
      borderBottom: '1px solid var(--gripMercuryThree, #e6e6e6)',
    },
    [mediaQueries.phone]: {
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 80,
    },
  },
  nriAddress: {
    [mediaQueries.nonPhone]: {
      height: '490px !important',
    },
  },
  bank: {
    [mediaQueries.nonPhone]: {
      height: '370px !important',
    },
  },
  others: {
    [mediaQueries.nonPhone]: {
      height: '1200px !important',
    },
  },
  hintsHeading: {
    width: '42% !important',
  },
  ellipse: {
    marginRight: 8,
    display: 'inline-block',
    background: 'var(--gripPrimaryGreen, #00B8B7)',
    borderRadius: '50%',
    width: 5,
    height: 5,
  },
  hintText: {
    fontFamily: 'var(--fontFamily) !important',
    lineHeight: '24px',
    color: '#555770',
    fontSize: 14,
  },
  activeProgress: {
    width: '24.9%',
    marginRight: 1,
    height: 2,
    transition: 'all 0.2s ease-out',
    [mediaQueries.phone]: {
      display: 'none',
    },
  },
  activeStep: {
    background: '#282C3F',
  },

  completedStep: {
    background: '#00B8B7',
  },
  pendingStep: {
    width: '0%',
  },
  okayButton: {
    fontSize: 12,
    lineHeight: 2,
    fontWeight: 800,
    textAlign: 'center',
    marginTop: 20,
    color: colors.GripBlue,
    cursor: 'pointer',
  },
  addressDetails: {
    [mediaQueries.nonPhone]: {
      height: '340px !important',
    },
  },

  addressDetailsWithEdit: {
    [mediaQueries.nonPhone]: {
      height: '450px !important',
    },
  },
  panWithEdit: {
    [mediaQueries.nonPhone]: {
      height: '360px !important',
    },
  },
  FormContainer: {
    [mediaQueries.desktop]: {
      maxWidth: 750,
      left: 'auto',
      right: 0,
    },
  },
});

type KYCLayoutProps = {
  id: 'pan' | 'address' | 'bank' | 'others' | 'cmrCml';
  step: number;
  data: any;
  actionActive: boolean;
  onActionClick: () => void;
  formData: any;
  onChangeFunctions: onChangeFuncs;
  getFormValues: getFormValues;
  formError?: string;
  isMultipleForms?: boolean;
  showHintsModal: boolean;
  onCloseHintsModal: () => void;
  showHintsMobile?: boolean;
  showEditDetails?: boolean;
  handleOtherBrokerModal?: (id: string) => void;
  assetData?: any;
};

const KYCLayout = ({
  id,
  step,
  data,
  actionActive,
  onActionClick,
  formData,
  onChangeFunctions,
  getFormValues,
  formError = '',
  isMultipleForms = false,
  showHintsModal = false,
  onCloseHintsModal,
  showHintsMobile = true,
  showEditDetails = false,
  handleOtherBrokerModal = (id = '') => {},
  assetData = {},
}: KYCLayoutProps) => {
  const isMobile = useMediaQuery();
  let stepArr: any[] = [...data];
  const isCMRCMLSteps = !isAssetSpvParentAIF(assetData);

  if (!isCMRCMLSteps) {
    stepArr = stepArr.filter((ele) => {
      return ele.id !== 'cmrCml';
    });
  }
  const styles = isMobile ? mobileStyles : desktopStyles;
  const stepCount = step > stepArr?.length - 1 ? stepArr?.length : step + 1;
  const isPreData = formData?.isPreData;
  const isErrorData = formData?.isErrorData;
  let height = 300;
  if (step === 3) {
    height = 580;
  }
  if (step === 4 && isPreData) {
    height = 350;
  }
  if (step === 4 && isErrorData) {
    height = 350;
  }
  if (step === 4 && !isPreData && !isErrorData) {
    height = 600;
  }
  const renderHintsForMobile = () => {
    return showHintsMobile ? (
      <>
        <div className={styles.hintsContent}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}commons/BulbIcon.svg`}
            layout={'fixed'}
            alt="BulbIcon"
            width={20}
            height={20}
          />
          <div className={styles.hintTitle}>{'Hints'}</div>
        </div>
        {hintsData.map((hint) => {
          return (
            <div key={`hint-${hint}`} className={styles.hint}>
              <div
                className={styles.dot}
                style={{
                  width: 8,
                  height: 8,
                  border: '1px solid #FFFFFF',
                  background: '#00357C',
                }}
              />
              <div className={styles.hintText}>{hint}</div>
            </div>
          );
        })}
      </>
    ) : null;
  };

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCkycData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className={classNames(classes.contentContainer, {
          [classes.nriAddress]:
            id === 'address' && getFormValues('residentialStatus') === 'nri',
          [classes.bank]: id === 'bank',
          [classes.others]: id === 'others' && getFormValues('accredited'),
          [classes.addressDetails]:
            id === 'address' &&
            getFormValues('residentialStatus') !== 'nri' &&
            !showEditDetails,
          [classes.addressDetailsWithEdit]:
            id === 'address' &&
            getFormValues('residentialStatus') !== 'nri' &&
            showEditDetails,
          [classes.panWithEdit]: id === 'pan' && showEditDetails,
        })}
        style={{ height: isMobile ? '100%' : height }}
      >
        <div className={styles.stepsContainer}>
          {!isMobile ? (
            <div
              className={styles.stepHeader}
            >{`Step ${stepCount}/${stepArr?.length}`}</div>
          ) : null}
          <div className={styles.activeWrapper}>
            {stepArr.map((_stepData: any, index: number) => {
              const activeStep = index === step;
              const completedStep = index < step;
              if (activeStep)
                return (
                  <div
                    key={`kyclayout-${_stepData?.id}`}
                    className={classNames(
                      classes.activeProgress,
                      classes.activeStep
                    )}
                  />
                );
              if (completedStep)
                return (
                  <div
                    key={`kyclayout-${_stepData?.id}`}
                    className={classNames(
                      classes.activeProgress,
                      classes.completedStep
                    )}
                  />
                );
              return (
                <div
                  key={`kyclayout-${_stepData?.id}`}
                  className={classNames(
                    classes.activeProgress,
                    classes.pendingStep
                  )}
                />
              );
            })}
          </div>
          <div className={styles.progress} />
          <div className={styles.stepsWrapper}>
            <div className={styles.sideProgress} />
            <div className={styles.steps}>
              {stepArr.map((stepData: any, index: number) => {
                const activeStep = index === step;
                const completedStep = index < step;
                const background = completedStep ? '#00B8B7' : '#FFFFFF';
                const dotStyle = {
                  border:
                    activeStep || completedStep
                      ? '2px solid #FFFFFF'
                      : '1px solid #D8D8D8',
                  background: activeStep ? '#00357C' : background,
                };
                return (
                  <div key={stepData?.id} className={styles.step}>
                    <div className={styles.dot} style={dotStyle} />
                    <div
                      className={styles.stepTitle}
                      style={{ fontWeight: activeStep ? '700' : '400' }}
                    >
                      {stepData?.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Form
          step={step}
          data={formData}
          onChangeFunctions={onChangeFunctions}
          getFormValues={getFormValues}
          formError={formError}
          isMultipleForms={isMultipleForms}
          showEditDetails={showEditDetails}
          id={id}
          handleOtherBrokerModal={(id: string) => handleOtherBrokerModal(id)}
          className={classes.FormContainer}
        />
        {isMobile ? (
          <>
            {renderHintsForMobile()}
            <ActionButton
              active={actionActive}
              data={panActions}
              onClick={onActionClick}
            />
          </>
        ) : null}
      </div>
      <DialogModal
        id={'hints-modal'}
        showDialog={showHintsModal}
        specialSubHeadingText={''}
        onCloseDialog={onCloseHintsModal}
        removeTitleBorder
        desktopClass={{
          heading: classes.hintsHeading,
          content: classes.hintContent,
        }}
        titleHeadURL={`${GRIP_INVEST_BUCKET_URL}homev2/hints_modal.svg`}
        headingText={'Hints'}
      >
        {hintsData.map((hint, index) => {
          return (
            <div
              key={`hint-${hint}`}
              className={`items-align-center-row-wise ${classes.hint}`}
            >
              <span className={classes.ellipse} />
              <div className={classes.hintText}>{hint}</div>
            </div>
          );
        })}
        <div className={classes.okayButton} onClick={onCloseHintsModal}>
          OKAY
        </div>
      </DialogModal>
    </>
  );
};

export default KYCLayout;
