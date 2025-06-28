// NODE MODULES
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Cookie from 'js-cookie';

import { getUTMParams, popuplateUTMParams } from '../../utils/utm';
// Components
import BackBtn from '../primitives/BackBtn/BackBtn';
import OverviewTab from '../investment-overview/overview-tab';
import PaymentTab from '../investment-overview/payment-tab';

// Utils
import {
  ExchangeType,
  PaymentApiResponse,
  PaymentTypeVariant,
  upiTagList,
} from '../../utils/investment';
import { generateAssetURL } from '../../utils/asset';
import { isSDISecondary } from '../../utils/financeProductTypes';
import {
  MARKET_CLOSED_REDIRECT,
  ORDER_ERROR_REDIRECT,
  ORDER_NETBANKING_REDIRECT,
  ORDER_SUCCESS_REDIRECT,
  getRFQPaymentURL,
} from '../../utils/rfq';
import { getPaymentType } from '../../api/payment';

// Redux
import { useAppSelector } from '../../redux/slices/hooks';
import { setPaymentMode } from '../../redux/slices/rfq';
import { setSelected } from '../../redux/slices/orders';

// APIS
import { createRFQOrder } from '../../api/order';

// Styles
import classes from '../../components/investment-overview/InvestmentOverview.module.css';

// other functions
import { retryRFQPaymentProcessingURL } from '../../pages/rfq-payment-processing';
import { getKYCDetailsFromConfig } from '../user-kyc/utils/helper';
import { GlobalContext } from '../../pages/_app';

const RFQDealConfirmationModal = dynamic(
  () => import('../rfq/RFQDealConfirmationModal'),
  {
    ssr: false,
  }
);

const RedirectionPaymentPopup = dynamic(
  () => import('../common/RedirectionPaymentPopup'),
  {
    ssr: false,
  }
);

let isLoaded = false; //Flag to prevent multiple API calls on rerender
const tabs = [
  { id: 801, title: 'Overview' },
  { id: 802, title: 'Payment Option' },
];
export const InvestmentOverviewContext = createContext({});

