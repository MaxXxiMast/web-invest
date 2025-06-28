//NODE MODULES
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

//COMPONENTS
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import InputWithCheckBox from '../../primitives/input-checkbox/InputWithCheckbox';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';
import Button from '../../primitives/Button';
import Image from '../../primitives/Image';
import SellOrderModalSkeleton from '../../../skeletons/sell-order-skeleton/SellOrderModalSkeleton';

//STYLES
import styles from './SellOrderModal.module.css';

//UTILS
import { trackEvent } from '../../../utils/gtm';
import { getMaturityMonthsForHolding } from '../../portfolio/my-holdings/utils';
import {
  roundOff,
  SDISecondaryAmountToCommaSeparator,
} from '../../../utils/number';

//API
import {
  fetchSellOrderData,
  fetchXirr,
  placeSellOrder,
} from '../../../api/order';
import { useAppSelector } from '../../../redux/slices/hooks';

export interface SellOrderData {
  logo: string;
  securityID: number;
  xirr: number;
}

interface SellOrderApiResponse {
  holdings: number;
  eligibleHoldings: number;
  maturityDate: string;
  expectedPayout: string | null;
  ytm: number;
}
export interface SellOrderModalProps {
  showModal: boolean;
  onClose: () => void;
  data: SellOrderData;
  onPlaceSellRequest: (units: number, showYellowText: boolean) => void;
  units?: number;
  maturityDate?: string;
}
const SellOrderModal: React.FC<SellOrderModalProps> = ({
  showModal,
  onClose,
  data,
  onPlaceSellRequest,
  units,
  maturityDate,
}) => {
  const { logo, securityID, xirr } = data;
  const [sellOrderData, setSellOrderData] =
    useState<SellOrderApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unitToSell, setUnitsToSell] = useState<string>('1');
  const [xirrResponse, setXirrResponse] = useState(null);
  const [withdrawAll, setWithdrawAll] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isPlacingSellOrder, setIsPlacingSellOrder] = useState<boolean>(false);
  const userID = useAppSelector((state) => state.user.userData.userID);

  useEffect(() => {
    const fetchSellData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const res = await fetchSellOrderData(securityID);
        setSellOrderData(res);

        if (res.eligibleHoldings === 1) {
          setUnitsToSell('1');
          setWithdrawAll(true);
        } else {
          setUnitsToSell('1');
          setWithdrawAll(false);
        }
      } catch (error) {
        console.error('Error fetching sell order data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (showModal && securityID) {
      fetchSellData();
    }
  }, [showModal, securityID]);

  useEffect(() => {
    if (showModal) {
      fetchXirr(securityID, unitToSell)
        .then((res) => {
          setXirrResponse(res);
        })
        .catch((err) => {
          setXirrResponse(null);
          console.error('Error fetching XIRR:', err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, unitToSell]);

  const monthsMaturityDate = getMaturityMonthsForHolding(dayjs(maturityDate));

  const handleCheckboxToggle = () => {
    const newStatus = !withdrawAll;
    setWithdrawAll(newStatus);
    if (newStatus) {
      setUnitsToSell(sellOrderData?.eligibleHoldings.toString());
      setError('');
    }
  };

  const isDecimal = (value: string) => /\./.test(value);
  const trackUnitInputChanged = (enteredUnits: number, isValid: boolean) => {
    trackEvent('unit_input_changed', {
      user_id: userID,
      entered_units: enteredUnits,
      max_eligible_units: sellOrderData?.eligibleHoldings || 0,
      is_valid: isValid,
    });
  };

  const handleUnitsChange = (value: string) => {
    if (withdrawAll) {
      setWithdrawAll(false);
    }

    if (value.startsWith('-')) {
      setError('Negative values are not allowed.');
      setUnitsToSell('1');
      trackUnitInputChanged(0, false);
      return;
    }

    if (value === '') {
      setUnitsToSell(value);
      setError('You must sell at least one unit.');
      trackUnitInputChanged(0, false);
      return;
    }

    if (value === '0') {
      setError('You must sell at least one unit.');
      setUnitsToSell('1');
      trackUnitInputChanged(0, false);
      return;
    }

    const numericValue = parseInt(value, 10);

    if (numericValue > sellOrderData?.eligibleHoldings) {
      setError('You can only sell units that are eligible for sale.');
      setUnitsToSell(sellOrderData?.eligibleHoldings.toString());
      setWithdrawAll(true);
      trackUnitInputChanged(numericValue, false);
      return;
    } else {
      setError('');
    }

    if (isDecimal(value)) {
      setError('Units cannot contain decimals');
      trackUnitInputChanged(numericValue, false);
    }

    trackUnitInputChanged(numericValue, true);
    setUnitsToSell(value);

    if (numericValue === sellOrderData?.eligibleHoldings) {
      setWithdrawAll(true);
    } else {
      setWithdrawAll(false);
    }
  };

  const isButtonDisabled = (() => {
    const numericValue = parseInt(unitToSell, 10);
    return (
      isPlacingSellOrder ||
      isNaN(numericValue) ||
      numericValue < 1 ||
      numericValue > sellOrderData?.eligibleHoldings ||
      isDecimal(unitToSell)
    );
  })();

  const handlePlaceSellRequest = async () => {
    const numericValue = parseInt(unitToSell, 10);
    if (!isButtonDisabled && !isNaN(numericValue)) {
      setIsPlacingSellOrder(true);
      try {
        trackEvent('place_sell_request', {
          user_id: userID,
          units_to_sell: numericValue,
          estimated_price_range:
            (!showYellowText &&
              `₹${
                (sellOrderData?.expectedPayout
                  ? parseFloat(sellOrderData.expectedPayout)
                  : 0) * parseInt(unitToSell, 10)
              }`) ||
            'N/A',
          order_status: 'Pending',
          request_timestamp: new Date().toISOString(),
          per_unit_price:
            (!showYellowText && `₹${sellOrderData?.expectedPayout}`) || 'N/A',
          xirr:
            (!showYellowText && `${roundOff(xirrResponse?.xirr, 2)}%`) || '',
          pricing_availability: showYellowText ? false : true,
        });
        await placeSellOrder(securityID, numericValue);
        onPlaceSellRequest(numericValue, showYellowText);
      } catch (error) {
        setError('Failed to place sell order. Please try again later.');
        console.error('Error placing sell order:', error);
      } finally {
        setIsPlacingSellOrder(false);
      }
    }
  };

  function isVarianceValid(xirr, ytm) {
    // handle undefined or null values or negative values
    let variance = xirr - ytm;
    return variance <= 0 && variance >= -2.5;
  }

  const ExpectedSellAmountAndXirr = () => {
    return (
      <div className={`flex ${styles.expectedPayoutContainer}`}>
        <div className={`flex-column items-start flex-one ${styles.gap4}`}>
          <div
            className={`flex justify-start flex-one ${styles.expectedPayout}`}
          >
            <span className={styles.payoutLabel}>Expected Sell Amount</span>
            <div className={styles.ToolTipData}>
              <TooltipCompoent
                toolTipText={
                  'Expected Sell amount is the returns you make post sale of securities (on T+1, i.e. next exchange working day) and deduction of 0.25% transaction margin. T being the date of placing the sell request. This does not include any charges levied by your broker.'
                }
              >
                <span
                  className={`icon-info`}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--gripBlue, #00357c)',
                  }}
                />
              </TooltipCompoent>
            </div>
          </div>
          <div className={`${styles.gap4} flex items-center`}>
            <span className={`${styles.payoutValue}`}>₹{expectedPayout}</span>
            <span className={styles.perUnit}>
              (₹
              {SDISecondaryAmountToCommaSeparator(
                sellOrderData?.expectedPayout
              )}
              /unit)
            </span>
          </div>
        </div>

        {xirrResponse?.xirr != null && xirrResponse?.xirr >= 0 ? (
          <div className={`flex-column items-end ${styles.gap4}`}>
            <div className={`flex justify-start ${styles.expectedPayout}`}>
              <span className={styles.payoutLabel}>XIRR</span>
              <div className={styles.ToolTipData}>
                <TooltipCompoent
                  toolTipText={
                    'The returns you make post sale of securities and after payment of brokerage charges of 0.25% YTM.'
                  }
                >
                  <span
                    className={`icon-info`}
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--gripBlue, #00357c)',
                    }}
                  />
                </TooltipCompoent>
              </div>
            </div>
            <div className={`flex  ${styles.payoutValue}`}>
              {roundOff(xirrResponse?.xirr, 2)}%
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const amount =
    parseFloat(sellOrderData?.expectedPayout) * parseInt(unitToSell, 10);
  const expectedPayout = unitToSell
    ? SDISecondaryAmountToCommaSeparator(amount, 2)
    : SDISecondaryAmountToCommaSeparator(sellOrderData?.expectedPayout, 2);

  const showYellowText =
    !sellOrderData?.expectedPayout ||
    amount > 2500000 ||
    !isVarianceValid(xirr, sellOrderData?.ytm);

  useEffect(() => {
    if (showModal && userID && sellOrderData && xirrResponse) {
      trackEvent('open_sell_modal', {
        user_id: userID,
        total_units: units,
        eligible_units: sellOrderData.eligibleHoldings,
        time_to_maturity_months: getMaturityMonthsForHolding(
          dayjs(maturityDate)
        ),
        estimated_price_range:
          (!showYellowText && `₹${sellOrderData.expectedPayout}`) || 'N/A',
        price_fetch_status: showYellowText ? false : true,
        xirr: (!showYellowText && `${roundOff(xirrResponse?.xirr, 2)}%`) || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, userID, sellOrderData, xirrResponse]);

  return (
    <MaterialModalPopup
      isModalDrawer
      showModal={showModal}
      className={styles.modalPopup}
      drawerExtraClass={styles.drawer}
      handleModalClose={onClose}
      closeButtonClass={styles.closeButton}
    >
      {isLoading ? (
        <SellOrderModalSkeleton />
      ) : (
        <div>
          <div className={styles.header}>
            <h2>Place Sell Request</h2>
          </div>
          <div
            className={`flex items-center justify-between ${styles.assetInfo}`}
          >
            <Image
              width={100}
              height={43}
              src={logo}
              alt="Asset Logo"
              layout="intrinsic"
            />
            <div
              className={`flex direction-column items-center justify-center ${styles.detailRow}`}
            >
              <span className={styles.label}>
                {units > 1 ? 'UNITS' : 'UNIT'}
              </span>
              <span className={styles.value}>{units}</span>
            </div>
            <div
              className={`flex direction-column items-end justify-center ${styles.detailRow}`}
            >
              <span className={styles.label}>ELIGIBLE TO SELL</span>
              <div
                className={`flex item-center justify-center ${styles.infoIcon}`}
              >
                {' '}
                <span className={styles.value}>
                  {sellOrderData?.eligibleHoldings}
                </span>
                <div className={styles.toolTipData}>
                  <TooltipCompoent
                    toolTipText={
                      'Units become available for sale after the lock-in period ends.'
                    }
                  >
                    <span
                      className={`icon-info`}
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--gripBlue, #00357c)',
                      }}
                    />
                  </TooltipCompoent>
                </div>
              </div>
            </div>
          </div>
          <div className={`flex items-center justify-start ${styles.maturity}`}>
            <span className={styles.maturityLabel}>Time to Maturity:</span>
            <span className={styles.maturityValue}>{monthsMaturityDate}</span>
          </div>
          <div className={`flex-column ${styles.inputSection}`}>
            <InputWithCheckBox
              id="unitsToSell"
              value={unitToSell}
              maxValue={sellOrderData?.eligibleHoldings}
              onChange={handleUnitsChange}
              checkboxChecked={withdrawAll}
              onCheckboxChange={handleCheckboxToggle}
            />
          </div>
          {error && <div className={styles.errorText}>{error}</div>}
          {showYellowText ? (
            <div
              className={`flex justify-center items-center ${styles.disclaimer}`}
            >
              Our team will reach out with the price within 24 working hours.
            </div>
          ) : (
            <ExpectedSellAmountAndXirr />
          )}
          <Button
            disabled={isButtonDisabled}
            className={styles.ctaButton}
            onClick={handlePlaceSellRequest}
            isLoading={isPlacingSellOrder}
          >
            Place Sell Request
          </Button>{' '}
          <div className={styles.terms}>
            By proceeding, you agree to the{' '}
            <a
              href="/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms and Conditions
            </a>
            .
          </div>
        </div>
      )}
    </MaterialModalPopup>
  );
};

export default SellOrderModal;
