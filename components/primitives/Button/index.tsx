import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import btnStyles from './Button.module.css';
import Image from '../Image';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

export enum ButtonType {
  Primary = 'primary',
  PrimaryLight = 'primary-light',
  Secondary = 'secondary',
  SecondaryLight = 'secondary-light',
  Inverted = 'inverted',
  NavMenu = 'nav_menu',
  Disabled = 'disabled',
  BorderLess = 'border-less',
}

type Props = {
  onClick?: ({ buttonId }: { buttonId: string | undefined }) => void;
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  width?: number | string;
  variant?: ButtonType;
  compact?: boolean;
  id?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  ctaIcon?: string;
  [key: string]: any;
};

const Button = ({
  children,
  isLoading = false,
  disabled = false,
  onClick,
  onKeyDown,
  width = 200,
  variant = ButtonType.Primary,
  compact = false,
  id,
  className = '',
  style = {},
  ctaIcon = '',
  ...props
}: Props) => {
  const getExtraClassName = () => (className.trim() !== '' ? className : '');

  const getStyles = () => {
    return { width: width, ...style };
  };

  const handleCompactButtonClass = () =>
    compact ? btnStyles.compactButton : '';

  const handleButtonStyles = () =>
    disabled || isLoading
      ? buttonTypeProperties[ButtonType.Disabled].style
      : buttonTypeProperties[variant].style;

  const handleButtonClassNames = () =>
    `${
      disabled || isLoading
        ? btnStyles.disabledButton
        : buttonTypeProperties[variant].className
    } 
     ${btnStyles.button} ${getExtraClassName()} ${handleCompactButtonClass()}`;

  const buttonTypeProperties = {
    [ButtonType.Primary]: {
      className: btnStyles.primaryButton,
      style: getStyles(),
    },
    [ButtonType.Secondary]: {
      className: btnStyles.secondaryButton,
      style: getStyles(),
    },
    [ButtonType.Inverted]: {
      className: `${btnStyles.secondaryButton} inverted`,
      style: getStyles(),
    },
    [ButtonType.NavMenu]: {
      className: btnStyles.button,
      style: {
        background: '#E5F1FF',
        color: '#00357C',
        width: '100%',
        height: 56,
        padding: '16px 18px',
      },
    },
    [ButtonType.Disabled]: {
      className: btnStyles.disabledButton,
      style: getStyles(),
    },
    [ButtonType.PrimaryLight]: {
      className: btnStyles.primaryLight,
      style: getStyles(),
    },
    [ButtonType.SecondaryLight]: {
      className: btnStyles.secondaryLight,
      style: getStyles(),
    },

    [ButtonType.BorderLess]: {
      className: `${btnStyles.borderLess}`,
      style: getStyles(),
    },
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading && onClick) {
      onClick({ buttonId: id });
    }
  };

  function renderButtonJSX() {
    return (
      <button
        className={handleButtonClassNames()}
        id={id}
        style={handleButtonStyles()}
        onClick={handleClick}
        onKeyDown={onKeyDown}
        disabled={disabled || isLoading}
        {...props}
      >
        <span>
          {isLoading && (
            <CircularProgress
              size={20}
              style={{ color: 'inherit !important', height: '20px' }}
              role="progressbar"
            />
          )}
          {ctaIcon && (
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}${ctaIcon}`}
              alternativeText="Icon"
              width={16}
              height={16}
              layout="fixed"
              alt="grip_invest_bucket_url"
            />
          )}
          {children}
        </span>
      </button>
    );
  }

  return renderButtonJSX();
};

export default Button;
