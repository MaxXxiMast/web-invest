import React from 'react';
import PartnerLogo from '../assetsList/partnerLogo';
import AssetTypeFlag from '../primitives/AssetTypeFlag/AssetTypeFlag';

import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { numberToCurrency } from '../../utils/number';
import { financeProductTypeMapping } from '../../utils/financeProductTypes';
import { classes } from './PartnerAndInvestmentAmountStyle';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import Image from '../primitives/Image';

type Props = {
  asset: any;
  amount: string | number;
  units?: number;
};

const PartnerAndInvestmentAmount = ({ asset, amount, units = 0 }: Props) => {
  const isMobile = useMediaQuery();
  const renderPartnerLogoAndInvestmentAmount = () => {
    return (
      <div
        className={`items-align-center-row-wise justify-between ${classes.partnerContainer}`}
      >
        <div
          className={`flex-column items-center ${classes.investmentContainer} ${
            classes[financeProductTypeMapping[asset?.financeProductType]]
          }`}
        >
          <div className={classes.investmentAmount}>
            &#8377; {numberToCurrency(amount || 0, true)}
          </div>
          <div className={classes.investmentText}>Your Investment</div>
        </div>

        <Image
          src={`${GRIP_INVEST_BUCKET_URL}dealsV2/arrowRight.svg`}
          className={classes.investmentImage}
          alt="arrowright"
          width={40}
          height={40}
        />

        <PartnerLogo
          asset={asset}
          customCss={classes.partnerImage}
          isPartnershipText={false}
          partnershipTextClass={classes.partnershipText}
          units={units}
          height={45}
          isAssetAgreement={true}
        />
      </div>
    );
  };

  const desktopView = () => {
    return (
      <div
        className="flex-column justify-start"
        style={{ width: 'max-content' }}
      >
        <AssetTypeFlag
          asset={asset}
          className={`${classes.CardHeaderFlag}`}
          isInvestmentOverView={true}
        />
        {renderPartnerLogoAndInvestmentAmount()}
      </div>
    );
  };

  const renderChildren = () => {
    return isMobile ? renderPartnerLogoAndInvestmentAmount() : desktopView();
  };

  return renderChildren();
};

export default PartnerAndInvestmentAmount;
