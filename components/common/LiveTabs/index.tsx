import React from 'react';
import classes from './LiveTabs.module.css';

type Props = {
  filterArr?: string[];
  activeFilter?: number;
  autoChangeTime?: number;
  tabChange?: (index: number) => void;
  isProductHovered?: boolean;
};

const LiveTabs = ({
  filterArr = [],
  activeFilter = 0,
  autoChangeTime = 10000,
  tabChange = () => {},
  isProductHovered = false,
}: Props) => {
  const handleTabChange = (index: any) => {
    tabChange(index);
  };

  React.useEffect(() => {
    const filterEle = document.getElementById(`DealFilter__${activeFilter}`);
    const filterWrapper = document.getElementById('filterWrapper');
    if (window.innerWidth <= 767 && filterEle && filterWrapper) {
      const windowWidth = window.innerWidth;
      filterWrapper.scrollTo({
        left:
          filterEle.offsetLeft + filterEle.clientWidth / 2 - windowWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [activeFilter]);

  if (filterArr.length <= 1) {
    return null;
  }

  return (
    <div className={`${classes.AssetFilter}`}>
      <div className={classes.ScrollWrapper} id="filterWrapper">
        <ul>
          {filterArr.map((ele: string, index: number) => {
            return (
              <li
                key={`${ele}__DealFilter`}
                className={`${
                  index === activeFilter ? classes.ActiveFilter : ''
                } ${isProductHovered ? classes.PauseAnimation : ''}`}
                onClick={() => handleTabChange(index)}
                id={`DealFilter__${index}`}
                style={{
                  animationDuration: `${autoChangeTime / 1000}s`,
                }}
              >
                <span>{ele}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default LiveTabs;
