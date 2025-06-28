// NODE MODULES
import React, { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Components
import Image from '../../primitives/Image';
import { NeftTabDetails } from '../neft-tab-payment-modal';
import PaymentProceedWidget from '../payment-proceed-widget';
import TermsPolicyWidget from '../terms-privacy-widget';
import { InvestmentOverviewContext } from '../../assetAgreement/RfqInvestment';
import PaymentExpired from '../payment-expired';

// Utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import {
  InvestmentTabProps,
  LoaderStatus,
  PaymentTypeData,
  TabProps,
  paymentTabsArr,
} from '../../../utils/investment';
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import { RFQPaymentType } from '../../../utils/rfq';
import { trackEvent } from '../../../utils/gtm';
import { pendingPaymentModals } from '../../../utils/invest-overview';
import { delay } from '../../../utils/timer';

// Contexts
import { GlobalContext } from '../../../pages/_app';

// Styles
import classes from './PaymentTab.module.css';

//Dynamic Components
const GenericIconModal = dynamic(() => import('../GenericIconModal'), {
  ssr: false,
});
const NetBankingTab = dynamic(() => import('../net-banking-tab'), {
  ssr: false,
});
const NeftTab = dynamic(() => import('../neft-tab'), { ssr: false });
const UpiTab = dynamic(() => import('../upi-tab'), { ssr: false });

type Props = InvestmentTabProps & {
  handleProceedClick: (
    selectedPaymentType: string,
    paymentTabIndex: number
  ) => void;
  activeIndex?: number;
  isLoading?: boolean;
  isShowDebarment?: boolean;
  openIn?: string;
};

