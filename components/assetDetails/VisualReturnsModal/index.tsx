// NODE MODULES
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';

// Components
import VisualReturns from '../VisualReturns';

// Redux Hooks and Slices
import { useAppSelector } from '../../../redux/slices/hooks';
import {
  setNotifyMeButtonStatus,
  setStructureShowVisualReturns,
} from '../../../redux/slices/monthlyCard';

// Utils
import {
  isAssetBasket,
  isAssetBonds,
  isHighYieldFd,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import { isMldProduct } from '../../../utils/asset';
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import { getTotalAmountPaybale } from '../../../utils/investment';
import { handleElementFocus } from '../../../utils/htmlHelpers';

// Types
import type { FixerraRepaymentResponse } from '../../fd/FDCalculator/utils';

// Apis
import { fetchVisualReturnFdData } from '../../../api/assets';

// Styles
import styles from './VisualReturnsModal.module.css';

const MaterialModalPopup = dynamic(
  () => import('../../primitives/MaterialModalPopup'),
  { ssr: false }
);

export default function VisualiseReturnsModal() {
  const dispatch = useDispatch();
  const asset = useAppSelector((state) => state.assets?.selectedAsset);
  const showStructureVisualReturns = useAppSelector(
    (state) => state?.monthlyCard?.showStructureVisualReturns
  );
  const { fdInputFieldValue } = useAppSelector(
    (state) => (state as any)?.fdConfig ?? {}
  );
  const { isDisabled: notifyMeDisabled, buttonText: notifyMeButtonText } =
    useAppSelector((state) => state?.monthlyCard?.notifyMeButtonStatus) || {};
  const {
    tenure = 0,
    selectedCheckbox,
    selectedFilter,
  } = useAppSelector((state) => state?.monthlyCard?.fdParams) || {};
  const { singleLotCalculation, units: lotSize } = useAppSelector(
    (state) => state.monthlyCard
  );

  const [fdData, setFdData] = useState<FixerraRepaymentResponse>(null);

  const isMldAsset = isMldProduct(asset);
  const isHighYield = isHighYieldFd(asset);

  const totalInterest = singleLotCalculation?.totalInterest * lotSize;
  const purchasePrice = singleLotCalculation?.purchasePrice * lotSize;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const getFdData = async () => {
      if (
        asset?.assetID &&
        isHighYield &&
        fdInputFieldValue &&
        selectedFilter &&
        tenure
      ) {
        try {
          const calculationData = await fetchVisualReturnFdData({
            assetID: asset?.assetID,
            investmentAmount: fdInputFieldValue ?? 0,
            tenure: Math.ceil(tenure),
            payoutFrequency: selectedFilter,
            format: 'data',
            seniorCitizen: selectedCheckbox?.srCitizen ?? false,
            womenCitizen: selectedCheckbox?.women ?? false,
            signal,
          });

          setFdData(calculationData as FixerraRepaymentResponse);
        } catch (err) {
          console.log(err);
        }
      }
    };
    const debounceFetch = setTimeout(() => {
      getFdData();
    }, 500);

    return () => {
      clearTimeout(debounceFetch);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    asset?.assetID,
    asset?.productSubcategory,
    fdInputFieldValue,
    selectedFilter,
    tenure,
    selectedCheckbox?.srCitizen,
    selectedCheckbox?.women,
  ]);

  const handleStructureModal = (val: boolean) => {
    dispatch(setStructureShowVisualReturns(val));
  };

  const handleBtnClick = () => {
    handleElementFocus('#FdButton', () => handleStructureModal(false));
  };

  const handleEditUnit = () => {
    handleElementFocus('#inputAmount', () => handleStructureModal(false));
  };

  const onClickVisualInvestNow = () => {
    dispatch(
      setNotifyMeButtonStatus({
        triggerNotifyMeButton: true,
      })
    );
    handleStructureModal(false);
  };

  const fdVisalReturnsProps = {
    isMldAsset: false,
    fdRepaymentMetric: fdData?.repaymentMetric || [],
    seniorCitizen: selectedCheckbox?.srCitizen ?? false,
    womenCitizen: selectedCheckbox?.women ?? false,
    asset: asset,
    investment: '',
    isPreTax: false,
    amount: fdInputFieldValue,
    selectedFilter: selectedFilter,
    hideEditButton: false,
    buttonText: 'Invest Now',
    disableInvestButton: false,
    tenure: tenure,
    handleContinueButtonClick: handleBtnClick,
    handleEditReturns: handleEditUnit,
  };

  const investmentAmountBondsSDI = getTotalAmountPaybale(
    singleLotCalculation?.investmentAmount,
    singleLotCalculation?.stampDuty,
    lotSize
  );

  const inCommaSeperated =
    notifyMeButtonText === 'Invest Now'
      ? numberToIndianCurrencyWithDecimals(investmentAmountBondsSDI)
      : '';

  const sdiVisalReturnsProps = {
    asset: asset,
    investment: '',
    isPreTax: false,
    amount: investmentAmountBondsSDI,
    hideEditButton: false,
    handleContinueButtonClick: onClickVisualInvestNow,
    buttonText: `${notifyMeButtonText} ${inCommaSeperated}`,
    disableInvestButton: notifyMeDisabled,
    lotSize: lotSize,
    totalInterest: totalInterest,
    purchasePrice: purchasePrice,
  };

  const bondsVisalReturnsProps = {
    isMldAsset: isMldAsset,
    asset: asset,
    investment: '',
    isPreTax: false,
    amount: investmentAmountBondsSDI,
    hideEditButton: false,
    handleContinueButtonClick: onClickVisualInvestNow,
    buttonText: `${notifyMeButtonText} ${inCommaSeperated}`,
    disableInvestButton: notifyMeDisabled,
    lotSize: lotSize,
  };

  const renderVisualiseReturns = () => {
    if (isHighYield) {
      return <VisualReturns {...fdVisalReturnsProps} />;
    }

    if (
      isAssetBonds(asset) ||
      (isAssetBasket(asset) && asset?.childAssetType === 'Bonds')
    ) {
      return <VisualReturns {...bondsVisalReturnsProps} />;
    }

    if (
      isSDISecondary(asset) ||
      (isAssetBasket(asset) &&
        ['SDI', 'Bonds & SDI'].includes(asset?.childAssetType))
    ) {
      return <VisualReturns {...sdiVisalReturnsProps} />;
    }

    return null;
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={showStructureVisualReturns}
      className={`${styles.VisualReturnModalPopup} ${styles.BondsVisualReturns}`}
      drawerExtraClass={styles.VisualReturnsDrawer}
      cardStyles={{ padding: '0 0 0 4px' }}
      handleModalClose={() => handleStructureModal(false)}
    >
      {renderVisualiseReturns()}
    </MaterialModalPopup>
  );
}
