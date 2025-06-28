import React from 'react';
import {
  financeProductTypeConstants,
  financeProductTypeMapping,
} from '../../../utils/financeProductTypes';
import { getAssetTypeFlag } from '../../../utils/badge';
import type { FinancialProduct } from '../../../utils/types';

import styles from './AssetTypeFlag.module.css';

type AssetTypeFlagProps = {
  asset: FinancialProduct;
  className?: string;
  isAssetList?: boolean;
  isInvestmentOverView?: boolean;
};

const AssetTypeFlag = (props: AssetTypeFlagProps) => {
  const {
    asset,
    className,
    isAssetList = false,
    isInvestmentOverView = false,
  } = props;
  const { financeProductType } = asset;
  const badge = getAssetTypeFlag(asset, isInvestmentOverView);

  const getStyleNameForFinancePT = () => {
    if (
      isAssetList &&
      financeProductType === financeProductTypeConstants.leasing
    ) {
      return styles.LeasingAssetList;
    } else if (
      isAssetList &&
      financeProductType === financeProductTypeConstants.bonds
    ) {
      return styles.CorporateBondList;
    } else if (
      !isAssetList &&
      financeProductType === financeProductTypeConstants.sdi
    ) {
      return styles.sdiSecondaryInvestmentOverview;
    } else if (
      isAssetList &&
      financeProductType === financeProductTypeConstants.sdi
    ) {
      return styles.SDIAssetlist;
    } else if (
      !isAssetList &&
      financeProductType === financeProductTypeConstants.bonds
    ) {
      return styles.CorporateBondInvestmentOverview;
    }
    return financeProductTypeMapping[financeProductType];
  };

  return (
    <>
      {financeProductType ? (
        <div
          className={`${
            styles.Flag
          } ${getStyleNameForFinancePT()} ${className}`}
        >
          {badge}
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export default AssetTypeFlag;
