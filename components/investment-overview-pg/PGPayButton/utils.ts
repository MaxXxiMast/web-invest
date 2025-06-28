import { PaymentTypeVariant } from '../../../utils/investment';

// PaymentMethodAPIEnum is Enum Backend API uses to identify the payment method
export const PaymentMethodAPIEnum = [
  '',
  'NET_BANKING',
  'UPI',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'N/A',
  'offline',
];

const paymentIndex: Record<PaymentTypeVariant, number> = {
  NetBanking: 1,
  UPI: 2,
  NEFT: 6,
};

export const getPaymentMethodAPIEnumIndex = (
  paymentMethod: PaymentTypeVariant
) => {
  return paymentIndex[paymentMethod];
};
