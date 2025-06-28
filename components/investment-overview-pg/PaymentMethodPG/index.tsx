// NODE MODULES
import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

// Components
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// Utils
import {
  ExchangeType,
  PaymentApiResponse,
  paymentTabsArr,
  PaymentTypeVariant,
  PaymentVariantIndexValue,
  TabProps,
} from '../../../utils/investment';
import { isSDISecondary } from '../../../utils/financeProductTypes';
import { dateFormatter } from '../../../utils/dateFormatter';
import { trackEvent } from '../../../utils/gtm';
import { roundOff } from '../../../utils/number';

// Redux Hooks and Slices
import { useAppSelector } from '../../../redux/slices/hooks';
import { setPaymentMethodPG } from '../../../redux/slices/assets';

// Contexts
import { InvestmentOverviewPGContext } from '../../../contexts/investmentOverviewPg';

// Styles
import styles from './PaymentMethodPG.module.css';

export default function PaymentMethodPG() {
  const dispatch = useDispatch();
  const {
    asset,
    calculatedSDIData,
    calculationDataBonds,
    userKycDetails,
    isMarketOpen,
    lotSize,
  } = useContext(InvestmentOverviewPGContext);

  const {
    isPaymentDetailsLoading: isLoading,
    allPaymentMethodPG,
    paymentMethodPG,
  } = useAppSelector((state) => state.assets);
  const marketTiming = useAppSelector((state) => state.config.marketTiming);

  const [paymentType, setPaymentType] = useState<PaymentApiResponse>({
    paymentType: [],
    exchangeType: undefined,
    expiredPayments: [],
  });
  const [neftDetails, setNeftDetails] = useState<any>({});
  const [activeTab, setActiveTab] = useState(null);
  const [switchCount, setSwitchCount] = useState(0);

  const paymentAmount = isSDISecondary(asset)
    ? calculatedSDIData?.investmentAmount
    : calculationDataBonds?.investmentAmount;

  const handlePaymentType = async () => {
    const paymentTypeArr: PaymentTypeVariant[] = ['UPI', 'NetBanking'];
    const disablePayments: PaymentTypeVariant[] = [];
    let exchangeType: ExchangeType = undefined;
    let paymentDetails: any = {};

    const priorityExchange =
      Number(allPaymentMethodPG?.NSE?.priority) === 1 ? 'NSE' : 'BSE';

    const responseData: any = allPaymentMethodPG?.PG || {};

    // IF NET Banking Supported
    const isNETBANKINGAllowed = responseData?.netBanking?.isAllowed;
    // IF UPI Supported
    const isUPIAllowed = responseData?.upi?.isAllowed;
    // IF NEFT Supported
    const isNEFTAllowed = asset?.isRfq && responseData?.offline?.isAllowed;

    let finalDefaultTab = 0;

    if (!isUPIAllowed) {
      finalDefaultTab = 1;
      disablePayments.push('UPI');
    }

    if (!isNETBANKINGAllowed) {
      disablePayments.push('NetBanking');
      if (!isUPIAllowed && isNEFTAllowed) {
        finalDefaultTab = 2;
      }
    }

    if (isNEFTAllowed) {
      paymentTypeArr.push('NEFT');
    }

    if (!isUPIAllowed && !isNETBANKINGAllowed && !isNEFTAllowed) {
      finalDefaultTab = -1;
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
      expiredPayments: disablePayments,
    });
    setActiveTab(finalDefaultTab);
    dispatch(
      setPaymentMethodPG(
        PaymentVariantIndexValue[
          finalDefaultTab === -1 ? null : finalDefaultTab
        ]
      )
    );
    return disablePayments;
  };

  useEffect(() => {
    if (!isLoading && activeTab === null) {
      handlePaymentType()
        .then((disablePayments) => {
          trackEvent('View Payment Page Loaded', {
            product_category: asset?.productCategory,
            product_sub_category: asset?.productSubcategory,
            assetID: asset?.assetID,
            market_open: isMarketOpen,
            market_day_type: marketTiming?.reason,
            quantities_selected: lotSize,
            payble_amount: paymentAmount,
            upi_available: !disablePayments.includes('UPI'),
            netbanking_available: !disablePayments.includes('NetBanking'),
            neft_available: !disablePayments.includes('NEFT'),
            amo_order: !isMarketOpen && asset?.isRfq,
            payment_gateway: paymentMethodPG,
            total_interest:
              roundOff(calculationDataBonds?.totalInterest, 2) || 0,
            total_returns: roundOff(
              (calculationDataBonds?.totalInterest || 0) +
                (calculationDataBonds?.principalAmount || 0),
              2
            ),
            financial_product_type: asset?.financeProductType || 'N/A',
            rfq_enabled: asset?.isRfq || false,
          });
        })
        .catch((error) => {
          console.log('error', error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPaymentMethodPG]);

  if (isLoading || activeTab === null) {
    return (
      <div className={`flex-column ${styles.SkeletonContainer}`}>
        <CustomSkeleton className={styles.Skeleton} />
        <CustomSkeleton className={styles.Skeleton} />
      </div>
    );
  }

  const handlePaymentTabArr = (paymentTab: TabProps) => {
    if (paymentTab.id === 'NEFT' && !paymentType.paymentType.includes('NEFT')) {
      return false;
    }
    return true;
  };

  const renderTags = (paymentTab: TabProps, isDisable = false) => {
    let text = '';

    if (paymentTab.id === 'UPI' && !isDisable) {
      text = 'Recommended';
    }

    if (
      paymentTab.id === 'NetBanking' &&
      !isDisable &&
      paymentType.expiredPayments.includes('UPI')
    ) {
      text = 'Zero PG Fee';
    }

    if (paymentTab.id === 'NEFT' && !isDisable) {
      text = `Pay on ${dateFormatter({
        dateTime: neftDetails?.settlementDate,
        dateFormat: 'DD MMM YYYY',
        timeZoneEnable: true,
      })}`;
    }

    if (!text) return null;
    return (
      <div className={`${styles.PaymentTag} ${paymentTab.id.toLowerCase()}`}>
        {text}
      </div>
    );
  };

  const renderDisableData = (ele: TabProps, isDisable = false) => {
    let text = '';
    if (ele.id === 'NetBanking' && isDisable) {
      text = `${(userKycDetails?.bank as any)?.bankName} not supported by PG`;
    } else if (ele.id === 'UPI' && isDisable) {
      text = `Transactions above 1 Lakh are not permitted via UPI`;
    } else {
      return null;
    }

    return (
      <div
        className={`items-align-center-row-wise ${styles.DisabledNetBanking}`}
      >
        <span className={`icon-info ${styles.InfoIcon}`} />
        <div className={styles.DisabledText}>{text}</div>
      </div>
    );
  };

  const handleOnPaymentTabClick = (
    index: number,
    ele: TabProps,
    isDisable = false
  ) => {
    if (isDisable) return;
    setActiveTab(index);
    dispatch(setPaymentMethodPG(ele.id));
    setSwitchCount((prev) => prev + 1);
    trackEvent('Payment Selection Switch', {
      payment_mode: ele?.id,
      product_category: asset?.productCategory,
      product_sub_category: asset?.productSubcategory,
      assetID: asset?.assetID,
      assetName: asset?.name,
      quantities_selected: lotSize,
      payble_amount: paymentAmount,
      rfq_enabled: asset?.isRfq,
      switch_count: switchCount + 1,
    });
  };

  return (
    <div>
      {paymentTabsArr
        .filter(handlePaymentTabArr)
        .map((ele: TabProps, index: number) => {
          const isDisable = paymentType.expiredPayments.includes(ele?.id);

          return (
            <div
              key={`${ele?.id}`}
              onClick={() => handleOnPaymentTabClick(index, ele, isDisable)}
              className={`flex ${styles.TabItemContainer} ${
                index === activeTab ? styles.Active : ''
              } ${isDisable ? styles.Disabled : ''} `}
            >
              <div className={styles.Radio} />
              <div className={`flex-column ${styles.TabItem}`}>
                <div
                  className={`${styles.TabLabel} items-align-center-row-wise ${
                    isDisable ? styles.Disabled : ''
                  } `}
                >
                  {Boolean(ele?.label) ? (
                    <span className={styles.Label}> {ele?.label}</span>
                  ) : null}
                  {renderTags(ele, isDisable)}
                </div>
                {renderDisableData(ele, isDisable)}
              </div>
            </div>
          );
        })}
    </div>
  );
}
