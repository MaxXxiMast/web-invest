import { useContext } from 'react';
import AccountInfo from '../account-info';
import UpiWidget from '../upi-widget';
import { LoaderStatus, InvestmentTabProps } from '../../../utils/investment';
import { handleExtraProps } from '../../../utils/string';
import { InvestmentOverviewContext } from '../../assetAgreement/RfqInvestment';
import classes from './UpiTab.module.css';
import { getPaymentOptionMessages } from '../../../utils/kyc';

type Props = InvestmentTabProps & {
  handleUpiStatus?: (status: string | null) => void;
  triggerValueChange: () => void;
};

const UpiTab = ({
  className = '',
  paymentType = [],
  expiredPayments = [],
  handleUpiStatus = () => {},
  triggerValueChange,
}: Props) => {
  const { upiSuggestion, bankDetails, pageData }: any = useContext(
    InvestmentOverviewContext
  );

  const paymentOptionMessages = getPaymentOptionMessages(pageData);

  return (
    <div
      className={`flex-column ${classes.Wrapper} ${handleExtraProps(
        className
      )}`}
      id="UpiTab"
    >
      {!paymentType.includes('UPI') && !expiredPayments.includes('UPI') ? (
        <AccountInfo showCardTitle={false}>
          <p className={classes.Txt}>
            {paymentOptionMessages?.upiLimitExeeded}
          </p>
        </AccountInfo>
      ) : null}

      <div
        className={`flex-column ${classes.Wrapper} ${
          !paymentType.includes('UPI') || expiredPayments.includes('UPI')
            ? classes.Disabled
            : ''
        }`}
      >
        <AccountInfo
          bankAccNumber={bankDetails?.accountNo}
          bankName={bankDetails?.bankName}
          showCardTitle={false}
        >
          <p className={`${classes.Txt} ${classes.Mt12}`}>
            {paymentOptionMessages.paymentAcceptanceCriteria}
          </p>
        </AccountInfo>
        <UpiWidget
          suggestedUPI={upiSuggestion}
          handleUpiStatus={(status: LoaderStatus) => handleUpiStatus(status)}
          triggerValueChange={triggerValueChange}
        />
      </div>
    </div>
  );
};

export default UpiTab;
