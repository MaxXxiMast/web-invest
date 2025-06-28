// NODE MODULES
import React, { useCallback, useEffect, useMemo } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from 'lodash';

// Redux Slices
import { RootState, handleApiError } from '../../redux';
import {
  completeOrder,
  completeOrderForCashfree,
  completeOrderForFD,
} from '../../redux/slices/orders';
import {
  fetchAndSetAgreementPDF,
  fetchAndSetAsset,
} from '../../redux/slices/assets';
import { fetchUserInfo } from '../../redux/slices/user';

// Utils
import { createTransaction, trackEvent } from '../../utils/gtm';
import {
  absoluteCommittedInvestment,
  getAssetPartnersName,
  isAifDeal,
} from '../../utils/asset';
import { ORDER_CASHFREE_TYPES } from '../../utils/order';
import { decodeURLEncodedString } from '../../utils/date';

// APIS
import { moveDocuments } from '../../api/document';
import {
  completeOrder as completeOrderApi,
  fetchOrderStatusPgTransaction,
} from '../../api/order';

// Styles
import styles from './PaymentProcessing.module.css';

function PaymentProcessing(props: any) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { pg, type, orderID, source } = queryString.parse(
    window?.location?.search
  );

  const moveDocument = async (order: any, spvAgreements: any, asset: any) => {
    if (isAifDeal(Number(asset?.spvType))) {
      const agreements = spvAgreements || [];
      const promises: any[] = [];
      //using a for of loop as there can be multiple docs in assets
      for (const pdf of agreements) {
        const aif = {
          docType: 'asset',
          docSubType: pdf.spvDocID,
          toModel: 'order',
          fromModel: 'user',
          toModuleID: order.orderID,
          fromModuleID: order.userID,
        };
        promises.push(moveDocuments(aif));
      }
      await Promise.all(promises);
    }
  };

  const postOrderProcess = async (orderData: any, asset: any) => {
    props.fetchAndSetAgreementPDF(
      orderData.spvID,
      async (spvAgreements: any) => {
        await moveDocument(orderData, spvAgreements, asset);
        if (orderData?.financeProductType === 'Startup Equity') {
          if (orderData.isOrderSuccessful) {
            router.push('/order-confirmation');
          } else {
            router.push('/order-failure');
          }
        } else {
          router.push('/pg-confirmation');
        }
      }
    );
  };

  const getRudderStackEventData = (
    amount: number,
    type: ORDER_CASHFREE_TYPES,
    currentAsset: any = {}
  ) => {
    const asset = props?.asset || currentAsset || {};

    const {
      assetPartners = [],
      tenure,
      irr,
      assetID,
      name,
      financeProductType,
    } = asset;

    const isAddingMoney = type === 'wallet' || type === 'vault';
    let isCombo: string | boolean = '';
    let completedPercentage: string | number = '';
    let partnerNames = '';

    /**
     * When adding money then following keys should be null
     *
     * 1. is_combo
     * 2. partner_names
     * 3. completed_percentage
     * 4. tenure
     * 5. irr
     * 6. asset_id
     * 7. asset_name
     */

    if (!isAddingMoney) {
      isCombo = assetPartners?.length > 1;
      completedPercentage = absoluteCommittedInvestment(asset, false);
      partnerNames = getAssetPartnersName(asset);
    }

    return {
      is_adding_money: isAddingMoney,
      is_combo: isCombo,
      partner_names: partnerNames,
      completed_percentage: completedPercentage,
      tenure: isAddingMoney ? '' : tenure,
      irr: isAddingMoney ? '' : irr,
      asset_id: isAddingMoney ? '' : assetID,
      asset_name: isAddingMoney ? '' : name,
      amount,
      is_duo_deal: isAddingMoney ? '' : assetPartners?.length === 2,
      finance_product_type: financeProductType,
    };
  };

  const trackRudderStackPaymentFailed = (
    amount: number,
    type: ORDER_CASHFREE_TYPES,
    asset = {}
  ) => {
    const { is_duo_deal, ...dataToSend } = getRudderStackEventData(
      amount,
      type,
      asset
    );

    trackEvent('payment_failed', dataToSend);
  };

  const sendPaymentSuccessEvent = (
    amount: number,
    type: ORDER_CASHFREE_TYPES
  ) => {
    const rudderData = getRudderStackEventData(amount, type);
    trackEvent('Investment Success', {
      orderAmount: rudderData?.amount,
      isAddingMoney: rudderData?.is_adding_money,
      isCombo: rudderData?.is_combo,
      partnerNames: rudderData?.partner_names,
      completed_percentage: rudderData?.completed_percentage,
      tenure: rudderData?.tenure,
      irr: rudderData?.irr,
      isDuoDeal: rudderData?.is_duo_deal,
      assetID: rudderData?.asset_id,
      assetName: rudderData?.asset_name,
      financeProductType: rudderData?.finance_product_type,
    });
  };

  const fetchUserAndAsset = (
    assetID: number | string,
    cb: (data: any) => void
  ) => {
    props.fetchUserInfo(props.access?.userID, () =>
      props.fetchAndSetAsset(assetID, cb)
    );
  };

  const sendPaymentEvents = async (userData) => {
    const dataToSend = { orderID };
    const orderData = await completeOrderApi(dataToSend);
    createTransaction(orderData?.msg?.data, userData);
    return orderData?.msg?.data;
  };

  const redirect = useCallback(async () => {
    let paymentData = {} as any;

    if (source !== 'fixerra') {
      paymentData = await sendPaymentEvents(props?.user?.userData);
    }

    if (pg === 'cashfree') {
      if (type === 'order') {
        dispatch(
          completeOrderForCashfree(orderID as string, paymentData, () => {
            postOrderProcess(paymentData, props.asset);
          }) as any
        );
      } else if (type === 'vault') {
        router.push('/vault');
      }
    } else if (pg === 'razorpay') {
      razorpayCallback(type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.user?.userData, props.asset]);

  const debouncedRedirect = useMemo(() => debounce(redirect, 1000), [redirect]);

  useEffect(() => {
    debouncedRedirect();
    return () => {
      debouncedRedirect.cancel();
    };
  }, [debouncedRedirect]);

  const routeToConfirmation = () => {
    router.push('/pg-confirmation');
  };

  const fetchOrderStatus = (
    transactionID: string,
    successCb: (data: any) => void,
    errorCb: () => void
  ) => {
    return async (dispatch) => {
      try {
        const response = await fetchOrderStatusPgTransaction(transactionID);
        successCb(response);
      } catch (e) {
        errorCb();
        handleApiError(e, dispatch);
      }
    };
  };

  const orderStatusFdWithDelay = async (
    txId: string,
    fn: (tx, scb, cb) => void,
    retries: number,
    delay: number,
    successCallback: () => void
  ) => {
    try {
      dispatch(
        fn(txId, successCallback, async () => {
          if (retries > 0) {
            // Retry after a delay if there are remaining retries
            await new Promise((resolve) => setTimeout(resolve, delay));
            await orderStatusFdWithDelay(
              txId,
              fn,
              retries - 1,
              delay,
              successCallback
            );
          }
        }) as any
      ); // Call the provided error function
    } catch (error) {
      console.error('Error in orderStatusFdWithDelay', error);
    }
  };

  useEffect(() => {
    const {
      source,
      transactionID: fixerraOrderID,
      partnertransactionid: gripOrderID,
      timestamp,
    } = queryString.parse(window?.location?.search);

    if (source === 'fixerra' && props?.user?.userData?.userID) {
      const params = {
        userID: props?.user?.userData?.userID,
        fixerraTxnTime: decodeURLEncodedString(timestamp),
        orderType: source,
        fixerraTxnId: fixerraOrderID,
      };

      dispatch(
        completeOrderForFD(
          gripOrderID as string,
          fixerraOrderID as string,
          params,
          () => {
            orderStatusFdWithDelay(
              gripOrderID as string,
              fetchOrderStatus,
              3,
              5000,
              routeToConfirmation
            );
          }
        ) as any
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.user?.userData?.userID]);

  const getDataObjForRazorpay = () => {
    const {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
      orderID,
    } = queryString.parse(window?.location?.search);
    return {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
      orderID,
    };
  };

  const completeRPOrder = (data: any, orderID, pg, type) => {
    props.completeOrder(
      {
        ...data,
        pg,
      },
      orderID,
      async (orderData: any) => {
        fetchUserAndAsset(orderData?.assetID, async (asset: any) => {
          if (!orderData.isOrderSuccessful) {
            trackRudderStackPaymentFailed(orderData?.amount, type, asset);
          } else {
            // Investment Success Rudder Event
            sendPaymentSuccessEvent(orderData?.amount, type);
          }
          await postOrderProcess(orderData, asset);
        });
      }
    );
  };

  const razorpayCallback = (type: string | string[]) => {
    const { orderID } = queryString.parse(window?.location?.search);
    const data = getDataObjForRazorpay();
    const pg = 'razorpay';
    if (type === 'order') {
      completeRPOrder(data, orderID, pg, type);
    }
  };

  const progessStyles = {
    size: 40,
    thickness: 6,
  };

  return (
    <div className={`items-align-center-row-wise ${styles.container}`}>
      <div className="containerNew">
        <div
          className={`items-align-center-column-wise ${styles.MainContainer}`}
        >
          <div className={styles.circularProgressContainer}>
            <CircularProgress
              variant="determinate"
              size={progessStyles.size}
              thickness={progessStyles.thickness}
              value={100}
              className={styles.circularProgressDeterminate}
            />
            <CircularProgress
              variant="indeterminate"
              size={progessStyles.size}
              thickness={progessStyles.thickness}
              disableShrink
              className={styles.circularProgressInDeterminate}
              classes={{
                circle: styles.circularProgressInDeterminateCircle,
              }}
            />
          </div>

          <span className={styles.processingHeader}>Processing Payment</span>

          <span className={styles.processingText}>
            Confirming status with Payment Gateway within 30 seconds
          </span>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  order: state.orders.selectedOrder,
  user: state.user,
  asset: state.assets.selectedAsset,
  access: state.access,
});

const mapDispatchToProps = {
  completeOrder,
  fetchAndSetAgreementPDF,
  fetchUserInfo,
  fetchAndSetAsset,
};

export default connect(mapStateToProps, mapDispatchToProps)(PaymentProcessing);
