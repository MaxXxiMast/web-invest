import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

// Redux
import { RootState } from '../../../../redux';
import { useAppDispatch } from '../../../../redux/slices/hooks';
import { resetFiltersWithLoading } from '../../../../components/assetsList/AssetFilters/AssetFilterSlice/assetFilters';

import styles from './ResetFilters.module.css';
import { trackEvent } from '../../../../utils/gtm';
import { isMobile } from '../../../../utils/resolution';
import { isRenderedInWebview } from '../../../../utils/appHelpers';

type ResetFiltersProps = {
  productType: string;
  totalCount: number;
};

const ResetFilters: React.FC<ResetFiltersProps> = ({
  productType,
  totalCount,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const filteredAssets = useSelector(
    (state: RootState) => state.assetFilters.filteredDeals
  );
  const hasAppliedFilters = useSelector(
    (state: RootState) => state.assetFilters.hasAppliedFilters
  );

  const filteredCount = filteredAssets.filter(
    (asset) => asset.financeProductType === productType
  ).length;

  const handleReset = () => {
    dispatch(resetFiltersWithLoading());   
    router.push(
      {
        pathname: router.pathname,
        query: {},
      },
      `${router.pathname}#active#${productType
        .toLowerCase()
        .replace(/\s+/g, '')}`,
      { shallow: true }
    );
    trackEvent('asset_list_interaction', {
      functionality: 'reset_button_clicked',
      page_name: 'Asset_List',
      application_type: isMobile ? (isRenderedInWebview() ? 'mweb' : 'mobile_app') : 'desktop',
    }); 

  };

  if (!hasAppliedFilters) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <div className={styles.FilterDiv}>
        <p className={styles.filterText}>
          Showing {filteredCount} of {totalCount}
        </p>
      </div>
      <p className={styles.ResetHeading} onClick={handleReset}>
        Reset
      </p>
    </div>
  );
};

export default ResetFilters;
