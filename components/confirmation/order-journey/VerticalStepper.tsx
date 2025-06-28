import React, { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

import { useDispatch } from 'react-redux';
import { setOpenPaymentModal } from '../../../redux/slices/config';
import { setRFQPendingOrder } from '../../../redux/slices/orders';

import Image from '../../primitives/Image';
import Button from '../../primitives/Button';
import BottomSwitch from '../../investment-success/MobileButtonSwitch';
import UtrFormModal from '../../rfq/UtrModal';
import {
  RenderBankDetails,
  RenderInstructionTxt,
  RenderInstructions,
} from '../../investment-overview/neft-tab';

import {
  pendingInvestmentModalDetail,
  rtgsBankDetailList,
} from '../../../utils/investment';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { PendingRfqOrderContext } from '../../../pages/confirmation';

import classes from './OrderJourney.module.css';
import {
  dateFormatter,
  formatDateMonth,
  isToday,
} from '../../../utils/dateFormatter';

const GenericModal = dynamic(
  () => import('../../user-kyc/common/GenericModal'),
  {
    ssr: false,
  }
);

export const RenderBankDetailModal = (props) => {
  return (
    <div className={`flex direction-column ${classes.Wrapper} `}>
      <p className={classes.PayTitle}>Pay to Account</p>
      <RenderBankDetails neftDetails={props?.neftDetails} />
      <RenderInstructionTxt />
      <div className={classes.Instructions}>
        <RenderInstructions
          settlementDate={props?.settlementDate}
          totalPayableAmount={props?.totalPayableAmount}
        />
      </div>
    </div>
  );
};

const RenderPendingOrderModalTitle = () => {
  return (
    <>
      <span>Order Placed! </span> <br />
      <span>Pay on Settlement day</span>
    </>
  );
};

export const RenderRtgsDetailList = (props) => {
  const { settlementDate, amount } = props || {};
  return (
    <ul className={`${classes.rtgsList} flex direction-column`}>
      {rtgsBankDetailList({ settlementDate, amount })?.map((ele) => {
        return (
          <li className="flex" key={`${ele?.label}`}>
            <span className={`flex-one ${classes.rtgsLabel}`}>
              {ele?.label}
            </span>
            <span className={` ${classes.rtgsValue}`}>{ele?.value}</span>
          </li>
        );
      })}
    </ul>
  );
};

export const PayNowButton = ({
  btnTxt = 'Pay Now',
  handleBtnClick,
  isLoading = false,
}) => {
  return (
    <Button
      width="150px"
      className={classes.PayNowBtn}
      isLoading={isLoading}
      onClick={handleBtnClick}
    >
      {btnTxt}
    </Button>
  );
};

export const VerticalStepper = () => {
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showNeftPendingModal, setShowNeftPendingModal] = useState(false);
  const [showBankDetailModal, setShowBankDetailModal] = useState(false);
  const [showUtrModal, setShowUtrModal] = useState(false);

  const pendingRfqOrderData = useContext(PendingRfqOrderContext) as any;

  const {
    status,
    orderPaymentDate,
    orderTransferInitiationDate,
    orderSecuritiesTransferDate,
    amoNextOpenDate,
    amount,
    bankName,
    ifscCode,
    accountNo,
    beneficiaryName,
    accountType,
    settlementDate,
    paymentMode,
    transactionID,
    isAmo,
    paymentRefID,
  } = pendingRfqOrderData;

  const router = useRouter();
  const dispatch = useDispatch();

  const isExpire = ['payment_expired', 'rejected', 'expired'].includes(status);
  const isPaymentPending = [
    'accepted',
    'payment_failed',
    'payment_initiated',
  ].includes(status);
  const isPaymentSuccess = status === 'payment_received';

  useEffect(() => {
    const modes = ['upi', 'netBanking'];
    if (paymentMode === 'offline') {
      setShowNeftPendingModal(true);
    } else if (isPaymentPending && modes.includes(paymentMode)) {
      // when payment is pending and payment mode either upi or netBanking then only pending popup will show
      setShowPendingModal(true);
    }
  }, [isPaymentPending, paymentMode]);

  const paymentStepSubTitle = () => {
    if (isPaymentSuccess) {
      return 'Your payment has been sent to exchange';
    }
    if (isExpire) {
      return 'Payment request for your order has expired';
    }
    return `Awaiting confirmation. Please pay by ${dayjs(
      orderPaymentDate
    ).format('DD MMM YYYY, hh:mmA')} if not paid`;
  };

  const paymentOrderJourneySteps = [
    {
      title: 'Order Status',
      subTitle: isAmo
        ? 'Your After Market Order has been placed'
        : `Placed with Exchange`,
      isPending: false,
      iconType: 'success',
    },
    {
      title: `Payment Status ${isExpire ? ' - Expired' : ''}`,
      subTitle: paymentStepSubTitle(),
      statusIcon: `${GRIP_INVEST_BUCKET_URL}icons/PendingStatus.svg`,
      showBtn: true,
      showAmoSubtitle: isAmo && !paymentRefID,
      isPending: false,
      iconType: isPaymentSuccess ? 'success' : '',
    },
    {
      title: 'Transfer Initiation',
      subTitle: `Will be initiated by  ${dayjs(
        orderTransferInitiationDate
      ).format('DD MMM YYYY, hh:mmA')}`,
      isPending: !isPaymentPending,
    },
    {
      title: 'Securities Transfer',
      subTitle: `You’ll receive Securities in your Demat by ${dayjs(
        orderSecuritiesTransferDate
      ).format('DD MMM YYYY, hh:mmA')}`,
      isPending: !isPaymentPending,
    },
  ];

  const stepCount = paymentOrderJourneySteps.length;

  const nextStep = (): [string, () => void, boolean] => {
    return [
      'View Portfolio',
      () => {
        router.push('/portfolio#my_investments');
      },
      false,
    ];
  };

  const handlePayNowClick = () => {
    setShowPendingModal(false);
    dispatch(setOpenPaymentModal(true));
    dispatch(setRFQPendingOrder(pendingRfqOrderData));
  };

  const visitPortfolio = () => {
    router.push('portfolio#my_investments');
  };

  const handleShowPendingModal = () => setShowPendingModal((pre) => !pre);

  const handleShowNeftPendingModal = () =>
    setShowNeftPendingModal((pre) => !pre);

  const handeUtrModal = () => {
    setShowNeftPendingModal(false);
    setShowUtrModal(true);
  };

  const handleBenificiaryDetail = () => {
    setShowNeftPendingModal((pre) => !pre);
    setShowBankDetailModal((pre) => !pre);
  };

  const handleShowBankDetailModal = () => setShowBankDetailModal((pre) => !pre);

  const pendingInvestmentModal = pendingInvestmentModalDetail({
    settlementDate,
  });

  const neftDetails = {
    bankName,
    ifscCode,
    accountNo,
    beneficiaryName,
    accountType,
  };

  const isTodaySettlementDate = isToday(settlementDate);

  const renderStepIcon = (statusIcon: string, iconType) =>
    statusIcon || iconType ? (
      <>
        {iconType === 'success' ? (
          <span
            style={{
              color: 'var(--gripPrimaryGreen, #00b8b7)',
              fontSize: 20,
            }}
            className={`icon-check-circle`}
          />
        ) : (
          <div className={classes.StepIcon}>
            <span className={classes.orderStatusIcon}>
              <Image src={statusIcon} alt="Check" />
            </span>
          </div>
        )}
      </>
    ) : (
      <div className={classes.StepIndicator}></div>
    );

  const renderStepContentSubTitle = (step: any) =>
    step.showAmoSubtitle ? (
      <p className={`${classes.StepContentSubTitle} ${classes.amoSubtitle}`}>
        As payments are handled by NSE directly, you’ll receive payment link
        from{' '}
        <strong>invest@gripinvest.in and via Grip’s official WhatsApp</strong>{' '}
        when the market opens at
        {` 9:00AM on ${dateFormatter({
          dateTime: amoNextOpenDate,
          timeZoneEnable: true,
          dateFormat: formatDateMonth,
        })}.`}
      </p>
    ) : (
      <p className={classes.StepContentSubTitle}>{step.subTitle}</p>
    );

  return (
    <div className={classes.VerticalStepper}>
      {paymentOrderJourneySteps.map((step, index) => (
        <div
          key={`stepper__${step?.title}`}
          className={`${classes.RowStepper}`}
        >
          <div className={'flex-column'}>
            {renderStepIcon(step?.statusIcon, step?.iconType)}
            <div
              className={`${
                index + 1 !== stepCount ? classes.StepperLine : ''
              }`}
            ></div>
          </div>
          <div className={`${classes.StepContent} `}>
            <div style={{ flex: 1 }}>
              <p
                className={`${classes.StepContentTitle} ${
                  step?.isPending ? classes.pendingTitle : ''
                }`}
              >
                {step.title}
              </p>
              {renderStepContentSubTitle(step)}
            </div>

            {step?.showBtn ? (
              <>
                {isPaymentSuccess || (isAmo && !paymentRefID) ? (
                  <PayNowButton
                    btnTxt="View Portfolio"
                    handleBtnClick={visitPortfolio}
                  />
                ) : isPaymentPending ? (
                  <PayNowButton
                    handleBtnClick={handlePayNowClick}
                    isLoading={Boolean(!settlementDate)}
                  />
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ))}
      {!isPaymentSuccess && (
        <div className={classes.bottomSwitch}>
          <BottomSwitch
            nextStep={nextStep}
            gotoAssets={() => router.push('/assets')}
          />
        </div>
      )}
      <GenericModal
        showModal={!!settlementDate && showPendingModal}
        icon={'PendingPayment.svg'}
        title={pendingInvestmentModal?.title ?? ''}
        subtitle={pendingInvestmentModal?.subtitle ?? ''}
        drawerExtraClass={classes.Drawer}
        hideClose={false}
        btnText="Retry Payment"
        btnSecText="I’ll Complete Investment Later"
        BtnSecVariant="Secondary"
        handleBtnClick={handlePayNowClick}
        handleSecBtnClick={handleShowPendingModal}
        handleModalClose={handleShowPendingModal}
      />
      <GenericModal
        showModal={!!settlementDate && showNeftPendingModal}
        icon={'PendingPayment.svg'}
        title={<RenderPendingOrderModalTitle />}
        drawerExtraClass={classes.Drawer}
        hideClose={false}
        btnText="View Beneficiary Details"
        btnSecText={`${
          isTodaySettlementDate ? "I've paid via NEFT/RTGS" : 'Okay, understood'
        }`}
        btnVariant="Secondary"
        // BtnSecVariant="Secondary"
        handleBtnClick={handleBenificiaryDetail}
        handleSecBtnClick={
          isTodaySettlementDate ? handeUtrModal : handleShowNeftPendingModal
        }
        handleModalClose={handleShowNeftPendingModal}
      >
        <RenderRtgsDetailList settlementDate={settlementDate} amount={amount} />
      </GenericModal>

      <GenericModal
        showModal={!!settlementDate && showBankDetailModal}
        hideIcon={true}
        drawerExtraClass={classes.Drawer}
        hideClose={false}
        handleModalClose={handleShowBankDetailModal}
      >
        <RenderBankDetailModal
          neftDetails={neftDetails}
          settlementDate={settlementDate}
          totalPayableAmount={amount}
        />
      </GenericModal>
      <UtrFormModal
        showModal={showUtrModal}
        setShowUtrModal={setShowUtrModal}
        transactionId={transactionID}
      />
    </div>
  );
};
