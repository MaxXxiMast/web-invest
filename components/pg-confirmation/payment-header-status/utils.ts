import { dateFormatter, formatDate } from '../../../utils/dateFormatter';

export type PaymentStatusInfo = {
  heading: string;
  subHeading: string[];
  icon: string;
  cta?: string;
  iconType?: string;
};

export const paymentStatusDetail = ({
  amoNextOpenDate,
  marketStatus,
  orderSettlementDate,
  isUnlistedPtc,
  isAmo,
  spvName,
}) => {
  return {
    payment_received_fd: {
      heading: 'Payment Received!',
      subHeading: [
        `Congratulations! Your High Yield FD has been booked with ${spvName}.`,
      ],
      icon: 'icons/SuccessIcon.svg',
      iconType: 'success',
    },
    payment_received: {
      heading: 'Payment Received!',
      subHeading:
        marketStatus === 'open' || isUnlistedPtc || !isAmo
          ? ['Your order has been confirmed!']
          : [
              `Your order will be executed as soon as the market opens next 
          (${dateFormatter({
            dateTime: amoNextOpenDate,
            dateFormat: formatDate,
          })})`,
            ],
      icon: 'icons/SuccessIcon.svg',
      iconType: 'success',
    },
    payment_failed: {
      heading: 'Payment Not Received!',
      subHeading: [
        'We didn’t receive your payment! Retry now to secure your returns.',
      ],
      icon: 'icons/Error.svg',
      cta: 'Retry Now',
      iconType: 'error',
    },
    payment_pending: {
      heading: 'Payment Status Awaited',
      subHeading: [
        'Sit back and relax! We will update you in next 15 minutes.',
      ],
      icon: 'icons/Attention.svg',
      cta: 'Explore More Opportunities',
      iconType: 'attention',
    },
    payment_awaited: {
      heading: `Payment Awaited! Please Pay on ${dateFormatter({
        dateTime: orderSettlementDate,
        dateFormat: formatDate,
      })}`,
      subHeading: [
        `Payment will be accepted via NEFT/RTGS/IMPS Settlement day 
        (${dateFormatter({
          dateTime: orderSettlementDate,
          dateFormat: formatDate,
        })} before 2 PM).`,
      ],
      icon: 'icons/hour-glass.svg',
    },
  };
};

export const iconStyles = {
  success: {
    color: 'var(--gripPrimaryGreen, #00b8b7)',
    fontSize: 50,
  },
  error: {
    color: 'var(--gripCinnabar, #EE3C3C)',
    fontSize: 50,
  },
  attention: {
    color: '#EA5900',
    fontSize: 50,
  },
};
