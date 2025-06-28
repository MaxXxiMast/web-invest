// types
import type { Tab } from '../types';

// styles
import styles from './MobileTabs.module.css';

type Props = {
  tab: Tab;
  isActive: boolean;
  onClick?: () => void;
};

const Tab = ({ tab, isActive, onClick }: Props) => {
  return (
    <div className={styles.container} onClick={onClick}>
      <span className={isActive ? styles.nameActive : styles.name}>
        {tab.name}
      </span>
      <span className={isActive ? styles.countActive : styles.count}>
        {tab.count}
      </span>
      <div
        data-testid="bottom-line"
        className={`${styles.bottomLine} ${isActive ? styles.active : ''}`}
      />
    </div>
  );
};

export default Tab;
