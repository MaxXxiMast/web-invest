import React from 'react';
import styles from './ProgressBar.module.css';

type Props = {
  progressWidth?: number;
  barHeight?: number;
  className?: string;
};

const ProgressBar = ({
  progressWidth = 0,
  className = '',
  barHeight = 4,
}: Props) => {
  return (
    <div
      role='progressbar'
      className={`${styles.ProgressBar} ProgressBar ${className}`}
      style={{
        height: `${barHeight}px`,
      }}
    >
      <span
        style={{
          width: `${progressWidth}%`,
        }}
      ></span>
    </div>
  );
};

export default ProgressBar;
