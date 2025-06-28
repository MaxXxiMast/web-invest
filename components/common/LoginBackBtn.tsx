import React from 'react';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import Image from '../primitives/Image';
import { getObjectClassNames } from '../utils/designUtils';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

const classes: any = getObjectClassNames({
  BackHomeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    cursor: 'pointer',
    span: {
      fontWeight: 600,
      fontSize: 14,
      lineHeight: '16px',
      color: 'var(--gripLuminousDark)',
      borderBottom: '1px solid',
    },
  },
});

type BtnProps = {
  showArr?: boolean;
  btnTxt?: string;
  className?: string;
  handleClick?: () => void;
};

const LoginBackBtn = ({
  showArr = true,
  btnTxt = 'Back to home',
  className = '',
  handleClick = () => {},
}: BtnProps) => {
  const isMobile = useMediaQuery();
  const renderButton = () => {
    return (
      <div
        className={`${classes.BackHomeBtn} ${className}`}
        onClick={handleClick}
      >
        {showArr && (
          <Image
            layout={'fixed'}
            width={12}
            height={12}
            src={`${GRIP_INVEST_BUCKET_URL}commons/LeftCaret.svg`}
            alt="LeftCaret"
          />
        )}
        <span>{btnTxt}</span>
      </div>
    );
  };

  return !isMobile ? renderButton() : null;
};

export default LoginBackBtn;
