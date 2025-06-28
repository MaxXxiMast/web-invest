export const ORDER_STATUS_MAPPING = {
  Confirmed: 'confirmed',
  Pending: 'pending',
};

export type ORDER_CASHFREE_TYPES = 'order' | 'wallet' | 'vault';

export const confirmedOrderStatus = [1, 7, 8, 0];

export const paymentModeMapping = [
  '',
  'NET_BANKING',
  'UPI',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'N/A',
  'NEFT',
];
