import * as React from 'react';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import type { Orientation } from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepConnector, {
  stepConnectorClasses,
} from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import Check from '../assets/static/investment-success/check-circle.svg';
import { isMobile } from '../../utils/resolution';
import styles from '../../styles/Stepper.module.css';
import Image from '../primitives/Image';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { mediaQueries } from '../utils/designSystem';

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: 'red',
      borderTop: '1px dashed var(--gripWhiteLilac, #f7f7fc)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: 'black',
      borderTop: '1px dashed #02c988',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: 'black',
    borderTop: '1px dashed var(--gripWhiteLilac, #f7f7fc)',
  },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    display: 'flex',
    height: isMobile() ? 18 : 24,
    width: isMobile() ? 18 : 24,

    '& .QontoStepIcon-completedIcon': {
      color: 'black',
      backgroundColor: '#02c988',
      border: '1px solid var(--gripMercuryThree, #e6e6e6)',
      borderRadius: '50%',
      width: 20,
      height: 20,
      zIndex: 1,
      fontSize: 18,
    },
    '& .QontoStepIcon-circle': {
      width: 'inherit',
      height: 'inherit',
      color: 'white',
      border: '1px solid var(--gripMercuryThree, #e6e6e6)',
      borderRadius: '50%',
      background: '#ffffff',
    },
    '& .QontoStepIcon-warningIcon': {
      backgroundColor: 'transparent',
      border: 'none',
      position: 'relative',
      [mediaQueries.desktop]: {
        '&::before': {
          content: "''",
          position: 'absolute',
          left: '-72px',
          top: 'calc(50% + 2px)',
          transform: 'translateY(-50%)',
          width: '70px',
          border: '1px dashed #282C3F',
        },
      },
      img: {
        top: '0px !important',
        left: '0px !important',
      },
    },
  })
);

type IconProps = StepIconProps & {
  isSDIPendingOrder?: boolean;
  customIcon?: (
    isCompleted?: boolean,
    isActive?: boolean,
    stepNumber?: number
  ) => JSX.Element;
};

function QontoStepIcon(props: IconProps) {
  const { active, completed, className, isSDIPendingOrder, icon } = props;

  const iconImage = () => {
    if (completed) {
      const imageSrc = isSDIPendingOrder
        ? ` ${GRIP_INVEST_BUCKET_URL}commons/warning-yellow.svg`
        : Check.src;
      return (
        <div
          className={`QontoStepIcon-completedIcon ${
            isSDIPendingOrder ? 'QontoStepIcon-warningIcon' : ''
          }`}
        >
          <Image
            width={25}
            height={25}
            layout="fixed"
            src={imageSrc}
            className={styles.StepIcon}
            alt='image'
          />
        </div>
      );
    }
    return <div className="QontoStepIcon-circle" />;
  };
  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {props?.customIcon?.(completed, active, Number(icon)) ?? iconImage()}
    </QontoStepIconRoot>
  );
}

type StepperProps = {
  steps: unknown[];
  activeStep: number;
  className?: any;
  orientation?: Orientation;
  classes?: Partial<{
    stepLabelRoot: any;
    stepRoot: any;
    completedStepRoot: any;
    stepLabel: any;
    stepperRoot: any;
    stepIcon: any;
  }>;
  customizedLabel?: (label: string) => React.ReactNode;
  hideStepConnector?: boolean;
  isSDIPendingOrder?: boolean;
  customIcon?: (
    isCompleted?: boolean,
    isActive?: boolean,
    stepNumber?: number
  ) => JSX.Element;
};

export default function CustomizedSteppers(props: StepperProps) {
  const { steps, hideStepConnector = false, isSDIPendingOrder = false } = props;
  return (
    <Stack sx={{ width: '100%' }} spacing={4} className={props?.className}>
      <Stepper
        alternativeLabel
        activeStep={props?.activeStep}
        connector={!hideStepConnector ? <QontoConnector /> : null}
        orientation={props?.orientation || 'horizontal'}
        classes={{
          root: props?.classes?.stepperRoot,
        }}
      >
        {steps.map((label: any) => (
          <Step
            key={`order-journey-steps${label}`}
            classes={{
              root: props?.classes?.stepRoot,
              completed: props?.classes?.completedStepRoot,
            }}
          >
            <StepLabel
              StepIconComponent={(data) =>
                QontoStepIcon({
                  ...data,
                  isSDIPendingOrder,
                  customIcon: props?.customIcon,
                  className: props?.classes?.stepIcon,
                })
              }
              classes={{
                root: props?.classes?.stepLabelRoot,
                label: props?.classes?.stepLabel,
              }}
            >
              {props.customizedLabel?.(label) ?? (
                <span className={styles.stepperLabel}> {label}</span>
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Stack>
  );
}
