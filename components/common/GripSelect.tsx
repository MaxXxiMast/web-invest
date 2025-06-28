/**
 * Created by Moulik on 2022-04-06.
 */

import React from 'react';
import classnames from 'classnames';

import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import MenuItem from '@mui/material/MenuItem';

import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';
import { handleExtraProps } from '../../utils/string';

const classes: any = getObjectClassNames({
  menuPaperMain: {
    zIndex: 999999,
    '> .MuiPaper-root': {
      boxShadow:
        '0px 1px 2px rgba(0, 0, 0, 0.13), 0px 2px 13px rgba(0, 0, 0, 0.06)',
      borderRadius: 4,
    },
  },
  selectOption: {
    '>div': {
      backgroundColor: 'var(--gripWhite, #ffffff)',
      border: '1px solid var(--gripLightStroke, #eaedf1) !important',
      borderRadius: '8px !important',
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 20,
    },
    '>label': {
      zIndex: 2,
      color: 'var(--gripGullGrey, #99A5B9)',
      fontSize: 16,
      fontWeight: 400,
    },
    '> fieldset': {
      border: 0,
    },
    '&:hover > fieldset': {
      borderColor: 'var(--gripBlue, #00357C)',
    },
    '&.Mui-disabled > div': {
      backgroundColor: 'var(--gripWhiteLilac, #f7f7fc) !important',
    },
    '&.Mui-disabled > fieldset': {
      borderColor: 'var(--gripGhost, #c5c6d3) !important',
    },
    '&.Mui-focused > fieldset': {
      borderColor: 'var(--gripBlue, #00357C) !important',
      borderWidth: 1,
    },
  },
  hasValue: {
    background: 'transparent',
    '> fieldset': {
      borderColor: 'var(--gripBlue, #00357C) !important',
      span: {
        color: 'var(--gripLuminousDark, #282c3f) !important',
        fontWeight: '600 !important',
      },
    },
  },
  selectMenuIcon: {
    fontSize: 11,
    color: 'var(--gripBlue, #00357C)',
    position: 'absolute',
    right: 16,
    display: 'inline-block',
    pointerEvents: 'none',
    fontWeight: 700,
  },
  dropdownMenuItem: {
    fontFamily: 'var(--fontFamily)',
    [mediaQueries.phone]: {
      fontSize: 16,
      paddingTop: '12px !important',
    },
  },
  rootLabel: {
    zIndex: 20,
    left: '10px',
    fontFamily: 'var(--fontFamily) !important',
    fontWeight: 400,
    fontSize: 16,
    lineHeight: '24px',
    color: 'var(--gripLuminousGreyPlace, #777777)',
  },
  focusedLabel: {
    display: 'none',
  },

  menuPaper: {
    boxShadow:
      '0px 0px 5px rgba(0, 0, 0, 0.05), 0px 25px 35px rgba(0, 0, 0, 0.03)',
    color: 'var(--gripLuminousDark, #282C3F)',
    maxHeight: 200,
  },
  menuItemRoot: {
    '&:hover': {
      color: 'var(--gripBlue, #00357C)',
      backgroundColor: 'var(--gripWhiteLilac, #f7f7fc)',
    },
    padding: '8px 12px',
    minWidth: 150,
    color: 'var(--gripLuminousDark, #282C3F)',
    borderRadius: 8,
    '&.Mui-selected': {
      backgroundColor: 'var(--gripLighterOne, #e5f1ff)',
    },
    [mediaQueries.nonPhone]: {
      fontWeight: 400,
      fontSize: 14,
      lineHeight: '24px',
    },
  },
  formControl: {
    minWidth: 360,
    [mediaQueries.phone]: {
      width: '100%',
      minWidth: 320,
    },
    [mediaQueries.xs]: {
      minWidth: 300,
    },
    '@media (max-width: 350px)': {
      minWidth: '100%',
      maxWidth: '100%',
    },
  },
  selectWithTextLabel: {
    fontWeight: 600,
    fontSize: 12,
    lineHeight: '16px',
    color: 'var(--gripShuttleGray, #686b78)',
    marginRight: 12,
    marginTop: 10,
    display: 'block',
    marginBottom: 7,
  },
  notchedOutline: {
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
      fontWeight: 500,
      fontSize: 10,
      lineHeight: '12px',
      backgroundColor: 'var(--gripWhite, #ffffff)',
      left: 20,
      color: 'var(--gripBlue, #00357C)',
      top: 0,
    },
  },
  onFocusedInput: {
    boxShadow: '0px 0px 0px 4px var(--gripLighterOne, #e5f1ff)',
    '> fieldset': {
      borderColor: 'var(--gripBlue, #00357C) !important',
    },
  },
  menuItemFocus: {
    background: 'var(--gripWhiteLilac, #f7f7fc)',
    color: 'var(--gripBlue, #00357C)',
  },
  menuList: {
    padding: '8px !important',
  },
  outlinedInputRoot: {
    borderRadius: 8,
  },
  selectWrapper: {
    width: '100%',
  },
  smallHeightSelect: {
    '>div': {
      paddingTop: 11.5,
      paddingBottom: 11.5,
    },
  },
  smallHeightSelectLabel: {
    top: '-5%',
  },
  showScrollbar: {
    '&::-webkit-scrollbar': {
      width: 4,
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'var(--gripGhost, #c5c6d3)',
      borderRadius: 20,
    },
  },
});

