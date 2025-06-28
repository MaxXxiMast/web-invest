// NODE MODULES
import React, { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/router';
import dompurify from 'dompurify';
import dynamic from 'next/dynamic';

// Components
import TooltipCompoent from '../../../primitives/TooltipCompoent/TooltipCompoent';
import KYCUnderVerificationSideBar from '../../KycUnderVerification';
import NotifyMeButton from '../../NotifyMeButton';
import { ReturnAndInvestmentModal } from './ReturnAndInvestmentModal';
import NumberAnimation from '../../../number-animator';
import AssetCalculatorSkeleton from '../../AssetCalculatorSkeleton/AssetCalculatorSkeleton';

// Utils
import { toCurrecyStringWithDecimals } from '../../../../utils/number';
import { callErrorToast } from '../../../../api/strapi';
import { getTotalAmountPaybale } from '../../../../utils/investment';
import { handleChipsSuggestions } from '../utils/chips_utils';
import { trackEvent } from '../../../../utils/gtm';
import { getOverallDefaultKycStatus } from '../../../../utils/discovery';
import { getMaturityDate, getMaturityMonths } from '../../../../utils/asset';
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
import { trackVisualReturnsClick } from '../../../../utils/event';
import { isHighYieldFd } from '../../../../utils/financeProductTypes';
import { getAssetOverview } from '../../AssetTopCard/utils';
import { isHideCutOut } from '../../../primitives/AssetCard/utils';

// Hooks
import { useAppDispatch, useAppSelector } from '../../../../redux/slices/hooks';

//Redux
import {
  setStructureShowVisualReturns,
  setUnits,
  updateHeaderSlot,
} from '../../../../redux/slices/monthlyCard';

// Types
import type { CalculateData } from '../types';

// Styles
import styles from './SideBarCalculator.module.css';

const Breakdown = dynamic(() => import('../Breakdown'), {
  ssr: false,
});

interface SideBarCalculatorProps {
  handleInvestNowBtnClick?: (val: boolean) => void;
  handleKycContinue: () => void;
  data: CalculateData;
  chipsArr: any;
  isDefault?: boolean;
}

function SideBarCalculator(props: PropsWithChildren<SideBarCalculatorProps>) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const sanitizer = dompurify.sanitize;
  const isMobile = useMediaQuery();

  const {
    handleInvestNowBtnClick = () => {},
    handleKycContinue = () => {},
    isDefault = true,
  } = props;

  const {
    singleLotCalculation = {},
    units: lotSize,
    disableBondsInvestBtn: disableInvestBtn,
    submitLoading,
  } = useAppSelector((state) => state.monthlyCard);

  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const isFD = asset ? isHighYieldFd(asset) : false;
  const assetOverviewInfo: any = asset
    ? getAssetOverview(asset, isMobile, isFD)
    : [];

  const irrDroppingDate = asset?.irrDroppingDate
    ? new Date(asset.irrDroppingDate)
    : null;
  const showIrr = isHideCutOut(irrDroppingDate, asset);

  const {
    data: {
      headerData,
      uniValue,
      preTaxReturnsBreakdown,
      payableAmountBreakdown,
      hideHeaderData,
    },
    chipsArr,
  } = props;

  const chipArr = handleChipsSuggestions(
    asset,
    singleLotCalculation,
    chipsArr?.bondsAndSdiChips
  );
  const isAssetRFQ = asset?.isRfq ?? false;
  const minNoOfLots = singleLotCalculation?.minLots;
  const maxInvestmentAmount = singleLotCalculation?.maxInvestment;
  const { pricePerLot = 1 } = asset?.sdiDetails ?? {};
  const { kycConfigStatus } = useAppSelector((state) => state.user);
  const { NSE: uccStatus = {} } = useAppSelector(
    (state) => state.user?.uccStatus
  );
  const [inputLot, setInputLot] = React.useState(lotSize);
  const [investmentAmount, setInvestmentAmount] = React.useState(0);
  const [disableSubmitBtn, setDisableSubmitBtn] = React.useState(false);
  const [isDisableButton, setIsDisableButton] = React.useState(false);
  const [disableIncrement, setDisableIncrement] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [checkAmount, setCheckAmount] = React.useState(false);
  const [showAmountBreakdownModal, setShowAmountBreakdownModal] =
    React.useState(false);
  const [amountBreakdown, setAmountBreakdown] = React.useState(null);

  useEffect(() => {
    if (!submitLoading) {
      setLoading(false);
    }
  }, [submitLoading]);

  useEffect(() => {
    const amount = getTotalAmountPaybale(
      singleLotCalculation?.investmentAmount,
      singleLotCalculation?.stampDuty,
      inputLot
    );
    setInvestmentAmount(amount);
  }, [
    singleLotCalculation?.investmentAmount,
    singleLotCalculation?.stampDuty,
    inputLot,
  ]);

  const handleLotFromUrl = (value) => {
    if (value === '') {
      return;
    }

    const investmentAmount = singleLotCalculation?.investmentAmount ?? 0;
    const stampDuty = singleLotCalculation?.stampDuty ?? 0;
    const totalAmountPayable = getTotalAmountPaybale(
      investmentAmount,
      stampDuty,
      value
    );

    let updatedValue = 0;

    if (value < minNoOfLots) {
      updatedValue = minNoOfLots;
    } else if (totalAmountPayable > maxInvestmentAmount) {
      const divisor = investmentAmount + stampDuty;
      const maxLots =
        divisor === 0 ? 1 : Math.floor(maxInvestmentAmount / divisor);
      updatedValue = maxLots;
    } else {
      updatedValue = value;
    }

    onLotChange(updatedValue);
    dispatch(setUnits(updatedValue));
  };

  useEffect(() => {
    updateHeaderSlotAsset(inputLot, inputLot * pricePerLot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputLot]);

  useEffect(() => {
    onLotChange(lotSize === -1 ? minNoOfLots : lotSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotSize]);

  useEffect(() => {
    if (singleLotCalculation?.minLots != undefined) {
      dispatch(setUnits(singleLotCalculation?.minLots || 0));
    }
    if (router.isReady) {
      const { units } = router.query;
      const purifyunits = units ? sanitizer(units) : '';

      if (purifyunits && !isNaN(Number(purifyunits))) {
        handleLotFromUrl(Math.ceil(Number(purifyunits)));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query, singleLotCalculation?.minLots]);

  const updateHeaderSlotAsset = (lotsUnits: number, totalAmount: number) => {
    const data = {
      lots: lotsUnits,
      totalAmount: totalAmount,
      isDisableButton,
    };
    dispatch(updateHeaderSlot({ data, asset }));
  };

  const onLotChange = (lotsValue: number) => {
    let lots = Number(lotsValue);
    if (lots < 0) {
      lots = 0;
    }
    setInputLot(lots);
    if (lotsValue < minNoOfLots) {
      setDisableSubmitBtn(true);
    } else {
      setDisableSubmitBtn(false);
    }

    const amount = getTotalAmountPaybale(
      singleLotCalculation?.investmentAmount,
      singleLotCalculation?.stampDuty,
      lotsValue
    );

    // Max Order Amount should not exceed by 2 Lakh 200000
    if (amount <= maxInvestmentAmount) {
      setIsDisableButton(false);
      setDisableIncrement(false);
      updateHeaderSlotAsset(lots, amount);
    }

    // Show toast when suggested chip selected
    if (amount > maxInvestmentAmount) {
      setDisableIncrement(true);
      updateHeaderSlotAsset(lots, amount);
    }
  };

  useEffect(() => {
    setCheckAmount(
      investmentAmount >= maxInvestmentAmount ||
        disableInvestBtn ||
        disableSubmitBtn ||
        disableIncrement
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investmentAmount]);

  const handleLotChangedTrackevent = (
    previous: number,
    changedTo: number,
    changed_using: string
  ) => {
    trackEvent('Lots Number Changed', {
      previous: previous,
      changed_to: changedTo,
      changed_using: changed_using,
      product_category: asset?.productCategory,
      product_sub_category: asset?.productSubcategory,
      financial_product_type: asset?.financeProductType,
      asset_id: asset?.assetID,
    });
  };
  const handleLotChangeChips = (lotChipSelected: number, index: number) => {
    trackEvent('chip_click', {
      assetID: asset?.assetID,
      chip_value: lotChipSelected,
      chip_position: index + 1,
      is_popular: index === 1,
      chip_type: 'lot',
    });
    const previous = inputLot;
    const changedTo = lotChipSelected;
    onLotChange(lotChipSelected);
    handleLotChangedTrackevent(previous, changedTo, 'recommended');
  };

  const handleSubmitClick = async (isMarketClosed: boolean) => {
    const kycStatus =
      getOverallDefaultKycStatus(kycConfigStatus) === 'verified';
    const userUccStatus = uccStatus?.status || '';

    const { default: defaultKycStatus = {} } = kycConfigStatus || {};
    const { isFilteredKYCComplete } = defaultKycStatus;

    const isAmo = isMarketClosed && asset?.isRfq;
    const buttonElement = document.getElementById('notifyMeButton');
    const ctaText = buttonElement?.textContent || '';
    const previousPath = sessionStorage.getItem('lastVisitedPage') as string;

    trackEvent('Invest Now Button Clicked', {
      tenure: getMaturityMonths(getMaturityDate(asset)),
      investment_amount: investmentAmount,
      total_returns: preTaxReturnsBreakdown.uiValue,
      product_category: asset?.productCategory,
      product_sub_category: asset?.productSubcategory,
      kyc_status: kycStatus,
      ucc_status: userUccStatus || false,
      irr: asset?.irr,
      rfq_enabled: asset?.isRfq,
      fd_kyc_status: isFilteredKYCComplete,
      amo: isAmo,
      obpp_kyc_status: isFilteredKYCComplete,
      cta_text: ctaText,
      ['quantities selected']: lotSize,
      URL: window.location.href,
      financial_product_type: asset?.financeProductType,
      path: previousPath,
      assetLogo: asset?.partnerLogo,
      assetDescription: asset?.partnerName,
    });

    const totalVal = asset.preTaxTotalMaxAmount;
    const pendingAmount = totalVal - asset.collectedAmount;

    if (
      !isMarketClosed &&
      isAssetRFQ &&
      Number(pendingAmount) < Number(investmentAmount)
    ) {
      if (pendingAmount < 0) {
        callErrorToast(`We are not accepting more investments for this deal`);
      } else {
        callErrorToast(
          `You can not invest more than ₹${toCurrecyStringWithDecimals(
            pendingAmount,
            1,
            false
          )}`
        );
      }

      return;
    }

    handleInvestNowBtnClick(isMarketClosed);
  };

  const renderButton = () => {
    if (!isDefault) return null;
    return (
      <NotifyMeButton
        disabled={checkAmount}
        handleSubmitClick={handleSubmitClick}
        handleKycContinue={handleKycContinue}
        id="notifyMeButton"
      />
    );
  };

  const minusLots = () => {
    const previous = inputLot;
    const changedTo = inputLot - 1;

    if (previous > Number(minNoOfLots)) {
      handleLotChangedTrackevent(previous, changedTo, 'icon_button');
    }

    if (inputLot === 1) {
      onLotChange(1);

      return;
    }
    if (inputLot - 1 < Number(minNoOfLots)) {
      return;
    }

    onLotChange(inputLot - 1);
  };

  const addLots = () => {
    const previous = inputLot;
    const changedTo = inputLot + 1;

    handleLotChangedTrackevent(previous, changedTo, 'icon_button');
    onLotChange(inputLot + 1);
  };

  const handleInputChange = (event: any) => {
    if (event.value.indexOf('.') > 0) {
      return false;
    }
    if (!isNaN(event.value)) {
      if (Number(event.value) < Number(minNoOfLots)) {
        setDisableSubmitBtn(true);
      }
      onLotChange(event.value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      '.',
      'e',
    ];

    if (!allowedKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  };

  const renderLotField = () => {
    return (
      <div className={styles.LotCounterField}>
        <div className={styles.Counter}>
          <div className="flex flex-column items-start">
            <h4>{`No of ${uniValue}s`}</h4>
            <span className={styles.CounterField}>
              <input
                type="number"
                min={minNoOfLots}
                value={inputLot > 0 ? inputLot : ''}
                id="unitField"
                onChange={(e) => handleInputChange(e.target)}
                onKeyDown={handleKeyDown}
              />
            </span>
          </div>
          <div className="flex gap-6 justify-center">
            <span
              className={`${styles.CounterBtn} ${
                inputLot <= Number(minNoOfLots) ? styles.DisabledCounterBtn : ''
              }`}
              onClick={minusLots}
            >
              -
            </span>
            <span
              className={`${styles.CounterBtn} ${
                disableIncrement ? styles.DisabledCounterBtn : ''
              }`}
              onClick={addLots}
            >
              +
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderHeaderData = () => {
    if (hideHeaderData) return null;

    return (
      <div
        className={`items-align-center-row-wise ${styles.InvestmentTypeRight}`}
      >
        <div className={`flex-column ${styles.purchaseUnitContainer}`}>
          <span className={styles.purchaseLabel}>{headerData.value}</span>

          <span className={styles.purchasePrice}>{headerData.label}</span>
        </div>
        {/* tooltip value */}
        {headerData?.tooltipData ? (
          <TooltipCompoent toolTipText={headerData?.tooltipData}>
            <span className={`icon-info ${styles.InfoIcon}`} />
          </TooltipCompoent>
        ) : null}
      </div>
    );
  };

  const renderChipArr = () => {
    return (
      <div
        className={`flex ${styles.AmountCloud} ${styles.AmountCloudSDI}`}
        id="bonds"
      >
        {chipArr.map((value, index) => {
          return (
            <span
              key={value}
              onClick={() => {
                handleLotChangeChips(value, index);
              }}
              className={styles.AmountCloudItem}
              id={lotSize === value ? styles.selectedChip : ''}
            >
              {`${value} ${uniValue}${value === 1 ? '' : 's'}`}
              {index === 1 && <p id={styles.popularTag}>Popular</p>}
            </span>
          );
        })}
      </div>
    );
  };

  const handleAmountClick = (breakdown, label) => {
    setShowAmountBreakdownModal(true);
    setAmountBreakdown({ ...breakdown, label });
  };

  const userData = useAppSelector((state) => state.user.userData);

  const handleVisualClick = () => {
    trackVisualReturnsClick({
      asset,
      userID: userData?.userID,
      investmentAmount,
      lotSize,
      isMobile,
    });
    dispatch(setStructureShowVisualReturns(true));
  };

  if (loading && isDefault) return <AssetCalculatorSkeleton />;

  return (
    <div
      className={`${styles.MonthlyReturnCardContent} ${
        isDefault ? '' : styles.noPadding
      }`}
    >
      {isDefault ? null : (
        <div className="flex justify-between items-center mt-12">
          <div className="flex-column">
            <span className={styles.investmentLabel}>Investment</span>
            <div
              className={styles.investmentValue}
              onClick={() =>
                handleAmountClick(payableAmountBreakdown, 'Investment')
              }
            >
              <NumberAnimation
                numValue={payableAmountBreakdown.numValue}
                roundOff={0}
                numberHeight={14}
                numberWidth={9}
              />
            </div>
          </div>
          <div
            className={`flex items-center justify-center ${styles.ytmAndTenure}`}
          >
            <div className={styles.arrowLineLeft} />
            <div
              className={`flex-column items-center ${styles.ytmAndTenureContainer}`}
            >
              {assetOverviewInfo[0]?.cutOutValue && !showIrr && (
                <span className={styles.cutOutValue}>
                  {assetOverviewInfo[0].cutOutValue}%
                </span>
              )}
              <span>{assetOverviewInfo[0].value || '-'} YTM</span>
              <span>{assetOverviewInfo[1].value || '-'}</span>
            </div>
            <div className={styles.arrowLineRight} />
          </div>
          <div className="flex-column items-end">
            <span className={styles.returnsLabel}>Returns</span>
            <div
              className={styles.returnsValue}
              onClick={() =>
                handleAmountClick(preTaxReturnsBreakdown, 'Returns')
              }
            >
              <NumberAnimation
                numValue={preTaxReturnsBreakdown.numValue}
                roundOff={0}
                numberHeight={14}
                numberWidth={9}
              />
            </div>
          </div>
        </div>
      )}
      <div className={`${styles.CardTop} ${isDefault ? '' : 'mt-8'}`}>
        {isDefault && (
          <div className={styles.InvestmentType}>
            <div className={styles.InvestmentTypeLeft}>
              <h5>Invest now</h5>
            </div>
            {renderHeaderData()}
          </div>
        )}
        {renderLotField()}
        {(disableIncrement || disableSubmitBtn) && (
          <div className={`${styles.LotError} TextStyle2`}>
            {disableSubmitBtn
              ? `Minimum No of ${uniValue}s should be ${minNoOfLots}`
              : `Max Investment Amount should be less than ${toCurrecyStringWithDecimals(
                  singleLotCalculation.maxInvestment,
                  1,
                  false
                )}`}
          </div>
        )}
        {renderChipArr()}
      </div>
      {/* BreakDown Data */}
      <div className={`${styles.CardBottom} ${styles.LotCard}`}>
        {isDefault ? (
          <ul className={styles.CountList}>
            <Breakdown
              asset={asset}
              id={'bonds-sidebar-principal'}
              topData={payableAmountBreakdown}
              breakdownData={payableAmountBreakdown.breakDownData}
            />
            <Breakdown
              asset={asset}
              id={'bonds-sidebar-principal'}
              topData={preTaxReturnsBreakdown}
              breakdownData={preTaxReturnsBreakdown.breakDownData}
              className={`${styles.PostTaxItem} ${styles.SDIPreTaxItem}`}
            />
          </ul>
        ) : null}

        {disableInvestBtn && <KYCUnderVerificationSideBar />}
        <div
          className={`${styles.VisualReturns} ${
            isDefault ? '' : styles.VisualReturnsNew
          } ${disableInvestBtn ? styles.disableInvestBtn : ''}`}
        >
          <div
            className={styles.VisualReturnsInner}
            onClick={handleVisualClick}
          >
            <span className={`icon-visualise-returns ${styles.Icon}`} />
            <span>Visualise Returns</span>
          </div>
        </div>
        <div
          className={
            isDefault ? styles.ContinueSection : styles.actionButtonNew
          }
        >
          {renderButton()}
        </div>
        {props.children}
        <ReturnAndInvestmentModal
          amountBreakdown={amountBreakdown}
          showModal={showAmountBreakdownModal}
          setShowModal={setShowAmountBreakdownModal}
        />
      </div>
    </div>
  );
}

export default SideBarCalculator;
