import { useRouter } from 'next/router';

//Components
import Button, { ButtonType } from '../../primitives/Button';

//Utils
import { trackEvent } from '../../../utils/gtm';
import { absoluteCommittedInvestment, assetStatus } from '../../../utils/asset';
import {
  isAssetBondsMF,
  isAssetStartupEquity,
  isHighYieldFd,
} from '../../../utils/financeProductTypes';
import { getTotalAmountPaybale } from '../../../utils/investment';
import { numberToIndianCurrency } from '../../../utils/number';

// Redux
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../redux/slices/hooks';
import { setShowMobileMonthlyPlan } from '../../../redux/slices/monthlyCard';

//Styles
import styles from './AssetMobileButton.module.css';

type AssetMobileButtonProps = {
  className?: string;
};

const AssetMobileButton = ({ className }: AssetMobileButtonProps) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const asset = useAppSelector((state) => state.assets?.selectedAsset || {});
  const isFD = isHighYieldFd(asset);
  const isBondsMf = isAssetBondsMF(asset);
  const { submitLoading, singleLotCalculation } = useAppSelector(
    (state) => state.monthlyCard
  );
  const isDefault = useAppSelector(
    (state) => state.assets.showDefaultAssetDetailPage
  );

  const dealType = assetStatus(asset);

  const amount = getTotalAmountPaybale(
    singleLotCalculation?.investmentAmount,
    singleLotCalculation?.stampDuty,
    singleLotCalculation?.minLots
  );

  const { fdCalculationMetaData } = useAppSelector(
    (state) => (state as any)?.fdConfig ?? {}
  );

  const { allowedMinInputValue } = useAppSelector(
    (state) => (state as any)?.mfConfig ?? {}
  );

  const buttonMinInvestmentAmount = () => {
    if (isFD) {
      return fdCalculationMetaData?.minAmount;
    }
    if (isBondsMf) {
      return allowedMinInputValue;
    }
    return amount;
  };

  const minInvestmentAmount = numberToIndianCurrency(
    buttonMinInvestmentAmount()
  );

  const handleCalculateReturnClick = ({ buttonId }: { buttonId: string }) => {
    dispatch(setShowMobileMonthlyPlan(true));
    // Send event to track only 'Calculate Returns'
    trackEvent(
      'Calculate Returns',
      {
        asset_id: asset?.assetID,
        asset_name: asset?.name,
        irr: asset?.irr,
        completed_percentage: absoluteCommittedInvestment(asset, false),
        product_category: asset?.productCategory,
        product_sub_category: asset?.productSubcategory,
        financial_product_type: asset?.financeProductType,
      },
      buttonId
    );
  };

  const renderBtnText = () => {
    if (submitLoading) {
      return '';
    }
    let buttonText = 'Calculate Returns';
    if (isAssetStartupEquity(asset)) {
      buttonText = 'Invest Now';
    } else if (minInvestmentAmount) {
      buttonText = `Investment Starting at ${minInvestmentAmount}`;
    }
    return buttonText;
  };

  if (!isDefault) return null;

  return (
    <div className={className ? className : styles.MobileFixedBtn}>
      {dealType === 'past' ? (
        <>
          <p className={styles.fullSubscribed}>This deal is fully subscribed</p>
          <Button
            onClick={() => {
              trackEvent('button_clicked', {
                cta: 'Find Other Deals',
                page: 'Past Asset Details',
                asset_id: asset?.assetID,
              });
              router.push('/assets');
            }}
            variant={ButtonType.Primary}
            width={'100%'}
            className={styles.findOtherDeals}
          >
            Find Other Deals
          </Button>
        </>
      ) : (
        <Button
          onClick={handleCalculateReturnClick}
          id="CalculateReturn"
          variant={ButtonType.Primary}
          className={styles.CalculateReturn}
          isLoading={submitLoading}
        >
          {renderBtnText()}
        </Button>
      )}
    </div>
  );
};

export default AssetMobileButton;
