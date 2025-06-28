import { financeProductTypeConstants } from '../../../utils/financeProductTypes';
import { dateFormatter, formatDate } from '../../../utils/dateFormatter';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

export const orderJourneySteps = ({
  dematTransferDate,
  isProcessing,
  paymentMethod,
  orderSettlementDate,
  isMarketOpen,
  amoNextOpenDate,
  isUnlistedPtc,
  isAmo,
  isFdOrder,
  firstInterestDate,
  orderTransferInitiationDate,
  isRfq,
  financeProductType,
}) => {
  let paymentSubTitle = '';
  if (isUnlistedPtc) {
    paymentSubTitle = `Confirmed`;
  } else if (!isMarketOpen && isAmo) {
    paymentSubTitle = `Confirmed. Will be placed when market opens next (${dateFormatter(
      {
        dateTime: amoNextOpenDate,
        dateFormat: formatDate,
      }
    )})`;
  } else if (isProcessing === 2) {
    paymentSubTitle = `Queued with Exchange`;
  } else if (isProcessing === 1) {
    paymentSubTitle = `Placing with Exchange`;
  } else {
    paymentSubTitle = `Placed with Exchange`;
  }

  const isSDI = financeProductType === financeProductTypeConstants?.sdi;
  const isNonRfqSdi = isSDI && !isRfq;
  if (isFdOrder) {
    return [
      {
        title: `Payment Status`,
        subTitle: `Successfully received`,
        iconType: 'success',
      },
      {
        title: 'FD Status',
        subTitle: `FD will be booked by ${dateFormatter({
          dateTime: orderTransferInitiationDate,
          dateFormat: formatDate,
        })}`,
        statusIcon: `${GRIP_INVEST_BUCKET_URL}icons/PendingStatus.svg`,
      },
      {
        title: 'First Interest',
        subTitle: `by ${dateFormatter({
          dateTime: firstInterestDate,
          dateFormat: formatDate,
        })}`,
      },
    ];
  }

  if (paymentMethod === 'offline') {
    return [
      {
        title: `Order Status`,
        subTitle: paymentSubTitle,
        isProcessing: isProcessing,
        iconType: 'success',
      },
      {
        title: 'Payment Status',
        subTitle: `Pay only on settlement day ${dateFormatter({
          dateTime: orderSettlementDate,
          dateFormat: formatDate,
        })} to beneficiary account. Order will fail if paid on any other day`,
        statusIcon: `${GRIP_INVEST_BUCKET_URL}icons/PendingStatus.svg`,
      },
      {
        title: 'Transfer to Demat',
        subTitle: `by ${dateFormatter({
          dateTime: dematTransferDate,
          dateFormat: formatDate,
        })}`,
      },
    ];
  }

  return [
    {
      title: `Payment Status`,
      subTitle: `Successfully received`,
      iconType: 'success',
    },
    {
      title: 'Order Status',
      subTitle: paymentSubTitle,
      isProcessing: isProcessing,
      iconType: 'success',
    },
    {
      title: 'Transfer to Demat',
      subTitle: isNonRfqSdi
        ? 'Upto 5 working days'
        : `by ${dateFormatter({
            dateTime: dematTransferDate,
            dateFormat: formatDate,
          })}`,
    },
  ];
};

export const paymentMethodMapping = {
  upi: 'UPI',
  netBanking: 'Net Banking',
};
