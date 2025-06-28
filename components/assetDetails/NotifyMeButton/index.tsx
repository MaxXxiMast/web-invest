import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

// Hooks
import { getMarketStatus } from '../../../utils/marketTime';
// Components
import Button from '../../primitives/Button';
import UserKycStatus from '../user-kyc-status';

// Utils
import {
  StatusValues,
  getOverallDefaultKycStatus,
} from '../../../utils/discovery';
import { getInvestNowButtonStatus } from './utils';
import { handleExtraProps } from '../../../utils/string';

// Redux Slices
import {
  setNotifyMeButtonStatus,
  setSubmitLoading,
} from '../../../redux/slices/monthlyCard';
import { useAppSelector } from '../../../redux/slices/hooks';

// Styles
import styles from './NotifyMeButton.module.css';

type Props = {
  className?: string;
  disabled: boolean;
  handleSubmitClick?: (val: boolean, status: StatusValues) => void;
  handleKycContinue: () => void;
  id?: string;
  statusClassName?: string;
};

const NotifyMeButton = ({
  className,
  disabled,
  handleSubmitClick,
  handleKycContinue = () => {},
  id,
  statusClassName = '',
}: Props) => {
  const dispatch = useDispatch();
  const marketTiming = useAppSelector((state) => state.config.marketTiming);
  const marketStatus = getMarketStatus(
    marketTiming?.marketStartTime,
    marketTiming?.marketClosingTime,
    marketTiming?.isMarketOpenToday
  );
  const isMarketClosed = ['closed', 'opens in'].includes(marketStatus);

  // GET KYC Data
  const { kycConfigStatus = {} } = useAppSelector(
    (state) => (state as any)?.user ?? {}
  );
  // GET Debarment Data
  const { debarmentData } = useAppSelector((state) => state.userConfig);
  // GET Asset Data
  const asset = useAppSelector((state) => state.assets.selectedAsset);

  const { submitLoading: isSubmitLoading, notifyMeButtonStatus } =
    useAppSelector((state) => state.monthlyCard);

  const {
    message,
    isDisabled: isSubmitDisabled,
    triggerNotifyMeButton,
  } = notifyMeButtonStatus || {};

  const status = getOverallDefaultKycStatus(kycConfigStatus);

  const isAssetRFQ = asset?.isRfq ?? false;

  const getButtonText = () => {
    if (isSubmitLoading) {
      return '';
    }
    if (!kycConfigStatus?.default?.isFilteredKYCComplete) {
      return 'Complete KYC';
    }
    return 'Invest Now';
  };

  const handleButtonClick = (isMarketClosed: any, status: any) => {
    if (!isSubmitDisabled && !disabled) {
      if (!kycConfigStatus?.default?.isFilteredKYCComplete) {
        handleKycContinue();
        return;
      }

      handleSubmitClick(isMarketClosed, status);
    }
  };

  useEffect(() => {
    // Trigger Buttons on Notify Me trigger
    if (triggerNotifyMeButton) {
      handleButtonClick(isMarketClosed, status);
      dispatch(setNotifyMeButtonStatus({ triggerNotifyMeButton: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerNotifyMeButton]);

  useEffect(() => {
    if (kycConfigStatus.default) {
      const {
        isSubmitDisabled = false,
        message = null,
      }: {
        isSubmitDisabled: boolean;
        message: string | null;
      } = getInvestNowButtonStatus(
        kycConfigStatus.default,
        debarmentData,
        isAssetRFQ
      );
      dispatch(
        setNotifyMeButtonStatus({
          isDisabled: disabled || isSubmitDisabled,
          message,
          buttonText: getButtonText(),
        })
      );
      dispatch(setSubmitLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kycConfigStatus, debarmentData, isAssetRFQ, disabled]);

  return (
    <>
      {!message ? null : (
        <UserKycStatus
          message={message}
          className={`${styles.DebarmentWidget} ${handleExtraProps(
            statusClassName
          )}`}
        />
      )}
      <Button
        className={handleExtraProps(className)}
        onClick={() => handleButtonClick(isMarketClosed, status)}
        isLoading={isSubmitLoading}
        disabled={disabled || isSubmitDisabled}
        width={'100%'}
        id={id}
      >
        {isSubmitLoading ? '' : getButtonText()}
      </Button>
    </>
  );
};
export default NotifyMeButton;
