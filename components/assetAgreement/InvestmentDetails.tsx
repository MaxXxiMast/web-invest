import { useState } from 'react';

//Components
import CircularProgress from '@mui/material/CircularProgress';
import AssetInfo from '../assetsList/AssetInfo';
import TooltipCompoent from '../primitives/TooltipCompoent/TooltipCompoent';
import Popup from '../common/Popup';

//Utils
import { numberToCurrency } from '../../utils/number';
import {
  calculateTotalPayableAmount,
  WHY_POST_TAX_DETAILS,
} from '../../utils/feeStructure';
import { isAssetStartupEquity } from '../../utils/financeProductTypes';

//Hooks
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

//styles
import { classes } from './InvestmentDetailsStyle';

const InvestmentDetails = (props: any) => {
  const isMobile = useMediaQuery();
  const [showWhyPostTax, setWhyPostTax] = useState(false);
  const renderAifPartner = () => {
    return (
      <div
        className={`items-align-center-row-wise ${classes.aifPartnerContainer}`}
      >
        <div className={classes.sebiLabel}>Registered AIF Partner</div>
        {props?.asset?.spv?.spvLogo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={props?.asset?.spv?.spvLogo}
              className={classes.image}
              alt="spvLogo"
            />
          </>
        ) : (
          <CircularProgress size={24} />
        )}
      </div>
    );
  };

  const renderWhyPostTax = () => {
    return showWhyPostTax ? (
      <Popup
        isHTMLData
        heading={WHY_POST_TAX_DETAILS.WHY_POST_TAX_HEADING}
        data={WHY_POST_TAX_DETAILS.WHY_POST_TAX}
        handleOnSubmit={() => {
          setWhyPostTax(false);
        }}
        onCloseModal={() => {
          setWhyPostTax(false);
        }}
      />
    ) : null;
  };

  const getFeeLabel = (fee: any) => {
    let feeValue = fee.feeValue ? `(${fee.feeValue}${fee.suffix})` : '';

    if (fee.feeValue === 0) {
      feeValue = `(${Number(fee.feeValue).toFixed(2)}${fee.suffix})`;
    }

    return `${fee.label} ${feeValue} `;
  };

  const renderInvestmentDetails = (largeView: boolean = false) => {
    const { fundingDetails } = props.asset;
    let feeDetails: any = props.feeDetails;

    const isStartupEquity = isAssetStartupEquity(props.asset);

    return (
      <>
        <div
          className={`flex_wrapper flex-column ${classes.investmentOverviewContainer}`}
        >
          <AssetInfo
            asset={props.asset}
            bondInvestmentOverView={true}
            isAssetDetailPage
          />

          {/* Funding Round for startup equity */}
          {isStartupEquity && fundingDetails?.fundingRound ? (
            <div
              className={`items-align-center-row-wise justify-between ${classes.investmentSplit}`}
            >
              <div className={classes.label}>{`Funding Round`}</div>
              <div className={classes.value}>
                {fundingDetails?.fundingRound}
              </div>
            </div>
          ) : null}
          {/* Fee Details for Asset for Leasing/Inventory/SE/CRE  */}
          {feeDetails.map((fee: any) => (
            <div
              className={`items-align-center-row-wise justify-between ${classes.investmentSplit}`}
              key={fee?.id}
            >
              <div className={`items-align-center-row-wise ${classes.label}`}>
                {getFeeLabel(fee)}
                {fee.labelTooltip ? (
                  <span className={'items-align-center-row-wise'}>
                    <TooltipCompoent toolTipText={fee.labelTooltip}>
                      <span
                        className={`icon-info`}
                        style={{
                          fontSize: '10px',
                          color: 'var(--gripBlue, #00357c)',
                        }}
                      />
                    </TooltipCompoent>
                  </span>
                ) : null}
              </div>
              <div className={classes.value}>
                <span>₹ {numberToCurrency(fee.value)}</span>
                {fee.tooltip ? (
                  <span className={'items-align-center-row-wise'}>
                    <TooltipCompoent toolTipText={fee.tooltip}>
                      <span
                        className={`icon-info`}
                        style={{
                          fontSize: '10px',
                          color: 'var(--gripBlue, #00357c)',
                        }}
                      />
                    </TooltipCompoent>
                  </span>
                ) : null}
              </div>
            </div>
          ))}
          <div className={classes.dividerNew} />
          <div className={`flex ${classes.postTaxContainer}`}>
            <div className={classes.preTax}>Total Payable</div>
            <div className={classes.preTaxValue}>
              &#8377;{' '}
              {numberToCurrency(
                calculateTotalPayableAmount(feeDetails, props.amount) || 0
              )}
            </div>
          </div>
          {largeView ? renderAifPartner() : null}
        </div>
      </>
    );
  };

  const mobileView = () => {
    return (
      <>
        {renderInvestmentDetails()}
        {renderAifPartner()}
      </>
    );
  };

  return (
    <>
      {isMobile ? mobileView() : renderInvestmentDetails(true)}
      {renderWhyPostTax()}
    </>
  );
};

export default InvestmentDetails;
