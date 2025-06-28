//Node Modules
import React from 'react';
import dayjs from 'dayjs';

//Components
import GripLoading from '../../layout/Loading';

//Utils
import { getRepaymentCycle, getTxnID } from '../../../utils/asset';
import {
  isAssetBasket,
  isAssetBonds,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import { dateFormatter, formatDate } from '../../../utils/dateFormatter';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../../utils/string';

//Hooks
import { useAppSelector } from '../../../redux/slices/hooks';

//Styles
import styles from '../../../styles/VisualReturns.module.css';
import styles2 from './TransactionHistory.module.css';

const TransactionHistory = ({
  data,
  className = '',
  handleCloseModal = () => {},
  hideExpectedReturns = false,
  showSchedule = false,
  handleBackEvent = () => {},
  isPortFolioCard = false,
}) => {
  const user = useAppSelector((state) => state.user);
  const returnScheduleLoading = useAppSelector(
    (state) => state.bond.returnScheduleLoading
  );
  const { txns } = data;
  const isCorporateBondAsset = isAssetBonds(data?.assetDetails);
  const isBasket = isAssetBasket(data?.assetDetails);
  const isSDISecondaryAsset = isSDISecondary(data?.assetDetails);
  const partnerType = data?.txns?.[0]?.partnerType;

  const tootTipTextLeaseXTdsAdjustedReturn =
    'As per applicable tax laws, TDS (Withholding Tax) will be deducted on the inteterest income at 25% (in case of Resident Individuals) and 30% (in case of Non- Individual/ Entities domiciled in India).';

  const getBondHeader = () => (
    <tr>
      <th className={styles2.textAlignLeft}>#</th>
      <th>Date</th>
      <th>Amount</th>
      <th>Status</th>
    </tr>
  );

  const getSdiSecondaryHeader = () => {
    let newdata = {
      ...data,
      repaymentCycle:
        data?.repaymentCycle?.charAt(0).toUpperCase() +
        data?.repaymentCycle?.slice(1),
    };
    return (
      <tr>
        <th className={styles2.textAlignLeft}>#</th>
        <th>Tentative Date</th>
        <th>Total {getRepaymentCycle(newdata)}</th>
      </tr>
    );
  };

  const getSdiSecondaryBody = () => {
    return data?.repaymentSchedule?.list.map((schedule: any, index: number) => {
      return (
        <tr key={`schedule_item_${schedule}`}>
          <td className={styles2.textAlignLeft}>{index + 1}</td>
          <td>
            {dateFormatter({
              dateTime: schedule?.date,
              dateFormat: formatDate,
              timeZoneEnable: true,
            })}
          </td>
          <td>
            {numberToIndianCurrencyWithDecimals(
              schedule?.totalPretaxReturnsAmount ?? 0
            )}
          </td>
        </tr>
      );
    });
  };

  const getBondScheduleBody = () => {
    return data?.repaymentSchedule?.list?.map(
      (scheduleData: any, index: number) => {
        return (
          <tr key={scheduleData}>
            <td className={styles2.textAlignLeft}>{index + 1}</td>
            <td>
              {dateFormatter({
                dateTime: scheduleData?.date,
                dateFormat: formatDate,
                timeZoneEnable: true,
              })}
            </td>
            <td>
              {numberToIndianCurrencyWithDecimals(
                Number(scheduleData?.totalPretaxReturnsAmount ?? 0)
              )}
            </td>
            <td>{scheduleData?.status}</td>
          </tr>
        );
      }
    );
  };
  const getScheduleBody = () => {
    const scheduleList = data?.repaymentSchedule?.list || [];
    if (!Array.isArray(scheduleList) || scheduleList?.length === 0) {
      return null;
    }

    return scheduleList
      ?.filter(
        (scheduleData) =>
          scheduleData?.returnsSplit?.totalReturns ||
          scheduleData?.returnsSplit?.preTaxReturns ||
          scheduleData?.returnsSplit?.postTaxReturns ||
          scheduleData?.returnsSplit?.totalReturn ||
          scheduleData?.returnsSplit?.preTaxReturn ||
          scheduleData?.returnsSplit?.postTaxReturn ||
          scheduleData?.returnsSplit?.salariedReturns
      )
      ?.map((scheduleData: any, index: number) => {
        const { returnsSplit } = scheduleData || {};
        return (
          <tr key={scheduleData}>
            <td>{index + 1}</td>
            <td>
              {dateFormatter({
                dateTime: scheduleData?.date,
                dateFormat: formatDate,
                timeZoneEnable: true,
              })}
            </td>
            {partnerType === 'sp' ? (
              <React.Fragment>
                <td>
                  {numberToIndianCurrencyWithDecimals(
                    (returnsSplit?.preTaxReturns ||
                      returnsSplit?.preTaxReturn ||
                      returnsSplit?.salariedReturns) ??
                      0
                  )}
                </td>
                <td>
                  {numberToIndianCurrencyWithDecimals(
                    (returnsSplit?.postTaxReturns ||
                      returnsSplit?.postTaxReturn) ??
                      0
                  )}
                </td>
                <td>
                  {numberToIndianCurrencyWithDecimals(
                    (returnsSplit?.totalReturns || returnsSplit?.totalReturn) ??
                      0
                  )}
                </td>
              </React.Fragment>
            ) : (
              <td>
                {numberToIndianCurrencyWithDecimals(
                  (returnsSplit?.totalReturns || returnsSplit?.totalReturn) ?? 0
                )}
              </td>
            )}
            <td>{scheduleData?.status}</td>
            <td>{scheduleData?.comment}</td>
          </tr>
        );
      });
  };

  return showSchedule && (user.repaymentLoading || returnScheduleLoading) ? (
    <GripLoading />
  ) : (
    <div className={`${styles.VisualReturnsMain} ${className}`}>
      <div className={styles.VisualReturnsInner}>
        <div className={styles.Card}>
          <div className={styles.CardInner}>
            <div className={styles.CardHeader}>
              <div className={styles.CardHeaderLeft}>
                {!showSchedule && (
                  <span
                    className={styles2.ArrowRight}
                    onClick={() => handleBackEvent()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}ArrowRight.svg`}
                      alt="ArrowRight"
                    />
                  </span>
                )}
                <span className={`${styles.ImageIcon} ${styles2.ImageIcon}`}>
                  <span
                    className="icon-rupees2"
                    style={{
                      fontSize: 24,
                      color: 'var(--gripBlue, #00357c)',
                    }}
                  />
                </span>
                <span className={styles.Label}>
                  {showSchedule
                    ? isCorporateBondAsset || isSDISecondaryAsset || isBasket
                      ? 'Returns Schedule'
                      : 'Payment Schedule'
                    : 'Transaction Info'}
                </span>
              </div>
            </div>
            <div className={styles.CardBody}>
              <table>
                <thead>
                  {showSchedule ? (
                    isCorporateBondAsset ? (
                      getBondHeader()
                    ) : isSDISecondaryAsset || isBasket ? (
                      getSdiSecondaryHeader()
                    ) : (
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        {partnerType === 'sp' ? (
                          <>
                            <th>Salaried Returns</th>
                            <th>Post Tax Returns</th>
                            <th>Total Returns</th>
                          </>
                        ) : (
                          <th>Amount Expected</th>
                        )}

                        <th> Status</th>
                        <th> Remarks</th>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <th>#</th>
                      <th>Txn ID</th>
                      <th> Txn Date</th>
                      <th> Txn Amount</th>
                      {isCorporateBondAsset ||
                      isSDISecondaryAsset ||
                      isBasket ? (
                        <th className={styles2.textAlignRight}>
                          {data?.isMld ? 'Discounted Price' : 'Purchase Amount'}
                        </th>
                      ) : hideExpectedReturns ? null : (
                        <th> Expected Returns</th>
                      )}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {!showSchedule &&
                    txns?.map((transaction: any, i: number) => {
                      return (
                        <tr key={transaction}>
                          <td>{i + 1}</td>
                          <td>{getTxnID(transaction?.transactionID)}</td>
                          <td>
                            {dayjs(transaction?.orderDate).format(
                              'DD MMM YYYY'
                            )}
                          </td>
                          <td>
                            {''}
                            {numberToIndianCurrencyWithDecimals(
                              String(transaction?.orderAmount)
                            )}
                          </td>
                          {hideExpectedReturns ? null : (
                            <td className={styles2.textAlignRight}>
                              {numberToIndianCurrencyWithDecimals(
                                String(transaction?.expectedReturns || 0)
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  {showSchedule &&
                    (isCorporateBondAsset
                      ? getBondScheduleBody()
                      : isSDISecondaryAsset || isBasket
                      ? getSdiSecondaryBody()
                      : getScheduleBody())}
                </tbody>
              </table>
            </div>
            {isPortFolioCard && (
              <div
                className={`${styles.InvestmentItem} flex gap-4 items-center`}
              >
                <span className={`icon-info ${styles2.InfoIcon}`} />
                <span className="Label">
                  You’ll receive returns in your Demat linked bank account
                </span>
              </div>
            )}
            <div className={`${styles.CardFooter} ${styles2.CardFooter}`}>
              <span onClick={() => handleCloseModal()}>Okay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
