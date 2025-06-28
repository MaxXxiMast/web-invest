import { GRIP_INVEST_BUCKET_URL } from './string';

export const pendingPaymentModals = {
  mandatory: {
    heading: 'Payment is Mandatory',
    subHeading:
      'As per SEBI guidelines, if you fail to make payment post order placement, you may be debarred from the debt market for up to 15 days',
    iconUrl: `${GRIP_INVEST_BUCKET_URL}icons/Bank_Debarred.svg`,
  },
  pending: {
    heading: 'Payment pending for order(s)',
    subHeading:
      'You have unpaid order(s) already placed with NSE. We recommend you complete those payments before placing any new orders',
    iconUrl: `${GRIP_INVEST_BUCKET_URL}icons/waiting-payment.svg`,
  },
};
