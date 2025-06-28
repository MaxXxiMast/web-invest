import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import GripLoading from '../../layout/Loading';
import {
  financeProductTypeConstants,
  isHighYieldFd,
} from '../../../utils/financeProductTypes';
import { getRepaymentPeriodInMonths } from '../../../utils/returnsCalculator';
import { getBondReturnSchedule } from '../../../utils/bonds';
import { getTenure } from '../../fd-graph/utils';
import { getHolidayList } from '../../../api/bonds';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../../utils/string';

import styles from './DealInfoModal.module.css';
import Image from '../../primitives/Image';

type dataArr = {
  Title: string;
  value: string;
};
type Props = {
  portfolio?: any;
  className?: any;
  isDetailedInfo?: boolean;
  handleBackEvent?: () => void;
  returnSchedule?: any;
  detailedInfo?: any;
  loading?: boolean;
  dynamicData?: boolean;
  showCompletedReturns?: boolean;
};
const DealInfoModal = ({
  portfolio,
  className = '',
  isDetailedInfo = false,
  handleBackEvent = () => {},
  returnSchedule,
  detailedInfo,
  loading,
  dynamicData,
  showCompletedReturns,
}: Props) => {
  const [holidays, setHolidays] = React.useState<any>([]);
  let currentReturn = portfolio?.noOfReturnsReceived;
  let totalReturns =
    Number(portfolio?.tenure) /
    getRepaymentPeriodInMonths(portfolio?.repaymentCycle, portfolio?.tenure);
  const orderData: dataArr[] = [
    {
      Title: 'Transaction ID',
      value: portfolio?.txns?.[0].transactionID?.slice(-12) ?? 'NA',
    },
  ];

  if (portfolio?.isRfq) {
    orderData.push({
      Title: 'Trade Number',
      value: detailedInfo?.[0]?.tradeNumber ?? 'NA',
    });
  }

  useEffect(() => {
    const hanldeHolidaysList = async () => {
      try {
        const holidays = await getHolidayList();
        if (holidays && Array.isArray(holidays)) {
          setHolidays(holidays);
        }
      } catch (e) {
        console.error(e);
      }
    };

    hanldeHolidaysList();
  }, []);

  if (dynamicData) {
    let returnStatus = {};
    returnSchedule.forEach((element) => {
      returnStatus[dayjs(element?.scheduledDate).format('DD MMM YYYY')] =
        element.status;
    });
    const finalAmount = getBondReturnSchedule(
      portfolio?.txns,
      portfolio?.bondDetails,
      holidays,
      returnStatus,
      portfolio?.isMld
    );
    totalReturns = Object.keys(finalAmount)?.length || 0;
    currentReturn =
      Object.values(finalAmount)?.filter((a: any) => a.status === 'completed')
        ?.length || 0;
  }

  const tenure = isHighYieldFd(portfolio?.assetDetails)
    ? getTenure(portfolio?.tenure)
    : `${portfolio?.tenure} Months`;

  return loading ? (
    <GripLoading />
  ) : (
    <>
      <div className={`${styles.CardHeader} ${className}`}>
        <h4 className="Heading4">
          <span className={styles.ArrowRight} onClick={() => handleBackEvent()}>
            <Image
              src={`${GRIP_INVEST_GI_STRAPI_BUCKET_URL}ArrowRight.svg`}
              alt="ArrowRight"
              layout='intrinsic'
              width={18}
              height={15}
            />
          </span>
          {isDetailedInfo ? 'Detailed Info' : 'Deal Info'}
        </h4>
      </div>
      <div className={styles.CardBody}>
        {!isDetailedInfo ? (
          <ul>
            <li>
              <span className="TextStyle1">Tenure</span>{' '}
              <span className="TextStyle1">{tenure}</span>
            </li>
            {showCompletedReturns ? (
              <li>
                <span className="TextStyle1">Completed Returns</span>{' '}
                <span className="TextStyle1">
                  {[financeProductTypeConstants.startupEquity].includes(
                    String(portfolio?.assetDetails?.financeProductType)
                  )
                    ? 'On Exit'
                    : portfolio?.assetDetails?.repaymentCycle === 'One Time'
                    ? `${currentReturn}/1`
                    : `${currentReturn}/${totalReturns}`}
                </span>
              </li>
            ) : null}
          </ul>
        ) : (
          <ul>
            {orderData.map(({ Title, value }, _idx) => (
              <li key={value}>
                <span className="TextStyle1">{Title}</span>{' '}
                <span className="TextStyle1 textWrap">{value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
export default DealInfoModal;