type Options = {
  value?: string | ReadonlyArray<string> | number;
  labelKey: string;
  selected?: boolean;
  disabled?: boolean;
};

type MyProps = {
  id?: string;
  value: unknown;
  onChange: (event: SelectChangeEvent, child: React.ReactNode) => void;
  options: Options[];
  placeholder: string;
  disabled?: boolean;
  withLabelName?: string;
  withLabelNameClass?: any;
  isSmallHeight?: boolean;
  name?: string;
  classes?: Partial<{
    root: any;
    select: any;
    label: any;
    selectLabel: any;
    formControlRoot: any;
    selectMenuIcon: any;
  }>;
  showScrollbar?: boolean;
  showPlaceholder?: boolean;
  optionClassName?: string;
};

const getCustomInput = ({ showPlaceholder, placeholder }) => {
  return showPlaceholder ? (
    <OutlinedInput
      classes={{
        notchedOutline: classes.notchedOutline,
        focused: classes.onFocusedInput,
        root: classes.outlinedInputRoot,
      }}
      label={placeholder}
      autoFocus={false}
    />
  ) : null;
};

const IconComponent = (selectMenuIcon: string) => (
  <span
    className={`icon-caret-down ${classnames(
      classes?.selectMenuIcon,
      selectMenuIcon
    )}`}
  />
);

function GripSelect(props: MyProps) {
  const {
    value,
    options,
    disabled,
    placeholder,
    withLabelName,
    withLabelNameClass,
    isSmallHeight = false,
    showScrollbar = false,
    showPlaceholder = true,
    optionClassName = '',
  } = props;

  return (
    <div className={classnames(classes.selectWrapper, props.classes?.root)}>
      {withLabelName ? (
        <span
          className={classnames(classes.selectWithTextLabel, {
            [withLabelNameClass]: Boolean(withLabelNameClass),
            [props.classes?.label]: Boolean(props.classes?.label),
          })}
        >
          {withLabelName}
        </span>
      ) : null}
      <FormControl
        className={classnames(
          classes.formControl,
          props.classes?.formControlRoot
        )}
      >
        <InputLabel
          id="grip-select"
          disableAnimation
          shrink={false}
          classes={{
            root: classnames(classes.rootLabel, {
              [classes.focusedLabel]: Boolean(value),
              [props.classes?.selectLabel]: Boolean(props.classes?.selectLabel),
              [classes.smallHeightSelectLabel]: isSmallHeight,
            }),
            focused: classes.focusedLabel,
          }}
        >
          {!Boolean(value) ? placeholder : String(value)}
        </InputLabel>
        <Select
          labelId="grip-select"
          label={showPlaceholder ? placeholder : null}
          id={props.id}
          disableUnderline
          className={classnames(classes.selectOption, props.classes?.select, {
            [classes.smallHeightSelect]: isSmallHeight,
            [classes.hasValue]: Boolean(value) && showPlaceholder,
          })}
          placeholder="Select"
          name={props?.name || 'Select'}
          value={value}
          defaultValue={value}
          onChange={props.onChange}
          IconComponent={() => IconComponent(props.classes?.selectMenuIcon)}
          classes={{
            select: classes.dropdownMenuItem,
          }}
          disabled={disabled}
          MenuProps={{
            PopoverClasses: {
              paper: `${classes.menuPaper}  ${
                showScrollbar ? classes.showScrollbar : ''
              }`,
            },
            classes: {
              list: classes.menuList,
              root: classes.menuPaperMain,
            },
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
            transitionDuration: 400,
          }}
          input={getCustomInput({ showPlaceholder, placeholder })}
        >
          {options.map(({ value: valueKey, labelKey, disabled, selected }) => (
            <MenuItem
              key={`MenuItem-${labelKey}-${valueKey}`}
              value={valueKey}
              className={`${classes.dropdownMenuItem} ${handleExtraProps(
                optionClassName
              )}`}
              classes={{
                root: classes.menuItemRoot,
                focusVisible: classes.menuItemFocus,
              }}
              disabled={disabled}
              selected={selected}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: labelKey,
                }}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default GripSelect;
