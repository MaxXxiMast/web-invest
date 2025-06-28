import React from 'react';

// types
import type { Tabs } from './types';

// components
import Tab from './Tab';

// styles
import styles from './Sidebar.module.css';

type Props = {
  top?: number;
  tabs: Tabs;
  activeTabId: string;
  handleTabChange: (tabId: string) => void;
  banner?: React.ReactNode;
};

const Sidebar = ({
  top = 120,
  tabs,
  activeTabId,
  handleTabChange,
  banner,
}: Props) => {
  const renderTabs = () => {
    return tabs.map((tab) => (
      <Tab
        key={tab.id}
        tab={tab}
        isActive={activeTabId === tab.id}
        onClick={() => handleTabChange(tab.id)}
      />
    ));
  };

  return (
    <div className={`${styles.container} flex-column`} style={{ top }}>
      {renderTabs()}
      {banner}
    </div>
  );
};

export default Sidebar;
