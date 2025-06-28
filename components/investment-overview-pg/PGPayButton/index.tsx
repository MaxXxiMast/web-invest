// NODE MODULES
import { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Cookie from 'js-cookie';

// Components
import Button from '../../primitives/Button';
import TechnicalGlitchModal from '../TechnicalGlitchModal';
import GenericIconModal from '../../investment-overview/GenericIconModal';

// Utils
import {
  numberToIndianCurrencyWithDecimals,
  roundOff,
} from '../../../utils/number';
import { getGCSource } from '../../../utils/gripConnect';
import { getUTMParams, popuplateUTMParams } from '../../../utils/utm';
import { pendingPaymentModals } from '../../../utils/invest-overview';
import { getPaymentMethodAPIEnumIndex } from './utils';
import { delay } from '../../../utils/timer';
import { trackEvent } from '../../../utils/gtm';
import { isHighYieldFd } from '../../../utils/financeProductTypes';
import { getAssetOverview } from '../../assetDetails/AssetTopCard/utils';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Contexts
import { InvestmentOverviewPGContext } from '../../../contexts/investmentOverviewPg';

// Hooks and Redux Slices
import { useAppSelector } from '../../../redux/slices/hooks';

// Scripts
import { loadCashfree } from '../../../utils/ThirdParty/scripts';

// APIS
import {
  createOrder,
  placeOrderWithExchange,
  setSelected,
} from '../../../redux/slices/orders';
import { createRFQOrder } from '../../../api/order';
import { mappingPaymentMethod } from '../../../pages/pg-confirmation';

// Types
import { OrderInitateResponse } from '../types';

// Styles
import styles from './PGPayButton.module.css';

const ProgressBarPG = dynamic(() => import('../ProgressBarPG'), {
  ssr: false,
});

const MaterialModalPopup = dynamic(
  () => import('../../primitives/MaterialModalPopup'),
  {
    ssr: false,
  }
);

export default function PGPayButton() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery();
  const [openPaymentMandtry, setOpenPaymentMandtry] = useState(false);
  const [error, setError] = useState(false);
  const [technicalGlitch, setTechnicalGlitch] = useState(false);
  const { calculatedSDIData, userKycDetails }: any = useContext(
    InvestmentOverviewPGContext
  );
  const { asset, isMarketOpen, lotSize, assetCalculationData }: any =
    useContext(InvestmentOverviewPGContext);
  const { investmentAmount = 0, stampDuty = 0 } = assetCalculationData ?? {};

  const { isPaymentDetailsLoading: isLoading, paymentMethodPG } =
    useAppSelector((state) => state.assets);

  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [openRFQDealPopup, setOpenRFQDealPopup] = useState(false);

  const assetID = asset?.assetID;
  const payableAmount = Number(investmentAmount + Math.round(stampDuty));
  const isFD = asset ? isHighYieldFd(asset) : false;
  const assetOverviewInfo: any = asset
    ? getAssetOverview(asset, isMobile, isFD)
    : [];
  const previousPath = sessionStorage.getItem('lastVisitedPage') as string;

  const createOrderCallback = async (data: OrderInitateResponse) => {
    // IF the payment method is NEFT then it should be redirected to the confirmation page
    if (paymentMethodPG === 'NEFT') {
      dispatch(setSelected(data));
      router.push(`/pg-confirmation`);
      return;
    }

    if (typeof data === 'string') {
      let error: any = {};
      try {
        error = JSON.parse(data);
      } catch (e) {
        setTechnicalGlitch(true);
        setOpenRFQDealPopup(false);
        trackEvent('PG Error', {
          product_category: asset?.productCategory,
          product_sub_category: asset?.productSubCategory,
          error: e,
        });
      }
    } else {
      try {
        if (data?.paymentSessionID) {
          const startTime = performance.now();
          await loadCashfree();
          const paymentInstance = new (window as any).Cashfree(
            data?.paymentSessionID
          );
          const endTime = performance.now();
          const elapsedTime = (endTime - startTime) / 1000;

          trackEvent('Sdk Loaded', {
            payment_mode: paymentMethodPG,
            product_category: asset?.productCategory,
            product_sub_category: asset?.productSubcategory,
            payable_amount: payableAmount,
            load_time: `${elapsedTime.toFixed(4)} s`,
            order_id: data?.orderID,
            order_created_at: new Date().toISOString(),
            amo: !isMarketOpen && asset?.isRfq,
            rfq_enabled: asset?.isRfq || false,
            total_interest: roundOff(calculatedSDIData?.totalInterest, 2),
            total_returns: roundOff(calculatedSDIData?.preTaxAmount, 2),
            quantities_selected: lotSize,
            financial_product_type: asset?.financeProductType || 'N/A',
            payment_gateway: 'Cashfree',
          });
          paymentInstance.redirect();
        } else if (data?.paymentLink) {
          window.open(data?.paymentLink, '_self');
        }
      } catch (error) {
        setTechnicalGlitch(true);
        setOpenRFQDealPopup(false);
        trackEvent('PG Error', {
          product_category: asset?.productCategory,
          product_sub_category: asset?.productSubCategory,
          error: error,
        });
      }
    }
    setIsButtonLoading(false);
  };

  const handleRFQPay = async (units: number) => {
    if (!paymentMethodPG) return;

    let utmParams = {};
    if (Cookie.get('utm')) {
      utmParams = getUTMParams();
    } else {
      utmParams = {
        search: 'Not received',
        ...popuplateUTMParams({}),
      };
    }

    if (isButtonLoading) return;

    try {
      const response = await createRFQOrder({
        assetID: assetID,
        amount: payableAmount,
        units: units,
        utmParams,
        bankingName: '',
        upiID: '',
        paymentMethod: getPaymentMethodAPIEnumIndex(paymentMethodPG),
        isAmo: !isMarketOpen,
      });

      if (isMarketOpen && response?.transactionID) {
        await dispatch(
          placeOrderWithExchange(
            {
              paymentMethod:
                mappingPaymentMethod[
                  getPaymentMethodAPIEnumIndex(paymentMethodPG)
                ],
              transactionID: response?.transactionID,
              upiID: '',
              showToast: false,
            },
            async () => {
              setIsButtonLoading(false);
              // Adding a delay to show the progress bar
              await delay(1000);
              createOrderCallback(response);
              setIsButtonLoading(false);
            },
            () => {
              setError(true);
              setTechnicalGlitch(true);
              setOpenRFQDealPopup(false);
            }
          ) as any
        );
      } else {
        setIsButtonLoading(false);
        // Adding a delay to show the progress bar
        await delay(1000);
        createOrderCallback(response);
      }
    } catch (e) {
      setError(true);
      setTechnicalGlitch(true);
      setOpenRFQDealPopup(false);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleNonRFQPay = async (units: number, source: any) => {
    if (isButtonLoading || !paymentMethodPG) return;

    setIsButtonLoading(false);

    dispatch(
      createOrder(
        assetID,
        payableAmount,
        0,
        true,
        async (data: any) => {
          setIsButtonLoading(false);
          // Adding a delay to show the progress bar
          await delay(1000);
          createOrderCallback(data);
        },
        source,
        units,
        asset?.sdiSecondaryDetails?.calculatedFaceValue,
        {
          paymentMethod: getPaymentMethodAPIEnumIndex(paymentMethodPG),
        },
        () => {
          setTechnicalGlitch(true);
          setOpenRFQDealPopup(false);
        }
      ) as any
    );
  };

  const handleOnFinalPayment = async () => {
    setIsButtonLoading(true);
    setOpenRFQDealPopup(true);

    const { amount: finalUnits, source } = router.query;
    const utmSourceGC = getGCSource();
    const finalSource = source || utmSourceGC;

    if (asset?.isRfq) {
      handleRFQPay(Number(finalUnits));
    } else {
      handleNonRFQPay(Number(finalUnits), finalSource);
    }
  };

  const onClickPaymentProceed = () => {
    setOpenPaymentMandtry(false);
    handleOnFinalPayment();
  };

  const handleOnPay = async () => {
    if (isLoading) return;

    if (paymentMethodPG === 'NEFT') {
      setOpenPaymentMandtry(true);
      return;
    }

    handleOnFinalPayment();
    trackEvent('Pay Button Clicked', {
      product_category: asset?.productCategory,
      product_sub_category: asset?.productSubcategory,
      assetID: asset?.assetID,
      assetName: asset?.name,
      assetDescription: asset?.partnerName,
      assetLogo: asset?.partnerLogo,
      tenure: assetOverviewInfo[1]?.value,
      payble_amount: payableAmount,
      quantities_selected: lotSize,
      payment_mode: paymentMethodPG,
      rfq_enabled: asset?.isRfq,
      amo: !isMarketOpen && asset?.isRfq,
      total_interest: roundOff(calculatedSDIData?.totalInterest, 2),
      total_returns: roundOff(calculatedSDIData?.preTaxAmount, 2),
      IRR: assetOverviewInfo[0]?.value,
      URL: previousPath,
      bank_selected: userKycDetails?.bank?.bankName,
      financial_product_type: asset?.financeProductType || 'N/A',
      clicked_at: new Date().toISOString(),
    });
  };

  return (
    <>
      <Button
        width={'100%'}
        disabled={isLoading || isButtonLoading || !paymentMethodPG}
        isLoading={isLoading || isButtonLoading}
        onClick={handleOnPay}
      >{`Pay ${numberToIndianCurrencyWithDecimals(payableAmount)}`}</Button>
      <MaterialModalPopup
        hideClose
        isModalDrawer
        showModal={openRFQDealPopup}
        handleModalClose={() => setOpenRFQDealPopup(false)}
        className={styles.RFQProgessPopup}
      >
        <ProgressBarPG activeStep={isButtonLoading ? 0 : 1} error={error} />
      </MaterialModalPopup>
      {/* When NEFT is selected */}
      <GenericIconModal
        hideSecondary
        open={openPaymentMandtry}
        heading={pendingPaymentModals.mandatory.heading}
        subHeading={pendingPaymentModals.mandatory.subHeading}
        primaryBtnDetails={{
          label: 'Proceed',
          onClick: onClickPaymentProceed,
          isLoading: isLoading,
        }}
        iconUrl={pendingPaymentModals.mandatory.iconUrl}
        onClose={() => setOpenPaymentMandtry(false)}
      />
      <TechnicalGlitchModal showModal={technicalGlitch} />
    </>
  );
}
