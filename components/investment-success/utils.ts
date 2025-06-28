import dayjs from 'dayjs';

interface orderJourneyDataType {
  title: string;
  date: string;
  info: {
    text: string;
  };
}

export const orderJourneyData = (
  isSdiSecondary = false,
  strapiData: any,
  isScondarySdiOrderPending = false,
  date: any
): orderJourneyDataType[] => {
  if (isSdiSecondary && isScondarySdiOrderPending) {
    return [
      {
        title: 'Add the Indian Clearing Corporation as Beneficiary',
        date: 'Aug 24, 2021',
        info: {
          text: 'Your order request has been initiated. As this transaction is being executed through the Indian Clearing Corporation, please add the same as a beneficiary using the details mentioned below.',
        },
      },
      {
        title: 'Transfer of Funds and Proof of Payment',
        date: 'Aug 25, 2021',
        info: {
          text: `Transfer the investment amount to the Clearing Corporation during stock market hours on or before ${dayjs(
            date
          ).format('MMM DD, YYYY')} and submit proof of payment to Grip.`,
        },
      },
      {
        title: 'Receipt of Securities',
        date: 'Aug 29, 2021',
        info: {
          text: 'The securities will reflect in your Demat Account within 5 working days of completion of the aforementioned steps.',
        },
      },
    ];
  }
  return [
    {
      title: 'Payment Success',
      date: 'Aug 24, 2021',
      info: {
        text: isSdiSecondary
          ? strapiData?.PAYEMENT_SUCCESS_SDI_SECONDARY
            ? strapiData?.PAYEMENT_SUCCESS_SDI_SECONDARY
            : 'We have received your payment. Thank you for investing with us.'
          : 'We have received your payment for the bond purchase. Thank you for investing with us.',
      },
    },
    {
      title: 'Order Confirmation',
      date: 'Aug 25, 2021',
      info: {
        text:
          isSdiSecondary && strapiData?.ORDER_CONFIRMATION_SDI_SECONDARY
            ? strapiData?.ORDER_CONFIRMATION_SDI_SECONDARY
            : 'Your documents will be verified. If the verification is successful, your order will be accepted. In case of failure, your amount will be refunded in your DEMAT bank account',
      },
    },
    {
      title: 'Securities transfer to Demat account',
      date: 'Aug 29, 2021',
      info: {
        text: isSdiSecondary
          ? strapiData?.SECURITIES_TRANSFER_SDI_SECONDARY
            ? strapiData?.SECURITIES_TRANSFER_SDI_SECONDARY
            : 'Once your order has been accepted, the PTCs would reflect in your DEMAT account shortly.'
          : 'Once your order has been accepted, the securities would reflect in your DEMAT account shortly.',
      },
    },
  ];
};

export const sdiSecondaryPendingOrderNextStep = (
  amount: number,
  date?: any
) => [
  {
    id: 1301,
    header: 'Add the Clearing Corporation as a Beneficiary',
    body: 'Please add the beneficiary according to the information provided below on your net banking terminal. Once the beneficiary is added, the transfer of funds via RTGS can typically be done after 24 hours.',
    bankDetails: [
      { title: 'Bank Name', value: 'Reserve Bank of India' },
      {
        title: 'Name of Beneficiary',
        value: 'Indian Clearing Corporation Ltd',
      },
      { title: 'RTGS Account Number', value: '8715962' },
      { title: 'IFSC Code', value: 'ICLL0000001' },
    ],
    bodyBottom:
      'Please copy and paste the beneficiary details (including the IFSC Code) to reduce the chances of any errors in transferring the funds <br/><br/>',
    note: '<i><strong>Note: Please use the bank account attached to your Demat account for this purpose.</strong></i>',
  },
  {
    id: 1302,
    header: `Transfer Funds via RTGS during market hours (9 AM to 2 PM IST) on <strong>${dayjs(
      date
    ).format('MMM DD, YYYY')}</strong>`,
    body: `Transfer ₹${amount} to the above-mentioned bank account during market hours <strong>(9 AM to 2 PM IST)</strong> on <strong>${dayjs(
      date
    ).format(
      'MMM DD, YYYY'
    )}</strong>. Please ensure that you select "RTGS" as the mode for settlement of payments. Payments made through NEFT or IMPS are not accepted.`,
  },
  {
    id: 1303,
    header: 'Send Proof of Payment before 2.15 PM IST on the Transfer Date',
    body: 'Once the payment has been made, we request you to immediately share the proof of payment (i.e., screenshot of the transaction/ UTR details of the transaction) with us at <a href="mailto:sdi@gripinvest.in">sdi@gripinvest.in</a>.<br/> <br/> Please note that the securities will reflect in your Demat account within 48 hours of completion of the aforementioned steps. <br/><br/>',
    videoLink: 'https://youtu.be/uozkiQz4Jew',
    note: ' <i>Note: You will also receive an email mentioning these steps on your registered email ID.</i>',
  },
];
