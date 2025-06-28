import React, { useEffect } from 'react';

import classes from './gciPaymentProcess.module.css';

import { getPGUrl } from '../../api/gci';
import GciLoading from '../../components/gci/loading';
import { loadCashfree } from '../../utils/ThirdParty/scripts';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { redirectHandler } from '../../utils/windowHelper';

function PaymentProcessing() {
  const isMobile = useMediaQuery('(max-width: 992px)');

  useEffect(() => {
    const token = new URLSearchParams(window?.location?.search).get('token');

    getPGUrl(token).then(async (response) => {
      if (response.url.startsWith('http')) {
        redirectHandler({
          pageUrl: response.url,
          pageName: 'GCI Payment Processing',
        });
      } else {
        await loadCashfree();
        const paymentInstance = new (window as any).Cashfree(response.url);
        paymentInstance.redirect();
      }
    });
    // eslint-disable-next-line
  }, []);

  const getRedirectionText = () => {
    return isMobile ? (
      <>
        You’re being redirected to
        <br />
        Complete Payment
      </>
    ) : (
      <>
        You’re being redirected to Complete
        <br />
        Payment
      </>
    );
  };

  return (
    <div className={classes.dataContainer}>
      <div className={classes.dataWrapper}>
        <GciLoading />
        <div className={classes.processingHeader}>{getRedirectionText()}</div>
        <div className={classes.processingText}>
          Please do not hit back or refresh button…
        </div>
      </div>
    </div>
  );
}

export default PaymentProcessing;
