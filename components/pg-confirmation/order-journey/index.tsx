import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import CircularProgress from '@mui/material/CircularProgress';

// Primitives
import Image from '../../primitives/Image';
import BottomSwitch from '../../investment-success/MobileButtonSwitch';

// utils
import { orderJourneySteps, paymentMethodMapping } from './orderJourneyUtils';
import { dateFormatter, formatDate } from '../../../utils/dateFormatter';
import { isGCOrder } from '../../../utils/gripConnect';

// Contexts
import { PendingPgOrderContext } from '../../../pages/pg-confirmation';

// Styles
import classes from './OrderJourney.module.css';

// other compenents
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';
import { AssetDetailsPGMMobile } from '../order-payment/assetDetailPgMobile';
import EscalateIssue from '../escalate-issue';
import PaymentStatusReason from '../payment-status-description';
import PoweredByGrip from '../../primitives/PoweredByGrip';

export const OrderJourneyComponent = () => {
  const data = useContext(PendingPgOrderContext);

  const {
    loading,
    dematTransferDate,
    isProcessing,
    paymentMethod,
    orderSettlementDate,
    paymentStatus,
    amoNextOpenDate,
    isMarketOpen,
    isUnlistedPtc,
    isAmo,
    isFdOrder,
    firstInterestDate,
    orderTransferInitiationDate,
    redirectToAssets,
    redirectToPortfolio,
    isRfq,
    financeProductType,
  } = data;

  const router = useRouter();

  const paymentOrderJourneySteps = orderJourneySteps({
    dematTransferDate,
    isProcessing,
    paymentMethod,
    orderSettlementDate,
    amoNextOpenDate,
    isMarketOpen,
    isUnlistedPtc,
    isAmo,
    isFdOrder,
    firstInterestDate,
    orderTransferInitiationDate,
    isRfq,
    financeProductType,
  });

  const stepCount = paymentOrderJourneySteps?.length;

  const nextStepPortfolio = (): [string, () => void, boolean] => {
    return ['View Portfolio', redirectToPortfolio, false];
  };

  const RenderBottomSwitch = (
    nextStep: () => [string, () => void, boolean]
  ) => {
    const isShowGCLogo = isGCOrder();
    return (
      <div className={classes.bottomSwitch}>
        <BottomSwitch
          nextStep={nextStep}
          gotoAssets={() => router.push('/assets')}
          showSkipButton={false}
          showForwardIcon={false}
          className={isShowGCLogo ? classes.BottomButtonContainer : ''}
        >
          {isShowGCLogo ? <PoweredByGrip /> : ''}
        </BottomSwitch>
      </div>
    );
  };

  const renderStepIcon = (step) => {
    if (step?.isProcessing === 1) {
      return (
        <CircularProgress size={20} className={classes.CircularProgress} />
      );
    }

    return step?.statusIcon || step?.iconType ? (
      <>
        {step?.iconType === 'success' ? (
          <span
            style={{
              color: 'var(--gripPrimaryGreen, #00b8b7)',
              fontSize: 20,
            }}
            className={`icon-check-circle`}
          />
        ) : (
          <div className={`flex ${classes.StepIcon}`}>
            <span className={classes.orderStatusIcon}>
              <Image src={step?.statusIcon} alt="Check" />
            </span>
          </div>
        )}
      </>
    ) : (
      <div className={`flex ${classes.StepIndicator}`}></div>
    );
  };

  const RenderTitleAndSubTitle = ({ step, index }) => {
    return (
      <div className={`flex ${classes.StepContent} `}>
        <div className={`flex-one`}>
          <p
            className={`${classes.StepContentTitle} ${
              index + 1 === stepCount ? classes.pendingTitle : ''
            }`}
          >
            {step?.title}
          </p>
          <p
            className={`${classes.StepContentSubTitle} ${
              index + 1 === stepCount ? classes.pendingTitle : ''
            }`}
          >
            {step?.subTitle}
          </p>
        </div>
      </div>
    );
  };

  const RenderMobileStepperContent = () => {
    return (
      <div className={`flex-column ${classes.MobileStepper}`}>
        {paymentOrderJourneySteps.map((step, index) => (
          <div
            key={`stepper${index}`}
            className={`flex ${classes.MobileRowStepper}`}
          >
            <div className="flex-column">
              {renderStepIcon(step)}
              <div
                className={`${
                  index + 1 !== stepCount ? classes.MobileStepperLine : ''
                }`}
              ></div>
            </div>
            <RenderTitleAndSubTitle step={step} index={index} />
          </div>
        ))}
      </div>
    );
  };

  const RenderWebStepperContent = () => {
    return (
      <div className={`flex ${classes.Stepper}`}>
        {paymentOrderJourneySteps.map((step, index) => (
          <div
            key={`stepper${index}`}
            className={`flex-column ${classes.RowStepper}`}
          >
            <div className={`flex ${classes.IconContent}`}>
              <div
                className={`${index === 0 ? classes.Hide : ''} ${
                  classes.StepperLine
                }`}
              ></div>
              {renderStepIcon(step)}
              <div
                className={`${index + 1 === stepCount ? classes.Hide : ''} ${
                  classes.StepperLine
                }`}
              ></div>
            </div>
            <RenderTitleAndSubTitle step={step} index={index} />
          </div>
        ))}
      </div>
    );
  };

  const Stepper = () => {
    if (loading) {
      return (
        <>
          <CustomSkeleton
            styles={{
              width: '100%',
              height: 100,
            }}
          />
          <br />
          <CustomSkeleton
            styles={{
              width: '100%',
              height: 225,
            }}
          />
          <br />
          <CustomSkeleton
            styles={{
              width: '100%',
              height: 400,
            }}
          />
        </>
      );
    }

    if (['pending'].includes(paymentStatus)) {
      return (
        <>
          <PaymentStatusReason />
          {RenderBottomSwitch(() => [
            'Explore More Opportunities',

            redirectToAssets,
            false,
          ])}
        </>
      );
    }

    if (['failed'].includes(paymentStatus)) {
      return (
        <>
          <PaymentStatusReason />
          <EscalateIssue />
        </>
      );
    }

    let orderSuTitle =
      paymentMethod === 'offline'
        ? `You’ve selected NEFT/RTGS/IMPS. Make sure to complete your payment to avoid getting debarred from the Debt Segment.`
        : `Payment received via ${
            paymentMethodMapping[paymentMethod]
          }. Securities will reach your Demat account
    by 7 PM on ${dateFormatter({
      dateTime: dematTransferDate,
      dateFormat: formatDate,
    })}`;

    if (isUnlistedPtc) {
      orderSuTitle =
        'Securities will reach your Demat account in upto 5 working days';
    }

    return (
      <div className={`flex-column ${classes.Container}`}>
        <div className={`flex-column ${classes.OrderJourneyHeader}`}>
          <div className={classes.OrderTitle}>Order Journey</div>
          {!isFdOrder ? (
            <div className={classes.OrderSubTitle}> {orderSuTitle}</div>
          ) : null}
        </div>
        <RenderWebStepperContent />
        <RenderMobileStepperContent />
        {RenderBottomSwitch(nextStepPortfolio)}
      </div>
    );
  };

  return (
    <div className={`flex-column ${classes.OrderJourneyContainer}`}>
      <div className={classes.AssetDetailsPGMain}>
        <AssetDetailsPGMMobile />
      </div>
      <Stepper />
    </div>
  );
};
