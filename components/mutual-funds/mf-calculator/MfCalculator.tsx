import dynamic from 'next/dynamic';

// COMPONENTS
import MfCalculatorButton from '../mf-calculator-button/MfCalculatorButton';
import MfCalculatorNote from '../mf-calculator-note/MfCalculatorNote';
import MfPaymentMethods from '../mf-payment-methods/MfPaymentMethods';
import MfInputFieldWrapper from '../mf-input-field-wrapper/MfInputFieldWrapper';
import MfCalculatorChipsWrapper from '../mf-calculator-chips-wrapper/MfCalculatorChipsWrapper';
import MfTabSwitchWrapper from '../mf-tab-switch-wrapper/MfTabSwitchWrapper';
import MFProgressBarModal from '../mf-progressbar-modal/MFProgressBarModal';

// STYLES
import styles from './MfCalculator.module.css';

const MfPaymentMethodModal = dynamic(
  () => import('../mf-payment-method-modal/MfPaymentMethodModal'),
  {
    ssr: false,
  }
);

const MfOtpModalWrapper = dynamic(
  () => import('../mf-otp-modal-wrapper/MfOtpModalWrapper'),
  {
    ssr: false,
  }
);

const MfCalculator = () => {
  return (
    <>
      <div className={styles.MonthlyReturnCardContent}>
        <div className={styles.CardTop}>
          <div className={`flex items-center ${styles.InvestmentType}`}>
            <div className={styles.InvestmentTypeLeft}>
              <h5>Invest now</h5>
            </div>
            <div className={`${styles.InvestmentTypeRight}`}>
              <MfTabSwitchWrapper />
            </div>
          </div>
          <MfInputFieldWrapper />
          <MfCalculatorChipsWrapper />
          <MfPaymentMethods />
        </div>
        <div className={styles.ContinueSection}>
          <MfCalculatorButton />
        </div>
      </div>
      <MfCalculatorNote />
      <MFProgressBarModal />
      <MfPaymentMethodModal />
      <MfOtpModalWrapper />
    </>
  );
};

export default MfCalculator;
