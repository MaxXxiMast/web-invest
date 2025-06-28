import React, { useEffect } from 'react';
import queryString from 'query-string';

import classes from './gciPostPaymentProcess.module.css';

import { getPostPGUrl } from '../../api/gci';
import GciLoading from '../../components/gci/loading';
import { redirectHandler } from '../../utils/windowHelper';

function PaymentProcessing() {
  useEffect(() => {
    const queryParams = queryString.parse(window?.location?.search);

    getPostPGUrl(queryParams as any).then((response) => {
      redirectHandler({
        pageUrl: response.url,
        pageName: 'GCI Post Payment Processing',
      });
    });
    // eslint-disable-next-line
  }, []);

  return (
    <div className={classes.dataContainer}>
      <div className={classes.dataWrapper}>
        <GciLoading />
        <div className={classes.processingHeader}>
          Your payment is in progress
        </div>
        <div className={classes.processingText}>
          Please do not hit back or refresh button…
        </div>
      </div>
    </div>
  );
}

export default PaymentProcessing;
