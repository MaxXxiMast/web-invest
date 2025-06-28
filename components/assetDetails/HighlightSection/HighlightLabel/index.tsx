import React from 'react';
import styles from './HighlightLabel.module.css';

const HighlightLabel = ({ label = '' }) => {
  return (
    <div className="flex items-center gap-6 mt-8">
      <div className={styles.label}>{label}</div>
      <div className={styles.solidLine}></div>
    </div>
  );
};

export default HighlightLabel;
