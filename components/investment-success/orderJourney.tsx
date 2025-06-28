import React from 'react';
import dayjs from 'dayjs';

import TooltipCompoent from '../../components/primitives/TooltipCompoent/TooltipCompoent';
import Image from '../../components/primitives/Image';
import Button from '../../components/primitives/Button';
import CustomizedSteppers from '../common/Stepper';

import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../utils/string';
import {
  checkInvestmentDateExistsInHolidays,
  isWeekend,
} from '../../utils/bonds';
import { orderJourneyData } from './utils';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

import { classes } from './orderJourneyStyle';
import styles from '../../styles/Investment/OrderJourney.module.css';

const renderLabel = (orderElement: any, isDesktop: boolean, props: any) => {
  return (
    <div
      className={`flex ${styles.singleOrderStatus} ${
        isDesktop ? 'direction-column justify-start' : 'justify-between'
      }`}
    >
      <div
        className={`flex ${isDesktop ? ' justify-center' : 'justify-start'}`}
      >
        <div
          className={`${styles.title} ${
            props?.isScondarySdiOrderPending && props?.isScondarySdiOrder
              ? styles.SDITitle
              : ''
          }`}
        >
          {orderElement?.title}{' '}
          <TooltipCompoent toolTipText={orderElement?.info?.text}>
            <span className={styles.infoIcon}>
              <span className={`icon-info ${styles.Icon}`} />
            </span>
          </TooltipCompoent>
        </div>
      </div>

      {props?.isScondarySdiOrderPending && !props?.isScondarySdiOrder ? null : (
        <div className={styles.date}>{orderElement?.date}</div>
      )}
    </div>
  );
};

const OrderJourney = (props: any) => {
  const [text = '', handler, loading] = props?.nextStep();
  const isMobile = useMediaQuery();

  const getInvestmentDate = (investmenDate: string) => {
    let date = investmenDate;
    while (
      checkInvestmentDateExistsInHolidays(props?.holidays, date) ||
      isWeekend(date)
    ) {
      date = dayjs(date).add(1, 'day').format();
    }
    return date;
  };

  const getOrderStatusDate = (el: any, index: number) => {
    const receiptOfSecuritiesTime = 'Up to 5 working days';
    let investmenDate = dayjs().add(1, 'days').format();
    let date;
    switch (index) {
      case 0: {
        date = dayjs().format('MMM DD, YYYY');
        break;
      }
      case 1: {
        date = getInvestmentDate(investmenDate);
        date = dayjs(date).format('MMM DD, YYYY');
        break;
      }
      case 2: {
        date = receiptOfSecuritiesTime;
        break;
      }
      default:
        date = dayjs().format('MMM DD, YYYY');
    }

    // CHECK IF SDI SECONDARY NOT PAYMENT GATEWAY AND PENDING ORDER
    if (props?.isScondarySdiOrderPending && props?.isScondarySdiOrder) {
      switch (index) {
        case 0: {
          date = dayjs().format('MMM DD, YYYY');
          break;
        }
        case 1: {
          date = props?.orderData?.orderConfirmationDueDate;
          date = dayjs(date).format('MMM DD, YYYY');
          break;
        }
        case 2: {
          date = receiptOfSecuritiesTime;
          break;
        }
        default:
          date = dayjs().format('MMM DD, YYYY');
      }
    }

    return {
      ...el,
      date: date,
    };
  };

  const desktopView = (isDesktop: boolean) => {
    return (
      <div>
        <div className={classes.orderJourneytitle}>Order Journey</div>
        <div className={styles.mainContainer}>
          <CustomizedSteppers
            orientation={isDesktop ? 'horizontal' : 'vertical'}
            steps={orderJourneyData(
              props?.isScondarySdiOrder,
              props?.pageData[1]?.objectData,
              props?.isScondarySdiOrderPending,
              props?.orderData?.orderConfirmationDueDate
            ).map((el, index) => getOrderStatusDate(el, index))}
            classes={{
              stepLabelRoot: classes.stepLabelRoot,
              stepRoot: classes.stepRoot,
              completedStepRoot: classes.completedStepRoot,
              stepLabel: classes.stepLabel,
            }}
            hideStepConnector={!isDesktop}
            customizedLabel={(el) => renderLabel(el, isDesktop, props)}
            activeStep={1}
            isSDIPendingOrder={
              props?.isScondarySdiOrder && props?.isScondarySdiOrderPending
            }
          />

          {/* HIDE BUTTON FOR SDI SECONDARY PG PENDING ORDER */}
          {props?.isScondarySdiOrder && !props?.isScondarySdiOrderPending && (
            <div className={`flex justify-center ${styles.buttonHolder}`}>
              <Button
                width={'max-content'}
                onClick={handler}
                isLoading={loading}
              >
                {!loading ? (
                  <div className={styles.buttonContainer}>
                    {text}
                    <Image
                      src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/forwardIcon.svg`}
                      width={20}
                      height={20}
                      alt="forwardIcon"
                      layout="fixed"
                    />
                  </div>
                ) : (
                  <></>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const mobileView = (isDesktop: boolean) => {
    return (
      <>
        <div className={classes.orderJourneytitle}>Order Journey</div>
        <div className={styles.mainContainer}>
          <CustomizedSteppers
            orientation={isDesktop ? 'horizontal' : 'vertical'}
            steps={orderJourneyData(
              props?.isScondarySdiOrder,
              props?.pageData[1]?.objectData,
              props?.isScondarySdiOrderPending,
              props?.orderData?.orderConfirmationDueDate
            ).map((el, index) => getOrderStatusDate(el, index))}
            classes={{
              stepLabelRoot: classes.stepLabelRoot,
              stepRoot: classes.stepRoot,
              completedStepRoot: classes.completedStepRoot,
              stepLabel: classes.stepLabel,
            }}
            hideStepConnector={!isDesktop}
            customizedLabel={(el) => renderLabel(el, isDesktop, props)}
            activeStep={1}
            isSDIPendingOrder={
              props?.isScondarySdiOrder && props?.isScondarySdiOrderPending
            }
          />
        </div>
      </>
    );
  };

  return isMobile ? mobileView(false) : desktopView(true);
};

export default OrderJourney;
