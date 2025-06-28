export const paymentStatusDescription = {
  failed: {
    id: 1401,
    heading: 'Failure might be due to any of the following reasons:',
    subHeading: [
      'Payment was made from a bank account that was not provided in your KYC',
      'Insufficient Balance/Transaction limit reached',
      'The payment process on PG was not fully completed',
    ],
  },
  pending: {
    id: 1402,
    heading: 'Delay might be due to any of the following reasons:',
    subHeading: [
      'Payment was made from a bank account that was not provided in your KYC',
      'Insufficient Balance/Transaction limit reached',
    ],
  },
};
