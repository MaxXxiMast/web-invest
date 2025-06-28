//Node Modules
import { useRouter } from 'next/router';

//Components
import PartnerLogo from '../../../assetsList/partnerLogo';
import RatingScale from '../../../assetsList/RatingScale';

//Utils
import {
  generateAssetURL,
  getMaturityDate,
  getMaturityMonths,
} from '../../../../utils/asset';
import { trackEvent } from '../../../../utils/gtm';
import { getMostInvestmentCategory } from '../../utils';

//Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

//Styles
import styles from './AssetCard.module.css';

type AssetCardProps = {
  asset: any;
  category?: string | null;
};

const AssetCard = ({ asset, category = null }: AssetCardProps) => {
  const router = useRouter();
  const { preTaxIrr = 0, totalAmountInvested = 0 } = useAppSelector(
    (state: any) => state?.portfolioSummary
  );

  if (!Object.keys(asset).length) return null;

  const redirectToAsset = () => {
    trackEvent('asset_clicked', {
      asset_id: asset?.assetID,
      amount_SDI: totalAmountInvested,
      most_investment: getMostInvestmentCategory(preTaxIrr),
      asset_type: asset?.financeProductType,
      dropdown_interest: category,
    });
    router.push(generateAssetURL(asset));
  };

  return (
    <div className={styles.assetCard} onClick={redirectToAsset}>
      <div className="flex items-center justify-between">
        <PartnerLogo asset={asset} isAssetList height={40} />
        {asset?.assetMappingData?.rating ? (
          <RatingScale
            rating={`${asset?.assetMappingData?.ratedBy || ''} ${
              asset?.assetMappingData?.rating || ''
            }`}
          />
        ) : null}
      </div>
      <p className={styles.header}>{asset?.header}</p>
      <ul className={styles.BondsInfo}>
        <li
          className={`flex items-center justify-between ${styles.BondsListItem}`}
        >
          <span className={styles.BondsTitle}>{'Yield to Maturity'}</span>
          <span className={styles.BondsValue}>
            {asset?.bonds?.preTaxYtm || asset?.irr}%
          </span>
        </li>
        <li
          className={`flex items-center justify-between ${styles.BondsListItem}`}
        >
          <span className={styles.BondsTitle}>Tenure</span>
          <span className={styles.BondsValue}>
            {getMaturityMonths(getMaturityDate(asset))} Months
          </span>
        </li>
      </ul>
    </div>
  );
};

export default AssetCard;
