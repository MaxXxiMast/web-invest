import { FormControlLabel, RadioGroup } from '@mui/material';
import MUIRadio from '@mui/material/Radio';
import { DocOptionsModel } from '../../user-kyc/utils/models';
import classes from './RadioGroup.module.css';

type Props = {
  options: DocOptionsModel[];
  value: any;
  row: boolean;
  name: string;
  id: string;
  handleChangeEvent?: (val: any) => void;
  classes?: any;
  labelClass?: string;
  labelRootClass?: string;
  radioClass?: string;
};

const RadioGroupCustom = ({
  options = [],
  value,
  handleChangeEvent,
  labelClass = '',
  radioClass = '',
  labelRootClass = '',
  ...props
}: Props) => {
  if (options.length === 0) {
    return null;
  }
  return (
    <RadioGroup
      {...props}
      onChange={(event) => handleChangeEvent(event)}
      value={value}
      classes={{
        ...props.classes,
        root: `${classes.RadioGroup} ${props?.classes?.root}`,
      }}
    >
      {options.map(({ label, value, disabled }) => {
        return (
          <FormControlLabel
            value={value}
            key={`${label}-label`}
            control={
              <MUIRadio
                classes={{
                  root: `${classes.radioRoot} ${radioClass}`,
                }}
                disableRipple
              />
            }
            label={label}
            classes={{
              label: `${classes.radioLabel} ${labelClass}`,
              root: `${classes.labelRoot} ${labelRootClass}`,
            }}
            disabled={disabled}
          />
        );
      })}
    </RadioGroup>
  );
};

export default RadioGroupCustom;
