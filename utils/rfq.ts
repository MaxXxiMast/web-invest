import { GRIP_INVEST_BUCKET_URL } from './string';
import type { NEFTDetails } from '../components/rfq/types';
import { isSDISecondary, isAssetBonds, isAssetBasket } from './financeProductTypes';

export const UPI_ID_REPLACE_VARIABLE = '<upi-id>';

export const upiStatusDetails = {
  timeout: {
    heading: 'Request timed out',
    subHeading: `Request sent to your UPI app linked to id ${UPI_ID_REPLACE_VARIABLE} has expired`,
    paymentStatusHeading: 'Payment not received',
    paymentStatusSubHeading:
      'In case money was debited, please wait 2 hours for confirmation. If this fails for any reason, you’ll receive a refund. Your money is safe.',
    iconURL: `${GRIP_INVEST_BUCKET_URL}icons/DangerTriangle.svg`,
  },
  failed: {
    heading: 'Payment unsuccessful',
    subHeading: `Request sent to your UPI app linked to id ${UPI_ID_REPLACE_VARIABLE} has declined/failed`,
    paymentStatusHeading: 'Payment not received',
    paymentStatusSubHeading:
      'In case money was debited, please wait 2 hours for confirmation. If this fails for any reason, you’ll receive a refund. Your money is safe.',
    iconURL: `${GRIP_INVEST_BUCKET_URL}icons/close-circle-red.svg`,
  },
  success: {
    heading: 'Payment Complete',
    subHeading: `Notification has been sent to your UPI app linked to id ${UPI_ID_REPLACE_VARIABLE}`,
    paymentStatusHeading: 'Your payment has been received',
    paymentStatusSubHeading:
      'Please wait while we take you to confirmation page',
    iconURL: `${GRIP_INVEST_BUCKET_URL}icons/ShieldCheck.svg`,
  },
  inprogress: {
    heading: 'Complete UPI Payment',
    subHeading: `Notification has been sent to your UPI app linked to id ${UPI_ID_REPLACE_VARIABLE}`,
    paymentStatusHeading:
      'Please approve the payment request before it times out',
    paymentStatusSubHeading:
      'Do not close or leave this page as your payment is in progress',
    iconURL: '',
  },
};

const payeeDetails = [
  {
    label: 'Bank Name',
    id: 'bankName',
  },
  {
    label: 'Name of Beneficiary',
    id: 'beneficiaryName',
  },
  {
    label: 'Account Number',
    id: 'accountNo',
  },
  {
    label: 'IFSC Code',
    id: 'ifscCode',
  },
];

const newLineWithSpace = '%0D%0A%0D%0A';
const toNewLine = '%0D';
const waNewLine = '%0a';

const getPaymentDetails = (
  type: 'wa' | 'email' | 'copy',
  NeftDetails: NEFTDetails
) => {
  let neftPaymentDetails = '';
  let newLine = '\n';

  if (type === 'wa') {
    newLine = waNewLine;
  }

  if (type === 'email') {
    newLine = toNewLine;
  }

  payeeDetails.forEach((payee, index) => {
    neftPaymentDetails = neftPaymentDetails.concat(
      `${payee.label}: ${NeftDetails[payee.id]} ${index !== 3 ? newLine : ''}`
    );
  });

  return neftPaymentDetails;
};

export const getEmailText = (dealName: string, NeftDetails: NEFTDetails) => {
  return {
    subject: `NEFT/RTGS Account info for ${dealName} Order on Grip Invest`,
    sbody: `Please make the payment to the payee details mentioned below: ${newLineWithSpace}Bank Name: Reserve Bank of India ${toNewLine}Name of Beneficiary: Indian Clearing Corporation ${toNewLine}Account Number: 8715962 ${toNewLine}IFSC Code: ICLL0000001 ${newLineWithSpace}For security purposes payments are only accepted from your registered, demat-linked bank account. Please ensure you transfer with the same account listed below:${toNewLine}State Bank of India Account ending with 7788
    `,
    body: `Please make the payment to the payee details mentioned below: ${newLineWithSpace}${getPaymentDetails(
      'email',
      NeftDetails
    )}${newLineWithSpace}For security purposes payments are only accepted from your registered, demat-linked bank account. Please ensure you transfer with the same account listed below:${toNewLine}State Bank of India Account ending with 7788
    `,
  };
};

