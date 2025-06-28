import { ReactNode } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { handleExtraProps } from '../../../utils/string';
import Button, { ButtonType } from '../../primitives/Button';
import classes from './PaymentProceedWidget.module.css';

type btnType =
  | 'Primary'
  | 'Secondary'
  | 'SecondaryLight'
  | 'Inverted'
  | 'Disabled';

type Props = {
  className?: string;
  label?: string;
  value?: string | number;
  btnTxt?: string | number;
  showBtn?: boolean;
  btnVariable?: btnType;
  isLoading?: boolean;
  handleBtnClick?: () => void;
  children?: ReactNode;
};

/**
 * Proceed to payment component
 * @param label Bottom label - Left side element
 * @param value Top value - Left side element
 * @param btnTxt Button text
 * @param showBtn Add/Remove widget btn
 * @param btnVariable Type of button
 * @param handleBtnClick Click event handler for button
 * @param children Extra react node elements
 * @param isLoading Check button loading state
 * @returns Proceed to payment component
 */
const PaymentProceedWidget = ({
  className = '',
  label = 'Amount Payable',
  btnTxt = 'Proceed',
  value = '',
  showBtn = true,
  isLoading = false,
  btnVariable = 'Primary',
  handleBtnClick,
  children = null,
}: Props) => {
  const handleClick = () => {
    if (btnVariable !== 'Disabled') {
      handleBtnClick();
    }
  };
  return (
    <div
      className={`direction-column ${classes.Main} ${handleExtraProps(
        className
      )}`}
    >
      <div className={`items-center justify-between ${classes.Wrapper}`}>
        <div className={`direction-column ${classes.Left}`}>
          {value ? <span className={classes.Amount}>{value}</span> : null}
          {label ? <span className={classes.Label}>{label}</span> : null}
        </div>
        <div className={classes.Right}>
          {showBtn ? (
            <Button onClick={handleClick} variant={ButtonType[btnVariable]}>
              <>
                {isLoading ? <CircularProgress size={10} /> : null} {btnTxt}
              </>
            </Button>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
};

export default PaymentProceedWidget;
