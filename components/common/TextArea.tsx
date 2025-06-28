/**
 * Created by Moulik on 2022-01-08
 */

import React from 'react';
import classnames from 'classnames';

import TextField from '@mui/material/TextField';

import { getObjectClassNames } from '../utils/designUtils';

import { mediaQueries } from '../utils/designSystem';

const classes: any = getObjectClassNames({
  inputContainer: {
    width: '100%',
  },
  input: {
    boxSizing: 'border-box',
    borderRadius: 8,
    width: '100%',
  },
  onFocusedInput: {
    boxShadow: '0px 0px 0px 4px var(--gripLighterOne, #E5F1FF)',
    '> fieldset': {
      borderColor: 'var(--gripBlue, #00357c) !important',
    },
  },
  hasValue: {
    '> fieldset': {
      borderColor: 'var(--gripBlue, #00357c) !important',
    },
  },
  label: {
    color: 'var(--gripLuminousGreyPlace, #777777) !important',
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    fontFamily: 'var(--fontFamily)',
    top: 2,
    left: 4,
  },
  focusedLabel: {
    color: 'var(--gripBlue, #00357c) !important',
    padding: '0px 8px !important',
    backgroundColor: 'var(--gripWhite, #FFFFFF)',
  },
  disabledLabel: {
    color: 'var(--gripLuminousDark, #282c3f) !important',
  },
  onError: {
    border: '1px solid #f44336',
  },
  notchedOutline: {
    borderColor: 'var(--gripGhost, #c5c6d3)',
    '& > legend': {
      [mediaQueries.nonPhone]: {
        marginLeft: 5,
      },
      [mediaQueries.phone]: {
        marginLeft: 4,
      },
    },
    '& > legend > span': {
      opacity: 1,
      display: 'block',
      backgroundColor: 'var(--gripWhite, #ffffff)',
    },
  },
  textAreaMain: {
    borderRadius: 8,
    padding: '16px 20px',
    [mediaQueries.phone]: {
      padding: '16px',
    },
  },
  disabledRoot: {
    backgroundColor: 'rgba(239, 239, 239, 0.3)',
  },
});

type MyProps = {
  labelText: string;
  value: any;
  onChange: (e: any) => void;
  error: string | boolean;
  classes?: Partial<{
    root: any;
    label: any;
    input: any;
    disabledRoot: any;
    inputPropsRoot: any;
  }>;
  multiline?: boolean;
  disabled?: boolean;
  id?: string;
};

const TextArea = (props: MyProps) => {
  const { disabled = false } = props;
  return (
    <div
      className={classnames(classes.inputContainer, {
        [props.classes?.root]: Boolean(props.classes?.root),
      })}
    >
      <TextField
        multiline
        id={props?.id}
        rows={4}
        variant="outlined"
        className={classnames(classes.input, {
          [props.classes?.input]: Boolean(props.classes?.input),
        })}
        value={props.value}
        onChange={props.onChange}
        classes={{
          root: classes.inputRoot,
        }}
        error={Boolean(props.error)}
        disabled={disabled}
        label={props.labelText}
        InputProps={{
          classes: {
            focused: classes.onFocusedInput,
            notchedOutline: classes.notchedOutline,
            error: classes.onError,
            root: classnames(classes.textAreaMain, {
              [classes.hasValue]: Boolean(props.value),
              [props.classes?.inputPropsRoot]: Boolean(
                props?.classes?.inputPropsRoot
              ),
            }),
            disabled: classnames(
              classes.disabledRoot,
              props?.classes?.disabledRoot
            ),
          },
        }}
        InputLabelProps={{
          classes: {
            root: classnames(classes.label, props.classes?.label, {
              [classes.focusedLabel]: Boolean(props.value),
              [classes.disabledLabel]: disabled,
            }),
            focused: classes.focusedLabel,
          },
        }}
        autoFocus={false}
      />
    </div>
  );
};

export default TextArea;
