// NODE MODULES
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';

// Components
import RenderSuggestionAmount from '../RenderSuggestionAmount';
import KYCUnderVerificationSideBar from '../KycUnderVerification';
import Button from '../../primitives/Button';
import TooltipComponent from '../../primitives/TooltipCompoent/TooltipCompoent';
import AifConsent from '../AIFConsent';
import CKYCUnderVerificationSideBar from '../CkycUnderVerification';

// UTILS
import {
  numberToCurrency,
  numberToIndianCurrencyWithDecimals,
} from '../../../utils/number';
import {
  calculateTotalPayableAmount,
  commercialProductFeesStructure,
  startupEquityFeeStructure,
} from '../../../utils/feeStructure';
import {
  isFirstTimeInvestor,
  isValidInvestmentAmount,
  assetStatus,
} from '../../../utils/asset';
import {
  isSEOrCRE,
  financeProductTypeConstants,
  isAssetCommercialProduct,
  nonTaxRelatedProductTypes,
  isAssetStartupEquity,
  isAssetBonds,
} from '../../../utils/financeProductTypes';
import { calculateReturns } from '../../../utils/returnsCalculator';
import VisualReturns from '../VisualReturns';
import {
  getEnhancedKYCStatus,
  isAdditionalKycPendingVerification,
  isEnhancedKycRequired,
  isKycUnderVerification,
  isUserAccountNRE,
  isUserCkycPending,
} from '../../../utils/user';
import { getKYCDetailsFromConfig } from '../../user-kyc/utils/helper';
import { callErrorToast } from '../../../api/strapi';
import {
  assetPriceChips,
  experimentalChips,
  CRE_CALCULATOR_TOOLTIPS,
  getAssetPrefillInvestmentAmount,
  preTaxValues,
  showInvestmentButton,
} from './utils';
import { trackVisualReturnsClick } from '../../../utils/event';

