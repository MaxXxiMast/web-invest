import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import Image from '../../../primitives/Image';
import classes from './StepIndicator.module.css';

type StepProps = {
  stepText: string;
  totalSteps: number;
  activeStep: number;
  icon?: string;
};

const StepIndicator = ({
  totalSteps = 0,
  activeStep = 0,
  stepText = '',
  icon = 'icons/shield-user.svg',
}: StepProps) => {
  return (
    <div className={`items-center ${classes.Step}`}>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}${icon}`}
        width={16}
        height={16}
        alt="user"
        layout="fixed"
      />
      <span className={classes.StepTxt}>
        {stepText} Information {activeStep + 1}/{totalSteps}
      </span>
    </div>
  );
};

export default StepIndicator;
