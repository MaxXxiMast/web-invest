import React from 'react';

// styles
import styles from './GridOverlay.module.css';

const GridOverlay = ({ children = null }) => {
  const renderHorizontalLines = () => {
    const lines = [];
    for (let i = 0; i < 100; i++) {
      lines.push(
        <div
          key={i}
          className={styles.horizontalLine}
          style={{
            height: 20 * (i + 1),
          }}
        />
      );
    }
    return lines;
  };
  const renderVerticalLines = () => {
    const lines = [];
    for (let i = 0; i < 100; i++) {
      lines.push(
        <div
          key={i}
          className={styles.verticalLine}
          style={{
            width: 20 * (i + 1),
          }}
        />
      );
    }
    return lines;
  };
  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <div className={styles.background}>
          {renderHorizontalLines()}
          {renderVerticalLines()}
        </div>
      </div>
      <div className={styles.container}>{children}</div>
    </div>
  );
};

export default GridOverlay;
