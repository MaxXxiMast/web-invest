import FormControlLabel from '@mui/material/FormControlLabel';
import MUIRadio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import React from 'react';
import { getObjectClassNames } from '../utils/designUtils';

const classes: any = getObjectClassNames({
  radioButton: {
    '& .MuiIconButton-label': {
      color: '#00B8B7',
      height: 20,
      width: 20,
    },
  },
  radioLabel: {
    '& .MuiTypography-body1': {
      color: '#282C3F',
      fontWeight: 400,
      fontSize: 14,
      lineHeight: '24px',
      fontFamily: 'var(--fontFamily) !important',
    },
  },
  radioRoot: {
    color: '#00357C !important',
  },
});

type RadioProps = {
  options: {
    label: string;
    value: boolean;
  }[];
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => void;
  selectedOption: any;
  classes?: Partial<{
    formGroupRoot: any;
    formControlLabelRoot: any;
  }>;
};

function Radio(props: RadioProps) {
  const { options, handleChange, selectedOption } = props;

  return (
    <RadioGroup
      aria-label="resident-kyc"
      name="resident-kyc-group"
      onChange={handleChange}
      value={selectedOption}
      classes={{
        root: props.classes?.formGroupRoot,
      }}
    >
      {options.map(({ label, value }) => {
        return (
          <FormControlLabel
            value={value}
            key={`val__${value}`}
            control={
              <MUIRadio
                className={classes.radioButton}
                classes={{
                  root: classes.radioRoot,
                }}
              />
            }
            label={label}
            className={classes.radioLabel}
            classes={{
              root: props.classes?.formControlLabelRoot,
            }}
          />
        );
      })}
    </RadioGroup>
  );
}

export default Radio;
