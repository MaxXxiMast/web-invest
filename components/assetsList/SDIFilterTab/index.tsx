import styles from './SDIFilterTab.module.css';

import FilterTab from '../../primitives/FilterTab';

const defaultTabArr = [
  {
    key: 'sebi',
    label: 'SEBI Regulated',
  },
  {
    key: 'rbi',
    label: 'RBI Regulated',
  },
];

const SDIFilterTab = ({
  handleSubTabChange = (tab: string) => {},
  SDITabArr = defaultTabArr,
  subCategory = '',
  customClass = '',
  event = null,
}) => {
  const defaultTab = SDITabArr.find((tab) => tab.key === subCategory)?.label;

  return (
    <div>
      <FilterTab
        id="filter-tab-sdi"
        tabArr={SDITabArr.map((tab: any) => tab.label)}
        handleTabChangeCB={handleSubTabChange}
        defaultTab={defaultTab}
        className={`${styles.FilterTabAssets} ${customClass}`}
        event={event}
      />
    </div>
  );
};

export default SDIFilterTab;
