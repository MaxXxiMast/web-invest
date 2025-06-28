import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import dompurify from 'dompurify';
import { setSelectedRfq } from '../../../redux/slices/rfq';

import Image from '../../primitives/Image';
import CountDownTimer from '../../primitives/CountDownTimer';
import Button, { ButtonType } from '../../primitives/Button';

import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { UPI_PAYMENT_DURATION, getTimeInFormat } from '../../../utils/timer';
import { SDISecondaryAmountToCommaSeparator } from '../../../utils/number';
import {
  UPI_ID_REPLACE_VARIABLE,
  UPI_POLLING_INTERVAL_IN_SECONDS,
  upiStatusDetails,
} from '../../../utils/rfq';
import { PaymentResponseObject } from '../types';
import { getUPIApprovalStatus, retryRFQPayment } from '../../../api/rfq';
import { fetchOrderStatusTransaction } from '../../../api/order';

import styles from './upi.module.css';

type PaymentStatus = 'success' | 'timeout' | 'inprogress' | 'failed';

type UPIPaymentProps = PaymentResponseObject & {
  transactionID: string;
};

let isLoaded = false; //Flag to prevent multiple API calls on rerender

function UPIPayment({
  paymentDetails,
  exchange,
  amount,
  transactionID,
}: UPIPaymentProps) {
  const dispatch = useDispatch();
  const [reinitiateLoading, setReInitiateLoading] = useState(false);

  const { upiID = '' } = paymentDetails ?? {};
  const isMobile = useMediaQuery();
  const router = useRouter();
  let interval;

  const sanitizer = dompurify.sanitize;
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>('inprogress');

  const {
    heading,
    subHeading,
    paymentStatusHeading,
    paymentStatusSubHeading,
    iconURL,
  } = upiStatusDetails[paymentStatus];

  let updatedSubHeading = subHeading.replace(
    UPI_ID_REPLACE_VARIABLE,
    `<span>${upiID}</span>`
  );

  const checkUPIStatus = () => {
    interval = setInterval(async () => {
      const res = await getUPIApprovalStatus(transactionID);
      if (res?.status === 'payment_received') {
        setPaymentStatus('success');
        clearInterval(interval);
        dispatch(
          setSelectedRfq({
            paymentRefID: res?.paymentRefId,
          })
        );
        setTimeout(() => {
          router.push('/confirmation');
        }, 5000);
      }

      if (
        ['rejected', 'expired', 'payment_expired', 'payment_failed'].includes(
          res.status
        )
      ) {
        setPaymentStatus('failed');
      }
    }, UPI_POLLING_INTERVAL_IN_SECONDS * 1000);
  };

  useEffect(() => {
    if (!isLoaded) {
      checkUPIStatus();
    }
    isLoaded = true;
    return () => {
      isLoaded = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTime = ({ remainingTime }) => {
    const isTimeUp = remainingTime === 0;
    return (
      <span className={styles.timerLabel}>
        {isTimeUp ? `00:00` : getTimeInFormat(remainingTime)}
      </span>
    );
  };

  const imageWithText = (text = '', imageURL = '') => {
    return (
      <div className="flex-column">
        {imageURL ? (
          <Image
            src={imageURL}
            width={24}
            height={24}
            layout="intrinsic"
            alt="image"
          />
        ) : null}
        <span className={styles.textWithImage}>{text}</span>
      </div>
    );
  };

  const renderArrow = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="111"
        height="30"
        viewBox="0 0 111 30"
        fill="none"
      >
        <path
          d="M0 4C0 1.79086 1.79086 0 4 0H88.3493C89.1439 0 89.9206 0.236675 90.5801 0.679843L106.254 11.211C108.559 12.7602 108.623 16.1303 106.377 17.7651L90.6207 29.234C89.9367 29.7318 89.1126 30 88.2667 30H4C1.79086 30 0 28.2091 0 26V4Z"
          fill="url(#paint0_linear_7865_270872)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_7865_270872"
            x1="4.13507e-07"
            y1="15"
            x2="117.5"
            y2="15"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const reinitiatePayment = async () => {
    try {
      setReInitiateLoading(true);
      await retryRFQPayment({
        transactionID: transactionID,
        paymentMethod: 'upi',
        upiID: upiID,
      });
    } catch (err) {
      console.log(err);
    }
    setReInitiateLoading(false);
    setPaymentStatus('inprogress');
  };

  const cancelPayment = async () => {
    clearInterval(interval);
    const data = await fetchOrderStatusTransaction(transactionID);
    dispatch(
      setSelectedRfq({
        paymentRefID: data?.paymentRefId,
      })
    );
    setTimeout(() => {
      router.push('/confirmation');
    }, 1000);
  };

  return (
    <div className={`flex-column ${styles.mainContainer}`}>
      <div className="flex justify-between">
        <div className={styles.upiLogo}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/upi-logo.svg`}
            width={isMobile ? 72 : 54}
            height={isMobile ? 22 : 16}
            alt="upilogo"
          />
        </div>
      </div>
      <div className={styles.mainText}>{heading}</div>
      <div
        className={styles.secondaryText}
        dangerouslySetInnerHTML={{
          __html: sanitizer(updatedSubHeading),
        }}
      />
      <div className={`flex-column ${styles.secondaryContainer}`}>
        <div
          className={`flex justify-between items-center ${styles.secondary}`}
        >
          {imageWithText('You', `${GRIP_INVEST_BUCKET_URL}icons/user.svg`)}
          <div className={styles.arrowContainer}>
            <div
              className={styles.textContainer}
            >{`₹${SDISecondaryAmountToCommaSeparator(amount, 2)}`}</div>
            {renderArrow()}
          </div>
          {imageWithText(
            'Exchange',
            `${GRIP_INVEST_BUCKET_URL}icons/${
              exchange === 'BSE' ? 'bse-logo.svg' : 'nse-logo.svg'
            }`
          )}
        </div>
        <div
          className={`flex justify-center ${styles.countDownTimerContainer} ${
            paymentStatus
              ? `items-center ${styles.paymentStatusContainer} ${paymentStatus}`
              : ''
          }`}
        >
          {(() => {
            switch (paymentStatus) {
              case 'timeout':
              case 'success':
              case 'failed':
                return iconURL ? (
                  <div className={`${styles.updatedStatusIcon}`}>
                    <Image src={iconURL} width={42} height={42} alt="iconurl" />
                  </div>
                ) : null;
              default:
                return (
                  <CountDownTimer
                    isPlaying
                    size={isMobile ? 139 : 109}
                    strokeWidth={isMobile ? 11 : 9}
                    duration={UPI_PAYMENT_DURATION}
                    color={'#00B8B7'}
                    trailColor={'#FFFFFF'}
                    onComplete={() => {
                      clearInterval(interval);
                      setPaymentStatus('timeout');
                      return {
                        shouldRepeat: false,
                      };
                    }}
                  >
                    {renderTime}
                  </CountDownTimer>
                );
            }
          })()}
        </div>

        <div className={styles.progressText}>{paymentStatusHeading}</div>
        <div className={`${styles.progressSecondaryText} ${paymentStatus}`}>
          {paymentStatusSubHeading}
        </div>
      </div>

      {['failed', 'timeout'].includes(paymentStatus) ? (
        <div className={styles.btnGroup}>
          <Button
            variant={ButtonType.PrimaryLight}
            className={styles.reInitiatePaymentButton}
            onClick={cancelPayment}
          >
            Close
          </Button>
          <Button
            variant={ButtonType.Primary}
            className={styles.reInitiatePaymentButton}
            onClick={reinitiatePayment}
            isLoading={reinitiateLoading}
          >
            Reinitiate Payment
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default UPIPayment;
