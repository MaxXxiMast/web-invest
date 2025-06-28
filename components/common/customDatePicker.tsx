import React from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';

import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

import Image from '../primitives/Image';

const DateIcon = React.memo(function DateIcon() {
  return (
    <>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}icons/date_input.svg`}
        alt="date_icon"
        width={18}
        height={18}
        layout={'fixed'}
      />
    </>
  );
});

type MyProps = {
  placeHolder?: string;
  label?: string;
  name?: string;
  inputId?: string;
  defaultValue?: Dayjs;
  disabled?: boolean;
  disableFuture?: boolean;
  onChange?: (event: any) => void;
  value?: Dayjs | null;
  className?: string;
  error?: boolean;
  errorMsg?: string;
  format?: string;
};
const CustomDatePicker = ({
  placeHolder,
  label,
  name = '',
  inputId = '',
  defaultValue,
  disabled,
  disableFuture,
  onChange,
  value,
  className = '',
  error,
  errorMsg = '',
  format = 'DD-MM-YYYY',
}: MyProps) => {
  const getDefaultBorderColor = () => {
    return value?.isValid() ? 'var(--gripBlue, #00357c)' : '';
  };

  const getBorderColor = () => {
    return error ? ' var(--gripDanger, #ff5c5c)' : 'var(--gripBlue, #00357c)';
  };

  const getBoxShadow = () => {
    return error
      ? 'rgba(255, 92, 92, 0.2) 0px 0px 0px 4px'
      : '0px 0px 0px 4px var(--gripLighterOne, #E5F1FF)';
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          className={className}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: '1px solid var(--borderFour, #a8a9bd)',
                borderColor: getDefaultBorderColor(),
                borderRadius: '6px',
                paddingLeft: '14px',
              },
              '&:hover fieldset': {
                border: '1px solid var(--borderFour, #a8a9bd)',
                borderColor: getBorderColor() + '!important',
                boxShadow: getBoxShadow() + '!important',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                border: '1px solid var(--borderFour, #A8A9BD)',
                boxShadow: getBoxShadow(),
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: '1px solid var(--borderFour, #a8a9bd)',
                borderColor: getBorderColor(),
                boxShadow: getBoxShadow(),
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset.Mui-error.MuiOutlinedInput-notchedOutline': {
                  border: '1px solid var(--borderFour, #a8a9bd)',
                  boxShadow: getBoxShadow(),
                },
              },
            },
            '& input': {
              paddingLeft: '20px',
            },
            '& .MuiFormLabel-root': {
              '&.MuiFormLabel-root.MuiInputLabel-root.Mui-error': {
                color: 'var(--gripDanger, #ff5c5c)',
              },
              '&.MuiFormLabel-root.MuiInputLabel-root': {
                left: '4px',
                top: '-4px',
                padding: '0 4px',
                background: 'var(--gripWhite, #fff)',
              },
            },
            '& .MuiFormHelperText-root.Mui-error': {
              color: 'var(--gripDanger, #ff5c5c)',
            },
            '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline':
              {
                border: '1px solid var(--borderFour, #a8a9bd)',
                boxShadow: getBoxShadow(),
              },
            '& .Mui-disabled': {
              backgroundColor: 'rgba(239, 239, 239, 0.3)',
              boxShadow: 'none',
              color: 'var(--gripLuminousDark, #282c3f)',
              fieldset: {
                borderColor: 'var(--gripBlue, #00357c) !important',
              },
            },
          }}
          slotProps={{
            textField: {
              id: inputId ?? 'object-creator',
              name: name ?? inputId,
              placeholder: label ? '' : placeHolder,
              error: error,
              helperText: `${error ? errorMsg : ''}`,
            },
          }}
          slots={{ openPickerIcon: DateIcon }}
          label={label}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          disableFuture={disableFuture}
          onChange={onChange}
          format={format}
        />
      </LocalizationProvider>
    </>
  );
};

export default CustomDatePicker;
