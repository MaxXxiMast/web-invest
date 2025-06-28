// NODE MODULES
import { useContext, useState } from 'react';
import dynamic from 'next/dynamic';

// Components
import PartnerLogo from '../../assetsList/partnerLogo';

// Context
import { InvestmentOverviewPGContext } from '../../../contexts/investmentOverviewPg';

// Utils
import { handleExtraProps } from '../../../utils/string';
import {
  getBadgeName,
  getBasketSummaryDetails,
  getBondsSummaryDetails,
  getSdiSummaryDetails,
} from '../../../utils/investment';
import { getAssetDetails } from './utils';
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import {
  isAssetBasket,
  isSDISecondary,
} from '../../../utils/financeProductTypes';

// Styles
import styles from './AssetDetailsPG.module.css';

// Dynamic imports for popup
const MaterialModalPopup = dynamic(
  () => import('../../primitives/MaterialModalPopup'),
  {
    ssr: false,
  }
);

// Dynamic imports for popup details as well
const InvestmentSummary = dynamic(
  () => import('../../investment-overview/investment-summary'),
  {
    ssr: false,
  }
);

export default function AssetDetailsPG() {
  const { asset, lotSize, assetCalculationData, calculationDataBonds } =
    useContext(InvestmentOverviewPGContext);

  const [showModal, setShowModal] = useState(false);

  const assetData = getAssetDetails(asset, lotSize);

  let totalReturns = Number(
    (assetCalculationData?.principalAmount || 0) +
      (assetCalculationData?.totalInterest || 0)
  );

  const getSummaryData = () => {
    return isSDISecondary(asset)
      ? getSdiSummaryDetails(asset, lotSize, assetCalculationData)
      : isAssetBasket(asset)
      ? getBasketSummaryDetails(asset, lotSize, assetCalculationData)
      : getBondsSummaryDetails(
          asset,

          lotSize,
          calculationDataBonds,
          assetCalculationData
        );
  };

  const renderAssetLogo = () => {
    const handleAssetClick = () => {
      setShowModal(true);
    };

    return (
      <div className={`items-align-center-row-wise`} onClick={handleAssetClick}>
        <PartnerLogo isPartnershipText asset={asset} isAssetList height={40} />
        <div className={styles.Arrow}>
          <span
            className="icon-caret-left"
            style={{
              transform: 'rotate(180deg)',
              display: 'inline-block',
            }}
          />
        </div>
      </div>
    );
  };

  const renderAmountDetails = (
    label: string,
    value: string,
    className = ''
  ) => {
    return (
      <div
        className={`flex-column ${styles.AmountPayable} ${handleExtraProps(
          className
        )}`}
      >
        <span>{label}</span>
        <span>{value}</span>
      </div>
    );
  };

  return (
    <>
      <div className={styles.MainContainer}>
        <div className={`flex-column ${styles.AssetDetailsContainer}`}>
          <div className={`flex justify-between`}>
            {renderAssetLogo()}
            <div className={styles.Badge}>
              {getBadgeName(asset?.financeProductType)}
            </div>
          </div>
          <div className={`items-align-center-row-wise ${styles.AssetDetails}`}>
            {assetData.map(({ label, value }) => {
              return (
                <span
                  key={`${label}-${value}`}
                  className={`items-align-center-row-wise`}
                >{`${value} ${label}`}</span>
              );
            })}
          </div>
        </div>
        <div
          className={`items-align-center-row-wise ${styles.AmountContainer}`}
        >
          {renderAmountDetails(
            'Amount Payable',
            numberToIndianCurrencyWithDecimals(
              (assetCalculationData?.investmentAmount || 0) +
                Math.round(assetCalculationData?.stampDuty || 0)
            )
          )}

          <div className={styles.ArrowIconWrapper}>
            <div className={styles.ArrowIcon}>
              <span className="icon-arrow-right" />
            </div>
          </div>

          {renderAmountDetails(
            'Expected Returns',
            numberToIndianCurrencyWithDecimals(totalReturns),
            styles.ExpectedReturns
          )}
        </div>
      </div>
      <MaterialModalPopup
        isModalDrawer
        showModal={showModal}
        handleModalClose={() => setShowModal(false)}
      >
        <div className={styles.OrderSummaryTitle}>Order Summary</div>
        <InvestmentSummary
          data={getSummaryData()}
          asset={asset}
          isAccordian={false}
          className={styles.InvestmentSummaryMobile}
        />
      </MaterialModalPopup>
    </>
  );
}
