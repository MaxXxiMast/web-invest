import { numberToCurrency } from '../../../utils/number';
import styles from './MfCalculatorInputField.module.css';

type Props = {
  inputValue: number | string;
  labelText?: string;
  shouldShowValueAsCurrency?: boolean;
  fieldPrefix?: string;
  handleInputChange?: (target: HTMLInputElement) => void;
};

const MfCalculatorInputField = ({
  inputValue,
  labelText = 'Enter Amount',
  shouldShowValueAsCurrency = true,
  fieldPrefix = '₹',
  handleInputChange,
}: Props) => {
  let inputData = inputValue;
  if (shouldShowValueAsCurrency) {
    inputData =
      numberToCurrency(inputValue) !== 'NaN'
        ? numberToCurrency(inputValue)
        : '';
  }

  return (
    <div className={styles.InputFieldContainer}>
      <label htmlFor="inputAmount" className={styles.InputLabel}>
        {labelText}
      </label>
      <span className={`items-align-center-row-wise ${styles.InputField}`}>
        <span data-testid="prefix-value">{fieldPrefix}</span>
        <input
          type="text"
          value={inputData}
          id="inputAmount"
          onChange={(e) => handleInputChange(e.target)}
          autoComplete="off"
          data-testid="input-amount"
        />
      </span>
    </div>
  );
};

export default MfCalculatorInputField;
