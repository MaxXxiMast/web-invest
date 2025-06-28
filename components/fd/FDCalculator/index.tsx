// NODE MODULES
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Components
import CustomCheckbox from '../../primitives/Checkbox';
import Breakdown from '../Breakdown';
import VisualReturns from '../../assetDetails/VisualReturns';
import FDButton from '../FDButton';
import SortBy from '../../primitives/SortBy/SortBy';
import FDGraph from '../../fd-graph';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';

// Utils
import {
  ExtraInterestRate,
  FixerraRepaymentResponse,
  fdCalculatorData,
} from './utils';
import { handleElementFocus } from '../../../utils/htmlHelpers';
import {
  numberToCurrency,
  numberToIndianCurrency,
} from '../../../utils/number';
import { mapOrder } from '../../../utils/arr';
import { tenureOrder, tenureOrderMapping } from '../../../utils/fd';
import { trackEvent } from '../../../utils/gtm';
import { trackVisualReturnsClick } from '../../../utils/event';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Redux Hooks
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { setFdParams } from '../../../redux/slices/monthlyCard';
import { setFdInputValue } from '../../../redux/slices/fd';

// API
import { fetchFDGraphData, fetchVisualReturnFdData } from '../../../api/assets';

// Styles
import styles from './FDCalculator.module.css';

const MaterialModalPopup = dynamic(
  () => import('../../primitives/MaterialModalPopup'),
  {
    ssr: false,
  }
);