export const getCopyText = (NeftDetails: NEFTDetails) => {
  return `NEFT/RTGS payment account Info for Order on Grip\n${getPaymentDetails(
    'copy',
    NeftDetails
  )}`;
};

export const getWAtext = (NeftDetails: NEFTDetails) => {
  return `Please make the NEFT/RTGS payment to the payee details mentioned below for your order on Grip Invest Bank Name: ${newLineWithSpace}${getPaymentDetails(
    'wa',
    NeftDetails
  )} ${newLineWithSpace}For security purposes payments are only accepted from your registered, demat-linked bank account. Please ensure you transfer with the same account listed below: ${waNewLine}State Bank of India Account ending with 7788`;
};

export const RFQInitationSteps = {
  'Creating order': [],
  'Placing order with exchange': [],
  'Generating Deal': [],
};

export const RFQPaymentType = ['upi', 'netBanking', 'offline'];

export const ORDER_ERROR_REDIRECT = {
  mainHeading:
    'There seems to be a problem in placing your order. Our team will reach out to you shortly to resolve the same',
};

export const MARKET_CLOSED_REDIRECT = {
  mainHeading:
    'Your order cannot be placed as the market has closed. Please invest when the market opens next',
};

export const ORDER_SUCCESS_REDIRECT = {
  mainHeading:
    'You are now being redirected to the Secure Payment Gateway of the Stock Exchange',
};

export const ORDER_NETBANKING_REDIRECT = {
  mainHeading: 'You are now being redirected to the confirmation page',
};

export const getRFQPaymentURL = (tranID: string) => {
  return `/rfq-payment-processing?transactionID=${tranID}`;
};

export const UPI_POLLING_INTERVAL_IN_SECONDS = 10;

export const QuestionAnswers = [
  {
    id: 701,
    question:
      'Why is the current status being shown to me as ‘Payment Pending’, even though I have already made the payment?',
    answer: `All payments are routed directly through the Clearing Corporation. Sometimes, it can take longer than expected to get a confirmation on the payment status from the Clearing Corporation. We suggest that you check the status again after 2 hours.<br /><br />
    In case of payments made via NEFT, transactions can take a longer time to reflect on the exchange’s account. If you have already paid the consideration amount within the prescribed deadline, the updated status will be reflected soon. In the unfortunate event that your payment does not reach the exchange on time, you will be refunded the total amount you paid within 24 hours.`,
  },
  {
    id: 702,
    question:
      'What are payment deadlines for different payment methods while investing in Corporate Bonds and SDIs?',
    answer: `For investing in Corporate Bonds and SDIs, the following payment deadlines are required to be followed: (Assume that the ‘T’ day is the day on which you have initiated the order process, and the ‘T+1’ day is the immediately next working day on which the market is open):<br />
    For Net Banking: 04:30 PM, T day.<br />
    For UPI: 04:30 PM, T+1 day.<br />
    For NEFT/ RTGS : 02:30 PM, T+1 day.<br />
    Please note for NEFT/ RTGS, payment cannot be made on T day. You must only make the payment on T+1 day and it should reach the exchange account by 04:30 PM.`,
  },
  {
    id: 703,
    question: `Why can’t I see the option to pay using net banking?`,
    answer: `As of today, only a limited number of partner banks are supported by the exchanges to collect payments through net banking for transactions executed through the RFQ platform. This list might change in the future. We urge you to use an alternative payment method.`,
  },
  {
    id: 704,
    question: 'Why do I need to add a beneficiary for payments?',
    answer: `If you choose ‘NEFT/ RTGS’ as a payment method, you will first need to add the clearing corporation as a ‘beneficiary’. Please note that this is only required to be done one time - while making your first investment. Please note that you should use the same bank account, which you had shared while opening your account with Grip, to transfer the funds.`,
  },
  {
    id: 705,
    question: 'Why can’t I use UPI to pay?',
    answer: `UPI is only eligible for payments of orders where the amount to be paid is less than INR 2,00,000 (Indian Rupees Two Lakhs).`,
  },
  {
    id: 706,
    question: 'When will I receive investment securities in my demat account?',
    answer: `You should typically expect to receive the securities on the next working day from the date on which you had placed your investment order (payment is completed.)`,
  },
];

