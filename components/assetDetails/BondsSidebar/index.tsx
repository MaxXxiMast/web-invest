// NODE MODULES
import React from 'react';

// Components
import SideBarCalculator from '../AssetCalculator/SideBarCalculator';
import BrokingPartnerInfo from '../BrokingPartnerInfo';

// Utils
import { isMldProduct } from '../../../utils/asset';
import { bondCalculatorData } from '../AssetCalculator/utils/bond_utils';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// Hooks
import { useAppSelector } from '../../../redux/slices/hooks';

interface BondsSidebarProps {
  handleInvestNowBtnClick?: (val: boolean) => void;
  handleKycContinue: () => void;
  chipsArr?: {
    [key: string]: number[];
  };
  isDefault?: boolean;
}

function BondsSidebar(props: BondsSidebarProps) {
  const {
    handleInvestNowBtnClick = () => {},
    handleKycContinue = () => {},
    isDefault = true,
  } = props;

  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const {
    singleLotCalculation,
    units: lotSize,
    localProps,
  } = useAppSelector((state) => state.monthlyCard);
  const { pageData = [] } = localProps;

  const isMldAsset = isMldProduct(asset);

  const bondsData = bondCalculatorData(
    singleLotCalculation,
    pageData,
    lotSize,
    isMldAsset
  );

  return (
    <>
      <SideBarCalculator
        handleInvestNowBtnClick={handleInvestNowBtnClick}
        handleKycContinue={handleKycContinue}
        data={bondsData}
        chipsArr={props?.chipsArr}
        isDefault={isDefault}
      />

      <BrokingPartnerInfo
        logo={`${GRIP_INVEST_BUCKET_URL}commons/gripbroking-logo.svg`}
        showLogo={false}
      />
    </>
  );
}

export default BondsSidebar;
