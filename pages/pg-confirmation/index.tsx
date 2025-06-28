// NODE_MODULES
import { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookie from 'js-cookie';
import dynamic from 'next/dynamic';

// Components
import { OrderJourneyComponent } from '../../components/pg-confirmation/order-journey';
import { OrderPayment } from '../../components/pg-confirmation/order-payment';
import StatusHeader from '../../components/pg-confirmation/payment-header-status';
import { BottomBannerConfimationCentent } from '../../components/pg-confirmation/bottom-banner';

// APIs
import { fetchOrderStatusPgTransaction } from '../../api/order';

// Hooks
import { useAppSelector } from '../../redux/slices/hooks';

// utils
import { getMarketStatus } from '../../utils/marketTime';
import { isGCOrder } from '../../utils/gripConnect';
import { trackEvent } from '../../utils/gtm';
import {
  generateAgreementURL,
  generateAssetURL,
  backToAggrementURL,
  getMaturityDate,
  getMaturityMonths,
} from '../../utils/asset';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../utils/appHelpers';
import { redirectHandler } from '../../utils/windowHelper';

// Styles
import classes from './PgConfirmation.module.css';

// Dynamic imports
const ViewBankDetails = dynamic(
  () => import('../../components/pg-confirmation/view-bank-details'),
  {
    ssr: false,
  }
);

const FtiGraphConfirmation = dynamic(
  () => import('../../components/pg-confirmation/FtiGraph/component'),
  {
    ssr: false,
  }
);

type paymentMode = 'upi' | 'offline' | 'netBanking';

type orderDetailsPg = {
  assetID: number;
  amount: number;
  status: number;
  isAmo: number;
  isRfq: number;
  units: number;
  unitPrice: number;
  amoLinkStatus: string;
  transactionID: string;
  orderDate: string;
  userID: number;
  createdAt: string;
  spvID: number;
  source: string;
  orderID: string;
  orderTransferInitiationDate: string;
  orderSecuritiesTransferDate: string;
  amoNextOpenDate: string;
  irr?: number;
  preTaxYtm?: number;
  maturityDate: string;
  financeProductType: string;
  assetName: string;
  assetImage: null;
  rfqID: string;
  rfqStatus: string;
  rfqDealStatus: string;
  principalAmount: number;
  purchasePrice: number;
  totalInterest: number;
  preTaxReturns: number;
  postTaxReturns?: number; // FD
  calculatedFaceValue: number;
  tenure: string;
  productCategory: string;
  orderSettlementDate: string;
  isPgEnabled: boolean;
  dematTransferDate: string;
  paymentMethod: paymentMode;
  category: string;
  name: string;
  partnerName: string;
  isFti?: boolean;
  spvName?: string;
  firstInterestDate?: string;
  isFdOrder?: boolean;
  vendorID?: string; // FD like bajaj
};

export type bondGraphApi = {
  id: number;
  name: string;
  irr: number;
  category: string;
  partnerName: string;
  partnerLogo: string;
  rating: string;
};

type PaymentStatus = 'success' | 'failed' | 'pending' | 'awaited';

export const mappingPaymentMethod = {
  1: 'netBanking',
  2: 'upi',
  6: 'offline',
};

export const PendingPgOrderContext = createContext<Partial<PgOrderContext>>({});

type isRfqProcessing = 0 | 1 | 2;
// 0: Not processing or Processed
// 1: Processing
// 2: error in processing

type PgOrderContext = orderDetailsPg & {
  loading: boolean;
  isProcessing: isRfqProcessing;
  marketStatus: string;
  isMarketOpen: boolean;
  paymentStatus: PaymentStatus;
  isGC: boolean;
  isUnlistedPtc: boolean;
  NonFtiGraphData: any[];
  redirectToGC: () => void;
  redirectToAssets: () => void;
  redirectToAssetAggrement: () => void;
  redirectToAssetDetail: () => void;
  redirectToDiscover: () => void;
  redirectToPortfolio: () => void;
  handleOnClickRetry: () => void;
};

const Confirmation = () => {
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<isRfqProcessing>(0);
  const [orderPgDetails, setOrdePgDetails] = useState<orderDetailsPg>();

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>();
  const [isUnlistedPtc, setIsUnlistedPtc] = useState<boolean>(false);

  const marketTiming = useAppSelector((state) => state.config.marketTiming);
  const marketStatus = getMarketStatus(
    marketTiming?.marketStartTime,
    marketTiming?.marketClosingTime,
    marketTiming?.isMarketOpenToday
  );

  const isGC = isGCOrder();
  const orderTransactionID = useAppSelector(
    (state) =>
      state?.orders?.selectedOrder?.transactionID ??
      state?.orders?.selectedOrder?.orderID
  );

  const isMarketOpen = ['open', 'closes in'].includes(marketStatus);
  const router = useRouter();

  const gcConfigData = useAppSelector((state) => state.gcConfig.configData);
  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const selectedAsset = useAppSelector((state) => state.access.selectedAsset);

  const { gcCallbackUrl } = useAppSelector((state) => state.gcConfig.gcData);
  const orderConfirmationData = useAppSelector(
    (state) => state.gcConfig?.configData?.themeConfig?.pages?.orderConfirmation
  );

  const isRetryGCEnabled =
    gcConfigData?.themeConfig?.redirectToPartner?.paymentFailedRetryNow ||
    false;

  const isSuccessGCEnabled =
    gcConfigData?.themeConfig?.redirectToPartner?.orderSuccessViewPortfolio ||
    false;

  useEffect(() => {
    if (orderPgDetails?.paymentMethod === 'offline')
      setPaymentStatus('awaited');
    else if ([1, 7, 8].includes(orderPgDetails?.status)) {
      setPaymentStatus('success');
    } else if (orderPgDetails?.status === 0) {
      setPaymentStatus('pending');
    } else {
      setPaymentStatus('failed');
    }
  }, [orderPgDetails?.status, orderPgDetails?.paymentMethod]);

  useEffect(() => {
    if (orderPgDetails?.productCategory) {
      setIsUnlistedPtc(orderPgDetails?.productCategory === 'Unlisted PTC');
    }
  }, [orderPgDetails?.productCategory]);

  useEffect(() => {
    if (orderTransactionID) {
      setLoading(true);
      fetchOrderStatusPgTransaction(orderTransactionID)
        .then((res) => {
          // remore this line after testing
          if (res && typeof res === 'object') {
            const { paymentMethod, isFdOrder } = res;
            setOrdePgDetails({
              ...res,
              paymentMethod: mappingPaymentMethod[paymentMethod],
            });
            let FdEventsFields = {};
            if (isFdOrder) {
              FdEventsFields = {
                fd_name: res?.vendorID ?? '',
                fd_type: res?.category,
              };
            }

            const messageData = {
              product_category: res?.productCategory,
              order_created_at: res?.orderDate,
              order_id: res?.orderID,
              payment_mode: mappingPaymentMethod[paymentMethod],
              payable_amount: res?.amount,
              order_status: res?.status,
              assetID: res?.assetID,
              assetName: res?.name,
              assetDescription: res?.partnerName,
              quantities_selected: res?.units,
              rfq_enabled: res?.isRfq ? 'true' : 'false',
              amo: res?.isAmo,
              investment_overview_link: generateAgreementURL(
                {
                  category: res?.category,
                  assetID: res?.assetID,
                  partnerName: res?.partnerName,
                  name: res?.assetName,
                },
                res?.units
              ),
              irr: res?.irr,
              total_returns: res?.preTaxReturns || 0,
              product_sub_category:
                selectedAsset?.productSubcategory || res?.financeProductType,
              tenure: getMaturityMonths(getMaturityDate(asset)),
              ...FdEventsFields,
            };

            /* 
            - Trigger event from GRIP App SDK if the page is rendered in webview and the order is not a GC order
            - It should work in desktop as well
            */
            if (isRenderedInWebview() && !isGC) {
              postMessageToNativeOrFallback(
                'view_payment_status_page',
                messageData
              );
            } else {
              trackEvent('View Payment Status Page', messageData);
            }
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      router.push('/assets');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTransactionID]);
  const getGCCallBackURL = () => {
    // GET Redirection URL
    const callBackURL = gcCallbackUrl || Cookie.get('gc_callback_url');
    Cookie.remove('gc_callback_url');
    const finalURL = `${callBackURL}?type=payment&transaction_id=${orderTransactionID}&status=${paymentStatus.toUpperCase()}&msg=${paymentStatus.toUpperCase()}`;
    return finalURL;
  };

  const redirectToGC = async () => {
    // GET Redirection URL
    const callBackURL = gcCallbackUrl || Cookie.get('gc_callback_url');
    Cookie.remove('gc_callback_url');
    const finalURL = `${callBackURL}?type=payment&transaction_id=${orderTransactionID}&status=${paymentStatus.toUpperCase()}&msg=${paymentStatus.toUpperCase()}`;
    if (!finalURL) {
      await trackEvent('gc_redirect_issue', {
        finalURL: finalURL,
        callBackURL: callBackURL,
        gcCallbackUrl: gcCallbackUrl,
        cookieUrl: Cookie.get('gc_callback_url'),
      });
    }

    redirectHandler({
      pageUrl: finalURL || '/',
      pageName: 'Pg Confirmation GC Callback',
    });
  };

  const redirectToDiscover = () => {
    isGC ? redirectToGC() : router.push('/discover');
  };

  const redirectToAssets = () => {
    isGC ? redirectToGC() : router.push('/assets');
  };

  const redirectToAssetAggrement = () => {
    const url = backToAggrementURL({
      assetID: orderPgDetails?.assetID,
      name: orderPgDetails?.name,
      category: orderPgDetails?.category,
      partnerName: orderPgDetails?.partnerName,
      amount: orderPgDetails?.units,
    });

    isGC ? redirectToGC() : router.push(url);
  };

  const redirectToAssetDetail = () => {
    const url = generateAssetURL({
      assetID: orderPgDetails?.assetID,
      name: orderPgDetails?.name,
      category: orderPgDetails?.category,
      partnerName: orderPgDetails?.partnerName,
    });
    isGC ? redirectToGC() : router.push(url);
  };

  const redirectToPortfolio = () => {
    isGC && isSuccessGCEnabled
      ? redirectToGC()
      : router.push('portfolio#my_investments');
  };

  const handleOnClickRetry = () => {
    if (isGCOrder() && isRetryGCEnabled && gcCallbackUrl) {
      const url = getGCCallBackURL();
      redirectHandler({
        pageUrl: url || '/',
        pageName: 'Retry Payment',
      });
      return;
    }

    const { assetID, name, category, partnerName, units } =
      orderPgDetails || {};

    const url = orderPgDetails?.isFdOrder
      ? generateAssetURL({
          assetID: assetID,
          name: name,
          category: category,
          partnerName: partnerName,
        })
      : backToAggrementURL({
          assetID: assetID,
          name: name,
          category: category,
          partnerName: partnerName,
          amount: units,
        });
    router.push(url);
  };

  const PendingRfqOrderContextData = {
    assetID: orderPgDetails?.assetID,
    amount: orderPgDetails?.amount,
    status: orderPgDetails?.status,
    isAmo: orderPgDetails?.isAmo,
    isRfq: orderPgDetails?.isRfq,
    units: orderPgDetails?.units,
    unitPrice: orderPgDetails?.unitPrice,
    amoLinkStatus: orderPgDetails?.amoLinkStatus,
    transactionID: orderPgDetails?.transactionID,
    orderDate: orderPgDetails?.orderDate,
    userID: orderPgDetails?.userID,
    createdAt: orderPgDetails?.createdAt,
    spvID: orderPgDetails?.spvID,
    source: orderPgDetails?.source,
    orderID: orderPgDetails?.orderID,
    orderTransferInitiationDate: orderPgDetails?.orderTransferInitiationDate,
    orderSecuritiesTransferDate: orderPgDetails?.orderSecuritiesTransferDate,
    amoNextOpenDate: orderPgDetails?.amoNextOpenDate,
    irr: orderPgDetails?.irr,
    preTaxYtm: orderPgDetails?.preTaxYtm,
    maturityDate: orderPgDetails?.maturityDate,
    financeProductType: orderPgDetails?.financeProductType,
    assetName: orderPgDetails?.assetName,
    assetImage: orderPgDetails?.assetImage,
    rfqID: orderPgDetails?.rfqID,
    rfqStatus: orderPgDetails?.rfqStatus,
    rfqDealStatus: orderPgDetails?.rfqDealStatus,
    principalAmount: orderPgDetails?.principalAmount,
    purchasePrice: orderPgDetails?.purchasePrice,
    totalInterest: orderPgDetails?.totalInterest,
    preTaxReturns: orderPgDetails?.preTaxReturns,
    postTaxReturns: orderPgDetails?.postTaxReturns,
    calculatedFaceValue: orderPgDetails?.calculatedFaceValue,
    tenure: orderPgDetails?.tenure,
    productCategory: orderPgDetails?.productCategory,
    orderSettlementDate: orderPgDetails?.orderSettlementDate,
    isPgEnabled: orderPgDetails?.isPgEnabled,
    dematTransferDate: orderPgDetails?.dematTransferDate,
    paymentMethod: orderPgDetails?.paymentMethod,
    category: orderPgDetails?.category,
    name: orderPgDetails?.name,
    partnerName: orderPgDetails?.partnerName,
    isFti: orderPgDetails?.isFti,
    spvName: orderPgDetails?.spvName,
    firstInterestDate: orderPgDetails?.firstInterestDate,
    isFdOrder: orderPgDetails?.isFdOrder,
    loading,
    isProcessing,
    marketStatus,
    isMarketOpen,
    paymentStatus,
    isGC,
    isUnlistedPtc,
    redirectToAssets,
    redirectToAssetAggrement,
    redirectToAssetDetail,
    redirectToDiscover,
    redirectToPortfolio,
    handleOnClickRetry,
  };

  const RenderBeneficiaryDetails = () => {
    if (orderPgDetails?.paymentMethod !== 'offline') {
      return null;
    }
    return <ViewBankDetails />;
  };

  // Up sell banner
  const RenderGraph = () => {
    if (
      !(orderPgDetails?.isFdOrder && paymentStatus === 'success') ||
      (isGC && !orderConfirmationData?.upsellBanner)
    ) {
      return null;
    }

    return orderPgDetails?.isFti ? <FtiGraphConfirmation /> : null;
    // <NonFtiGraphConfirmation />
  };

  return (
    <div className={`flex ${classes.OrderConfirmationContainer}`}>
      <PendingPgOrderContext.Provider value={PendingRfqOrderContextData}>
        <div
          className={`flex direction-column flex-one ${classes.LeftContainer}`}
        >
          <StatusHeader />
          <RenderBeneficiaryDetails />
          <OrderJourneyComponent />
          <RenderGraph />
          <BottomBannerConfimationCentent />
        </div>
        <OrderPayment />
      </PendingPgOrderContext.Provider>
    </div>
  );
};

export default Confirmation;
