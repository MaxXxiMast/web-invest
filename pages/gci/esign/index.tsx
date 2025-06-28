import React, { useEffect } from 'react';

import classes from './esign.module.css';

import GciLoading from '../../../components/gci/loading';
import {
  getEsignParams,
  verifyEsign,
  fetchEsignRedirectUrl,
} from '../../../api/gci';
import { redirectHandler } from '../../../utils/windowHelper';

function PaymentProcessing() {
  useEffect(() => {
    const token = new URLSearchParams(window?.location?.search).get('token');

    getEsignParams(token)
      .then((response) => {
        PubSub.publish('openDigio', {
          openDigioModal: true,
          data: response,
          onEsignDone: () => {
            verifyEsign({
              token: token,
              did: response?.did,
              identifier: response?.identifier,
              signOnce: response?.signOnce,
            }).then((res: any) => {
              redirectHandler({
                pageUrl: res.url,
                pageName: 'GCI Esign Success',
              });
            });
          },
        });
      })
      .catch((_err) => {
        setTimeout(() => {
          fetchEsignRedirectUrl(token).then((res: any) => {
            redirectHandler({
              pageUrl: res.url,
              pageName: 'GCI Esign Error',
            });
          });
        }, 5000);
      });
    // eslint-disable-next-line
  }, []);

  return (
    <div className={classes.dataContainer}>
      <div className={classes.dataWrapper}>
        <GciLoading />
        <p className={classes.processingText}>
          Please do not hit back or refresh button…
        </p>
      </div>
    </div>
  );
}

export default PaymentProcessing;
