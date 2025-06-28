import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import Image from '../../primitives/Image';
import classes from './PaymentExpired.module.css';

type Props = {
  paymentType?: string;
};

const PaymentExpired = ({ paymentType = 'UPI' }: Props) => {
  return (
    <div className={`${classes.Wrapper} flex items-center`}>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}icons/DangerRedTriangle.svg`}
        alt="Danger"
        width={24}
        height={24}
        layout="fixed"
      />{' '}
      <span className={classes.Txt}>
        {paymentType} Payment mode has expired, Try other payment modes
      </span>
    </div>
  );
};
export default PaymentExpired;
