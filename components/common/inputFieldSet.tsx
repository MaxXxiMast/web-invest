//Node Modules
import React, { useEffect } from 'react';
import DOMPurify from 'dompurify';

//components
import Image from '../primitives/Image';

//utils
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

//Styles
import styles from '../../styles/helpers/inputFieldSet.module.css';

type MyProps = {
  placeHolder?: string;
  label?: string;
  width?: string | number;
  type: string;
  maxLength?: number;
  onChange?: (event: any) => void;
  onFocus?: (event: any) => void;
  children?: {} | null;
  customInputStyles?: {};
  error?: boolean;
  showLabelOnFocus?: boolean;
  disabled?: boolean;
  value?: string;
  onKeyPress?: (e: any) => void;
  isSmallHeight?: boolean;
  inputId?: string;
  className?: string;
  extraStyles?: any;
  inputFieldSetClassName?: string;
  inputContainerClassName?: string;
  errorMsg?: string;
  name?: string;
  showClear?: boolean;
  clearClass?: string;
  errorMsgStyle?: string;
  enableFocusOnClear?: boolean;
  inputMode?:
    | 'search'
    | 'none'
    | 'email'
    | 'tel'
    | 'text'
    | 'url'
    | 'numeric'
    | 'decimal';
  isShowPlaceHolder?: boolean;
  otherProps?: React.InputHTMLAttributes<HTMLInputElement>;
  ref?: React.Ref<HTMLInputElement>;
  setError?: any;
  autoFocus?: boolean;
};

