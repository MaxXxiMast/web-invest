import React, { useContext, useState, useCallback } from 'react';

// Context
import { PendingPgOrderContext } from '../../../pages/pg-confirmation';

// Components
import Image from '../../primitives/Image';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import Button, { ButtonType } from '../../primitives/Button';
import InvestmentSummaryUI from '../../primitives/InvestrmentSummaryUI';
import PartnerLogo from '../../assetsList/partnerLogo';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { getBadgeName } from '../../../utils/investment';
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import {
  getAssetDetailsMobile,
  getOrderDetails,
} from '../order-payment/orderUtils';
import { trackEvent } from '../../../utils/gtm';

// Styles
import classes from './OrderPayment.module.css';
import { useAppSelector } from '../../../redux/slices/hooks';

/**
 * Render the partner logo with a modal trigger
 */
const AssetLogo = ({ assetImage, assetName, onClick }) => {
  return (
    <div className={`items-align-center-row-wise`} onClick={onClick}>
      <PartnerLogo
        isPartnershipText
        asset={{
          partnerLogo: assetImage,
          partnerName: assetName,
        }}
        isAssetList
        height={40}
      />
      <div className={classes.Arrow}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}homev3/ArrowRight.svg`}
          alt="Arrow Right"
          width={16}
          height={16}
          layout="fixed"
        />
      </div>
    </div>
  );
};

/**
 * Render amount details
 */
const AmountDetails = ({ label, value }) => (
  <div className={`flex-column ${classes.AmountPayable}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

/**
 * CTA Buttons
 */
const ActionButtons = ({ paymentStatus, isGC, onRetry, onDiscover }) => {
  if (paymentStatus !== 'failed') return null;

  return (
    <div className={`flex-column ${classes.CtaContainer}`}>
      <Button width={'100%'} variant={ButtonType.Primary} onClick={onRetry}>
        Retry Now
      </Button>
      {!isGC && (
        <Button
          width={'100%'}
          variant={ButtonType.SecondaryLight}
          onClick={onDiscover}
        >
          Go to Discover
        </Button>
      )}
    </div>
  );
};

export const AssetDetailsPGMMobile = () => {
  const data = useContext(PendingPgOrderContext);
  const [showModal, setShowModal] = useState(false);
  const { singleLotCalculation = {}, localProps = {} } = useAppSelector(
    (state) => state.monthlyCard
  );

  const {
    financeProductType,
    purchasePrice,
    principalAmount,
    preTaxReturns,
    postTaxReturns,
    assetImage,
    assetName,
    maturityDate,
    units,
    unitPrice,
    irr,
    preTaxYtm,
    totalInterest,
    loading,
    paymentStatus,
    isGC,
    amount,
    redirectToDiscover,
    isAmo,
    isFdOrder,
    handleOnClickRetry,
    assetID,
  } = data;

  const InvestmentSummaryData = {
    financeProductType,
    preTaxYtm,
    maturityDate,
    irr,
    investedAmount: purchasePrice,
    unitPrice,
    units,
    preTaxReturns,
    postTaxReturns,
    principalAmount,
    totalInterest,
    amount,
    isFdOrder,
  };

  const handleAssetClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleOnClickInvestmentSummary = useCallback(
    (isExpanded) => {
      trackEvent('Order Summary Clicked', {
        product_category: data?.productCategory,
        assetID: data?.assetID,
        assetName: assetName,
        quantities_selected: data?.units,
        rfq_enabled: data?.isRfq,
        payble_amount: data?.amount,
        amo: !data?.isMarketOpen && data?.isRfq,
        action: isExpanded ? 'collapsed' : 'expanded',
      });
    },
    [data, assetName]
  );

  if (loading) {
    return (
      <CustomSkeleton
        styles={{
          width: '100%',
          height: 150,
        }}
        className={classes.MobileSkeleton}
      />
    );
  }

  return (
    <>
      <div className={classes.MainContainer}>
        {isAmo ? (
          <div
            className={`flex items-center ${classes.amoBadge} ${classes.float}`}
          >
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/amo-icon.svg`}
              alt="AMO Badge"
              width={20}
              height={20}
              layout={'intrinsic'}
            />
            <span>After Market Order</span>
          </div>
        ) : null}
        <div className={`flex-column ${classes.AssetDetailsContainer}`}>
          <div className={`flex justify-between`}>
            <AssetLogo
              assetImage={assetImage}
              assetName={assetName}
              onClick={handleAssetClick}
            />
            <div className={classes.Badge}>
              {getBadgeName(financeProductType)}
            </div>
          </div>
          <div
            className={`items-align-center-row-wise ${classes.AssetDetails}`}
          >
            {getAssetDetailsMobile({
              financeProductType,
              maturityDate,
              units,
              irr,
              preTaxYtm,
              isFdOrder,
            }).map(({ label, value }) => (
              <span
                key={`${label}-${value}`}
                className={`items-align-center-row-wise`}
              >{`${value} ${label}`}</span>
            ))}
          </div>
        </div>
        <div
          className={`items-align-center-row-wise ${classes.AmountContainer}`}
        >
          <AmountDetails
            label="Amount Payable"
            value={numberToIndianCurrencyWithDecimals(amount || 0)}
          />
          <div className={classes.ArrowIconWrapper}>
            <div className={classes.ArrowIcon}>
              <span className="icon-arrow-right" />
            </div>
          </div>
          <AmountDetails
            label="Expected Returns"
            value={numberToIndianCurrencyWithDecimals(preTaxReturns)}
          />
        </div>
        <ActionButtons
          paymentStatus={paymentStatus}
          isGC={isGC}
          onRetry={handleOnClickRetry}
          onDiscover={redirectToDiscover}
        />
      </div>
      <MaterialModalPopup
        isModalDrawer
        showModal={showModal}
        handleModalClose={handleCloseModal}
      >
        <div className={classes.OrderSummaryTitle}>Order Summary</div>
        <InvestmentSummaryUI
          data={getOrderDetails(
            InvestmentSummaryData,
            singleLotCalculation,
            localProps.pageData
          )}
          asset={{
            partnerLogo: assetImage,
            partnerName: assetName,
          }}
          isAccordian={false}
          className={classes.InvestmentSummaryMobile}
          handleOnClickCB={handleOnClickInvestmentSummary}
        />
      </MaterialModalPopup>
    </>
  );
};
