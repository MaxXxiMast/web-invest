// Components
import PartnerLogo from '../../../assetsList/partnerLogo';

// Utils
import { urlify } from '../../../../utils/string';
import { trackEvent } from '../../../../utils/gtm';

// Types
import { ReturnsData } from '../ReturnsTable/types';

// Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

type ReturnsTableAssetProps = {
  item: ReturnsData;
};

export default function ReturnsTableAsset({ item }: ReturnsTableAssetProps) {
  // GET UserID
  const { userID = '' } = useAppSelector((state) => state?.user?.userData);

  // GET selectedAssetType
  const { selectedAssetType = 'Bonds, SDIs & Baskets' } = useAppSelector(
    (state) => state.portfolioSummary
  );

  const {
    partnerName,
    assetName,
    assetID,
    category,
    financeProductType = '',
  } = item ?? {};

  const handleOnClick = () => {
    trackEvent('portfolio_summary_deal_info_click', {
      user_id: userID,
      product_type: financeProductType,
      asset_type: selectedAssetType,
      asset_id: assetID,
      timestamp: new Date().toISOString(),
    });
  };

  const handleRedirect = () => {
    return urlify(
      `/assetdetails/${partnerName}/${category}/${assetName}/${assetID}`.toLowerCase()
    );
  };

  return (
    <div className={`flex_wrapper`}>
      <a
        className={`items-align-center-row-wise`}
        href={handleRedirect()}
        target="_blank"
        rel="noreferrer"
        onClick={handleOnClick}
      >
        <PartnerLogo
          asset={{ ...item, partnerLogo: item.assetImage }}
          showUnit={false}
          showLot={false}
          height={90}
        />
        <span
          className={`icon-link`}
          style={{
            fontSize: 16,
            color: 'var(--gripBlue, #00357c)',
          }}
        />
      </a>
    </div>
  );
}
