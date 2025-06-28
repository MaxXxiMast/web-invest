import { ReactNode } from 'react';
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import Image from '../../primitives/Image';
import { ExchangeType } from '../../../utils/investment';
import classes from './TermsPolicyWidget.module.css';

type Props = Partial<{
  className: string;
  children: ReactNode;
  showPaymentExchange: boolean;
  exchangeType: ExchangeType;
  showPolicy: boolean;
  paymentExchangeCustomText: string;
}>;

const TermsPolicyWidget = ({
  className = '',
  children = null,
  showPaymentExchange = false,
  exchangeType = 'NSE',
  showPolicy = true,
  paymentExchangeCustomText = '',
}: Props) => {
  return (
    <div
      className={`flex-column ${classes.Terms} ${handleExtraProps(className)}`}
    >
      {showPolicy ? (
        <p>
          By proceeding I agree to the{' '}
          <a href="/legal#termsAndConditions" target={'_blank'}>
            TnC
          </a>{' '}
          &{' '}
          <a href="/legal#riskTerms" target={'_blank'}>
            Risks Involved
          </a>
        </p>
      ) : null}

      {showPaymentExchange ? (
        <p>
          {paymentExchangeCustomText
            ? paymentExchangeCustomText
            : 'Payment would be made directly to'}{' '}
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/${
              exchangeType === 'NSE' ? 'nse-logo.svg' : 'bse-logo.svg'
            }`}
            alt={exchangeType}
            layout="fixed"
            width={exchangeType === 'NSE' ? 46 : 35}
            height={exchangeType === 'NSE' ? 22 : 15}
          />
        </p>
      ) : null}
      {children}
    </div>
  );
};

export default TermsPolicyWidget;
