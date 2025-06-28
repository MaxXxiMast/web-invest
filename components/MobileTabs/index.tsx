import React from 'react';

// components
import Tab from './Tab';

// types
import type { Tabs } from './types';

// styles
import styles from './MobileTabs.module.css';

type Props = {
  tabs: Tabs;
  activeTabId: string;
  handleTabChange: (tabId: string) => void;
  hideZeroCountTabs?: boolean;
};

const MobileTabs = ({
  tabs,
  activeTabId,
  handleTabChange,
  hideZeroCountTabs = true,
}: Props) => {
  const renderTabs = () => {
    return tabs.map((tab) => {
      if (hideZeroCountTabs && tab.count === 0) return null;
      return (
        <Tab
          key={tab.id}
          tab={tab}
          isActive={activeTabId === tab.id}
          onClick={() => handleTabChange(tab.id)}
        />
      );
    });
  };

  if (tabs.filter((tab) => tab.count).length < 2) return null;

  return <div className={styles.container}>{renderTabs()}</div>;
};

export default MobileTabs;
