import dayjs from 'dayjs';
import {
  numberToCurrency,
  numberToIndianCurrencyWithDecimals,
} from '../../../utils/number';
import { handleExtraProps } from '../../../utils/string';
import ProgressBar from '../../primitives/ProgressBar/ProgressBar';
import classes from './RfqReturnsWidget.module.css';

type Props = Partial<{
  className: string;
  totalReturns: number;
  receivedReturns: number;
  nextReturnDate: string;
  nextReturnAmount: string | number;
  numbersDecimalCount: number;
  noOfReturnsScheduled: number;
  noOfReturnsReceived: number;
}>;

type dataArr = {
  Title: string;
  value: string;
};
/**
 * Portfolio return summary widget
 * @param totalReturns Total number of expected returns in asset
 * @param receivedReturns Received return from asset
 * @param nextReturnDate Next return date
 * @param nextReturnAmount Next return amount
 * @param numbersDecimalCount Count of decimal after amount
 * @param className Component extra class name
 * @param noOfReturnsScheduled total scheduled returns
 * @param noOfReturnsReceived returns received / scheduled
 * @returns
 */

const RfqReturnsWidget = ({
  className = '',
  totalReturns = 0,
  receivedReturns = 0,
  nextReturnDate = '',
  nextReturnAmount = 0,
  numbersDecimalCount = 2,
  noOfReturnsScheduled = 0,
  noOfReturnsReceived = 0,
}: Props) => {
  const returnPercentage = Number(
    (
      (Number(receivedReturns || 0) * 100) / Number(totalReturns || 0) || 0
    ).toFixed(0)
  );

  const totalReceivedAmount = numberToCurrency(
    Number(receivedReturns || 0).toFixed(numbersDecimalCount),
    true
  );
  const NextPaymentData: dataArr[] = [
    {
      Title: 'Next Return Date: ',
      value:
        nextReturnDate && nextReturnDate !== '100% complete'
          ? dayjs(nextReturnDate).format('DD MMM YYYY')
          : 'NA',
    },
    {
      Title: 'Next Return Amount: ',
      value: ` ${numberToIndianCurrencyWithDecimals(
        Number(nextReturnAmount || 0)
      )}`,
    },
  ];

  return (
    <div
      className={`flex items-center ${classes.Wrapper} ${handleExtraProps(
        className
      )}`}
    >
      {returnPercentage < 100 ? (
        <div className={`flex-column ${classes.Left} ${classes.HideDesktop}`}>
          <div className={`flex justify-between `}>
            <label className={`${classes.WidgetTxt}`}>Returns Received</label>
            <label className={`${classes.WidgetTxt}`}>
              <span>
                {numberToIndianCurrencyWithDecimals(totalReceivedAmount)}
              </span>
            </label>
          </div>
          <ProgressBar progressWidth={returnPercentage} barHeight={8} />
          <div className={`flex justify-between ${classes.Summary}`}>
            <label className={classes.WidgetTxt}>{returnPercentage}%</label>
            <label className={classes.WidgetTxt}>
              {noOfReturnsReceived} of {noOfReturnsScheduled}
            </label>
          </div>
        </div>
      ) : (
        <div
          className={`flex ${classes.Left} ${classes.HideDesktop} ${classes.CompleteWrapper}`}
        >
          <div className={`${classes.CompleteMobile}`}>
            <span className={`icon-weighing-scale ${classes.WeighingIcon}`} />
            <label className={`${classes.WidgetTxt} ${classes.Label}`}>
              Returns Completed
            </label>
          </div>
          <div className={classes.CompleteProgress}>
            <label className={`${classes.WidgetTxt}`}>Returns Completed</label>
            <ProgressBar progressWidth={100} barHeight={8} />
            <label className={classes.CompleteLabel}>100%</label>
          </div>
        </div>
      )}
      <div className={`flex-column ${classes.Left} ${classes.HideMobile}`}>
        <label className={`${classes.WidgetTxt}`}>
          Returns Received{' '}
          <span>
            {noOfReturnsReceived} of {noOfReturnsScheduled}
          </span>
        </label>
        <ProgressBar progressWidth={returnPercentage} barHeight={8} />
        <div className={`flex justify-between ${classes.Summary}`}>
          <label className={classes.WidgetTxt}>₹0</label>
          <label className={`${classes.WidgetTxt} ${classes.HideMobile}`}>
            <span>
              {numberToIndianCurrencyWithDecimals(totalReceivedAmount)}(
              {returnPercentage}% completed)
            </span>
          </label>
          <label className={classes.WidgetTxt}>
            {numberToIndianCurrencyWithDecimals(Number(totalReturns || 0))}
          </label>
        </div>
      </div>

      <div className={`flex-column ${classes.Right}`}>
        {returnPercentage < 100 ? (
          <>
            <div className={classes.HideMobile}>
              {NextPaymentData.map(({ Title, value }, _idx) => (
                <div key={value}>
                  <label className={classes.WidgetTxt}>
                    {Title} <span>{value}</span>
                  </label>
                </div>
              ))}
            </div>
            <div className={classes.HideDesktop}>
              {NextPaymentData.map(({ Title, value }, _idx) => (
                <label
                  key={value}
                  className={`${classes.WidgetTxt} flex justify-between`}
                >
                  {Title} <span>{value}</span>
                </label>
              ))}
            </div>
          </>
        ) : (
          <div className={`${classes.HideMobile} ${classes.Complete}`}>
            <span className={`icon-weighing-scale ${classes.WeighingIcon}`} />
            <label className={`${classes.WidgetTxt} ${classes.Label}`}>
              Returns Completed
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default RfqReturnsWidget;
