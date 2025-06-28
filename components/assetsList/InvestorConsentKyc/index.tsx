import React from 'react';
import dompurify from 'dompurify';
import FormGroup from '@mui/material/FormGroup';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button, { ButtonType } from '../../../components/primitives/Button';

import classes from './InvestorConsentKyc.module.css';

type MyProps = {
  heading: string;
  subHeading: string;
  type: string;
  values: string;
  id: number;
  onSubmit: (data: any) => void;
};

function InvestorConsentKYC(props: MyProps) {
  const sanitizer = dompurify.sanitize;
  const options = props.values.split(',').map((value) => ({
    label: value,
    value: value,
  }));

  const [checkedItems, setChecked] = React.useState<string[]>([]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const value = event.target.value;
    if (checked) {
      setChecked([...checkedItems, value]);
    } else {
      const newCheckedItems = checkedItems.filter((item) => item !== value);
      setChecked(newCheckedItems);
    }
  };

  return (
    <div className={`flex-column ${classes.mainContainer}`}>
      <text className={classes.heading}>{props.heading}</text>
      <text
        className={classes.subHeadingText}
        dangerouslySetInnerHTML={{
          __html: sanitizer(props.subHeading),
        }}
      />

      <FormGroup className={classes.GroupList}>
        {options.map(({ label, value }, index) => {
          return (
            <FormControlLabel
              key={`val-${value}`}
              value={value}
              control={
                <Checkbox
                  className={classes.radioButton}
                  defaultChecked={index === 0}
                  onChange={handleChange}
                  checked={checkedItems.includes(value)}
                  sx={{
                    '&.Mui-checked': {
                      color: '#00357c',
                    },
                  }}
                />
              }
              label={label}
              className={classes.radioLabel}
            />
          );
        })}
      </FormGroup>

      <div
        className={`items-align-center-row-wise ${classes.bottomActionsContainer}`}
      >
        <Button
          className={classes.submitButton}
          disabled={checkedItems.length === 0}
          onClick={() => {
            if (checkedItems.length === 0) {
              return;
            }
            const id = props.id;
            checkedItems.length &&
              props.onSubmit({
                kycType: id,
                content: checkedItems.toString(),
              });
          }}
        >
          Continue
        </Button>

        <Button
          className={classes.submitButton}
          disabled={!!checkedItems.length}
          onClick={() => {
            if (!!checkedItems.length) {
              return;
            }
            const id = props.id;
            !checkedItems.length &&
              props.onSubmit({
                kycType: id,
                content: 'none',
              });
          }}
          variant={ButtonType.Inverted}
        >
          None of the above
        </Button>
      </div>
    </div>
  );
}

export default InvestorConsentKYC;