// Hooks
import { useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Redux slices
import {
  handleVisualModalClose,
  handleVisualReturnsShow,
  setCalculatedReturns,
  setInvestmentAmount,
} from '../../../redux/slices/monthlyCard';

import styles from './OtherProductCalculator.module.css';

const MaterialModalPopup = dynamic(
  () => import('../../primitives/MaterialModalPopup'),
  { ssr: false }
);

type OtherProductCalculatorProps = {
  showLearnMore: (val: boolean) => void;
  showOverview: () => void;
};

export default function OtherProductCalculator({
  showLearnMore,
  showOverview,
}: OtherProductCalculatorProps) {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const isMobileDevice = useMediaQuery('(max-width: 992px)');

  const [isAmountChanging, setAmountChange] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAmountPayable, setShowAmountPayable] = useState(false);
  const [showPrincipalPayment, setShowPrincipalPayment] = useState(false);

  const {
    showVisualReturns,
    units: lots,
    investmentAmount,
    calculatedReturns,
  } = useAppSelector((state) => state.monthlyCard);
  const asset = useAppSelector((state) => state.assets?.selectedAsset || {});
  const toggle = useAppSelector((state) => state.assets.toggle || false);
  const user = useAppSelector((state) => state.user?.userData);
  const ckycOpened = useAppSelector(
    (state) => state.assets?.ckycOpened || false
  );
  const kycConfigStatus = useAppSelector(
    (state) => state.user?.kycConfigStatus
  );

  // Prefill Investment Amount
  useEffect(() => {
    const prefill = getAssetPrefillInvestmentAmount({ user, asset, toggle });
    if (!isAmountChanging && Number(investmentAmount) !== Number(prefill)) {
      changeAmount(`${prefill}`);
    } else {
      changeAmount(`${investmentAmount}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle, asset, user]);

  const showFixedSuggestion = !isAssetBonds(asset);

  const changeAmount = async (enteredAmount: string) => {
    setAmountChange(true);
    dispatch(setInvestmentAmount(Number(enteredAmount)));
    if (!String(enteredAmount).length) {
      dispatch(setCalculatedReturns({}));
      setAmountChange(false);
      return;
    }

    const partnerType = preTaxValues({ user, toggle, asset }) ? 'sp' : 'gp';
    const [valid, error] = isValidInvestmentAmount(
      asset,
      parseInt(enteredAmount),
      partnerType === 'sp',
      isFirstTimeInvestor(user)
    );
    setErrorMessage(valid || !enteredAmount ? '' : error);
    if (!valid) {
      setAmountChange(false);
      return null;
    }

    let returns: any = calculateReturns(
      asset?.repaymentMetrics,
      partnerType,
      asset?.repaymentCycle,
      asset?.tenure,
      Number(enteredAmount)
    );

    if (partnerType === 'sp') {
      returns = returns?.spPreTaxReturns;
    }
    dispatch(setCalculatedReturns(returns || {}));
    setAmountChange(false);
  };

  const isCkycUnderVerification = () => {
    /**
     * using this isSEOrCRE because the intention of this function is to check whether the asset finance product type is CRE or Startup equity
     */
    return isUserCkycPending(user) && isSEOrCRE(asset) && ckycOpened;
  };

  const disableContinue = () => {
    const userData = user;
    const eKycStatus = getEnhancedKYCStatus(userData);
    const enhancedKycRequired = isEnhancedKycRequired(asset);
    if (isCkycUnderVerification()) {
      return true;
    }

    if (normalKYCUnderVerification && enhancedKycRequired) {
      if (eKycStatus === 'pending') {
        return false; // allow them to do enhanced kyc
      } else if (
        eKycStatus === 'pending verification' ||
        eKycStatus === 'verified'
      ) {
        return true; // any kyc verification pending stop from proceeding further
      }
    } else if (normalKYCUnderVerification) {
      return true;
    } else if (normalKYCUnderVerification && !enhancedKycRequired) {
      return false; // if no ekyc required allow them to plae an order which is the current flow
    } else if (!normalKYCUnderVerification && enhancedKycRequired) {
      if (eKycStatus === 'pending' || eKycStatus === 'verified') {
        return false; // allow them to do enhanced kyc
      } else if (eKycStatus === 'pending verification') {
        return true;
      }
    }
  };

  const isButtonDisabled = () => {
    return !showButton() || disableContinue();
  };

  const onClickInvest = () => {
    if (isButtonDisabled()) {
      return;
    }
    const bankDetails = getKYCDetailsFromConfig(
      kycConfigStatus,
      'bank'
    ) as Record<string, string>;
    let isNreUser = isUserAccountNRE(bankDetails?.accountType || '');

    if (isNreUser) {
      callErrorToast('Grip does not accept investments from NRO accounts');
      return;
    }
    showOverview();
  };

  const amountSuggestion = () => {
    let suggestedAmounts = [];
    const preTaxVal = preTaxValues({ user, asset, toggle });
    let minAmount = preTaxVal ? asset?.preTaxMinAmount : asset?.minAmount;
    let lastAmount =
      asset?.reducedTransactionAmount && isFirstTimeInvestor(user) && !preTaxVal
        ? Number(asset?.reducedTransactionAmount)
        : Number(minAmount);

    let totalMaxAmount = asset?.totalMaxAmount;
    let collectedAmount = asset?.collectedAmount - asset?.preTaxCollectedAmount;
    minAmount = asset?.minAmount;
    const maxAmount = !preTaxVal ? asset?.maxAmount : asset?.preTaxMaxAmount;

    if (preTaxVal) {
      totalMaxAmount = asset?.preTaxTotalMaxAmount;
      collectedAmount = asset?.preTaxCollectedAmount;
      minAmount = asset?.preTaxMinAmount;
    }
    const remainingAmount = totalMaxAmount - collectedAmount;

    if (!showFixedSuggestion) {
      suggestedAmounts = assetPriceChips(lastAmount);
    } else {
      suggestedAmounts = experimentalChips(
        lastAmount,
        remainingAmount,
        maxAmount
      );
    }

    if (minAmount > remainingAmount) {
      return [];
    }

    return suggestedAmounts;
  };

  /**
   * Cases:
   *
   * 1. Should not come for Leasing / Inventory / SDI
   *
   * For SE:
   *
   * For Mobile and Desktop:
   *
   * 1. Active Deal: both text should come
   * 2. Past Deal: only partner logo should come
   *
   * For CRE:
   *
   * For Mobile:
   *
   * 1. Active Deal: both text should come
   * 2. Past Deal: nothing should render
   *
   * For Desktop:
   *
   * 1. Active Deal: both text should come
   * 2. Past Deal: both text should come
   *
   * @param {boolean} hideAIFConsent `true` when hide the text
   * @param {boolean} hideAIFPartnerLogo `true` when hide the partner logo
   * @returns {React.Node | null} returns the aif details text
   */

  const renderAifPartner = (
    hideAIFConsent = false,
    hideAIFPartnerLogo = false
  ) => {
    if (!nonTaxRelatedProductTypes.includes(asset?.financeProductType)) {
      return null;
    }

    return (
      <AifConsent
        hideAIFConsent={
          !isActive ? isAssetStartupEquity(asset) : hideAIFConsent
        }
        hideAIFPartnerLogo={!isActive ? false : hideAIFPartnerLogo}
      />
    );
  };

  const renderCKYCUnderVerification = () => {
    return isCkycUnderVerification() ? (
      <CKYCUnderVerificationSideBar showLearnMore={showLearnMore} />
    ) : null;
  };

  const getAssetSaleValue = () => {
    const saleValue = calculatedReturns?.['assetSaleValue'] || 0;
    return numberToCurrency(Number.parseFloat(saleValue).toFixed(2)) || 0;
  };

  const handleVisualReturnsClick = () => {
    trackVisualReturnsClick({
      asset,
      userID: user?.userID,
      investmentAmount,
      lotSize: lots,
      isMobile: isMobileDevice,
    });
    dispatch(
      handleVisualReturnsShow({ res: true, isDesktopModal: !isMobileDevice })
    );
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (isNaN(val)) {
      changeAmount('0');
    } else {
      changeAmount(val || '0');
    }
  };

  const showButton = () => {
    const data: any = {
      user,
      amount: investmentAmount,
      asset,
      toggle,
    };
    return showInvestmentButton(data);
  };

  const handleContinueButtonClick = () => {
    if (!showButton() || disableContinue()) {
      return;
    }
    dispatch(handleVisualModalClose(false));
    onClickInvest();
  };

  const suggestionList = amountSuggestion();
  const isActive = assetStatus(asset) === 'active';
  const { profitShareAtExit = 0 } =
    asset?.assetMappingData?.calculationInputFields ?? {};
  let feeDetails: any = startupEquityFeeStructure(
    asset,
    isActive ? investmentAmount : asset?.preTaxMinAmount
  );
  if (isAssetCommercialProduct(asset)) {
    feeDetails = commercialProductFeesStructure(
      asset,
      Number(investmentAmount)
    );
  }
  const normalKYCUnderVerification = isKycUnderVerification(user);

  return (
    <>
      <div className={styles.MonthlyReturnCardContent}>
        <div className={styles.CardTop}>
          <div className={styles.InvestmentType}>
            <div className={styles.InvestmentTypeLeft}>
              <h5>I want to invest</h5>
            </div>
          </div>
          <div className={styles.InvestMentAmount}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter investment value..."
              value={numberToCurrency(investmentAmount)}
              onChange={handleInputChange}
              autoComplete="off"
            />
          </div>
          {errorMessage.length > 0 && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
          <RenderSuggestionAmount
            suggestionList={suggestionList}
            onClick={(val) =>
              changeAmount(
                `${
                  showFixedSuggestion
                    ? Number(val)
                    : Number(investmentAmount) + Number(val)
                }`
              )
            }
            showFixedSuggestion={showFixedSuggestion}
          />
        </div>
        <div className={styles.CardBottom}>
          {[
            financeProductTypeConstants.realEstate,
            financeProductTypeConstants.startupEquity,
          ].includes(asset?.financeProductType) ? (
            <ul className={styles.CountList}>
              <li>
                <span className={styles.CountLabel}>Amount Payable</span>
                <span
                  className={`${styles.PreTaxAmount} ${
                    showAmountPayable ? 'Active' : ''
                  } cursor`}
                  onClick={() => setShowAmountPayable(!showAmountPayable)}
                >
                  {numberToIndianCurrencyWithDecimals(
                    calculateTotalPayableAmount(
                      feeDetails,
                      Number(investmentAmount)
                    )
                  )}
                  <span className={styles.CaretDown}>
                    <span className="icon-caret-down" />
                  </span>
                </span>
              </li>
              {showAmountPayable &&
                feeDetails.map((fee: any) => (
                  <li key={fee?.id} className={styles.RepaymentAmount}>
                    <ul>
                      <li>
                        <span className={styles.CountLabel}>
                          {`${fee.label} (${fee.feeValue}${fee.suffix})`}
                          {fee.tooltip ? (
                            <TooltipComponent toolTipText={fee.tooltip}>
                              <span
                                className={`icon-info ${styles.InfoIcon}`}
                              />
                            </TooltipComponent>
                          ) : null}
                        </span>
                        <span className={styles.PostTaxAmount}>
                          {numberToIndianCurrencyWithDecimals(fee.value) || 0}
                        </span>
                      </li>
                    </ul>
                  </li>
                ))}
              {isAssetCommercialProduct(asset) ? (
                <>
                  <li className={styles.PostTaxItem}>
                    <span className={styles.CountLabel}>
                      Pre-Tax Total Returns
                    </span>
                    <span
                      className={`${styles.PostTaxAmount} ${
                        showPrincipalPayment ? 'Active' : ''
                      } cursor`}
                      onClick={() =>
                        setShowPrincipalPayment(!showPrincipalPayment)
                      }
                    >
                      {numberToIndianCurrencyWithDecimals(
                        Math.round(
                          parseInt(calculatedReturns?.totalPostTaxAmount || 0)
                        )
                      )}
                      <span className={styles.CaretDown}>
                        <span className="icon-caret-down" />
                      </span>
                    </span>
                  </li>
                  {showPrincipalPayment && (
                    <>
                      <li className={styles.RepaymentAmount}>
                        <ul>
                          <li>
                            <span className={styles.CountLabel}>
                              Net Rental
                              <TooltipComponent
                                toolTipText={CRE_CALCULATOR_TOOLTIPS.netRental}
                              >
                                <span
                                  className={`icon-info ${styles.InfoIcon}`}
                                />
                              </TooltipComponent>
                            </span>
                            <span className={styles.PostTaxAmount}>
                              {numberToIndianCurrencyWithDecimals(
                                Math.round(
                                  parseInt(
                                    calculatedReturns?.totalPostTaxAmount || 0
                                  ) - (calculatedReturns?.assetSaleValue || 0)
                                )
                              )}
                            </span>
                          </li>
                        </ul>
                      </li>
                      <li className={styles.RepaymentAmount}>
                        <ul>
                          <li>
                            <span className={styles.CountLabel}>
                              Sale Value of Asset
                              <TooltipComponent
                                toolTipText={CRE_CALCULATOR_TOOLTIPS.saleAsset}
                              >
                                <span
                                  className={`icon-info ${styles.InfoIcon}`}
                                />
                              </TooltipComponent>
                            </span>
                            <span className={styles.PostTaxAmount}>
                              &#8377;&nbsp;
                              {getAssetSaleValue()}
                            </span>
                          </li>
                        </ul>
                      </li>
                    </>
                  )}
                </>
              ) : (
                <li className={styles.PostTaxItem}>
                  <span className={styles.CountLabel}>
                    Profit Share at Exit
                    <TooltipComponent toolTipText="This is a one-time performance fee (charged by the Investment Manager of the AIF) in form of a percentage of the total profits for facilitating the fund-raise through its AIF.">
                      <span className={`icon-info ${styles.InfoIcon}`} />
                    </TooltipComponent>
                  </span>
                  <span className={styles.PreTaxAmount}>
                    {`${Number(profitShareAtExit).toFixed(2)}%`}
                  </span>
                </li>
              )}
            </ul>
          ) : null}
          {![
            financeProductTypeConstants.ncd,
            financeProductTypeConstants.startupEquity,
          ].includes(asset?.financeProductType) && (
            <div className={styles.VisualReturns}>
              <div
                className={styles.VisualReturnsInner}
                onClick={handleVisualReturnsClick}
              >
                <span className={styles.ImageContainer}>
                  <span
                    className={`icon-visualise-returns`}
                    style={{
                      fontSize: 24,
                    }}
                  />
                </span>
                <span>Visualise Returns</span>
              </div>
            </div>
          )}
          {isMobileDevice ? renderAifPartner(true) : null}
          {isAdditionalKycPendingVerification(user) ||
          normalKYCUnderVerification ? (
            <KYCUnderVerificationSideBar />
          ) : (
            renderCKYCUnderVerification()
          )}
          <div className={styles.ContinueSection}>
            <Button
              disabled={!showButton() || disableContinue()}
              onClick={handleContinueButtonClick}
              width={'100%'}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
      {/* CRE/SE */}
      {/* setShowPastTax(!preTaxValues({ user, asset, toggle }) || !isActive); */}
      {showVisualReturns ? (
        <MaterialModalPopup
          isModalDrawer
          showModal={showVisualReturns}
          className={styles.VisualReturnModalPopup}
          drawerExtraClass={styles.VisualReturnsDrawer}
          handleModalClose={() => dispatch(handleVisualModalClose(false))}
          closeButtonClass={styles.VisualReturnCloseBtn}
        >
          <VisualReturns
            handleContinueButtonClick={handleContinueButtonClick}
            asset={asset}
            investment={calculatedReturns}
            isPreTax={isActive && preTaxValues({ user, asset, toggle })}
            amount={investmentAmount}
          />
        </MaterialModalPopup>
      ) : null}
    </>
  );
}
