import React from 'react';

// types
import type { Tab } from '../types';

// styles
import styles from './Sidebar.module.css';

type Props = {
  tab: Tab;
  isActive: boolean;
  onClick?: () => void;
};

const Tab = ({ tab, isActive, onClick }: Props) => {
  return (
    <button
      className={`flex justify-between ${
        isActive ? styles.containerActive : styles.container
      }`}
      onClick={onClick}
      // disabled={tab.count === 0}
    >
      <span className={isActive ? styles.nameActive : styles.name}>
        {tab.name}
      </span>
      <span className={styles.count}>{tab.count}</span>
    </button>
  );
};

export default Tab;
