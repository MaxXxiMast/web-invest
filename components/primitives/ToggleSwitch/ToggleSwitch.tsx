import React from 'react';
import TooltipCompoent from '../TooltipCompoent/TooltipCompoent';
import styles from './ToggleSwitch.module.css';

type Props = {
  leftLabel?: any;
  rightLabel?: any;
  handleChange?: (val: any) => void;
  className?: any;
  checked?: boolean;
  disabled?: boolean;
  tooltip?: string;
  fieldName?: string;
};
const ToggleSwitch = ({
  leftLabel = null,
  rightLabel = null,
  handleChange = () => {},
  className = '',
  checked = false,
  disabled = false,
  tooltip = '',
  fieldName = '',
}: Props) => {
  const renderLabel = () => (
    <label className={styles.Switch}>
      <input
        name={fieldName}
        type="checkbox"
        onChange={handleChange}
        checked={checked}
        disabled={disabled}
      />

      <span
        className={`${styles.Slider} ${styles.Round} ${
          disabled ? styles.disabled : ''
        }`}
      ></span>
    </label>
  );
  return (
    <div className={`${styles.SwitchContainer} ${className}`}>
      {leftLabel && <span className={styles.SwitchLabel}>{leftLabel}</span>}
      {tooltip && tooltip.length > 0 ? (
        <TooltipCompoent toolTipText={`${tooltip}`}>
          {renderLabel()}
        </TooltipCompoent>
      ) : (
        renderLabel()
      )}

      {rightLabel && <span className={styles.SwitchLabel}>{rightLabel}</span>}
    </div>
  );
};

export default ToggleSwitch;
