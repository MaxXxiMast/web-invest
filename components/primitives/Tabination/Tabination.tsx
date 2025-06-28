import styles from './Tabination.module.css';

type Props = {
  data?: any;
  className?: string;
  children?: any;
  tabArr?: any;
  activeTab?: string;
  handleTabChange?: any;
  showShortBy?: boolean;
  tabContentClass?: any;
  id?: string;
};
const Tabination = ({
  children,
  data,
  className,
  showShortBy = true,
  handleTabChange = () => {},
  tabArr,
  activeTab,
  tabContentClass,
  id,
}: Props) => {
  const ChildrenElement = () => {
    const eleMent =
      children && children.length > 0
        ? children.filter((item: any) => {
            return item.props['tab-ele'] === activeTab;
          })[0]
        : children;
    return <>{eleMent}</>;
  };
  return (
    <>
      <div className={`${styles.Tabination} ${className}`} id={id}>
        <div className={styles.TabItems}>
          <ul>
            {tabArr &&
              tabArr.length > 0 &&
              tabArr.map((item: string) => {
                return (
                  <li
                    key={`tabItem_${item}`}
                    className={`${activeTab === item ? 'active' : ''}`}
                    onClick={() => handleTabChange(item)}
                  >
                    {item}
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      <div className={`${styles.TabContent} ${tabContentClass}`}>
        <ChildrenElement />
      </div>
    </>
  );
};

export default Tabination;
