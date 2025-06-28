//Node Modules
import React from 'react';
import { useRouter } from 'next/router';

//COmponents
import Image from '../../primitives/Image';
import CircularProgress from '@mui/material/CircularProgress';
import { callErrorToast } from '../../../api/strapi';
import PartnerLogo from '../../assetsList/partnerLogo';
import ProgressBar from '../../primitives/ProgressBar/ProgressBar';
import SortBy from '../../primitives/SortBy/SortBy';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';

//Utils
import {
  financeProductTypeConstants,
  isAssetBonds,
  isAssetCommercialProduct,
  isAssetStartupEquity,
  isAssetInventory,
  isAssetLeasing,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import {
  getKycUrl,
  isKycPending,
  isKycUnderVerification,
} from '../../../utils/user';
import {
  ESIGN_LOADING_TIME,
  getPortfolioAssetDetailInfo,
  showModaltype,
} from '../../../utils/portfolio';
import {
  numberToIndianCurrencyWithDecimals,
  roundOff,
} from '../../../utils/number';
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import { bondOrderStatus } from '../../../utils/bonds';
import { dateFormatter, formatDate } from '../../../utils/dateFormatter';
import { trackEvent } from '../../../utils/gtm';
import { isMldProduct, isAifDeal } from '../../../utils/asset';
import { assetReturnCycle } from './utils';

//Redux
import {
  getDocumentDetails,
  getPartnerResignation,
} from '../../../redux/slices/orders';

//Hooks
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';

//Styles
import classes from './style.module.css';

const committedInvestment = (collectedAmount: any, totalAmount: any) => {
  if (collectedAmount && totalAmount) {
    return Math.min(
      parseInt(roundOff(((collectedAmount || 0) * 100) / totalAmount)),
      100
    );
  }
  return 0;
};

const InvestmentCardV2 = ({
  portfolio,
  className = '',
  isPortFolio = false,
  filterArr = [],
  sortByRef,
  renderAssetDocuments,
  handleCardAction = (ele: string) => {},
  handleCardBtnClick = (type: showModaltype, orderID?: string) => {},
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const [esignLoading, setEsignLoading] = React.useState(false);

  const isCorporateBondAsset = isAssetBonds(portfolio?.assetDetails);
  const isSDISecondaryAsset = isSDISecondary(portfolio?.assetDetails);
  const isStartupEquityAsset = isAssetStartupEquity(portfolio?.assetDetails);
  const isBondsAsset = isAssetBonds(portfolio?.assetDetails);
  const isCommercialProductAsset = isAssetCommercialProduct(
    portfolio?.assetDetails
  );
  const isLeasing = isAssetLeasing(portfolio?.assetDetails);
  const isInventory = isAssetInventory(portfolio?.assetDetails);

  const getPartnerLogoheight = () => (window.innerWidth < 768 ? 32 : 40);
  const getPartnerLogowidth = () => (window.innerWidth < 768 ? 100 : 130);
  const isReturnComplete =
    portfolio?.noOfReturnsScheduled === portfolio?.noOfReturnsReceived;

  const renderDealCompletePercentage = () => {
    return committedInvestment(
      portfolio?.totalAmtReceived,
      portfolio?.txns.reduce(
        (sum, transaction) => sum + transaction.expectedReturns,
        0
      )
    ) as unknown as number;
  };

  const isProductSE = () => {
    return (
      portfolio?.assetDetails?.financeProductType ===
      financeProductTypeConstants.startupEquity
    );
  };

  const isAssetReturnsCompleted = () => {
    return (
      Number(portfolio.tenure) === portfolio.noOfReturnsReceived ||
      (portfolio.noOfReturnsReceived === 1 &&
        portfolio.repaymentCycle === assetReturnCycle.OneTime)
    );
  };

  const renderExpectedReturns = () => {
    if (isProductSE()) {
      return 'On Exit';
    }
    if (isAssetReturnsCompleted()) {
      return '100% Complete';
    }
    return `${numberToIndianCurrencyWithDecimals(
      portfolio?.txns.reduce(
        (sum, transaction) => sum + transaction.expectedReturns,
        0
      )
    )}`;
  };

  const getReturnTypeTxt = () => {
    if (isCorporateBondAsset || isSDISecondaryAsset) {
      return 'Returns Schedule';
    }
    if (portfolio && isStartupEquityAsset) {
      return 'Transaction Info';
    }
    if (portfolio && portfolio.status === 'Confirmed') {
      return `Tentative Schedule`;
    }
    return `Payment Schedule`;
  };

  const getNextReturnDate = () => {
    return dateFormatter({
      dateTime: portfolio?.nextReturnDate,
      timeZoneEnable: true,
      dateFormat: formatDate,
    });
  };

  const getExpectedReturnsAmount = () => {
    if (renderDealCompletePercentage() === 100) {
      return '100% Complete';
    }
    if (isCorporateBondAsset || isSDISecondaryAsset) {
      return numberToIndianCurrencyWithDecimals(
        Number(
          portfolio?.txns.reduce(
            (sum, transaction) => sum + transaction.expectedReturns,
            0
          )
        )
      );
    }

    return renderExpectedReturns();
  };

  const handleScheduleClick = async () => {
    if (isStartupEquityAsset) {
      handleCardBtnClick('TRANSACTION');
    } else {
      handleCardBtnClick('SCHEDULE');
    }
  };

  const triggerKyc = () => {
    router.push(getKycUrl(user.userData));
    trackEvent('PendingAction_clicked_KYC_triggered', user.userData);
  };

  const stopEsignLoading = () => {
    setEsignLoading(false);
  };

  const verifyEsignDetails = (data: any, fileName: string, type?: string) => {
    PubSub.publish('openDigio', {
      redirectTo: '/portfolio#my_investments',
      type: type || 'order',
      openDigioModal: true,
      data: { ...data, fileName },
    });

    setTimeout(() => stopEsignLoading(), ESIGN_LOADING_TIME);
  };

  const failedEsign = (msg: string) => {
    callErrorToast(msg);
    stopEsignLoading();
  };

  const initiateEsign = () => {
    const { txns } = portfolio;
    setEsignLoading(true);
    const spreadTxns = [...txns];
    const sortedTransactions = spreadTxns.sort(
      (txn1: any, txn2: any) => txn2.orderDate - txn1.orderDate
    );
    const fileName = `Unsigned_${user.userData?.firstName}_${portfolio?.assetDetails?.assetName}`;

    dispatch(
      getDocumentDetails(
        portfolio?.assetID,
        verifyEsignDetails,
        failedEsign,
        fileName,
        sortedTransactions[0]?.orderID
      )
    );
  };

  const initiateResign = () => {
    const { txns } = portfolio;
    setEsignLoading(true);
    const spreadTxns = [...txns];
    const sortedTransactions = spreadTxns.sort(
      (txn1: any, txn2: any) => txn2.orderDate - txn1.orderDate
    );
    const fileName = `Unsigned_resignation_${user.userData?.firstName}_${portfolio?.assetDetails?.assetName}`;
    dispatch(
      getPartnerResignation(
        sortedTransactions[0]?.orderID,
        fileName,
        verifyEsignDetails,
        failedEsign
      )
    );
  };

  const pendingActions = () => {
    const renderResignation =
      portfolio.hasResignation &&
      portfolio.shouldResign &&
      !portfolio.isResigned;
    const kycUnderVerification: boolean = isKycUnderVerification(user.userData);
    if (isKycPending(user?.userData, user?.kycDetails)) {
      return {
        onClick: triggerKyc,
        text: 'Complete KYC',
      };
    } else if (
      (!portfolio.isSigned || renderResignation) &&
      kycUnderVerification
    ) {
      return {
        onClick: () => null,
        text: 'KYC Under Review',
        disabled: true,
      };
    } else if (!portfolio.isSigned && !isAifDeal(Number(portfolio.spvType))) {
      if (portfolio?.assetDetails?.hasLlp) {
        return {
          onClick: initiateEsign,
          tooltip: kycUnderVerification
            ? 'Will be enabled once kyc is verfied'
            : '',
          text: 'eSign LLP Agreement',
          disabled: kycUnderVerification,
        };
      }
      return {
        onClick: null,
        tooltip: 'We will notify you once enabled!',
        text: 'eSign LLP Agreement',
        disabled: true,
      };
    } else if (renderResignation) {
      return {
        onClick: initiateResign,
        tooltip: kycUnderVerification
          ? 'Will be enabled once kyc is verified'
          : '',
        text: 'eSign Partner Agreement',
        disabled: kycUnderVerification,
      };
    } else {
      return null;
    }
  };

  const getPortfolioStatus = () => {
    if (isAifDeal(Number(portfolio.spvType))) {
      return null;
    }
    const getAllAifStatus = portfolio?.txns?.map((t: any) => t.status);
    if (getAllAifStatus.includes('pending')) {
      return 'Pending';
    }
    return null;
  };

  const anyPendingAction = pendingActions();
  const portfolioStatus = getPortfolioStatus();

  const getUnits = () => {
    if (isCorporateBondAsset || isSDISecondaryAsset) {
      return (
        <>
          {portfolio?.noOfUnits} {isCorporateBondAsset ? 'Units' : 'Lots'}
        </>
      );
    }
    return null;
  };

  const renderFirstSection = () => {
    if (isProductSE()) {
      return null;
    }
    return (
      <div className={classes.Progress}>
        <div className={classes.ProgressHeader}>
          <span className={classes.Label}>Returns Received</span>
          <span className={classes.Amount}>
            {''}
            {numberToIndianCurrencyWithDecimals(portfolio?.totalAmtReceived)} (
            {renderDealCompletePercentage()}%)
          </span>
        </div>
        <ProgressBar progressWidth={renderDealCompletePercentage()} />
      </div>
    );
  };

  const renderPropertyJoinTxt = () => {
    if (isBondsAsset || isCommercialProductAsset) {
      return 'and';
    }
    if (isStartupEquityAsset) {
      return 'by';
    }
    return 'for';
  };

  const renderOtherDetails = () => {
    const assetDetails = getPortfolioAssetDetailInfo(portfolio);
    return (
      <p>
        {isBondsAsset || isStartupEquityAsset ? '' : 'at'}{' '}
        {assetDetails[0]?.value}
        {assetDetails[0]?.suffix} {assetDetails[0]?.label}{' '}
        {/* COUPON RATE AND MLD CHECK */}
        {assetDetails[1]?.label === 'Coupon Rate' &&
        (!assetDetails[1]?.value || isMldProduct(portfolio)) ? (
          ''
        ) : (
          <>
            {assetDetails[1]?.value ? renderPropertyJoinTxt() : null}{' '}
            {assetDetails[1]?.value}
            {assetDetails[1]?.suffix} {assetDetails[1]?.label}
          </>
        )}
      </p>
    );
  };

  const handleDealStatusClass = (statusText: string) => {
    if (statusText === 'Initiated') {
      return classes.Initiate;
    }
    if (statusText === 'Confirmed') {
      return classes.Confirmed;
    }
    return '';
  };

  const renderCardPendingAction = () => {
    if (
      (isLeasing ||
        isInventory ||
        isStartupEquityAsset ||
        isCommercialProductAsset) &&
      anyPendingAction?.text === 'Complete KYC'
    ) {
      return null;
    }
    if (anyPendingAction && !isCorporateBondAsset && !isSDISecondaryAsset) {
      return (
        <div className={classes.Action}>
          <div className={classes.ActionLabel}>
            <span
              className={`icon-info`}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--gripBlue, #00357c)',
              }}
            />
            <span className={classes.ActionName}>Pending Action:</span>
          </div>
          <div
            className={classes.ActionType}
            onClick={() => {
              !anyPendingAction.disabled && anyPendingAction?.onClick();
            }}
            style={{
              cursor: anyPendingAction.disabled ? 'not-allowed' : 'pointer',
              opacity: anyPendingAction.disabled ? '50%' : '100%',
            }}
          >
            <span>
              {esignLoading ? (
                <CircularProgress
                  size={12}
                  className={classes.CircularProgress}
                />
              ) : (
                anyPendingAction?.text
              )}
            </span>
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}commons/ArrowRight.svg`}
              alt="Arrow Right"
              width={16}
              height={12}
              layout="fixed"
            />
          </div>
        </div>
      );
    }
    return null;
  };

  const renderBondSDISecondaryAction = () => {
    if (
      (!!isCorporateBondAsset || !!isSDISecondaryAsset) &&
      !!isPortFolio &&
      !!portfolio?.bondStatus
    ) {
      return (
        <div
          className={`${classes.Action} ${
            classes.justifyStart
          } ${handleDealStatusClass(
            bondOrderStatus[portfolio?.bondStatus]?.statusText
          )}`}
        >
          <div className={classes.BondStatusText}>
            {bondOrderStatus[portfolio?.bondStatus]?.statusText}
          </div>

          <div className={classes.ActionLabel}>
            {bondOrderStatus[portfolio?.bondStatus]?.infoText && (
              <TooltipCompoent
                toolTipText={bondOrderStatus[portfolio?.bondStatus]?.infoText}
              >
                <span
                  className={`icon-info`}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--gripBlue, #00357c)',
                  }}
                />
              </TooltipCompoent>
            )}
            <span className={classes.ActionName}>
              {bondOrderStatus[portfolio?.bondStatus]?.infoTitle}
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderPortfolioStatus = () => {
    if (portfolioStatus) {
      return (
        <div className={`${classes.Action} ${classes.YetToComplete}`}>
          <span className={classes.ActionName}>
            Yet to Complete Transaction
          </span>
        </div>
      );
    }
    return (
      <>
        {renderBondSDISecondaryAction()}
        {renderCardPendingAction()}
      </>
    );
  };

  return (
    <>
      <div className={`${classes.Card} ${handleExtraProps(className)}`}>
        <div className={classes.Header}>
          <PartnerLogo
            asset={portfolio}
            showUnit={false}
            isDiscoveryPage={true}
            height={getPartnerLogoheight()}
            width={getPartnerLogowidth()}
            customContainerClass={classes.PartnerLogo}
          />
          <div className={classes.HeaderRight}>
            <span className={classes.DealCode}>
              Deal Code : {portfolio?.assetDetails?.assetName}
            </span>
            <span className={classes.Units}>{getUnits()}</span>
          </div>
        </div>
        <div className={classes.Body}>
          <div className={classes.ReturnsWrapper}>
            <div className={classes.Returns}>
              <div className={classes.ReturnItem}>
                <span className={classes.Amount}>
                  {numberToIndianCurrencyWithDecimals(
                    portfolio?.txns.reduce(
                      (sum, transaction) => sum + transaction.orderAmount,
                      0
                    )
                  )}
                </span>
                <span className={classes.Label}>Invested</span>
              </div>
              <div className={classes.Separator} />
              <div className={`${classes.ReturnItem} text-right`}>
                <span className={classes.Amount}>
                  {getExpectedReturnsAmount()}
                </span>
                <span className={classes.Label}>Expected Returns</span>
              </div>
            </div>
            {renderOtherDetails()}
          </div>
          {renderFirstSection()}
          <div className={classes.NextReturn}>
            <span className={classes.Date}>
              {isReturnComplete
                ? `Return received `
                : `You’ll receive next return on `}
              {isReturnComplete ? null : <strong>{getNextReturnDate()}</strong>}
            </span>
            <span className={classes.ReturnType}>
              {portfolio?.partnerType === 'gp' &&
              !isCorporateBondAsset &&
              !isSDISecondaryAsset
                ? 'Post-Tax'
                : 'Pre-Tax'}
            </span>
          </div>
        </div>
        <div className={classes.Footer}>
          <div className={classes.Schedule}>
            <div
              className={`${classes.Calendar}`}
              onClick={handleScheduleClick}
            >
              {!isStartupEquityAsset ? (
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}commons/Calendar.svg`}
                  alt={getReturnTypeTxt()}
                  width={16}
                  height={16}
                  layout="fixed"
                />
              ) : null}

              <span>{getReturnTypeTxt()}</span>
            </div>
            <SortBy
              ref={sortByRef}
              isMobileDrawer
              data={filterArr}
              mobileDrawerTitle={`Actions`}
              handleFilterItem={(ele: any) => handleCardAction(ele)}
              customDataRenderer={renderAssetDocuments}
              className={classes.Menu}
            >
              <span
                className="icon-dots"
                style={{
                  fontSize: 17,
                  color: 'var(--gripEbonyClay, #292c3e)',
                }}
              />
            </SortBy>
          </div>

          {renderPortfolioStatus()}
        </div>
      </div>
    </>
  );
};

export default InvestmentCardV2;
