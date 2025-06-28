import React from 'react';
import { CircularProgress } from '@mui/material';
import dompurify from 'dompurify';

import Button from '../primitives/Button';
import Image from '../primitives/Image';
import VideoComponent from '../primitives/VideoComponent/VideoComponent';
import { copy } from '../../utils/customHooks/useCopyToClipBoard';

import { isKycPending, isKycUnderVerification } from '../../utils/user';
import {
  GRIP_INVEST_BUCKET_URL,
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
} from '../../utils/string';
import { sdiSecondaryPendingOrderNextStep } from './utils';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

import styles from '../../styles/Investment/NextSteps.module.css';

const NextSteps = (props: any) => {
  const sanitizer = dompurify.sanitize;
  const isMobile = useMediaQuery();
  const data = props?.data;
  // NOSONAR: This line is commented for future use
  // const esign = data?.shouldEsign();
  const esignMca = data?.shouldEsignMCA();
  const isCommercialOrder = data?.isCommercialOrder;
  const orderData = props?.orderData;

  const getNextStepText = () => {
    const { order, userData, kycDetails } = data;
    const { hasLlp, isOrderSuccessful, shouldEsignDocuments, partnerType } =
      order;
    if (isOrderSuccessful) {
      if (
        userData &&
        !isKycPending(userData, kycDetails) &&
        isKycUnderVerification(userData)
      ) {
        return `As your KYC is under review`;
      } else if (hasLlp && (shouldEsignDocuments || esignMca)) {
        return 'eSign Investment Agreement';
      } else if (hasLlp && !shouldEsignDocuments) {
        return `As you have already eSigned an agreement with ${order.partnerName} before.`;
      } else if (hasLlp && partnerType === 2) {
        return `As you are a designated partner, you don't need to sign the LLP Agreement.`;
      } else {
        return `Go to portfolio`;
      }
    } else {
      return 'false';
    }
  };

  // NOSONAR: This function is commented for future use
  const renderEsign = () => {
    return (
      <>
        <div className={styles.stepperContainer}>
          <Image
            src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/esign.svg`}
            height={48}
            width={48}
            alt="esign"
            layout="fixed"
          />

          <span className={styles.esignText}>eSign Investment Agreement</span>
        </div>
        {!data?.esignLoading ? (
          <Button
            className={styles.RedeemBtn}
            width={134}
            onClick={data?.fetchEsignDoc}
          >
            <div className={styles.buttonContainer}>
              Proceed
              <Image
                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/forwardIcon.svg`}
                width={20}
                height={20}
                layout="fixed"
                alt="forwardIcon"
              />
            </div>
          </Button>
        ) : (
          <CircularProgress size={24} />
        )}
      </>
    );
  };

  const secondarySdiOrderNextStepBankUI = (bankDetails = []) => {
    if (bankDetails.length === 0) {
      return;
    }
    return (
      <div className={styles.secondarySdiOrderBankDetails}>
        {bankDetails.map((ele) => (
          <div key={`bankDetails_${ele?.title}`}>
            {ele?.title}:{' '}
            <b>
              {ele?.value}{' '}
              <span
                className={styles.CopyLink}
                onClick={() => copy(ele?.value, 'Copied to Clipboard')}
              >
                <Image
                  src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/CopyIcon.svg`}
                  alt="CopyIcon"
                  width={18}
                  height={18}
                  layout="fixed"
                />
              </span>
            </b>
          </div>
        ))}
      </div>
    );
  };

  const secondarySdiOrderNextStep = () => {
    return (
      <>
        <div className={styles.secondarySdiContainer}>
          {sdiSecondaryPendingOrderNextStep(
            data?.order?.amount,
            orderData?.orderConfirmationDueDate
          )?.map((el, index) => (
            <div
              key={`listItem_${el?.id}`}
              className={`flex ${styles.secondarySdiTextContainer}`}
            >
              <div className={styles.secondarySdiIndex}>{index + 1}</div>{' '}
              <div>
                <div
                  className={styles.secondarySdiOrderStepsHeader}
                  dangerouslySetInnerHTML={{
                    __html: sanitizer(el?.header),
                  }}
                />
                <div
                  className={styles.secondarySdiText}
                  dangerouslySetInnerHTML={{
                    __html: sanitizer(el?.body),
                  }}
                />
                {secondarySdiOrderNextStepBankUI(el?.bankDetails)}
                <div
                  className={styles.secondarySdiText}
                  dangerouslySetInnerHTML={{
                    __html: sanitizer(el?.bodyBottom),
                  }}
                />
                <VideoComponent link={el?.videoLink} />
                {el?.note && (
                  <div
                    className={styles.secondarySdiText}
                    dangerouslySetInnerHTML={{
                      __html: sanitizer(el?.note),
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const getNextStep = () => {
    if (isCommercialOrder) {
      return renderCommercialOrder();
    }
    // else if (esign || esignMca) {
    //   return renderEsign();
    // }
    else if (props?.isScondarySdiOrder) {
      return secondarySdiOrderNextStep();
    } else {
      return renderAllDone();
    }
  };

  const renderAllDone = () => {
    return (
      <>
        <div className={styles.stepperContainer}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}orders/thumbsUp.png`}
            height={48}
            width={48}
            alt="thumbsUp"
            layout="fixed"
          />
          <div className={styles.textContainer}>
            <span className={styles.esignText}>All done</span>
            <span className={styles.esignSubText}>{getNextStepText()}</span>
          </div>
        </div>
        <Button
          className={styles.RedeemBtn}
          width={'auto'}
          onClick={data?.showPortfolio}
        >
          <div className={styles.buttonContainer}>
            View Portfolio
            <Image
              src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/forwardIcon.svg`}
              width={20}
              height={20}
              alt="forwardIcon"
              layout="fixed"
            />
          </div>
        </Button>
      </>
    );
  };

  const renderCommercialOrder = () => {
    const { content = '' } = props?.data?.order?.spvCategoryBank || {};
    const list = content?.split(';') || [];
    return (
      <div className={styles.nextStepBlock}>
        {list?.map((data: any, index: number) => (
          <div key={`val__${data}`} className={styles.commercialOrderRow}>
            <div className={styles.number}>
              <span>{index + 1}</span>
            </div>
            <div>
              <span> {data}</span>
            </div>
          </div>
        ))}
        {!isMobile && (
          <Button
            className={styles.RedeemBtn}
            width={'fit-content'}
            onClick={data?.showPortfolio}
          >
            <div className={styles.buttonContainer}>
              View Portfolio
              <Image
                src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}investment-success/forwardIcon.svg`}
                width={20}
                height={20}
                alt="forwardIcon"
                layout="fixed"
              />
            </div>
          </Button>
        )}
      </div>
    );
  };
  const desktopView = () => {
    const renderStep = getNextStep();
    return (
      <div className={styles.mainContainer}>
        <span className={styles.nextStepsText}>Next Steps</span>
        {renderStep && <div className={styles.subContainer}>{renderStep}</div>}
      </div>
    );
  };

  const mobileView = () => {
    if (isCommercialOrder || props?.isScondarySdiOrder)
      return (
        <div
          className={`${styles.mainContainer} ${
            props?.isScondarySdiOrder && styles.ScondarySdiNextStep
          }`}
        >
          <span className={styles.nextStepsText}>Next Steps</span>
          {props?.isScondarySdiOrder ? (
            <div className={styles.secondarySdiHeaderDivider} />
          ) : null}
          <div className={styles.subContainer}>{getNextStep()}</div>
        </div>
      );

    return null;
  };

  return isMobile ? mobileView() : desktopView();
};

export default NextSteps;
