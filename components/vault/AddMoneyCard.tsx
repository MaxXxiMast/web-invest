import React, { useEffect } from 'react';
import NumberFormat from 'react-number-format';
import { CircularProgress } from '@mui/material';
import Button from '../primitives/Button';
import { isValidAddMoneyAmount, numberToCurrency } from '../../utils/number';

import styles from '../../styles/Vault/AddMoneyCard.module.css';

type Props = {
  amount?: any;
  className?: any;
  onChange?: (e: string | number, chipSelected: boolean) => void;
  onAddButtonClick?: () => void;
  handleTransferModal?: () => void;
  loading?: boolean;
  errorText?: string;
};
const amountList = [20000, 30000, 40000, 50000];

const AddMoneyCard = ({
  amount,
  className = '',
  onChange,
  onAddButtonClick,
  handleTransferModal,
  loading,
  errorText,
}: Props) => {
  const [addButtonDisabled, setAddButtonDisable] = React.useState({
    value: false,
    msg: '',
  });

  const [chipClicked, setChipClicked] = React.useState(false);

  useEffect(() => {
    document.getElementById('AddmoneyInput')?.focus();
  }, []);

  useEffect(() => {
    if (amount !== null && amount !== '') checkWalletAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const checkWalletAmount = () => {
    const [result, msg] = isValidAddMoneyAmount(amount);
    setAddButtonDisable({ value: !result, msg: msg });
  };

  const renderErrorText = () => {
    if (errorText) {
      return <div className={styles.vaultAddErrorText}>{errorText}</div>;
    }
    return null;
  };

  const onChangeInput = (values: any) => {
    !chipClicked && onChange(values.value, false);
  };

  const onChangeChipSelected = (value: number) => {
    setChipClicked(true);

    onChange(value, true);
  };

  return (
    <div className={`${styles.AddMoneyCard} ${className} AddMoneyCard`}>
      <div className={styles.AddMoneyCardTop}>
        <h3 className="Heading3">
          {window.innerWidth <= 767 ? (
            <>
              <span className={styles.WithdrawIcon}>
                <span className={`icon-rupees2 ${styles.RupeesIcon}`} />
              </span>{' '}
            </>
          ) : (
            <span className={`icon-wallet ${styles.WalletIcon}`} />
          )}
          Add Money
        </h3>
        <NumberFormat
          thousandSeparator
          thousandsGroupStyle="lakh"
          inputMode={'numeric'}
          prefix={'₹ '}
          placeholder="Enter Amount"
          className={styles.InvestMentAmount}
          onValueChange={(values: any) => onChangeInput(values)}
          value={amount}
          id={'AddmoneyInput'}
          decimalScale={0}
          onFocus={() => setChipClicked(false)}
        />
        {addButtonDisabled.value ? (
          <span className={styles.errorText}>{addButtonDisabled.msg}</span>
        ) : null}
        <div className={styles.AmountCloud}>
          {amountList.map((val, index) => (
            <span
              key={`chip-${val}`}
              id={`chip-${index}`}
              className={styles.CloudItem}
              style={{ cursor: 'pointer' }}
              onClick={() => onChangeChipSelected(val)}
            >
              ₹{numberToCurrency(val)}
            </span>
          ))}
        </div>
        {window.innerWidth <= 767 && !Boolean(errorText) && (
          <p
            className={`TextStyle1 ${styles.TransferNote} ${styles.mobileTransferNote}`}
          >
            Want to transfer via NEFT/RTGS/IMPS?{' '}
            <span onClick={() => handleTransferModal()}>See How</span>
          </p>
        )}

        <div className={styles.AddMoneyCardBottom}>
          <Button
            className={styles.AddMoneyBtn}
            onClick={onAddButtonClick}
            disabled={
              addButtonDisabled.value ||
              amount === '' ||
              amount === null ||
              loading ||
              Boolean(errorText)
            }
            width={'100%'}
          >
            <div className={styles.buttonChildren}>
              Continue
              {loading ? (
                <CircularProgress
                  size={20}
                  style={{ color: 'white', height: '20px', marginRight: 8 }}
                />
              ) : null}
            </div>
          </Button>
          {renderErrorText()}
        </div>
      </div>
    </div>
  );
};

export default AddMoneyCard;
