import { useKycContext } from '../../../contexts/kycContext';
import { useAppSelector } from '../../../redux/slices/hooks';
import { isGCOrder } from '../../../utils/gripConnect';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import Image from '../../primitives/Image';
import {
  checkActiveStep,
  checkSkipActiveStep,
  isCompletedStep,
} from '../utils/helper';
import classes from './Header.module.css';

type Props = {
  handleCloseClick?: () => void;
};
const LayoutHeader = ({ handleCloseClick }: Props) => {
  const gcExitKYCHide =
    useAppSelector(
      (state) => state.gcConfig?.configData?.themeConfig?.pages?.kyc?.hideKYC
    ) || false;

  const { kycValues, completedKycSteps, kycActiveStep } = useKycContext();
  const isEsignShow =
    completedKycSteps.length && completedKycSteps.every(isCompletedStep);

  const isAOFEsignPending =
    (kycActiveStep === 3 &&
      checkSkipActiveStep(completedKycSteps, 'depository') &&
      !checkActiveStep(completedKycSteps, 'aof')) ||
    isEsignShow;

  const bankDetails = completedKycSteps.find((step) => step.name === 'bank');

  const isMobile = kycValues?.isMobile;

  if (isAOFEsignPending && bankDetails?.status === 2) {
    return null;
  }

  const isHideKYC = isGCOrder() && gcExitKYCHide;

  return (
    <div className={`${classes.Header} flex justify-between items-center`}>
      <h1 className="text-left">{!isAOFEsignPending ? 'Complete KYC' : 'eSign'}</h1>
      {!isHideKYC ? (
        <span
          className={classes.Close}
          id="CLOSE_ICON"
          onClick={handleCloseClick}
        >
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/close-line.svg`}
            alt="Close"
            width={isMobile ? 12 : 16}
            height={isMobile ? 12 : 16}
            layout="fixed"
          />
        </span>
      ) : null}
    </div>
  );
};

export default LayoutHeader;
