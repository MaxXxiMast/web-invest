import React, { useEffect, useState } from 'react';
import Button, { ButtonType } from '../primitives/Button';
import styles from '../../styles/Vault/BalanaceCard.module.css';
import { numberToCurrency } from '../../utils/number';
import TooltipCompoent from '../primitives/TooltipCompoent/TooltipCompoent';
import { getSecret } from '../../api/secrets';
type Props = {
  data?: any;
  className?: any;
  handleWithdrawBtnClick?: () => void;
  handleAddMoneyBtnClick?: (arg0: number | null) => void;
  withdrawDisabled?: boolean;
  withDrawDisabledReason?: string;
};

const BalanaceCard = ({
  data,
  className = '',
  handleWithdrawBtnClick,
  handleAddMoneyBtnClick,
  withdrawDisabled = false,
  withDrawDisabledReason = 'Please complete the process in notifications to enable',
}: Props) => {
  const [isBankServerDown, setIsBankServerDown] = useState(false);

  useEffect(() => {
    const downTimeData: any = getSecret('withdraw.downtime');
    setIsBankServerDown(downTimeData?.value === 'true');
  }, []);

  const renderWithDrawButton = () => {
    if (withdrawDisabled)
      return (
        <div className={styles.InfoIcon}>
          <TooltipCompoent toolTipText={withDrawDisabledReason}>
            <Button
              onClick={() => handleWithdrawBtnClick()}
              className={styles.BottomBtn}
              variant={ButtonType.Inverted}
              disabled={withdrawDisabled}
            >
              Withdraw
            </Button>
          </TooltipCompoent>
        </div>
      );
    return (
      <Button
        onClick={() => handleWithdrawBtnClick()}
        className={styles.BottomBtn}
        variant={ButtonType.Inverted}
        disabled={withdrawDisabled}
      >
        Withdraw
      </Button>
    );
  };
  const getAddMoneyButton = () => {
    if (data < 0) {
      return (
        <Button
          onClick={() => handleAddMoneyBtnClick(data)}
          className={styles.BottomBtn}
        >
          Add Money
        </Button>
      );
    }
    return null;
  };
  return (
    <div className={`${styles.BalanaceCard} ${className}`}>
      <div className={styles.BalanaceCardTop}>
        <p className="TextStyle1">Available Balance</p>
        <h3 className={` Heading1 ${styles.vaultBalance}`}>
          {' '}
          &#8377; {numberToCurrency(data)}
        </h3>
        {isBankServerDown && (
          <span className={styles.bankServerDown}>
            We’re experiencing high failure rate at our partner bank.
            Withdrawals are expected to fail till its resolved.
          </span>
        )}
      </div>
      <div className={styles.BalanaceCardBottom}>
        {getAddMoneyButton()}
        {renderWithDrawButton()}
      </div>
    </div>
  );
};

export default BalanaceCard;
