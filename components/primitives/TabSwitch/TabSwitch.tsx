import { TabSwitchArrProps } from './utils';
import classes from './TabSwitch.module.css';

type Props = {
  tabs: TabSwitchArrProps[];
  activeTab: string;
  setActiveTab?: (tab: string) => void;
};

const TabSwitch = ({ tabs = [], activeTab, setActiveTab }: Props) => {
  const handleTabChange = (ele: TabSwitchArrProps) => {
    if (ele.isDisabled || activeTab === ele.value) {
      return;
    }
    setActiveTab?.(ele.value); // Optional chaining to ensure safety
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex ${classes.Wrapper}`}
      role="tablist"
      data-testid="tablist"
    >
      {tabs.map((ele) => {
        return (
          <div
            key={ele.label}
            className={`text-center ${classes.Tab} ${
              ele.value === activeTab ? classes.ActiveTab : ''
            } ${ele.isDisabled ? classes.Disabled : ''}`}
            onClick={() => handleTabChange(ele)}
            role="tab"
            aria-disabled={ele.isDisabled}
          >
            {ele.label}
          </div>
        );
      })}
    </div>
  );
};

export default TabSwitch;