function FDCalculator(props) {
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery();

  const { fdInputFieldValue, fdCalculationMetaData } = useAppSelector(
    (state) => (state as any)?.fdConfig ?? {}
  );
  const { userData: user } = useAppSelector((state) => state.user);

  const { minAmount = 0, maxAmount = 0 } = useAppSelector(
    (state) => (state as any)?.fdConfig?.fdCalculationMetaData ?? {}
  );

  const [fdData, setFdData] = useState<FixerraRepaymentResponse>(null);
  const [graphLoading, setGraphLoading] = useState(true);

  const [selectedCheckbox, setSelectedCheckbox] = useState({
    srCitizen: false,
    women: false,
  });

  const [calculationLoading, setCalculationLoading] = useState(false);
  const [showVisualReturns, setShowVisualReturns] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [payoutArr, setPayoutArr] = useState([] as string[]);
  const [extraInterestRate, setExtraInterestRate] =
    useState<ExtraInterestRate>(null);

  const [graphData, setGraphData] = useState({
    options: [],
    tenureByIntrest: [],
    scaleRange: { min: 0, max: 10 },
    selectedOption: 0,
  });
  const [tenure, setTenure] = useState(0);
  const [minMaxError, setSetMinMaxError] = useState({
    minAmountErr: false,
    maxAmountErr: false,
    nbfcError: false,
  });

  const { label, uiValue, breakDownData } = fdCalculatorData({
    pageData: {},
    preTaxReturn: fdData?.totalMaturityAmount,
    breakDownAmount: [fdInputFieldValue, fdData?.totalPayout],
  });

  const asset = useAppSelector((state) => state.assets.selectedAsset);

  useEffect(() => {
    if (fdCalculationMetaData) {
      const data = fdCalculationMetaData;
      setExtraInterestRate(data?.extraInterestRate || {});
      dispatch(
        setFdParams({
          selectedCheckbox: {
            srCitizen: data?.extraInterestRate?.seniorCitizen?.defaultChecked,
            women: data?.extraInterestRate?.women?.defaultChecked,
          },
        })
      );
      const payoutArr: any[] = data?.interestPayout || [];
      if (payoutArr.length) {
        const sortedArray = mapOrder(payoutArr, tenureOrder);
        setPayoutArr(sortedArray);
        dispatch(
          setFdParams({
            selectedFilter: sortedArray?.[0],
          })
        );
        setSelectedFilter(sortedArray?.[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fdCalculationMetaData]);

  useEffect(() => {
    // SAME LOGIC ADDED TO AVOID API CALL IN MOBILE
    const errObject = {
      minAmountErr: false,
      maxAmountErr: false,
      nbfcError: false,
    };

    if (
      Number(fdInputFieldValue) < minAmount ||
      Number(fdInputFieldValue) > maxAmount
    ) {
      errObject.minAmountErr = Number(fdInputFieldValue) < minAmount;
      errObject.maxAmountErr = Number(fdInputFieldValue) > maxAmount;
      errObject.nbfcError = false;
    }

    if (
      asset?.productSubcategory === 'NBFC' &&
      Number(fdInputFieldValue) % 1000 !== 0
    ) {
      errObject.nbfcError = true;
    }

    const isCalculatorErrNone =
      !errObject.maxAmountErr &&
      !errObject.minAmountErr &&
      !errObject.nbfcError;

    setCalculationLoading(true);

    const controller = new AbortController();
    const { signal } = controller;
    const getFdData = async () => {
      if (
        asset?.assetID &&
        fdInputFieldValue &&
        selectedFilter &&
        tenure &&
        isCalculatorErrNone
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
          setCalculationLoading(false);
        } catch (err) {
          console.log(err);
        }
      }
    };

    // debounce fetch
    const debounceFetch = setTimeout(() => {
      getFdData();
    }, 500);

    // cleanup
    return () => {
      clearTimeout(debounceFetch);
      controller.abort();
    };
  }, [
    asset?.assetID,
    asset?.productSubcategory,
    fdInputFieldValue,
    selectedFilter,
    tenure,
    selectedCheckbox?.srCitizen,
    selectedCheckbox?.women,
    minAmount,
    maxAmount,
  ]);

  const changeAmount = (finalValue: string | number) => {
    dispatch(setFdInputValue(Number(finalValue)));
  };

  const handleFDInvestmentAmtChangeTrackEvent = (
    value: number,
    changed_using: string
  ) => {
    trackEvent('FD Investment Amount Changed', {
      previous: fdInputFieldValue,
      changed_to: value,
      changed_using: changed_using,
      fd_name: asset?.name,
      fd_type: asset?.productSubcategory,
      asset_id: asset?.assetID,
    });
  };
  const handleInputChange = (event: any) => {
    const errObject = {
      minAmountErr: false,
      maxAmountErr: false,
      nbfcError: false,
    };

    const value = event.target.value.replace(/\D/g, '');

    if (
      Number.isNaN(`${value.replaceAll('', '')}`) ||
      Number.isNaN(`${value.replaceAll('[^\\d]', '')}`)
    ) {
      changeAmount(`0`);
      return;
    }

    if (Number(value) < minAmount || Number(value) > maxAmount) {
      errObject.minAmountErr = Number(value) < minAmount;
      errObject.maxAmountErr = Number(value) > maxAmount;
      errObject.nbfcError = false;
    }

    if (asset?.productSubcategory === 'NBFC' && Number(value) % 1000 !== 0) {
      errObject.nbfcError = true;
    }

    setSetMinMaxError({
      ...errObject,
    });

    if (value.length > 0) {
      changeAmount(`${value.replaceAll(',', '')}`);
      handleFDInvestmentAmtChangeTrackEvent(value, 'keypad');
    } else {
      changeAmount(`0`);
    }
  };

  const renderInputField = () => {
    return (
      <div className={styles.InputFieldContainer}>
        <span className={styles.InputLabel}>Enter Amount</span>
        <span className={`items-align-center-row-wise ${styles.InputField}`}>
          <span>₹</span>
          <input
            type="text"
            value={fdInputFieldValue ? numberToCurrency(fdInputFieldValue) : ''}
            id="inputAmount"
            onChange={handleInputChange}
            autoComplete="off"
          />
        </span>
      </div>
    );
  };

  const handleFilterChange = (newFilter: any) => {
    trackEvent('FD Interest Payout Changed', {
      previous: selectedFilter,
      changed_to: newFilter,
      fd_name: asset?.name,
      fd_type: asset?.productSubcategory,
      asset_id: asset?.assetID,
    });
    setSelectedFilter(newFilter);
  };

  const renderSelectField = () => {
    return (
      <div className={styles.SelectContainer}>
        <div className={styles.InterestPayout}>Interest Payout</div>
        <SortBy
          filterName={selectedFilter}
          data={payoutArr}
          handleFilterItem={handleFilterChange}
          selectedValue={payoutArr.indexOf(selectedFilter)}
          className={styles.filterContainer}
          keyMappingObject={tenureOrderMapping}
        />
      </div>
    );
  };
  const renderFDFields = () => {
    return (
      <>
        <div className={`flex ${styles.FieldContainer}`}>
          {renderInputField()}
          {renderSelectField()}
        </div>

        {minMaxError.maxAmountErr ||
        minMaxError.minAmountErr ||
        minMaxError.nbfcError ? (
          <div className={styles.Error}>
            {minMaxError.minAmountErr ? (
              <span>
                Min investment amount should be &#8377;
                {numberToCurrency(minAmount)}
              </span>
            ) : minMaxError.maxAmountErr ? (
              <span>
                Max investment amount should be &#8377;
                {numberToCurrency(maxAmount)}
              </span>
            ) : (
              <span>Investment amount should be a multiple of 1000</span>
            )}
          </div>
        ) : null}
      </>
    );
  };

  const renderHeaderData = () => {
    return (
      <div
        className={`items-align-center-row-wise ${styles.InvestmentTypeRight}`}
      >
        <span className={`icon-check-circle ${styles.CheckIcon}`} />
        <span>
          {asset?.category === 'bank' ? 'DICGC Insured' : 'NBFC Rating'}{' '}
          <span className="Amount">
            {asset?.category === 'bank'
              ? 'Upto 5L'
              : asset?.assetMappingData?.calculationInputFields?.rating}
          </span>
        </span>
      </div>
    );
  };

  const onChangeCheckbox = (value: string, checked = false) => {
    const item_unchange = value == 'women' ? 'sr_citizen' : 'women';

    trackEvent('FD Extra Returns Checked', {
      item_changed: value,
      previous: selectedCheckbox[value] ? 1 : 0,
      changed_to: !selectedCheckbox[value] ? 1 : 0,
      item_unchanged: item_unchange,
      unchanged_item_value: selectedCheckbox[item_unchange] ? 1 : 0,
      fd_name: asset?.name,
      fd_type: asset?.productSubcategory,
      asset_id: asset?.assetID,
    });
    setSelectedCheckbox({
      ...selectedCheckbox,
      [value]: checked,
    });
  };

  const handleVisualModalClose = (showORHideDialog: boolean) => {
    if (showORHideDialog) {
      trackVisualReturnsClick({
        asset,
        userID: user?.userID,
        investmentAmount: fdInputFieldValue,
        isMobile,
      });
    }
    // TODO: Add tracking for FD Visual Returns
    setShowVisualReturns(showORHideDialog);
  };

  const renderButton = () => {
    return (
      <FDButton
        selectedValues={selectedCheckbox}
        data={{
          assetID: asset?.assetID,
          amount: fdInputFieldValue,
          tenure: tenure,
          payout: selectedFilter,
          isSeniorCitizen: selectedCheckbox?.srCitizen,
          isWomen: selectedCheckbox?.women,
          fdName: asset?.spv?.vendorID,
          category: asset?.category,
        }}
        extraInterestRate={extraInterestRate}
        fdData={fdData}
        disableBtn={
          minMaxError.maxAmountErr ||
          minMaxError.minAmountErr ||
          minMaxError.nbfcError ||
          calculationLoading
        }
      />
    );
  };

  const renderCheckboxes = () => {
    return (
      <div className={`flex justify-between ${styles.CheckBoxMainContainer}`}>
        <div className={styles.ReturnsHeading}>Extra Returns</div>
        <div className={`flex items-center ${styles.CheckboxContainer}`}>
          <div className={`inline-flex items-center ${styles.Checkbox}`}>
            {extraInterestRate?.seniorCitizen?.render ? (
              <>
                <CustomCheckbox
                  key={'srCitizen'}
                  value={selectedCheckbox.srCitizen}
                  label={'Sr Citizen'}
                  onChange={(_, checked) =>
                    onChangeCheckbox('srCitizen', checked)
                  }
                />
                <TooltipCompoent toolTipText="Aged 60 and above">
                  <span className={`icon-info ${styles.TooltipIcon}`} />
                </TooltipCompoent>
              </>
            ) : null}
          </div>
          <div>
            {extraInterestRate?.women?.render ? (
              <CustomCheckbox
                key={'women'}
                value={selectedCheckbox.women}
                label={'Women'}
                onChange={(_, checked) => onChangeCheckbox('women', checked)}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const handleEditUnit = () => {
    handleElementFocus('#inputAmount', () => setShowVisualReturns(false));
  };

  const handleBtnClick = () => {
    handleElementFocus('#FdButton', () => setShowVisualReturns(false));
  };

  useEffect(() => {
    setGraphLoading(true);

    const getGraphData = () => {
      if (asset.assetID && selectedFilter) {
        fetchFDGraphData({
          assetID: asset.assetID,
          women: selectedCheckbox.women,
          seniorCitizen: selectedCheckbox.srCitizen,
          interestPayout: selectedFilter,
        })
          .then((res) => {
            res.sort((a: any, b: any) => a.maxTenure - b.maxTenure);
            let options = [];
            let tenureByIntrest = [];
            let selectedOption = 0;
            const minInterest = Math.min(
              ...res.map((x: any) => x.interestRate)
            );
            const maxInterest = Math.max(
              ...res.map((x: any) => x.interestRate)
            );
            res.forEach((element: any, index: number) => {
              if (element.visibility === 0) {
                return;
              }
              let possibleOptions = [];
              let i = element.minTenure;
              do {
                possibleOptions.push(i.toFixed(2));
                options.push({
                  label:
                    i === element.minTenure && element.label !== '.'
                      ? element.label
                      : null,
                  value: i.toFixed(2),
                });
                if (Math.round(i % 30.42) === 1) {
                  i += 29.42;
                } else {
                  i += 30.42;
                }
              } while (
                i.toFixed(2) < element.maxTenure ||
                (index === res.length - 1 && i.toFixed(2) <= element.maxTenure)
              );
              tenureByIntrest.push({
                options: possibleOptions,
                interest: element.interestRate,
              });
            });
            const maxInterestObjects = tenureByIntrest.filter(
              (item) => item.interest === maxInterest
            );
            const mostValuableDeal = maxInterestObjects.reduce(
              (minObj, currentObj) => {
                const currentOption = parseFloat(currentObj.options[0]);
                const minOption = parseFloat(minObj.options[0]);
                return currentOption < minOption ? currentObj : minObj;
              }
            );
            selectedOption = options.findIndex(
              (item) => item.value === mostValuableDeal.options[0]
            );
            setGraphData({
              options,
              tenureByIntrest,
              scaleRange: { min: minInterest - 1, max: maxInterest + 0.4 },
              selectedOption: selectedOption,
            });
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            setGraphLoading(false);
          });
      }
    };

    const delayDebounceFn = setTimeout(() => {
      getGraphData();
    }, 100);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCheckbox, selectedFilter, asset]);

  const handleTenureChange = (val) => {
    setTenure(val);
  };

  const renderChipArr = () => {
    const arr = props?.chipsArr?.fdChips ?? [];

    const handlefdamountchange = (value, index) => {
      trackEvent('chip_click', {
        assetID: asset?.assetID,
        chip_value: value,
        chip_position: index + 1,
        is_popular: index === 1,
        chip_type: 'amount',
      });

      changeAmount(value);
      handleFDInvestmentAmtChangeTrackEvent(value, 'recommended');
    };

    return (
      <div
        className={`flex ${styles.AmountCloud} ${styles.AmountCloudSDI}`}
        id="fd"
      >
        {arr?.map((value, index) => {
          return (
            <span
              key={`${value}`}
              onClick={() => handlefdamountchange(value, index)}
              className={styles.AmountCloudItem}
              id={fdInputFieldValue === value ? styles.selectedChip : ''}
            >
              {numberToIndianCurrency(value)}
              {index === 1 && <p id={styles.popularTag}>Popular</p>}
            </span>
          );
        })}
      </div>
    );
  };
  return (
    <>
      <div className={styles.MonthlyReturnCardContent}>
        <div className={styles.CardTop}>
          <div
            className={`items-align-center-row-wise ${styles.InvestmentType}`}
          >
            <div className={styles.InvestmentTypeLeft}>
              <h5>Invest now</h5>
            </div>
            {renderHeaderData()}
          </div>
          {renderFDFields()}
          {renderChipArr()}
        </div>
        {/* BreakDown Data */}
        <div className={`${styles.CardBottom}`}>
          {renderCheckboxes()}
          <FDGraph
            graphData={graphData}
            setTenure={handleTenureChange}
            graphLoading={graphLoading}
            extraInterestRate={extraInterestRate}
          />
          <ul className={styles.CountList}>
            <Breakdown
              asset={asset}
              id={'fd-sidebar-principal'}
              topData={{
                label,
                uiValue,
                tooltipText: '',
              }}
              breakdownData={breakDownData}
              loading={calculationLoading}
            />
          </ul>

          <div className={styles.ContinueSection}>{renderButton()}</div>
        </div>
      </div>
      <p className={styles.TandC}>
        By continuing, I consent to sharing my Personal Information with the
        chosen Bank/ NBFC, and agree to the{' '}
        <Link href={'/legal#termsAndConditions'} target="_blank">
          T&Cs
        </Link>{' '}
        &{' '}
        <Link href={'/legal#privacy'} target={'_blank'}>
          Privacy Policy
        </Link>
      </p>
      <MaterialModalPopup
        isModalDrawer
        showModal={showVisualReturns}
        className={`${styles.VisualReturnModalPopup} ${styles.BondsVisualReturns}`}
        drawerExtraClass={styles.VisualReturnsDrawer}
        handleModalClose={() => handleVisualModalClose(false)}
      >
        <VisualReturns
          isMldAsset={false}
          handleModalClose={(res: boolean) => handleVisualModalClose(res)}
          fdRepaymentMetric={fdData?.repaymentMetric || []}
          seniorCitizen={selectedCheckbox?.srCitizen ?? false}
          womenCitizen={selectedCheckbox?.women ?? false}
          asset={asset}
          investment={''}
          isPreTax={false}
          amount={fdInputFieldValue}
          selectedFilter={selectedFilter}
          hideEditButton={false}
          handleEditReturns={() => handleEditUnit()}
          buttonText={'Invest Now'}
          disableInvestButton={false}
          tenure={tenure}
          handleContinueButtonClick={handleBtnClick}
        />
      </MaterialModalPopup>
    </>
  );
}

export default FDCalculator;