const PaymentTab = ({
  handleProceedClick,
  className,
  isLoading = false,
  isShowDebarment = false,
  openIn = '',
}: Props) => {
  const {
    paymentTypeData,
    totalPayableAmount,
    isOrderInitiateInProgress,
    lotSize,
    asset,
    isAmo = false,
    bankDetails = {},
  }: any = useContext(InvestmentOverviewContext);
  const { enableDebartment }: any = useContext(GlobalContext);

  const paymentType: PaymentTypeData = paymentTypeData;

  const handleActiveStep = () => {
    const { paymentType, expiredPayments } = paymentTypeData;

    if (paymentType.includes('UPI') && !expiredPayments.includes('UPI')) {
      return 0;
    }

    if (
      paymentType.includes('NetBanking') &&
      !expiredPayments.includes('NetBanking')
    ) {
      return 1;
    }

    if (paymentType.includes('NEFT') && !expiredPayments.includes('NEFT')) {
      return 2;
    }

    return 0;
  };

  const [activeTab, setActiveTab] = useState(handleActiveStep());
  const [upiStatus, setUpiStatus] = useState<LoaderStatus>(null);
  const [isDebarmentLoader, setIsDebarmentLoader] = useState(false);

  const [openPaymentMandtry, setOpenPaymentMandtry] = useState(false);

  const router = useRouter();

  const handleUPIBtnVariant = () => {
    return (
      paymentType.paymentType.includes('UPI') &&
      !paymentType.expiredPayments.includes('UPI') &&
      activeTab === 0 &&
      upiStatus !== 'success'
    );
  };

  useEffect(() => {
    const eventData = {
      amount: Number(totalPayableAmount || 0).toFixed(2),
      upi_available:
        paymentTypeData?.paymentType?.includes('UPI') &&
        !paymentTypeData?.expiredPayments.includes('UPI'),
      net_banking_available:
        paymentTypeData?.paymentType?.includes('NetBanking') &&
        !paymentTypeData?.expiredPayments.includes('NetBanking'),
      offline_available:
        paymentTypeData?.paymentType?.includes('NEFT') &&
        !paymentTypeData?.expiredPayments.includes('NEFT'),
      amo_order: isAmo,
    };
    trackEvent('choose_payment_tab_view', eventData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (openPaymentMandtry) {
      //  when debarment nudge pop up comes
      const data = {
        asset_id: asset?.assetID,
        units: lotSize,
        amount: Number(totalPayableAmount).toFixed(2),
        page: window?.location?.href,
      };
      trackEvent('debarment_nudge', data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPaymentMandtry]);

  const handleEnableDebartment = async () => {
    // Call Discover API
    setIsDebarmentLoader(false);
    setOpenPaymentMandtry(true);
  };

  const handleBtnVariable = () => {
    if (
      isOrderInitiateInProgress ||
      isLoading ||
      isDebarmentLoader ||
      handleUPIBtnVariant()
    ) {
      return 'Disabled';
    }

    return 'Primary';
  };

  const onHandlePaymentBtnClick = async () => {
    if (enableDebartment && isShowDebarment) {
      handleEnableDebartment();
    } else {
      const eventData = {
        amount: Number(totalPayableAmount || 0).toFixed(2),
        upi_available:
          paymentTypeData?.paymentType?.includes('UPI') &&
          !paymentTypeData?.expiredPayments.includes('UPI'),
        net_banking_available:
          paymentTypeData?.paymentType?.includes('NetBanking') &&
          !paymentTypeData?.expiredPayments.includes('NetBanking'),
        offline_available:
          paymentTypeData?.paymentType?.includes('NEFT') &&
          !paymentTypeData?.expiredPayments.includes('NEFT'),
        amo_order: isAmo,
        payment_mode: RFQPaymentType[activeTab],
        bank_name: bankDetails?.bankName || '',
      };
      trackEvent('payment_tab_proceed', eventData);
      await delay(300);
      handleProceedClick(RFQPaymentType[activeTab], activeTab);
    }
  };

  return (
    <>
      <div className={`${classes.Wrapper} ${handleExtraProps(className)}`}>
        <div className={`flex justify-center ${classes.Tabs}`}>
          {paymentTabsArr.map((ele: TabProps, index: number) => {
            // Hide NEFT tab if payment not allowed through NEFT method
            if (index === 2 && !paymentType.paymentType.includes('NEFT')) {
              return null;
            }

            return (
              <>
                <div
                  className={`flex items-center ${classes.TabItem} ${
                    index === activeTab ? classes.Active : ''
                  } ${ele?.showLabel ? classes.IconHide : ''}`}
                  key={`${ele?.id}`}
                  onClick={() => setActiveTab(index)}
                >
                  <div className={classes.Radio} />
                  <div className={`${classes.TabLabel} flex items-center`}>
                    {Boolean(ele?.logoName) && ele?.removeLogo !== openIn ? (
                      <span className={classes.Logo}>
                        <Image
                          src={`${GRIP_INVEST_BUCKET_URL}icons/${ele?.logoName}`}
                          alt="InfoIcon"
                          layout="fixed"
                          width={ele?.width ? ele.width : 24}
                          height={ele?.height ? ele.height : 24}
                        />
                      </span>
                    ) : null}

                    {Boolean(ele?.label) && ele?.showLabel ? (
                      <span className={classes.Label}> {ele?.label}</span>
                    ) : null}
                  </div>
                </div>
                <div className={classes.Separator} />
              </>
            );
          })}
        </div>
        <div className={classes.TabContent}>
          {(paymentType.expiredPayments.includes('UPI') && activeTab === 0) ||
          (paymentType.expiredPayments.includes('NetBanking') &&
            activeTab === 1) ? (
            <PaymentExpired paymentType={paymentTabsArr?.[activeTab]?.label} />
          ) : null}

          {(() => {
            const isPaymentTab = openIn === 'paymentTab';
            switch (activeTab) {
              case 0:
                return (
                  <UpiTab
                    triggerValueChange={() => setUpiStatus(null)}
                    handleUpiStatus={(status: LoaderStatus) =>
                      setUpiStatus(status)
                    }
                    paymentType={paymentType.paymentType}
                    expiredPayments={paymentType.expiredPayments}
                  />
                );
              case 1:
                return (
                  <NetBankingTab
                    paymentType={paymentType.paymentType}
                    exchangeType={paymentType.exchangeType}
                    expiredPayments={paymentType.expiredPayments}
                  />
                );
              case 2:
                return isPaymentTab ? (
                  <NeftTabDetails />
                ) : (
                  <NeftTab
                    paymentType={paymentType.paymentType}
                    totalPayableAmount={totalPayableAmount}
                  />
                );
              default:
                return null;
            }
          })()}
        </div>

        <div className={`${classes.TabBottom} flex direction-column`}>
          {(paymentType.paymentType.includes('UPI') &&
            !paymentType.expiredPayments.includes('UPI') &&
            activeTab === 0) ||
          (paymentType.paymentType.includes('NetBanking') &&
            !paymentType.expiredPayments.includes('NetBanking') &&
            activeTab === 1) ||
          (paymentType.paymentType.includes('NEFT') &&
            activeTab === 2 &&
            openIn !== 'paymentTab') ? (
            <>
              <PaymentProceedWidget
                value={`${numberToIndianCurrencyWithDecimals(
                  Number(totalPayableAmount || 0).toFixed(2)
                )}`}
                handleBtnClick={() => onHandlePaymentBtnClick()}
                btnVariable={handleBtnVariable()}
                isLoading={isOrderInitiateInProgress || isDebarmentLoader}
                className={classes.Proceed}
              />
              <TermsPolicyWidget
                showPaymentExchange
                exchangeType={paymentType.exchangeType}
              />
            </>
          ) : null}
        </div>
      </div>
      {/* When Pending Orders are not there  */}
      <GenericIconModal
        open={openPaymentMandtry}
        heading={pendingPaymentModals.mandatory.heading}
        subHeading={pendingPaymentModals.mandatory.subHeading}
        primaryBtnDetails={{
          label: 'Proceed',
          onClick: () => {
            handleProceedClick(RFQPaymentType[activeTab], activeTab);
            setOpenPaymentMandtry(false);
          },
          isLoading: isOrderInitiateInProgress,
        }}
        secondaryBtnDetails={{
          label: 'View other deals',
          onClick: () => {
            router.push('/assets');
          },
        }}
        iconUrl={pendingPaymentModals.mandatory.iconUrl}
        hideClose
      />
    </>
  );
};

export default PaymentTab;
