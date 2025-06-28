import React from 'react';
import styles from './ArrowButton.module.css';
import { useRouter } from 'next/router';

type Props = {
  onClick?: () => void;
  clickUrl?: string;
  children?: React.ReactElement | React.ReactElement[] | string;
  id?: string;
  className?: string;
  isAnimatedArrow?: boolean;
  ArrowrotateAngle?: string;
  hideBottomLine?: boolean;
};

const ArrowButton = ({
  children,
  onClick,
  clickUrl,
  id,
  className,
  isAnimatedArrow = false,
  ArrowrotateAngle = '0',
  hideBottomLine = false,
}: Props) => {
  const router = useRouter();

  const handleClick = (event: any) => {
    if (clickUrl) {
      router.push(clickUrl);
    } else {
      if (onClick) {
        onClick();
      }
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`${
          hideBottomLine ? styles.ArrowButtonWOLine : styles.ArrowButton
        } ${isAnimatedArrow ? styles.AnimatedArrow : ''}  ${
          className ? className : ''
        }`}
        id={id ? id : ''}
      >
        {children}{' '}
        <div
          className={styles.ButtonImage}
          style={{
            transform: `rotate(${ArrowrotateAngle}deg)`,
          }}
        >
          <span className={`icon-arrow-right-semi-circle ${styles.ThumIcon}`} />
        </div>
      </button>
    </>
  );
};

export default ArrowButton;
