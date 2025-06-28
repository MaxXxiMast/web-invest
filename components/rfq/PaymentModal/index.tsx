import { useContext, useEffect, useState } from 'react';
import { ConnectedProps, connect, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'next/router';

import PaymentTab from '../../investment-overview/payment-tab';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import Image from '../../primitives/Image';
import PaymentModalLoader from './loader';

import { RootState } from '../../../redux';
import { setOpenPaymentModal } from '../../../redux/slices/config';
import { InvestmentOverviewContext } from '../../assetAgreement/RfqInvestment';

import { GlobalContext } from '../../../pages/_app';

import { getPaymentType } from '../../../api/payment';
import { retryRFQPayment } from '../../../api/rfq';

import {
  ExchangeType,
  PaymentApiResponse,
  PaymentTypeVariant,
  upiTagList,
} from '../../../utils/investment';
import { getRFQPaymentURL } from '../../../utils/rfq';
import { fetchAPI } from '../../../api/strapi';
import { setPaymentMode } from '../../../redux/slices/rfq';
import { useAppSelector } from '../../../redux/slices/hooks';
import { getKYCDetailsFromConfig } from '../../user-kyc/utils/helper';

import styles from './PaymentModal.module.css';

dayjs.extend(utc);
dayjs.extend(timezone);

const mapStateToProps = (state: RootState) => ({
  userData: state.user.userData,
  pendingOrderDetails: state.orders.rfqPendingOrder,
});

const mapDispatchToProps = {
  setOpenPaymentModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

interface PaymentModalProps extends ConnectedProps<typeof connector> {}

function PaymentModal(props: Partial<PaymentModalProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [isProceedLoading, setIsProceedLoading] = useState(false);
  const [neftDetails, setNeftDetails] = useState<any>({});
  const [paymentType, setPaymentType] = useState<PaymentApiResponse>({
    paymentType: [],
    expiredPayments: [],
    exchangeType: undefined,
  });
  const [pageData, setPageData] = useState([]);

  const router = useRouter();
  const dispatch = useDispatch();

  const { pendingOrderDetails } = props ?? {};
  const {
    expireBy,
    partnerLogo,
    assetID,
    transactionID,
    amount,
    assetName,
    isAmo = 0,
  } = pendingOrderDetails || {};

  const kycConfigStatus = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );

  const bankDetails = getKYCDetailsFromConfig(
    kycConfigStatus,
    'bank'
  ) as Record<string, string>;

  const { upiSuggestions }: any = useContext(GlobalContext);

  const investmentContext = {
    paymentTypeData: paymentType,
    totalPayableAmount: amount,
    isOrderInitiateInProgress: isProceedLoading,
    upiSuggestion: upiSuggestions?.length ? upiSuggestions : upiTagList,
    bankDetails: {
      bankName: bankDetails?.bankName,
      userName: bankDetails?.accountName,
      accountNo: bankDetails?.accountNumber,
      dematAccNumber: props?.userData?.dematNo,
    },
    neftDetails: neftDetails,
    isNeftNextStep: false,
    pageData: pageData,
    transactionID: transactionID,
    isAmo: Boolean(isAmo),
  };

  const handlePaymentType = async () => {
    //Get bank details, payment methods and exchange details
    try {
      const data = await getPaymentType(
        assetID,
        Math.round(Number(amount)),
        transactionID
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
      console.log('error', error);
    }
    setIsLoading(false);
  };

  const getPageData = async () => {
    try {
      var pageData = await fetchAPI(
        '/inner-pages-data',
        {
          filters: {
            url: '/assetagreement',
          },
          populate: '*',
        },
        {},
        false
      );
      setPageData(pageData?.data?.[0]?.attributes?.pageData);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getPageData();
    handlePaymentType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickMakePayment = async (selectedPaymentType: string) => {
    const upiInputDocument: any = document.getElementById('UPI_VALUE');
    const upiValue = upiInputDocument?.value ?? '';

    try {
      setIsProceedLoading(true);

      // When retry mandate should be false for upi
      const data = await retryRFQPayment({
        transactionID: transactionID,
        paymentMethod: selectedPaymentType,
        upiID: upiValue,
        raiseMandate: selectedPaymentType !== 'upi',
      });

      props.setOpenPaymentModal(false);

      // Redirection case handle for Net banking
      if (data?.type === 'netBanking') {
        router.push(data?.value);
      } else {
        router.push(getRFQPaymentURL(transactionID));
      }
    } catch (err) {
      console.log(err);
    }
    setIsProceedLoading(false);
  };

  const renderPaymentDetails = () => {
    return (
      <InvestmentOverviewContext.Provider value={investmentContext}>
        <div className={styles.Header}>Complete Payment</div>
        <div
          className={`flex justify-between items-center ${styles.OrderDetailsContainer}`}
        >
          {partnerLogo && (partnerLogo as string).includes('https') ? (
            <Image
              src={partnerLogo}
              width={130}
              height={41}
              layout="fixed"
              alt={assetName}
            />
          ) : (
            <span className={styles.PartnerName}>{partnerLogo}</span>
          )}
          <div className={styles.ExpiryDate}>
            {`Expires by ${dayjs(expireBy).format('DD MMM, hh:mm A IST')}`}
          </div>
        </div>
        <div className={styles.PaymentTabContainer}>
          <PaymentTab
            openIn="paymentTab"
            className={styles.PaymentTabWrapper}
            handleProceedClick={(type, tabIndex) => {
              dispatch(setPaymentMode(type));
              onClickMakePayment(type);
            }}
            isLoading={isLoading}
          />
        </div>
      </InvestmentOverviewContext.Provider>
    );
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={true}
      className={styles.PopupContainerDesktop}
      cardClass={styles.PopupCardContainer}
      drawerExtraClass={styles.PopupContainerMobile}
      handleModalClose={() => props.setOpenPaymentModal(false)}
    >
      {isLoading ? <PaymentModalLoader /> : renderPaymentDetails()}
    </MaterialModalPopup>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentModal);
