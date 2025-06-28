import { ChangeEvent } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import styles from './Checkbox.module.css';

type CheckboxProps = {
  value: boolean;
  key: string;
  label: string;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  name?: string;
};

const CustomCheckbox = ({
  value,
  key,
  label,
  onChange,
  name,
  disabled = false,
}: CheckboxProps) => {
  return (
    <FormControlLabel
      key={key}
      value={label}
      classes={{
        root: styles.FormLabelRoot,
        label: styles.CheckboxLabel,
      }}
      control={
        <Checkbox
          className={styles.radioButton}
          checked={value}
          onChange={onChange}
          name={name}
          disabled={disabled}
          checkedIcon={
            <span className={styles.Checkbox}>
              <span className="icon-tick" />
            </span>
          }
          classes={{
            root: styles.CheckboxRoot,
          }}
          sx={{
            '&.Mui-checked': {
              color: 'var(--gripWhite, #ffffff)',
            },
          }}
        />
      }
      label={label}
    />
  );
};

export default CustomCheckbox;
