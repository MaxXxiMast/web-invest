import { trackEvent } from './gtm';

type Props = {
  userID: string | number;
  asset: any;
  investmentAmount: number;
  lotSize?: number;
  isMobile?: boolean;
};
export const trackVisualReturnsClick = ({
  asset,
  userID,
  investmentAmount,
  lotSize = null,
  isMobile = false,
}: Props) => {
  trackEvent('visualise_returns', {
    user_id: userID,
    asset_id: asset?.assetID,
    visualised_amount: investmentAmount,
    asset_name: asset?.assetName,
    device: isMobile ? 'mobile' : 'desktop',
    product_category: asset?.productCategory,
    product_sub_category: asset?.productSubcategory,
    lots_selected: lotSize,
    cta_text: 'Visualise Returns',
    financial_product_type: asset?.financeProductType,
  });
};
