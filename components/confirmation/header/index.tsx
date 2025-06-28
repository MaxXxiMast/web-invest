import Image from '../../primitives/Image';
import classes from './ConfirmationHeader.module.css';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

type confirmationHeaderProp = {
  isAmo?: boolean;
};

export const ConfirmationHeader = (props: confirmationHeaderProp) => {
  const { isAmo = false } = props;
  const title = isAmo
    ? 'Your After Market Order has been placed'
    : 'Order Placed with Exchange!';
  return (
    <div className={`${classes.HeaderContainer}`}>
      <div className={classes.OrderPlaceIcon}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/OrderPlaceIcon.svg`}
          alt="Order"
          width="70"
          height="70"
        />
      </div>
      <div className={classes.TextContainer}>
        <div className={`${classes.Title}`}>{title}</div>
        <div className={`${classes.SubTitle}`}>
          {isAmo
            ? `You'll receive a payment link when the market opens next.`
            : 'We will keep you posted regarding your order status'}
        </div>
      </div>
    </div>
  );
};
