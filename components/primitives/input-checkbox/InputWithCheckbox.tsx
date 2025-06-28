//NODE MODULES
import React, { ChangeEvent } from 'react';

//STYLES
import styles from './InputWithCheckbox.module.css';

export interface InputWithCheckBoxProps {
  id: string;
  value: string | number;
  maxValue: string | number;
  onChange: (value: string) => void;

  checkboxChecked: boolean;
  onCheckboxChange: () => void;
}

const InputWithCheckBox: React.FC<InputWithCheckBoxProps> = ({
  id,
  value,
  maxValue,
  onChange,
  checkboxChecked,
  onCheckboxChange,
}) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div
      className={`flex justify-between items-center ${styles.InputContainer}`}
    >
      <div className={`flex-column items-start ${styles.inputControls}`}>
        <label htmlFor="unitsToSell" className={styles.inputLabel}>
          Units to Sell
        </label>
        <input
          type="number"
          id={id}
          value={value}
          onChange={handleInputChange}
          min={1}
          max={maxValue}
          className={styles.inputField}
        />
      </div>

      {/* ===== Checkbox  ===== */}
      <div className={`flex items-center ${styles.checkboxContainer}`}>
        <div
          className={`${styles.customCheckbox} ${
            checkboxChecked ? styles.checked : ''
          }`}
          onClick={onCheckboxChange}
        >
          {checkboxChecked && (
            <span className={`icon-tick ${styles.checkmark}`}></span>
          )}
        </div>
        <label htmlFor={`${id}-checkbox`} className={styles.checkboxLabel}>
          Withdraw All
        </label>
      </div>
    </div>
  );
};

export default InputWithCheckBox;
