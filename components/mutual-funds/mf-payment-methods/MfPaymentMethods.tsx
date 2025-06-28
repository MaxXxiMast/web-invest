import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { setMfData } from '../redux/mf';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// Components
import Image from '../../primitives/Image';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// Utils
import { getOverallDefaultKycStatusMf } from '../utils/utils';
import { paymentMethodMappping } from './util';
import { BankDetails, PaymentMethods } from '../utils/types';

// Styles
import styles from './MfPaymentMethods.module.css';

const MfPaymentMethods = () => {
  const bankLogo = '';
  const dispatch = useAppDispatch();
  const { kycConfigStatus = {} } = useAppSelector(
    (state) => (state as any)?.user ?? {}
  );
  const {
    selectedPaymentMethod = 'upi',
    bankDetails = {},
    isPaymentMethodsLoading = false,
  }: {
    selectedPaymentMethod: PaymentMethods;
    bankDetails: BankDetails;
    isPaymentMethodsLoading: boolean;
  } = useAppSelector((state) => (state as any)?.mfConfig ?? {});

  const handleConfirClick = () => {
    dispatch(
      setMfData({
        showPaymentMethodModal: true,
      })
    );
  };

  const status = getOverallDefaultKycStatusMf(kycConfigStatus);

  if (status !== 'verified') {
    return null;
  }

  if (isPaymentMethodsLoading) {
    return (
      <CustomSkeleton
        styles={{
          width: '100%',
          height: '68px',
        }}
      />
    );
  }
  return (
    <div className={`flex justify-between ${styles.PaymentOption}`}>
      <div className={styles.PaymentOptionLeft}>
        <div className={`flex items-center ${styles.PaymentWidget}`}>
          <div className={styles.MethodLogo}>
            <Image
              src={
                bankLogo ? bankLogo : `${GRIP_INVEST_BUCKET_URL}icons/bank.svg`
              }
              alt={bankDetails?.bankName}
              width={16}
              height={16}
              layout="fixed"
            />
          </div>
          <div className={`flex-column ${styles.MethodDetail}`}>
            <p className={styles.AutoPayText}>PAY VIA</p>
            <p className={styles.BankData}>
              {bankDetails?.bankName?.slice(0, 4)} **
              {bankDetails?.accountNo?.slice(-4)}
            </p>
          </div>
        </div>
      </div>
      <div
        className={`flex items-center ${styles.PaymentOptionRight}`}
        onClick={() => handleConfirClick()}
      >
        <span className={styles.SelectedMethod}>
          {paymentMethodMappping[selectedPaymentMethod]}
        </span>
        <span className={'icon-caret-right'} />
      </div>
    </div>
  );
};

export default MfPaymentMethods;
