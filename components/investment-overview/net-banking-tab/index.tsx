// NODE MODULES
import { ReactNode, useContext } from 'react';
import Link from 'next/link';

// Components
import AccountInfo from '../account-info';

// Utils
import { handleExtraProps } from '../../../utils/string';
import { getPaymentOptionMessages } from '../../../utils/kyc';

// Context and Types
import { InvestmentTabProps } from '../../../utils/investment';
import { InvestmentOverviewContext } from '../../assetAgreement/RfqInvestment';
import classes from './NetBankingTab.module.css';

const NetBankingTab = ({
  className = '',
  paymentType = [],
  expiredPayments = [],
  exchangeType = 'NSE',
}: InvestmentTabProps) => {
  const { bankDetails, pageData }: any = useContext(InvestmentOverviewContext);

  const paymentOptionMessages = getPaymentOptionMessages(pageData);

  const text: ReactNode = paymentType.includes('NetBanking') ? (
    <p className={`${classes.Txt} ${classes.Mt12}`}>
      {paymentOptionMessages?.paymentAcceptanceCriteria}
    </p>
  ) : (
    <p className={`${classes.Txt} ${classes.Mt12}`}>
      Your bank is not supported by Exchange for Payment via Net Banking <br />{' '}
      <br />
      <Link
        href={
          'https://www.gripinvest.in/blog/investing-in-bonds-just-like-stocks#:~:text=of%20order%20placement.-,B.%20Net%20Banking,-Alternatively%2C%20you%20can'
        }
        target="_blank"
      >
        Check here
      </Link>{' '}
      the list of available banks. <br /> <br />
      Please Select other payment options to proceed
    </p>
  );

  return (
    <div
      className={`${classes.Tab} ${handleExtraProps(className)}`}
      id="NetBankingTab"
    >
      <div className={`${classes.Wrapper} flex-column`}>
        <AccountInfo
          bankAccNumber={bankDetails?.accountNo}
          bankName={bankDetails?.bankName}
          showCardTitle={false}
        >
          {text}
        </AccountInfo>
        {paymentType.includes('NetBanking') &&
        !expiredPayments.includes('NetBanking')! ? (
          <p className={`${classes.Txt} ${classes.ExchangeNote}`}>
            <span className={`icon-info ${classes.InfoIcon}`} /> {exchangeType}{' '}
            {paymentOptionMessages.exchangeCharges}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default NetBankingTab;