const RfqInvestments = (props: any) => {
  const router = useRouter();
  const { upiSuggestions }: any = useContext(GlobalContext);

  const asset = useAppSelector((state) => state.access.selectedAsset);
  const { kycDetails, userData } = useAppSelector((state) => state.user);
  const lotUnitAmount = Number(router?.query?.amount || 0);

  const isSecondarySdiAsset = isSDISecondary(asset);

  const [activeTab, setActiveTab] = useState(0);
  const [neftDetails, setNeftDetails] = useState<any>({});
  const [paymentType, setPaymentType] = useState<PaymentApiResponse>({
    paymentType: [],
    exchangeType: undefined,
    expiredPayments: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentTypeAvailable, setIsPaymentTypeAvailable] = useState(false);
  const [openRFQDealPopup, setOpenRFQDealPopup] = useState(false);
  const [disableProceedButton, setDisableProceedButton] = useState(false);
  const [stepperStatus, setStepperStatus] = useState<
    'success' | 'error' | 'closed' | null
  >(null);
  const [paymentTypeSelected, setPaymentTypeSelected] = useState('');
  const [upi, setUPI] = useState({
    value: null,
    bankingName: null,
  });
  const [transactionID, setTransactionID] = useState();
  const [neftLoader, setNeftLoader] = useState(false);

  const dispatch = useDispatch();

  const payableAmount =
    (isSecondarySdiAsset
      ? props.calculatedSDIData?.investmentAmount
      : props.calculatedBondData?.investmentAmount) +
    Math.round(props?.assetCalculationData?.stampDuty);

  const kycConfigStatus = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );

  const bankDetails = getKYCDetailsFromConfig(
    kycConfigStatus,
    'bank'
  ) as Record<string, string>;

  const investmentContext = {
    ...props,
    upiSuggestion: upiSuggestions || upiTagList,
    tooltipData: props?.localProps?.tooltipData?.[0]?.objectData || {},
    userKycDetails: kycDetails || {},
    asset: asset,
    lotSize: lotUnitAmount,
    calculationDataBonds: props.calculatedBondData,
    calculatedSDIData: props.calculatedSDIData,
    totalPayableAmount: payableAmount,
    paymentTypeData: paymentType,
    isValidLotsize: props.isLotSizeValid,
    isOrderInitiateInProgress: false,
    isCheckingPaymentOptions: isLoading,
    neftDetails: neftDetails,
    paymentTypeSelected: paymentTypeSelected,
    bankDetails: {
      bankName: bankDetails?.bankName,
      userName: bankDetails?.accountName,
      accountNo: bankDetails?.accountNumber,
      dematAccNumber: userData?.dematNo,
    },
    upi: upi,
    upiValue: upi.value || '',
    onSubmitUpiCB: setUPI,
    transactionID: transactionID,
    assetCalculationData: props?.assetCalculationData || {},
  };

  const paymentAmount = isSecondarySdiAsset
    ? props.calculatedSDIData?.investmentAmount
    : props.calculatedBondData?.investmentAmount;

  const handleCreateProceedOrder = async () => {
    let utmParams = {};
    if (Cookie.get('utm')) {
      utmParams = getUTMParams();
    } else {
      utmParams = {
        search: 'Not received',
        ...popuplateUTMParams({}),
      };
    }
    if (disableProceedButton) return;

    try {
      const response = await createRFQOrder({
        assetID: asset?.assetID,
        amount: payableAmount,
        units: lotUnitAmount,

        upiID: upi.value,

        bankingName: upi.bankingName,
        utmParams,
      });
      setTransactionID(response?.transactionID);
    } catch (e) {
      let isMarketClosed = false;
      if (e?.hasOwnProperty('includes')) {
        isMarketClosed = e?.includes('Market is closed now');
      }
      onCloseStepperModal(false, isMarketClosed);
    }
  };

  const handleProceedClick = (selectedPaymentType: string) => {
    dispatch(setPaymentMode(selectedPaymentType));
    setOpenRFQDealPopup(true);
    setDisableProceedButton(true);
    setPaymentTypeSelected(selectedPaymentType);
    handleCreateProceedOrder();
  };

  const handlePaymentType = async () => {
    setIsLoading(true);
    //Get bank details, payment methods and exchange details
    try {
      const data = await getPaymentType(
        asset?.assetID,
        Math.round(Number(paymentAmount))
      );

      const paymentTypeArr: PaymentTypeVariant[] = [];
      const expiredPayments: PaymentTypeVariant[] = [];

      let exchangeType: ExchangeType = undefined;
      let paymentDetails: any = {};

      const priorityExchange =
        Number(data?.NSE?.priority) === 1 ? 'NSE' : 'BSE';

      const responseData: any = data?.[priorityExchange] || {};
      if (responseData?.upi?.isAllowed) {
        paymentTypeArr.push('UPI');
      }
      if (responseData?.netBanking?.isAllowed) {
        paymentTypeArr.push('NetBanking');
      }

      if (responseData?.offline?.isAllowed) {
        paymentTypeArr.push('NEFT');
      }

      // Check expired payment methods
      if (responseData?.upi?.isExpired) {
        expiredPayments.push('UPI');
      }
      if (responseData?.netBanking?.isExpired) {
        expiredPayments.push('NetBanking');
      }

      paymentDetails = responseData;
      exchangeType = priorityExchange;

      setNeftDetails({
        ...paymentDetails?.offline?.details,
        settlementDate: paymentDetails?.settlementDate,
      });
      //Set payment methods and exchange type
      setPaymentType({
        paymentType: paymentTypeArr,
        exchangeType: exchangeType,
        expiredPayments: expiredPayments,
      });
    } catch (error) {
      setIsPaymentTypeAvailable(true);
      console.log('error', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded) {
      handlePaymentType();
    }
    isLoaded = true;

    return () => {
      isLoaded = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRedirectURL = () => {
    return stepperStatus === 'error'
      ? generateAssetURL(asset)
      : '/rfq-payment-processing';
  };

  const routeToConfirmationPage = () => {
    router.push('/confirmation');
  };

  const onCloseStepperModal = async (
    isSuccess = true,
    isMarketClosed = false
  ) => {
    setOpenRFQDealPopup(false);

    if (isSuccess && paymentTypeSelected === 'offline') {
      dispatch(
        setSelected({
          transactionID: transactionID,
        })
      );
      setNeftLoader(true);

      const { type } = await retryRFQPaymentProcessingURL(transactionID);
      if (!type) {
        // if order is expire
        router.push('/assets');
      }
      routeToConfirmationPage();
      return;
    }

    setTimeout(() => {
      if (isSuccess) {
        setStepperStatus('success');
      } else if (isMarketClosed) {
        setStepperStatus('closed');
      } else {
        setStepperStatus('error');
      }
    }, 1000);

    const redirectURL = isSuccess
      ? getRFQPaymentURL(transactionID)
      : generateAssetURL(asset);

    setTimeout(() => {
      router.push(redirectURL);
    }, 5000);
  };

  const getMainHeadingRedirect = () => {
    let mainHeading: string;
    if (stepperStatus === 'closed') {
      mainHeading = MARKET_CLOSED_REDIRECT.mainHeading;
    } else if (stepperStatus === 'error') {
      mainHeading = ORDER_ERROR_REDIRECT.mainHeading;
    } else {
      mainHeading = ORDER_SUCCESS_REDIRECT.mainHeading;
    }
    return mainHeading;
  };

  return (
    <>
      <div className={classes.Wrapper}>
        <div className="containerNew">
          <div className={classes.Header}>
            <BackBtn
              className={classes.BackBtn}
              handleBackEvent={() => router.push(generateAssetURL(asset))}
              shouldHandleAppBack
            />
            <div className={classes.Tabs}>
              {tabs.map((ele: { id: number; title: string }, index: number) => {
                return (
                  <React.Fragment key={`investment_overview_${ele}`}>
                    <div
                      className={`${classes.TabItem} ${
                        index === activeTab ? classes.Active : ''
                      } ${index < activeTab ? classes.Completed : ''}`}
                      key={ele?.id}
                    >
                      <span className={classes.Radio} />
                      <span className={classes.Label}>{ele.title}</span>
                    </div>
                    {index !== tabs.length - 1 ? (
                      <div className={classes.Separator} key={ele?.id} />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className={classes.Main}>
            <InvestmentOverviewContext.Provider value={investmentContext}>
              {(() => {
                switch (activeTab) {
                  case 0:
                    return (
                      <OverviewTab
                        handlePaymentBtnClick={() => setActiveTab(1)}
                        key={`OverviewTab`}
                        isLoading={isLoading}
                        isBtnDisable={isPaymentTypeAvailable}
                      />
                    );
                  case 1:
                    return (
                      <PaymentTab
                        key={`PaymentTab`}
                        handleProceedClick={handleProceedClick}
                        isLoading={disableProceedButton}
                        isShowDebarment
                      />
                    );
                  default:
                    return null;
                }
              })()}
              {openRFQDealPopup ? (
                <RFQDealConfirmationModal
                  open={openRFQDealPopup}
                  close={onCloseStepperModal}
                />
              ) : null}
              {neftLoader ? (
                <RedirectionPaymentPopup
                  mainHeadingText={ORDER_NETBANKING_REDIRECT.mainHeading}
                />
              ) : null}

              {stepperStatus ? (
                <RedirectionPaymentPopup
                  mainHeadingText={getMainHeadingRedirect()}
                  redirectURL={getRedirectURL()}
                />
              ) : null}
            </InvestmentOverviewContext.Provider>
          </div>
        </div>
      </div>
    </>
  );
};

export default RfqInvestments;
