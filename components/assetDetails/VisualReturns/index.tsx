//Node Modules
import React, { useEffect, useRef, useState } from 'react';

//Components
import Button, { ButtonType } from '../../primitives/Button';
import Image from '../../primitives/Image';
import { Skeleton } from '@mui/material';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';
import NumberAnimation from '../../number-animator';

//Utils
import {
  getAssetReturnCycle,
  getAverageReturns,
  paymentScheduleDownloadLabels,
} from './utils';
import {
  financeProductTypeConstants,
  isAssetBasket,
  isAssetBonds,
  isHighYieldFd,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import {
  dateFormatter,
  formatDate,
  ymdFormat,
} from '../../../utils/dateFormatter';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../../utils/appHelpers';
import {
  numberToIndianCurrencyWithDecimals,
  SDISecondaryAmountToCommaSeparator,
} from '../../../utils/number';
import { trackEvent } from '../../../utils/gtm';
import { SDISECONDARY_TOOLTIPS } from '../../../utils/sdiSecondary';
import { FdRepaymentMetric } from '../../fd/FDCalculator/utils';
import { getRepaymentCycle } from '../../../utils/asset';

//APIs
import {
  fetchVisualReturnData,
  fetchVisualReturnFdDataRedux,
  fileDownloadHandler,
} from '../../../api/assets';
import { callSuccessToast } from '../../../api/strapi';

//Hooks
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

//Redux
import { setUnits } from '../../../redux/slices/monthlyCard';

//Styles
import styles from '../../../styles/VisualReturns.module.css';

type Props = {
  data?: any;
  className?: string;
  handleModalClose?: any;
  handleEditReturns?: any;
  asset: any;
  isPreTax: boolean;
  investment: any;
  amount: number | string;
  hideEditButton?: boolean;
  handleContinueButtonClick?: () => void;
  buttonText?: string;
  disableInvestButton?: boolean;
  lotSize?: number;
  totalInterest?: number;
  purchasePrice?: number;
  isMldAsset?: boolean;
  // For FD
  selectedFilter?: string;
  fdRepaymentMetric?: FdRepaymentMetric[];
  seniorCitizen?: boolean;
  womenCitizen?: boolean;
  tenure?: number;
};

type RepaymentMetric = {
  date: string;
  principalAmount: number;
  tdsAmount: number;
  interestPostTax: number;
  interestPreTax: number;
  totalReturnPostTax: number;
  totalReturnPreTax: number;
};

type HeaderValue = { value: string };

const VisualReturns = (props: Props) => {
  const isMobile = useMediaQuery();
  const dispatch = useAppDispatch();
  const {
    className,
    asset,
    investment,
    isPreTax,
    amount,
    tenure,
    hideEditButton = false,
    handleContinueButtonClick,
    buttonText = 'Invest Now',
    disableInvestButton = false,
    lotSize = 0,

    isMldAsset = false,
    selectedFilter,
    fdRepaymentMetric = [],
    seniorCitizen = false,
    womenCitizen = false,
    handleEditReturns,
  } = props;
  const isBonds = isAssetBonds(asset);
  const isSDI = isSDISecondary(asset);
  const isBasket = isAssetBasket(asset);
  const isFD = isHighYieldFd(asset);
  const [showDownload, setShowDownload] = useState(false);
  const [repaymentData, setRepaymentData] = useState<RepaymentMetric[]>([]);
  const [repaymentHeader, setRepaymentHeader] = useState<{
    [key: string]: HeaderValue;
  }>({}); // repaymentHeader stores the visibility and value of headers for the repayment data table based on the asset type.

  const [isLoading, setIsLoading] = useState(true);
  const wrapperRef = useRef(null);

  const handleClickOutside = (event: any) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setShowDownload(false);
    }
  };
  const { userData } = useAppSelector((state) => state.user);
  const { singleLotCalculation = {} } = useAppSelector(
    (state) => state.monthlyCard
  );

  const cleanEventHandlers = () => {
    // Unbind the event listener on clean up
    document.removeEventListener('mousedown', handleClickOutside);
  };

  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Unbind the event listener on clean up
    return cleanEventHandlers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, lotSize]);

  const addPrincipalAmountToRepaymentData = (repaymentData) => {
    // update principal amount for the last row
    repaymentData.forEach(
      (data, index) =>
        (data.principal = repaymentData.length - 1 === index ? amount : 0)
    );
  };

  useEffect(() => {
    async function fetchRepaymentData() {
      try {
        let returnData = { repaymentMetric: [] };
        if (isFD) {
          // it will update in reference
          addPrincipalAmountToRepaymentData(fdRepaymentMetric);
          returnData = { repaymentMetric: fdRepaymentMetric };
        } else {
          returnData = await fetchVisualReturnData(
            isBonds || isSDI || isBasket ? lotSize : amount,
            asset.assetID,
            isPreTax,
            'data'
          );
        }

        const { repaymentMetric } = returnData;
        setRepaymentData(repaymentMetric);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch repayment data:', error);
      }
    }

    if (lotSize !== -1 || isFD) {
      fetchRepaymentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotSize, asset.assetID, isPreTax]);

  useEffect(() => {
    if (Array.isArray(repaymentData) && repaymentData?.length) {
      renderAssetReturnTable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repaymentData]);

  const getVisualizeTableReturnTextForBonds = () => {
    if (isMldAsset) {
      return 'Returns at Maturity';
    }
    return `Total ${getRepaymentCycle(asset)}`;
  };

  const headerValueFields = (value: string) => ({
    value,
  });

  useEffect(() => {
    if (!lotSize || lotSize === -1) {
      dispatch(setUnits(singleLotCalculation?.minLots));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bondsHeaderMapping = {
    date: headerValueFields('Date'),
    principalAmount: headerValueFields('Principal'),
    interestPreTax: headerValueFields('Interest'),
    totalReturnPreTax: headerValueFields(getVisualizeTableReturnTextForBonds()),
  };

  const sdiHeaderMapping = {
    date: headerValueFields(
      repaymentData?.length > 0 ? 'Date' : 'Expected Payout Date'
    ),
    principalAmount: headerValueFields('Principal'),
    interestPreTax: headerValueFields('Interest'),
    totalReturnPreTax: headerValueFields(`Total ${getRepaymentCycle(asset)}`),
  };

  const PreTaxHeaderMapping = {
    date: headerValueFields('Tentative Date'),
    salariedReturns: headerValueFields('Salaried Returns'),
    postTaxReturns: headerValueFields('Post Tax Returns'),
    totalReturns: headerValueFields('Total Returns'),
  };

  const NonPreTaxHeaderMapping = {
    date: headerValueFields('Tentative Date'),
    totalReturns: headerValueFields('Amount'),
  };

  const FDHeaderMapping = {
    date: headerValueFields('Tentative Date'),
    principal: headerValueFields('Principal'),
    interest: headerValueFields('Interest'),
    amount: headerValueFields('Payout'),
  };

  const renderAssetReturnTable = () => {
    if (isFD) {
      setRepaymentHeader(FDHeaderMapping);
    } else if (isBonds) {
      setRepaymentHeader(bondsHeaderMapping);
    } else if (isSDI || isBasket) {
      setRepaymentHeader(sdiHeaderMapping);
    } else if (isPreTax) {
      setRepaymentHeader(PreTaxHeaderMapping);
    } else {
      setRepaymentHeader(NonPreTaxHeaderMapping);
    }
  };

  // function to handle download excel for  Web
  const handlePDFownload = async () => {
    callSuccessToast('Your download is in progress.');
    let response;
    const fileName = `${asset.name}_${isPreTax ? 'pre' : 'post'}_${amount}.pdf`;
    if (isFD) {
      response = await fetchVisualReturnFdDataRedux({
        payoutFrequency: selectedFilter ?? 'Monthly',
        assetID: asset.assetID,
        investmentAmount: amount,
        tenure: Math.ceil(tenure),
        format: 'pdf',
        seniorCitizen,
        womenCitizen,
      });
    } else {
      response = await fetchVisualReturnData(
        isBonds || isSDI || isBasket ? lotSize : amount,
        asset.assetID,
        isPreTax,
        'pdf'
      );
    }
    response = await response.blob();
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    // Append to html link element page
    document.body.appendChild(link);
    // Start download
    link.click();
  };

  function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // Base64 string
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Converts Blob to base64 string
    });
  }

  const handleDownloadedTrackEvent = (fileType: string) => {
    trackEvent('Visualised Returns Downloaded', {
      file_type: fileType,
      asset_id: asset?.assetID,
      visualised_amount: numberToIndianCurrencyWithDecimals(getInvestedValue()),
      user_id: userData?.userID,
      product_category: asset?.productCategory,
      product_sub_category: asset?.productSubcategory,
      lots_selected: lotSize,
      cta_text: 'As pdf',
      financial_product_type: asset?.financeProductType,
    });
  };

  // common function to handle download PDF for App and Web
  const handleDownloadPDF = async () => {
    const fileName = `${asset.name}_${isPreTax ? 'pre' : 'post'}_${amount}.pdf`;
    handleDownloadedTrackEvent('PDF');
    try {
      let apiUrl = '';
      if (isFD) {
        apiUrl = `/v3/assets/fd/${
          asset.assetID
        }/repaymentMetrics/pdf?investmentAmount=${amount}&tenure=${Math.ceil(
          tenure
        )}&payoutFrequency=${
          selectedFilter ?? 'Monthly'
        }&seniorCitizen=${seniorCitizen}&womenCitizen=${womenCitizen}`;
      } else {
        apiUrl = `/v3/assets/repaymentmetric?assetID=${asset.assetID}&lotSize=${
          isBonds || isSDI || isBasket ? lotSize : amount
        }&format=pdf&isPreTax=${isPreTax}`;
      }

      let base64: any = '';
      if (isRenderedInWebview()) {
        await fileDownloadHandler(apiUrl)
          .then((response) => {
            return response.blob();
          })
          .then(async (blob) => {
            base64 = await convertBlobToBase64(blob);
          });
      }

      postMessageToNativeOrFallback(
        'visualiseReturn',
        {
          apiUrl,
          fileName,
          base64: JSON.stringify(base64),
        },
        handlePDFownload
      );
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  // function to handle download excel for Web
  const handleExcelDownlod = async () => {
    callSuccessToast('Your download is in progress.');
    const date = dateFormatter({
      dateTime: new Date().toDateString(),
      dateFormat: ymdFormat,
    });
    const fileName = `${asset.name}_${amount}_${date}.xlsx`;
    let response = await fetchVisualReturnData(
      isBonds || isSDI || isBasket ? lotSize : amount,
      asset.assetID,
      isPreTax,
      'excel'
    );
    let blob = await response.blob();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    // Start download
    link.click();
  };

  // common function to handle download excel for App and Web
  const downloadExcel = async () => {
    handleDownloadedTrackEvent('Excel');
    try {
      const date = dateFormatter({
        dateTime: new Date().toDateString(),
        dateFormat: ymdFormat,
      });
      const fileName = `${asset.name}_${amount}_${date}.xlsx`;
      const apiUrl = `/v3/assets/repaymentmetric?assetID=${
        asset.assetID
      }&lotSize=${
        isBonds || isSDI || isBasket ? lotSize : amount
      }&format=excel&isPreTax=${isPreTax}`;

      let base64: any = '';

      if (isRenderedInWebview()) {
        await fileDownloadHandler(apiUrl)
          .then((response) => {
            return response.blob();
          })
          .then(async (blob) => {
            base64 = await convertBlobToBase64(blob);
          });
      }

      postMessageToNativeOrFallback(
        'visualiseReturn',
        {
          apiUrl: apiUrl,
          fileName,
          base64: JSON.stringify(base64),
        },
        handleExcelDownlod
      );
    } catch (error) {
      console.error('Failed to download Excel:', error);
    }
  };

  const handleDownload = (id: string) => {
    switch (id) {
      case 'pdf': {
        handleDownloadPDF();
        break;
      }
      case 'csv': {
        downloadExcel();
        break;
      }
    }
  };

  const renderPaymentSchedulePopupItem = ({ id, label, icon }, index) => {
    return id === 'pdf' ||
      (id === 'csv' &&
        asset?.productCategory !== financeProductTypeConstants.highyieldfd) ? (
      <div
        key={`${id}`}
        className={`flex ${styles.DownloadSchedulePopupItemContainer}`}
        onClick={() => handleDownload(id)}
      >
        <div className={styles.DownloadSchedulePopupIcon}>
          <Image src={icon} alt="icon" />
        </div>
        <div className={styles.DownloadSchedulePopupText}>{label}</div>
      </div>
    ) : null;
  };

  const renderDownload = () => {
    return showDownload ? (
      <div className={styles.DownloadSchedulePopup}>
        {paymentScheduleDownloadLabels.map(renderPaymentSchedulePopupItem)}
      </div>
    ) : null;
  };

  const renderTooltip = () => {
    return (
      <TooltipCompoent
        toolTipText={SDISECONDARY_TOOLTIPS.INTEREST_SDISECONDARY}
      >
        <span className={`icon-info ${styles.Info}`} />
      </TooltipCompoent>
    );
  };

  const getTotalsOfData = (item: string) => {
    const total = repaymentData?.reduce((acc, obj) => acc + obj[item], 0);
    return numberToIndianCurrencyWithDecimals(total);
  };

  const renderTotals = () => {
    if (asset?.productCategory === 'High Yield FDs') {
      return null;
    }
    return (
      <tr key={`row__total`}>
        <td>Total</td>
        {Object.keys(repaymentHeader).map((item: string) => {
          if (item === 'date') {
            return (
              <td key={`row__total-column__${item}`}>
                {`${repaymentData?.length} Returns`}
              </td>
            );
          }
          return (
            <td key={`column__${item}`}>
              <NumberAnimation
                numValue={getTotalsOfData(item)}
                numberWidth={8}
                color="var(--gripTextMain,#373a46)"
              />
            </td>
          );
        })}
      </tr>
    );
  };

  const renderSkeleton = () => (
    <>
      <Skeleton
        animation="wave"
        variant="rounded"
        height={500}
        width={`100%`}
        data-testid="skeleton-loader"
      />
    </>
  );

  const renderHeader = () => (
    <thead>
      <tr>
        <th>#</th>
        {Object.values(repaymentHeader).map((item: HeaderValue) => {
          return (
            <th key={`header__${item.value}`}>
              {item?.value ?? 'NA'}{' '}
              {item?.value === 'TDS Adjusted Returns' ? renderTooltip() : null}
            </th>
          );
        })}
      </tr>
    </thead>
  );

  const renderVisualizeTableForBondsAndSDISecondary = () => {
    return (
      <table className={`${styles.BondsTable} ${styles.VisualiseTable}`}>
        {renderHeader()}
        <tbody>
          {repaymentData?.map((data: RepaymentMetric, i: number) => {
            return (
              <tr key={`row__${data.date}-${data.principalAmount}`}>
                <td>{i + 1}</td>
                {Object.keys(repaymentHeader).map((item: string) => {
                  if (item === 'date') {
                    return (
                      <td
                        key={`row__${data.date}-${data.principalAmount}-column__${item}`}
                      >
                        {dateFormatter({
                          dateTime: data[item],
                          dateFormat: formatDate,
                        })}
                      </td>
                    );
                  }
                  return (
                    <td key={`column__${item}`}>
                      <NumberAnimation
                        numValue={Number(data[item])}
                        numberWidth={8}
                        color="var(--gripTextMain,#373a46)"
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {renderTotals()}
        </tbody>
      </table>
    );
  };

  const renderAssetUnit = () => {
    if (isSDI) {
      return `${lotSize > 1 ? 'lots' : 'lot'}`;
    }
    return `${lotSize > 1 ? 'units' : 'unit'}`;
  };

  const getInvestedValue = () =>
    isSDI ? SDISecondaryAmountToCommaSeparator(amount) : amount;

  let FdEventsFields: { lots_selected: number | string };

  if (isFD) {
    FdEventsFields = {
      lots_selected: getInvestedValue(),
    };
  } else {
    FdEventsFields = {
      lots_selected: lotSize,
    };
  }

  const handleDownloadClick = () => {
    trackEvent('Download Visualised Returns Clicked', {
      asset_id: asset?.assetID,
      visualised_amount: getInvestedValue(),
      user_id: userData?.userID,
      product_category: asset?.productCategory,
      product_sub_category: asset?.productSubcategory,
      cta_text: 'Download',
      financial_product_type: asset?.financeProductType,
      lots_selected: FdEventsFields.lots_selected,
    });
    setShowDownload(true);
  };

  const handleUnits = (type: string) => {
    const newUnits = type === 'incr' ? lotSize + 1 : lotSize - 1;
    dispatch(setUnits(newUnits));
  };

  const renderBottomContainerCalc = () => {
    const minusDisabled =
      Number(lotSize) === (singleLotCalculation?.minLots || 1);
    const addDisabled =
      singleLotCalculation?.maxInvestment <= getInvestedValue();
    if (isBonds || isSDI || isBasket) {
      return (
        <span className="Amount">
          {!hideEditButton ? (
            <div className="flex justify-between items-center gap-12">
              <Button
                width={30}
                compact
                className={
                  minusDisabled ? styles.lotsDisable : styles.lotsButton
                }
                variant={ButtonType.PrimaryLight}
                onClick={() => handleUnits('decr')}
              >
                -
              </Button>
              <div
                className={`${
                  isMobile ? 'flex-column' : 'flex'
                } items-center justify-center`}
              >
                <div className={styles.assetUnits}>{lotSize}</div>{' '}
                <div className={styles.unitSuffix}>{renderAssetUnit()}</div>
              </div>
              <Button
                width={30}
                compact
                className={addDisabled ? styles.lotsDisable : styles.lotsButton}
                variant={ButtonType.PrimaryLight}
                onClick={() => handleUnits('incr')}
              >
                +
              </Button>
            </div>
          ) : null}
        </span>
      );
    }

    return (
      <>
        <span className="Label">
          {isBonds || isSDI || isBasket || isFD
            ? 'Investment Amount: '
            : ' Selected Investment: '}
        </span>
        <span className="Amount">
          {numberToIndianCurrencyWithDecimals(getInvestedValue())}
          <span className={styles.UnitCount}>
            {(isBonds || isSDI || isBasket) &&
              `(${lotSize} ${renderAssetUnit()})`}
          </span>
          {!hideEditButton ? (
            <button
              className={styles.EditBtn}
              onClick={() => handleEditReturns()}
              aria-label="Edit Returns"
              type="button"
            >
              <span className={`icon-edit ${styles.Edit}`} />
            </button>
          ) : null}
        </span>
      </>
    );
  };

  return (
    <div className={`${styles.VisualReturnsMain} ${className}`}>
      <div className={styles.VisualReturnsInner}>
        <div className={styles.Card}>
          <div className={styles.CardInner}>
            <div className={`${styles.CardHeader} ${styles.VisulaCardHeader}`}>
              <div className={styles.CardHeaderLeft}>
                <span className={styles.ImageIcon}>
                  <span className={`icon-rupees2 ${styles.Rupee}`} />
                </span>
                <span className={styles.Label}>Visualise Returns</span>
              </div>
              {!isLoading && (
                <div className={styles.CardHeaderRight} ref={wrapperRef}>
                  <span
                    className={styles.DownloadBtn}
                    onClick={handleDownloadClick}
                  >
                    <span className={`icon-download ${styles.DownloadIcon}`} />{' '}
                    Download
                  </span>
                  {renderDownload()}
                </div>
              )}
            </div>

            <div
              className={`${styles.CardBody} ${
                asset?.productCategory !== 'High Yield FDs'
                  ? styles.TotalRow
                  : ''
              }`}
            >
              {isLoading
                ? renderSkeleton()
                : renderVisualizeTableForBondsAndSDISecondary()}
            </div>
            <div className={styles.CardFooter}>
              <div className={styles.InvestmentItem}>
                {renderBottomContainerCalc()}
              </div>
              {!isBonds && !isBasket && !isSDI && !isFD && (
                <div className={styles.InvestmentItem}>
                  <span className="Label">
                    Avg {getAssetReturnCycle(asset)} Returns:
                  </span>{' '}
                  <span className="Amount">
                    {numberToIndianCurrencyWithDecimals(
                      Number(getAverageReturns(investment))
                    )}
                  </span>
                </div>
              )}
              <Button
                onClick={handleContinueButtonClick}
                disabled={disableInvestButton || isLoading}
                width={250}
              >
                <div className={styles.VisualReturnButtonText}>
                  {buttonText}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualReturns;