const InputFieldSet = React.forwardRef<HTMLInputElement, MyProps>(
  (
    {
      placeHolder,
      label,
      showLabelOnFocus = true,
      width,
      type,
      maxLength,
      customInputStyles = {},
      onChange,
      onFocus,
      error,
      children,
      disabled,
      value,
      onKeyPress,
      isSmallHeight = false,
      inputId = '',
      className = '',
      extraStyles = {},
      inputFieldSetClassName = '',
      inputContainerClassName = '',
      errorMsg = '',
      errorMsgStyle = '',
      name = '',
      showClear = false,
      clearClass = '',
      enableFocusOnClear = false,
      inputMode = 'text',
      isShowPlaceHolder = false,
      otherProps,
      setError,
      autoFocus = false,
    },
    ref
  ) => {
    const setInitialInputType = () => {
      if (!focus && type == 'date' && !value) {
        return '';
      }
      return type;
    };

    const inputref = React.useRef<HTMLInputElement>(null);
    const [borderBox, setBorderBox] = React.useState('none');
    const [focus, setFocus] = React.useState(false);
    const [inputType, setInputType] = React.useState(setInitialInputType);
    const [isMaliciousInput, setIsMaliciousInput] = React.useState(false);

    React.useEffect(() => {
      if (!focus && !value) {
        setInputType('');
      } else {
        setInputType(type);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focus, value]);

    useEffect(() => {
      if (autoFocus) {
        setTimeout(() => {
          if (inputref.current) {
            inputref.current?.focus();
          }
        }, 0);
      }
    }, [autoFocus]);

    // Function to sanitize and validate input
    const sanitizeAndValidateInput = (input: string) => {
      const sanitizedInput = DOMPurify.sanitize(input);
      const isMalicious = sanitizedInput !== input;
      setIsMaliciousInput(isMalicious);
      setError?.(isMalicious);
    };

    // Handle input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      const inputValue = event.target.value;
      sanitizeAndValidateInput(inputValue);
    };

    const handleFocus = (focus: boolean, event?: any) => {
      if (focus) {
        setBorderBox('0px 0px 0px 4px var(--gripLighterOne, #e5f1ff)');
        inputref?.current?.focus();

        if (onFocus) {
          onFocus(event);
        }
      } else {
        setBorderBox('');
      }
      setFocus(focus);
    };

    const getClassOnFocus = () => {
      return focus ? styles.showLabelOnFocus : '';
    };

    const getShowLabelClass = () => {
      return showLabelOnFocus ? styles.legend : styles.showLegend;
    };

    const getClassesForDateType = () => {
      const focusClass = focus ? styles.showLabelOnFocusDate : '';
      return focusClass;
    };

    const getStylesForInput = () => {
      return `${
        styles.commonFont
      } ${getShowLabelClass()} ${getClassOnFocus()} ${getClassesForDateType()}
    `;
    };

    const getBorder = () => {
      const whenFocus = `${
        focus ? extraStyles?.selectedBorder ?? '1' : '1'
      }px solid var(--gripBlue, #00357c)`;
      const whenNoValueAndNoFocus =
        !value && !focus ? '1px solid var(--gripGhost, #c5c6d3)' : whenFocus;
      if (value && !focus) {
        return '1px solid var(--borderFour, #A8A9BD)';
      }
      return !error && !isMaliciousInput
        ? whenNoValueAndNoFocus
        : '1px solid var(--gripDanger, #ff5c5c)';
    };

    const getBorderBox = () => {
      return error || isMaliciousInput
        ? '0px 0px 0px 4px rgba(255, 92, 92, 0.2)'
        : borderBox;
    };

    const getClassName = () => {
      const whenFocus = `${focus ? 'Focused' : ''}`;
      const whenNoValueAndNoFocus = value && !focus ? 'HasValue' : whenFocus;
      return !error ? whenNoValueAndNoFocus : '';
    };

    const getColorWhenNoValue = () => {
      const onFocusColor = focus
        ? 'var(--gripBlue, #00357c)'
        : 'var(--gripLuminousGreyPlace, #777777)';
      return !error ? onFocusColor : 'var(--gripDanger, #ff5c5c)';
    };

    const renderError = () => {
      if (error || isMaliciousInput)
        return (
          <p className={`${styles.errorMsg} ${errorMsgStyle}`}>
            {isMaliciousInput && !setError ? 'invalid input' : errorMsg}
          </p>
        );
    };

    const handleClear = () => {
      if (inputref.current) {
        inputref.current.value = '';
        if (onChange) {
          const event = new Event('change');
          inputref.current.dispatchEvent(event);
          if (enableFocusOnClear) {
            inputref?.current?.focus();
          }
          onChange(event); // Propagate the change
        }
      }
    };

    return (
      <div
        style={{ width: width }}
        className={inputContainerClassName}
        key={label}
      >
        <fieldset
          className={`${
            styles.inputFieldSet
          } ${getClassName()} ${inputFieldSetClassName}`}
          style={{
            border: getBorder(),
            boxShadow: getBorderBox(),
          }}
        >
          <>
            <input
              ref={(node) => {
                inputref.current = node;
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  (
                    ref as React.MutableRefObject<HTMLInputElement | null>
                  ).current = node;
                }
              }}
              type={inputType}
              style={customInputStyles}
              id={inputId.trim() !== '' ? inputId : placeHolder}
              className={`${styles.mailMobileInput} ${
                isSmallHeight ? styles.smallHeightInput : ''
              } ${className}`}
              name={`${name || 'object-creator'}`}
              maxLength={maxLength}
              onChange={handleInputChange}
              value={value}
              disabled={disabled}
              onFocus={(e) => handleFocus(true, e)}
              onBlur={(e) => handleFocus(false)}
              onKeyDown={onKeyPress}
              placeholder={label ? '' : placeHolder}
              inputMode={inputMode}
              autoComplete="off"
              autoFocus={autoFocus}
              {...otherProps}
            />
            {children}

            <legend
              className={getStylesForInput()}
              onClick={() => {
                inputref?.current?.focus();
                handleFocus(true);
              }}
              style={
                value
                  ? {
                      display: 'block',
                      fontWeight: 600,
                      fontSize: 10,
                      lineHeight: '20px',
                      position: 'absolute',
                      backgroundColor: 'var(--gripWhite, #ffffff)',
                      left: 16,
                      color: !error
                        ? 'var(--gripLuminousDark, #282c3f)'
                        : 'var(--gripDanger, #ff5c5c)',
                      top: 0,
                    }
                  : {
                      color: getColorWhenNoValue(),
                    }
              }
            >
              {isShowPlaceHolder
                ? isShowPlaceHolder && focus
                  ? label
                  : placeHolder
                : label}
            </legend>

            {!disabled && showClear && value && value.trim() !== '' && (
              <span
                className={`${styles.ClearIcon} ${clearClass}`}
                onClick={handleClear}
              >
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}icons/close-circle-red.svg`}
                  alt="clear"
                  width={20}
                  height={20}
                  layout="fixed"
                />
              </span>
            )}
          </>
        </fieldset>
        {renderError()}
      </div>
    );
  }
);

InputFieldSet.displayName = 'InputFieldSet';

export default InputFieldSet;
