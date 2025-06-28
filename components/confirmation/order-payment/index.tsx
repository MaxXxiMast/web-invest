// NODE MODULES
import Skeleton from '@mui/material/Skeleton';

// Components
import Image from '../../primitives/Image';
import InvestmentSummary from '../../investment-overview/investment-summary';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { orderDetailsType } from '../../../pages/confirmation';

// utils
import { getAccDetails, getOrderDetails } from './orderUtils';

// Styles
import classes from './OrderPayment.module.css';

export const OrderPayment = (props: orderDetailsType) => {
  const accDetails = getAccDetails(props);

  return (
    <div className={classes.OrderPaymentcontainer}>
      <div className={classes.awarenessContainer}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/Awareness.gif`}
          alt="InfoIcon"
          width={350}
          height={280}
          className={classes.awareness}
          layout={'fixed'}
        />
      </div>

      {props?.maturityDate ? (
        <InvestmentSummary
          data={getOrderDetails(props)}
          asset={{
            partnerLogo: props?.assetImage,
            partnerName: props?.assetName,
          }}
          className={classes.orderInvestmentSummary}
        />
      ) : (
        <Skeleton
          animation="wave"
          variant="rounded"
          height={160}
          width={'100%'}
        />
      )}

      {props?.accInfo?.panNo ? (
        <div
          className={`${classes.orderDetailsCard} ${classes.accInfoContainer}`}
        >
          <div className={classes.accInfoLabel}>Account Info</div>
          <div className={classes.accInfoContent}>
            {accDetails.map((item: any) => (
              <div
                key={item.key}
                className={`${classes.detailsWrapper} ${
                  item.key === 'demat_no' ? classes.accDematInfo : ''
                }`}
              >
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}${item.icon}`}
                  alt={item.key}
                  layout="fixed"
                  width={16}
                  height={16}
                />
                <div className={classes.accInfoTitle}>{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Skeleton
          animation="wave"
          variant="rounded"
          height={100}
          width={'100%'}
        />
      )}
    </div>
  );
};
