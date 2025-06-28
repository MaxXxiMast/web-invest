import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomSkeleton from '../../../primitives/CustomSkeleton/CustomSkeleton';
import { setPortfolioSummaryProductTypeTab } from '../../../../redux/slices/portfoliosummary';
import { trackEvent } from '../../../../utils/gtm';
import { getLabelForProductType, UserInvestedTypeData } from '../../utils';

import styles from './AssetTypeFilter.module.css';

const AssetTypeFilter = ({
  userInvestedTypes,
}: {
  userInvestedTypes: UserInvestedTypeData;
}) => {
  const dispatch = useDispatch();

  const {
    selectedAssetType = 'Bonds, SDIs & Baskets',
    totalAmountInvested = 0,
  } = useSelector((state: any) => state?.portfolioSummary);

  const [option, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOptions(['Bonds, SDIs & Baskets']);
    if (Object.keys(userInvestedTypes).length) {
      if (userInvestedTypes.highyieldfd) {
        setOptions((prev) => [...prev, 'High Yield FDs']);
      }

      if (
        userInvestedTypes.leasing ||
        userInvestedTypes.inventory ||
        userInvestedTypes.commercial
      ) {
        setOptions((prev) => [...prev, 'LLPs & CRE']);
      }

      if (userInvestedTypes.startupEquity) {
        setOptions((prev) => [...prev, 'Startup Equity']);
      }

      setLoading(false);
    }
    dispatch(
      setPortfolioSummaryProductTypeTab({
        selectedAssetType: 'Bonds, SDIs & Baskets',
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInvestedTypes]);

  const renderSkeleton = () => {
    return Array(3).fill(
      <CustomSkeleton
        styles={{
          height: 35,
          width: 90,
          borderRadius: 20,
        }}
      />
    );
  };

  const handleClickEvent = (option: string) => {
    trackEvent('portfolio_summary_navigation', {
      asset_type: option,
      invested_amount: totalAmountInvested,
    });

    dispatch(setPortfolioSummaryProductTypeTab({ selectedAssetType: option }));
  };

  if (!loading && option.length === 1) return null;

  return (
    <div className={`flex ${styles.container}`}>
      {loading
        ? renderSkeleton()
        : option.map((option: string) => (
            <div
              key={`portfolioFilterChip-${option}`}
              className={`${styles.filterChip} ${
                selectedAssetType === option ? styles.selected : ''
              }`}
              onClick={() => handleClickEvent(option)}
            >
              {getLabelForProductType(option)}
            </div>
          ))}
    </div>
  );
};

export default AssetTypeFilter;
