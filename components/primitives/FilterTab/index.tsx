import { PropsWithChildren, useEffect, useState } from 'react';
import styles from './FilterTab.module.css';
import { handleExtraProps } from '../../../utils/string';

type FilterTabProps = {
  id: string;
  tabArr: string[];
  defaultTab?: string;
  handleTabChangeCB: (value: string) => void;
  className?: string;
  tabStyle?: string;
  extraComponentForTabs?: JSX.Element[];
  event?: string;
};

export default function FilterTab({
  id,
  tabArr,
  handleTabChangeCB = () => {},
  children,
  className = '',
  defaultTab = null,
  tabStyle = '',
  extraComponentForTabs,
  event = null,
}: PropsWithChildren<FilterTabProps>) {
  const [activeTab, setActiveTab] = useState(tabArr[0]);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    if (event) {
      const tab =
        tabArr.find((ele) => ele.toLowerCase().includes(event)) ?? tabArr[0];
      setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const handleTabChange = (ele: string) => {
    if (ele === activeTab) {
      return;
    }
    setActiveTab(ele);
    handleTabChangeCB?.(ele);
  };

  return (
    <div
      className={`${styles.PortfolioTabs} ${handleExtraProps(className)}`}
      id={id}
    >
      <div className={styles.PortfolioTabsInner}>
        <ul>
          {tabArr.map((ele: string, index: number) => {
            return (
              <li
                onClick={() => handleTabChange(ele)}
                key={`item_${ele}`}
                className={`TabItem TextStyle1 ${
                  activeTab === ele ? `${styles.Active} ActiveTab` : ''
                } ${tabStyle} `}
              >
                {ele}
                {extraComponentForTabs?.[index] ?? null}
              </li>
            );
          })}
        </ul>
      </div>
      {children}
    </div>
  );
}
