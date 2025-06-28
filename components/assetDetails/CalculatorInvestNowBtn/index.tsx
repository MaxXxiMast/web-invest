// NODE MODULES
import { useEffect, useState } from 'react';

// Components
import NotifyMeButton from '../NotifyMeButton';

// Hooks
import { useAppSelector } from '../../../redux/slices/hooks';

// Utils
import { getOverallDefaultKycStatus } from '../../../utils/discovery';
import { trackEvent } from '../../../utils/gtm';
import { getMaturityDate, getMaturityMonths } from '../../../utils/asset';
import { callErrorToast } from '../../../api/strapi';
import {
  numberToIndianCurrencyWithDecimals,
  toCurrecyStringWithDecimals,
} from '../../../utils/number';
import { getTotalAmountPaybale } from '../../../utils/investment';

// Styles
import styles from './CalculatorInvestNowBtn.module.css';

type CalculatorInvestNowBtnProps = {
  handleKycContinue: () => void;
  handleInvestNowBtnClick: (val?: boolean) => void;
};

export default function CalculatorInvestNowBtn({
  handleKycContinue,
  handleInvestNowBtnClick,
}: CalculatorInvestNowBtnProps) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const {
    singleLotCalculation = {},
    units: lotSize,
    disableBondsInvestBtn: disableInvestBtn,
  } = useAppSelector((state) => state.monthlyCard);
  const { kycConfigStatus } = useAppSelector((state) => state.user);
  const { NSE: uccStatus = {} } = useAppSelector(
    (state) => state.user?.uccStatus
  );
  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const btnMessage =
    useAppSelector((state) => state.monthlyCard.notifyMeButtonStatus.message) ||
    '';

  const maxInvestmentAmount = singleLotCalculation?.maxInvestment;

  useEffect(() => {
    const amount = getTotalAmountPaybale(
      singleLotCalculation?.investmentAmount,
      singleLotCalculation?.stampDuty,
      lotSize
    );
    const minNoOfLots = singleLotCalculation?.minLots;
    setIsButtonDisabled(
      amount >= maxInvestmentAmount || disableInvestBtn || lotSize < minNoOfLots
    );
  }, [
    disableInvestBtn,
    lotSize,
    maxInvestmentAmount,
    singleLotCalculation?.investmentAmount,
    singleLotCalculation?.minLots,
    singleLotCalculation?.stampDuty,
  ]);

  const handleSubmitClick = async (isMarketClosed: boolean) => {
    const kycStatus =
      getOverallDefaultKycStatus(kycConfigStatus) === 'verified';
    const userUccStatus = uccStatus?.status || '';

    const { default: defaultKycStatus = {} } = kycConfigStatus || {};
    const { isFilteredKYCComplete } = defaultKycStatus;

    const isAssetRFQ = asset?.isRfq ?? false;
    const isAmo = isMarketClosed && isAssetRFQ;
    const buttonElement = document.getElementById('notifyMeButton');
    const ctaText = buttonElement?.textContent || '';
    const previousPath = sessionStorage.getItem('lastVisitedPage') as string;

    // Added for Tracking from the individual components
    // Bonds, SDI, Baskets
    const totalReturnsPreTaxBonds = numberToIndianCurrencyWithDecimals(
      singleLotCalculation?.preTaxReturns * lotSize
    );

    const investmentAmount = getTotalAmountPaybale(
      singleLotCalculation?.investmentAmount,
      singleLotCalculation?.stampDuty,
      lotSize
    );

    trackEvent('Invest Now Button Clicked', {
      tenure: getMaturityMonths(getMaturityDate(asset)),
      investment_amount: investmentAmount,
      total_returns: totalReturnsPreTaxBonds,
      product_category: asset?.productCategory,
      product_sub_category: asset?.productSubcategory,
      kyc_status: kycStatus,
      ucc_status: userUccStatus || false,
      irr: asset?.irr,
      rfq_enabled: asset?.isRfq,
      fd_kyc_status: isFilteredKYCComplete,
      amo: isAmo,
      obpp_kyc_status: isFilteredKYCComplete,
      cta_text: ctaText,
      ['quantities selected']: lotSize,
      URL: window.location.href,
      financial_product_type: asset?.financeProductType,
      path: previousPath,
      assetLogo: asset?.partnerLogo,
      assetDescription: asset?.partnerName,
    });

    const totalVal = asset.preTaxTotalMaxAmount;
    const pendingAmount = totalVal - asset.collectedAmount;

    if (
      !isMarketClosed &&
      isAssetRFQ &&
      Number(pendingAmount) < Number(investmentAmount)
    ) {
      if (pendingAmount < 0) {
        callErrorToast(`We are not accepting more investments for this deal`);
      } else {
        callErrorToast(
          `You can not invest more than ₹${toCurrecyStringWithDecimals(
            pendingAmount,
            1,
            false
          )}`
        );
      }

      return;
    }

    handleInvestNowBtnClick(isMarketClosed);
  };

  return (
    <div
      className={`${styles.NotifyMeButtonExperiment} ${
        !btnMessage ? styles.BtnNoMessage : styles.BtnMessage
      }`}
    >
      <NotifyMeButton
        disabled={isButtonDisabled}
        handleSubmitClick={handleSubmitClick}
        handleKycContinue={handleKycContinue}
        id="notifyMeButtonExperiment"
        statusClassName={styles.StatusWidget}
      />
    </div>
  );
}
