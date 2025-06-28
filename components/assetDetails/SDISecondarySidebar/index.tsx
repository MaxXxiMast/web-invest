// NODE MODULES
import React from 'react';

// Components
import SideBarCalculator from '../AssetCalculator/SideBarCalculator';

// Utils
import { sdiSecondaryCalculatorData } from '../AssetCalculator/utils/sdi_secondary_utils';

// Hooks
import { useAppSelector } from '../../../redux/slices/hooks';

// Styles
import styles from './SDISecondarySidebar.module.css';

interface SDISecondaryProps {
  handleInvestNowBtnClick?: (val: boolean) => void;
  handleKycContinue: () => void;
  chipsArr?: {
    [key: string]: {};
  };
  isDefault?: boolean;
}

function SDISecondarySidebar(props: SDISecondaryProps) {
  const {
    handleInvestNowBtnClick = () => {},
    handleKycContinue = () => {},
    isDefault = true,
  } = props || {};

  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const {
    singleLotCalculation = {},
    units: lotSize,
    localProps,
  } = useAppSelector((state) => state.monthlyCard);
  const { pageData = [] } = localProps;

  const renderNote = () => {
    if (asset?.productCategory !== 'Unlisted PTC') return null;
    return (
      <div
        className={`flex ${styles.noteContainer} ${styles.SDISecondaryNotes}`}
      >
        <div className={`${styles.note}`}>
          <span className={styles.noteText}>
            <strong>Note:</strong> This product is regulated by RBI
          </span>
        </div>
      </div>
    );
  };

  const calculationData = sdiSecondaryCalculatorData(
    singleLotCalculation,
    pageData,
    lotSize
  );

  return (
    <>
      <SideBarCalculator
        handleInvestNowBtnClick={handleInvestNowBtnClick}
        handleKycContinue={handleKycContinue}
        data={calculationData}
        chipsArr={props?.chipsArr}
        isDefault={isDefault}
      />
      {renderNote()}
    </>
  );
}

export default SDISecondarySidebar;
