import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Skeleton from '@mui/material/Skeleton';
import { ConnectedProps, connect } from 'react-redux';

import UPI from '../../components/rfq/upi';

import { setSelected } from '../../redux/slices/orders';

import type {
  PaymentResponseObject,
  PaymentTypes,
} from '../../components/rfq/types';
import { getRFQPaymentProcessingURL } from '../../api/rfq';

import styles from './RfqPaymentProcessing.module.css';
import { callErrorToast } from '../../api/strapi';
import { redirectHandler } from '../../utils/windowHelper';

const mapDispatchToProps = {
  setSelected,
};

const mapStateToProps = () => ({});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

let isLoaded = false; //Flag to prevent multiple API calls on rerender

export const retryRFQPaymentProcessingURL = async (
  txId: string,
  retries: number = 5,
  delay: number = 3000
) => {
  try {
    return await getRFQPaymentProcessingURL(txId, Boolean(retries === 1));
  } catch (err) {
    if (retries > 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return await retryRFQPaymentProcessingURL(txId, retries - 1);
    } else {
      return err;
    }
  }
};

function RfqPaymentProcessing({ setSelected }: PropsFromRedux) {
  const [paymentType, setPaymentType] = useState<PaymentTypes>();
  const [loading, setLoading] = useState(false);
  const [paymentRes, setPaymentRes] = useState<PaymentResponseObject>({});

  const router = useRouter();

  const transactionID = new URLSearchParams(window?.location?.search).get(
    'transactionID'
  );

  const routeToConfirmationPage = () => {
    router.push('/confirmation');
  };

  const onNetBanking = (src: string) => {
    redirectHandler({
      pageUrl: src,
      pageName: 'RFQ Netbanking',
    });
  };

  const rfqPaymentCB = async () => {
    setLoading(true);
    try {
      const response = await retryRFQPaymentProcessingURL(transactionID);
      const { type, value } = response;
      if (!type) {
        callErrorToast('Invalid Transaction');
        // Return to confirmation page
        router.push('/assets');
      }

      setSelected({
        ...response,
        transactionID: transactionID,
      });

      // When Netbanking
      if (type === 'netBanking') {
        onNetBanking(value);
      } else if (type === 'upi') {
        // When UPI fetch asset details
        setPaymentRes(response);
      } else if (type === 'offline') {
        // When NEFT
        routeToConfirmationPage();
        setPaymentRes(response);
      } else {
        // route to asset list
        router.push('/assets');
      }

      setPaymentType(type);
    } catch (err) {
      setSelected({
        transactionID: transactionID,
      });
      // route to confirmation
      routeToConfirmationPage();
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoaded) {
      rfqPaymentCB();
    }
    isLoaded = true;

    return () => {
      isLoaded = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Skeleton width={500} height={400} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {(() => {
        switch (paymentType) {
          case 'upi':
            return <UPI transactionID={transactionID} {...paymentRes} />;
          default:
            return null;
        }
      })()}
    </div>
  );
}

export default connector(RfqPaymentProcessing);