export const AmoQuestionAnswers = [
  {
    id: 601,
    question: 'What is an After Market Order (AMO) and who is it for?',
    answer: `AMO offers you greater convenience for investing. You can now place an investment order at any time during the day and even on weekends. Your ability to invest is no longer limited to just market hours (9 am - 5 pm on weekdays). So login at a convenient time, explore the various investment opportunities, and place an order whenever you are ready.`,
  },
  {
    id: 602,
    question: 'When can I place an AMO?',
    answer: `During market hours i.e. 9am-5pm on weekdays you can place an investment order and complete your payment instantly. An AMO can be placed at all other times outside of these market hours, including on holidays and weekends.`,
  },
  {
    id: 603,
    question: `How are payments for AMO processed?`,
    answer: `Payments for AMOs can be made via UPI, NEFT/RTGS, or Netbanking. Since payments are made directly to the NSE, you will receive a payment link once the market opens, directly in your inbox or on Whatsapp. This will allow you to complete the payment for your order instantly.`,
  },
  {
    id: 604,
    question: 'How can I get support if I face issues with AMO?',
    answer: `For any assistance, please reach out to us at <a href="mailto:"support@gripinvest.in">support@gripinvest.in</a>.`,
  },
  {
    id: 605,
    question: 'What should I not do with the AMO payment link?',
    answer: `Never share your AMO payment link with anyone. This link is unique to your transaction and sharing it can compromise your personal and financial security.`,
  },
  {
    id: 606,
    question: 'What happens if I miss making the payment for an AMO?',
    answer: `Any AMO is valid only for 8 hours. If you do not make a payment within the required time, the AMO will expire. You may place another order if the desired investment opportunity is still available. `,
  },
];

export const videoURL = `https://youtu.be/kMT0GFHFWrg`;

/**
 * Checks if the SPV category of a given asset is enabled for OBPP.
 *
 * @param {Object} asset - The asset to check. This should have a `spvCategoryDetails` property with an `id`.
 * @param {number[]} obppEnabledCategoryIDs - An array of category IDs for which OBPP is enabled.
 * @returns {boolean} Returns true if the SPV category of the asset is enabled for OBPP, false otherwise.
 */
const isSPVCategoryEnabledForOBPP = (
  asset: any,
  obppEnabledCategoryIDs: number[]
) => {
  const assetCategoryID = Number(asset?.spvCategoryDetails?.id ?? 0);
  return obppEnabledCategoryIDs?.includes(assetCategoryID);
};

/**
 * Checks if OBPP KYC is enabled for the given asset.
 * @param asset - The asset to check.
 * @returns True if OBPP KYC is enabled for the asset, false otherwise.
 */
export const isOBPPKYCEnabledForAsset = (
  asset: any,
  obppEnabledCategoryIDs: number[]
) => {
  if (!asset?.isRfq) {
    return (
      isSPVCategoryEnabledForOBPP(asset, obppEnabledCategoryIDs) &&
      (isSDISecondary(asset) || isAssetBonds(asset) || isAssetBasket(asset))
    );
  }

  return true;
};
