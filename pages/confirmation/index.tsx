// NODE_MODULES
import React, { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { connect, useDispatch } from 'react-redux';

// Components
import { OrderJourneyComponent } from '../../components/confirmation/order-journey';
import { ConfirmationHeader } from '../../components/confirmation/header';
import { OrderPayment } from '../../components/confirmation/order-payment';
import FAQ from '../../components/ReferEarn/FAQ';
import GripLoading from '../../components/layout/Loading';

// Utils
import { callErrorToast } from '../../api/strapi';
import { AmoQuestionAnswers, QuestionAnswers, videoURL } from '../../utils/rfq';
import { trackEvent } from '../../utils/gtm';

// APIs
import {
  fetchAmoTransactionDetails,
  fetchOrderStatusTransaction,
  fetchOrderTransactionDetails,
} from '../../api/order';
import { getPaymentType } from '../../api/payment';
import { fetchUserDetails } from '../../api/user';

// Redux Slices
import { RootState } from '../../redux';
import { setSelectedRfq } from '../../redux/slices/rfq';


// Styles
import classes from './Confirmation.module.css';

export const PendingRfqOrderContext = createContext({});
export interface orderDetailsType {
  transactionID: string;
  assetImage: string;
  assetName: string;
  assetID?: number;
  investedAmount: number;
  preTaxReturns: number;
  dematAccountNumber: string;
  tradeNumber: string;
  isAmo?: boolean;
  orderTransferInitiationDate?: string;
  orderSecuritiesTransferDate?: string;
  amoNextOpenDate?: string;
  preTaxYtm?: number;
  irr?: number;
  maturityDate?: string;
  unitPrice?: number;
  units?: number;
  totalInterest?: number;
  principalAmount?: number;
  accInfo?: any;
}

interface orderStatusType {
  amount: number;
  createdAt: string;
  dealID: string;
  orderDate: string;
  paymentLink: string;
  paymentRefId: string;
  rfqID: string;
  rfq_id: string;
  status: string;
  updatedAt: string;
  orderPaymentDate?: string;
  orderTransferInitiationDate?: string;
  orderSecuritiesTransferDate?: string;
}

const Confirmation = (props: any) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [orderStatusData, setOrderStatusData] = useState<orderStatusType>();
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState('');
  const [orderTransactionDetails, setOrderTransactionDetails] =
    useState<orderDetailsType>();
  const [paymentModeData, setPaymentModeData] = useState<any>();

  const isAmo = props.isAmo || false;
  const [accountInfo, setIsAccInfo] = useState({});

  const faqQuestions = isAmo ? AmoQuestionAnswers : QuestionAnswers;

  // Get payment Mode details
  const fetchPaymentTypeData = async () => {
    const data = await getPaymentType(
      orderTransactionDetails?.assetID,
      Math.round(Number(orderTransactionDetails?.investedAmount)),
      orderTransactionDetails?.transactionID
    );
    setPaymentModeData(data);
  };

  // Get transaction status details
  const fetchOrderStatusData = async (ID: string) => {
    try {
      const data = await fetchOrderStatusTransaction(ID);
      setOrderStatusData(data);
      setLoading(false);
    } catch (e) {
      callErrorToast(e);
    }
  };

  const handleTransactionDetailsByPayRefId = async (paymentRefID) => {
    // Get transaction details
    try {
      const data = await fetchOrderTransactionDetails(
        `?paymentRefId=${paymentRefID}`
      );
      setOrderTransactionDetails(data);
      if (data?.transactionID) {
        setTransactionId(data?.transactionID);
      }
    } catch (err) {
      setTimeout(() => {
        router.push('/assets');
      }, 2000);
    }
  };

  const handleTransactionDetailsByTransactionId = async (transactionId) => {
    // Get transaction details
    try {
      let data = isAmo
        ? await fetchAmoTransactionDetails(`?transactionID=${transactionId}`)
        : await fetchOrderTransactionDetails(`?transactionID=${transactionId}`);
      data = {
        ...data,
        investedAmount: data?.investedAmount ?? data?.amount,
      };
      setOrderTransactionDetails(data);
      if (isAmo) setLoading(false);
    } catch (err) {
      setTimeout(() => {
        router.push('/assets');
      }, 2000);
    }
  };

  useEffect(() => {
    const isPaymentSuccess = orderStatusData?.status === 'payment_received';
    if (
      isAmo &&
      orderTransactionDetails?.assetID &&
      orderTransactionDetails?.investedAmount
    ) {
      trackEvent('amo_confirmation_page', {
        timestamp: new Date(),
        asset_id: orderTransactionDetails?.assetID,
        amount_payable: orderTransactionDetails?.investedAmount,
        payment_status: orderStatusData?.status || 'no',
        view_portfolio_enabled: isPaymentSuccess || isAmo,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAmo,
    orderTransactionDetails?.assetID,
    orderTransactionDetails?.investedAmount,
  ]);

  useEffect(() => {
    if (props?.transactionID) {
      setTransactionId(props?.transactionID);
    }
  }, [props?.transactionID]);

  useEffect(() => {
    if (props?.paymentRefID) {
      handleTransactionDetailsByPayRefId(props?.paymentRefID);
    } else if (props?.transactionID) {
      handleTransactionDetailsByTransactionId(props?.transactionID);
    } else {
      router.push('/assets');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  useEffect(() => {
    if (transactionId && !isAmo) {
      fetchOrderStatusData(transactionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  useEffect(() => {
    if (orderTransactionDetails) {
      fetchPaymentTypeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTransactionDetails]);

  const removeData = () => {
    dispatch(setSelectedRfq({}));
  };

  const userData = async () => {
    const accData = await fetchUserDetails();
    setIsAccInfo(accData);
  };

  // Remove saved data on page change or refresh
  useEffect(() => {
    window.addEventListener('beforeunload', removeData);
    userData();
    return () => {
      window.removeEventListener('beforeunload', removeData);
      removeData();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (orderStatusData) {
      let paymentStatus = '';
      if (orderStatusData?.status === 'payment_initiated') {
        paymentStatus = 'Pending';
      } else if (orderStatusData?.status === 'payment_received') {
        paymentStatus = 'Payment successfull';
      }
      const eventData = {
        is_rfq: true,
        order_status: orderStatusData?.status || '',
        payment_status: paymentStatus,
        payment_mode: props?.paymentMode || '',
        transactionId: transactionId,
      };
      trackEvent('Investment Success', eventData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderStatusData?.status]);

  const renderFaqTitle = () => {
    return (
      <div className={classes.FaqTitle}>FAQ {`( ${faqQuestions.length} )`}</div>
    );
  };

  const PendingRfqOrderContextData = {
    orderDate: orderStatusData?.orderDate,
    expireBy: orderStatusData?.orderPaymentDate,
    createdDate: orderStatusData?.createdAt,
    status: orderStatusData?.status,
    orderPaymentDate: orderStatusData?.orderPaymentDate,
    orderTransferInitiationDate:
      orderStatusData?.orderTransferInitiationDate ??
      orderTransactionDetails?.orderTransferInitiationDate,
    orderSecuritiesTransferDate:
      orderStatusData?.orderSecuritiesTransferDate ??
      orderTransactionDetails?.orderSecuritiesTransferDate,
    amoNextOpenDate: orderTransactionDetails?.amoNextOpenDate,
    transactionID: transactionId,
    assetID: orderTransactionDetails?.assetID,
    amount: orderTransactionDetails?.investedAmount,
    assetName: orderTransactionDetails?.assetName,
    partnerLogo: orderTransactionDetails?.assetImage,
    isAmo: isAmo || orderTransactionDetails?.isAmo || false,
    bankName: paymentModeData?.NSE?.offline?.details?.bankName ?? '',
    ifscCode: paymentModeData?.NSE?.offline?.details?.ifscCode ?? '',
    accountNo: paymentModeData?.NSE?.offline?.details?.accountNo ?? '',
    beneficiaryName:
      paymentModeData?.NSE?.offline?.details?.beneficiaryName ?? '',
    accountType: paymentModeData?.NSE?.offline?.details?.accountType ?? '',
    settlementDate: paymentModeData?.NSE?.settlementDate ?? '',
    paymentMode: props?.paymentMode ?? '',
    paymentRefID: props.paymentRefID,
  };

  return false ? (
    <GripLoading />
  ) : (
    <div>
      <div className={classes.OrderConfirmationHeader}>
        <ConfirmationHeader isAmo={isAmo} />
      </div>
      <div className={classes.OrderConfirmationContainer}>
        <div className={classes.UpperContainer}>
          <PendingRfqOrderContext.Provider value={PendingRfqOrderContextData}>
            <OrderJourneyComponent
              videoURL={videoURL}
              isAmo={isAmo || orderTransactionDetails?.isAmo}
              isLoading={loading}
            />
          </PendingRfqOrderContext.Provider>
          <OrderPayment
            investedAmount={orderTransactionDetails?.investedAmount ?? 0}
            preTaxReturns={orderTransactionDetails?.preTaxReturns ?? 0}
            dematAccountNumber={
              orderTransactionDetails?.dematAccountNumber ?? ''
            }
            tradeNumber={orderTransactionDetails?.tradeNumber ?? ''}
            assetImage={orderTransactionDetails?.assetImage ?? ''}
            assetName={orderTransactionDetails?.assetName ?? ''}
            transactionID={orderTransactionDetails?.transactionID ?? ' '}
            {...orderTransactionDetails}
            accInfo={accountInfo}
          />
        </div>
        <FAQ
          data={faqQuestions}
          containerClassName={classes.FaqContainer}
          renderTitle={renderFaqTitle}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  paymentRefID: state.rfq?.selectedOrder?.paymentRefID,
  paymentMode: state.rfq?.selectedPaymentType,
  transactionID: state?.orders?.selectedOrder?.transactionID,
  isAmo: state?.orders?.selectedOrder?.isAmo,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Confirmation);
