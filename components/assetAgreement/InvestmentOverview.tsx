//Node Modules
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

//Components
import PartnerAndInvestmentAmount from './PartnerAndInvestmentAmount';
import EsignStatus from './EsignStatus';
import Button from '../primitives/Button';

// Utils
import {
  calculateTotalPayableAmount,
  commercialProductFeesStructure,
  defaultFeeStructure,
  startupEquityFeeStructure,
} from '../../utils/feeStructure';
import { financeProductTypeConstants } from '../../utils/financeProductTypes';
import { numberToCurrency } from '../../utils/number';
import { trackEvent } from '../../utils/gtm';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

import { useAppSelector } from '../../redux/slices/hooks';

import { classes } from './InvestmentOverviewStyle';

//Dynamic Components
const InvestmentDetails = dynamic(() => import('./InvestmentDetails'), {
  ssr: false,
});

const InvestmentOverview: React.FC<any> = (props) => {
  const isMobile = useMediaQuery();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const amount = Number(router?.query?.amount || 0);

  const { userData, aifDocuments = [] } = useAppSelector((state) => state.user);
  const singleAgreements = useAppSelector(
    (state) => state.assets?.oneTimeAgreements
  );
  const userPortfolio = useAppSelector((state) => state.user.portfolio.list);

  const renderButton = () => {
    const proceedBtnText = 'Proceed';

    return (
      <div className={`flex-column justify-between ${classes.buttonContainer}`}>
        <div className={`flex justify-between ${classes.phoneStickyButton}`}>
          <div className="flex-column">
            <div className={classes.value}>{`₹ ${numberToCurrency(
              calculateTotalPayableAmount(feeDetails, amount) || 0
            )}`}</div>
            <div className={classes.label}>Amount Payable</div>
          </div>
          <Button
            onClick={onClickProceedButton}
            disabled={checkButtonVisiblity()}
            isLoading={loading}
            className={classes.eSignPending}
          >
            {checkButtonVisiblity() ? 'eSign Pending' : proceedBtnText}
          </Button>
        </div>
      </div>
    );
  };

  const renderProceedButton = (isMobile: boolean = false) => {
    return (
      <>
        {!isMobile ? renderButton() : null}
        <div className={classes.bottomText}>
          {' '}
          By clicking Proceed, I agree to the{' '}
          <a href="/legal#termsAndConditions" target={'_blank'}>
            {' '}
            Terms and Conditions{' '}
          </a>{' '}
          &{' '}
          <a href="/legal#riskTerms" target={'_blank'}>
            Risks Involved
          </a>
        </div>
      </>
    );
  };

  /**
   * @description this function will return all the necessary agreements that need to be signed for a particular SPV and corresponding SPV type
   */
  const getAgreementsToRender = () => {
    //these are the agreements uploaded in the SPV
    const agreementDocs = asset?.spvAgreements || [];
    const agreementIDs = agreementDocs.map((e: any) => e.id);

    //these are the agreements that need to be signed only once for a particular SPV
    const oneTimeAgreements = singleAgreements || [];

    //this will filter out the agreements that need to be signed once, and ignore it, if it already exists in agreementDocs
    const agreements = oneTimeAgreements.filter((e: any) => {
      return !agreementIDs.find((id: number) => +id === +e.agreementPdfs.id);
    });
    const signOnceAgreements = agreements.map((agreement: any) => {
      const agreementPdfs = agreement.agreementPdfs;
      return {
        ...agreementPdfs,
        spvDocument: agreement,
      };
    });
    let investmentAgreements: any = [];
    if (isLFIFAndHasLLp()) {
      investmentAgreements.push({
        id: 103,
        spvDocument: {
          displayName: 'Investment Agreement',
          spvID: asset?.spvID,
          assetID: asset?.assetID,
        },
      });
    }
    //combine and return all the agreements that need to be signed
    return (
      agreementDocs.concat(signOnceAgreements).concat(investmentAgreements) ||
      []
    );
  };

  const checkButtonVisiblity = () => {
    const agreementDocs = getAgreementsToRender();
    let isDisabledButton = false;
    for (const agreementDoc of agreementDocs) {
      isDisabledButton = !isEsignDone(agreementDoc);
      if (isDisabledButton) {
        return isDisabledButton;
      }
    }
    return isDisabledButton;
  };

  const isLFIFAndHasLLp = () => {
    return Number(asset?.hasLlp) === 1;
  };

  /**
   *
   * @param agreementDoc agreement document
   * @returns {Boolean} if esign is done or not
   */

  const isEsignDone = (agreementDoc: any) => {
    const documents = userData?.documents;
    const list = userPortfolio || [];
    const signedDocuments = documents?.filter(
      (a: any) =>
        Number(a.docSubType) === Number(asset?.assetID) && a.docType === 'order'
    );
    if (isLFIFAndHasLLp()) {
      const orderAsset = list?.find(
        (a: any) => a.assetID === Number(asset.assetID)
      );
      const { isEsigned = false } = orderAsset || {};

      return signedDocuments?.length || isEsigned;
    }
    if (!aifDocuments.length) {
      return false;
    }
    return aifDocuments.find((e: any) => {
      return (
        e.displayName.trim() ===
        `eSign ${agreementDoc?.spvDocument?.displayName}`.trim()
      );
    });
  };

  const onClickProceedButton = () => {
    setLoading(true);
    props.placeDeal?.(
      true,
      calculateTotalPayableAmount(feeDetails, amount) || 0
    );
  };

  const renderEsignStatus = () => {
    return Object.keys(asset).length ? (
      <EsignStatus asset={asset} amount={amount} onClickEvent={onClickEvent} />
    ) : null;
  };

  const renderPartnerAndInvestmentAmount = () => {
    const totalAmountOrUnits = 0;
    return (
      <PartnerAndInvestmentAmount
        asset={asset}
        amount={amount}
        units={totalAmountOrUnits}
      />
    );
  };

  const mobileView = () => {
    return (
      <div className={`flex-column ${classes.mobileViewContainer}`}>
        {renderEsignStatus()}
        {renderPartnerAndInvestmentAmount()}
        {renderInvestmentDetails()}
        {/* Esign status should render when CE and SRE Deals  */}
        <div className={`flex ${classes.buttonContainer}`}>
          <Button
            width={'100%'}
            disabled={checkButtonVisiblity()}
            onClick={() => onClickProceedButton()}
            isLoading={loading}
          >
            Proceed
          </Button>
        </div>
      </div>
    );
  };

  const getFeeStructure = () => {
    const { financeProductType } = asset;
    if (financeProductType === financeProductTypeConstants.startupEquity) {
      return startupEquityFeeStructure(asset, amount);
    }

    if (financeProductType === financeProductTypeConstants.realEstate) {
      return commercialProductFeesStructure(asset, amount);
    }

    return defaultFeeStructure(
      props.calculatedReturns,
      props.taxPercentage,
      asset
    );
  };
  let feeDetails: any = getFeeStructure();

  const renderInvestmentDetails = () => {
    return (
      <InvestmentDetails
        asset={asset}
        amount={amount}
        calculatedReturns={props.calculatedReturns}
        taxPercentage={props.taxPercentage}
        feeDetails={feeDetails}
      />
    );
  };

  const desktopView = () => {
    return (
      <div className="flex">
        <div
          className="flex_wrapper flex-column"
          style={{
            padding: '32px 0',
            width: '50%',
          }}
        >
          {renderPartnerAndInvestmentAmount()}
          {renderInvestmentDetails()}
        </div>

        {/* Esign status should render when CE and SRE Deals  */}
        <div
          className={`flex-column items-start justify-start ${classes.rightContainer}`}
        >
          {renderEsignStatus()}
          {renderProceedButton()}
        </div>
      </div>
    );
  };

  const onClickEvent = (
    eventName: string,
    extraData: {
      [key: string]: string;
    } = {}
  ) => {
    const data = {
      assetID: asset?.assetID,
      userID: userData?.userID,
      createdAt: new Date(),
      financeProductType: asset?.financeProductType,
      ...extraData,
    };
    trackEvent(eventName, data);
  };

  return isMobile ? mobileView() : desktopView();
};

export default InvestmentOverview;
