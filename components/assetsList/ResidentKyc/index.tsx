import React, { useState } from 'react';
import classNames from 'classnames';

import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

import classes from './ResidentKyc.module.css'
import Button from '../../primitives/Button';



type MyProps = {
  heading: string;
  subHeading: string;
  type: string;
  values: string;
  id: number;
  onSubmit: (data: any) => void;
  showResident: (val: boolean) => void;
};

function ResidentKYC(props: MyProps) {
  const options = props.values.split(',').map((value) => ({
    label: value,
    value: value,
  }));

  const [selectedOption, setSelectedOption] = useState('');

  React.useEffect(() => {
    props.showResident(true);
    return () => props.showResident(false);
  });

  const handleChange = (event: any) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className={`flex-column ${classes.mainContainer}`}>
      <div className={classes.heading}>{props.heading}</div>
      <div className={classes.subHeadingText}>{props.subHeading}</div>

      <RadioGroup
        aria-label="resident-kyc"
        name="resident-kyc-group"
        onChange={handleChange}
        className={classes.RadioGroup}
        value={selectedOption}
      >
        {options.map(({ label, value }) => {
          return (
            <FormControlLabel
              key={`path-${value}`}
              value={value}
              control={
                <Radio
                  className={classes.radioButton}
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
      </RadioGroup>

      <Button
        className={classNames(classes.submitButton, classes.submitButtonText)}
        disabled={!Boolean(selectedOption)}
        width={140}
        onClick={() => {
          if (Boolean(selectedOption)) {
            const id = props.id;
            props.onSubmit({
              kycType: id,
              content: selectedOption,
            });
          }
        }}
      >
        Continue
      </Button>
    </div>
  );
}

export default ResidentKYC;
