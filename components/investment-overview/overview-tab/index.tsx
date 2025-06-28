import { useContext, useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { handleExtraProps } from '../../../utils/string';
import Button, { ButtonType } from '../../primitives/Button';
import {
  getBasketSummaryDetails,
  getBondsSummaryDetails,
  getSdiSummaryDetails,
} from '../../../utils/investment';
import {
  isAssetBasket,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import AccountInfo from '../account-info';
import InvestmentSummary from '../investment-summary';
import TermsPolicyWidget from '../terms-privacy-widget';
import { InvestmentOverviewContext } from '../../assetAgreement/RfqInvestment';
import classes from './OverviewTab.module.css';
import { trackEvent } from '../../../utils/gtm';
import { fetchDematAccInformation } from '../../../api/assets';

type Props = {
  className?: string;
  handlePaymentBtnClick?: () => void;
  isLoading?: boolean;
  isBtnDisable?: boolean;
  buttonLabel?: string;
};

const OverviewTab = ({
  className = '',
  handlePaymentBtnClick,
  isBtnDisable = false,
  buttonLabel = '',
}: Props) => {
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const [dematNo, setDematNo] = useState('');
  const {
    bankDetails,
    asset,
    lotSize,
    calculationDataBonds,
    calculatedSDIData,
    isValidLotsize,
    isCheckingPaymentOptions,
    paymentTypeData,
    totalPayableAmount,
    assetCalculationData,
  }: any = useContext(InvestmentOverviewContext);
  useEffect(() => {
    setIsDataUpdated(!isDataUpdated); //State to detect data update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculationDataBonds, calculatedSDIData, lotSize]);

  useEffect(() => {
    if (asset?.isRfq) {
      fetchDematAccInformation(asset?.assetID).then((res) => {
        const { dpID = '', clientID = '' } = res?.kycTypes?.[0]?.fields || {};
        setDematNo(dpID + clientID);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.assetID]);

  const getSummaryData = () => {
    return isSDISecondary(asset)
      ? getSdiSummaryDetails(asset, lotSize, assetCalculationData)
      : isAssetBasket(asset)
      ? getBasketSummaryDetails(asset, lotSize, assetCalculationData)
      : getBondsSummaryDetails(
          asset,
          lotSize,
          calculationDataBonds,
          assetCalculationData
        );
  };

  const handleButtonVisibility = () => {
    return isBtnDisable || isCheckingPaymentOptions || !isValidLotsize;
  };

  const choosePaymentEvent = (eventName: string) => {
    const eventData = {
      amount: Number(totalPayableAmount || 0).toFixed(2),
      upi_available:
        paymentTypeData?.paymentType?.includes('UPI') &&
        !paymentTypeData?.expiredPayments.includes('UPI'),
      net_banking_available:
        paymentTypeData?.paymentType?.includes('NetBanking') &&
        !paymentTypeData?.expiredPayments.includes('NetBanking'),
      offline_available:
        paymentTypeData?.paymentType?.includes('NEFT') &&
        !paymentTypeData?.expiredPayments.includes('NEFT'),
    };
    trackEvent(eventName, eventData);
  };

  const handlePayment = () => {
    choosePaymentEvent('Choose_payment_tab_click');

    handlePaymentBtnClick();
  };

  return (
    <div
      className={`flex-column ${classes.Wrapper} ${handleExtraProps(
        className
      )}`}
    >
      <InvestmentSummary
        data={getSummaryData()}
        key={`Component_update_key${isDataUpdated}`}
        asset={asset}
      />
      <AccountInfo
        userName={bankDetails?.userName}
        bankAccNumber={bankDetails?.accountNo}
        bankName={bankDetails?.bankName}
        key={'user-account-info'}
        dematNo={dematNo}
      />
      <div className={classes.PaymentBtn}>
        <Button
          width={'100%'}
          onClick={handleButtonVisibility() ? null : handlePayment}
          variant={
            handleButtonVisibility() ? ButtonType.Disabled : ButtonType.Primary
          }
        >
          <>
            {isCheckingPaymentOptions ? <CircularProgress size={10} /> : null}
            {buttonLabel || 'Choose Payment Option'}
          </>
        </Button>
      </div>
      <TermsPolicyWidget />
    </div>
  );
};

export default OverviewTab;
