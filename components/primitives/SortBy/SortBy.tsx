import React, { useEffect, useRef } from 'react';
import RHP from 'react-html-parser';
import MaterialModalPopup from '../MaterialModalPopup';

import styles from './SortBy.module.css';

type Props = {
  children?: any;
  data?: any[];
  className?: any;
  handleFilterItem?: any;
  filterName?: any;
  isMobileDrawer?: boolean;
  mobileDrawerTitle?: string;
  selectedValue?: number;
  keyMappingObject?: any;
  customDataRenderer?: (
    activeIndex: number,
    setShowFilter: (arg0: boolean) => void,
    setActiveIndex: (arg0: number) => void,
    showFilter: any
  ) => React.ReactNode;
};

const SortBy = (
  {
    children,
    data,
    className = '',
    handleFilterItem = () => {},
    filterName = 'Sort By',
    mobileDrawerTitle = 'Sort By',
    isMobileDrawer = false,
    selectedValue = 0,
    customDataRenderer,
    keyMappingObject = {},
  }: Props,
  ref: any
) => {
  const [showFilter, setShowFilter] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const eleRef1 = useRef(null);
  const eleRef2 = useRef(null);

  useEffect(() => {
    setActiveIndex(selectedValue < 0 ? 0 : selectedValue);
  }, [selectedValue]);

  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        eleRef1 &&
        eleRef1.current &&
        !eleRef1?.current.contains(event.target) &&
        eleRef2 &&
        eleRef2.current &&
        !eleRef2?.current.contains(event.target)
      ) {
        setShowFilter(false);
      }
    };
    document.addEventListener('click', handleClickOutside, false);
    return () => {
      document.removeEventListener('click', handleClickOutside, false);
    };
  }, []);

  const onClickListItem = (item: any, index: number, showFilter = false) => {
    handleFilterItem(item);
    setActiveIndex(index);
    setShowFilter(showFilter);
  };

  const MobileSortBy = () => {
    return (
      <div className={styles.MobileSortByFilter} id={'sortSection'}>
        <h3>{RHP(mobileDrawerTitle)}</h3>
        <ul>
          {customDataRenderer?.(
            activeIndex,
            setShowFilter,
            setActiveIndex,
            showFilter
          ) ??
            data.map((item, index) => {
              return (
                <li
                  onClick={() => onClickListItem(item, index)}
                  key={`item_${item}`}
                  className={`${activeIndex === index ? 'Active' : ''}`}
                >
                  <span>
                    {keyMappingObject?.[item]
                      ? keyMappingObject[item]
                      : RHP(item)}
                  </span>
                </li>
              );
            })}
        </ul>
      </div>
    );
  };

  const SortByContent = () => {
    return (
      <div
        className={`${styles.ShortByDropDown} ${
          showFilter ? 'visible' : 'hidden'
        }`}
        ref={eleRef1}
        id="ShortByDropDown"
      >
        <ul>
          {customDataRenderer?.(
            activeIndex,
            setShowFilter,
            setActiveIndex,
            showFilter
          ) ??
            (data &&
              data.map((item, index: number) => {
                return (
                  <li
                    key={`item_${item}`}
                    className={`${activeIndex === index ? 'Active' : ''}`}
                    onClick={() => onClickListItem(item, index, !showFilter)}
                  >
                    <span>
                      {keyMappingObject?.[item]
                        ? keyMappingObject[item]
                        : RHP(item)}
                    </span>
                  </li>
                );
              }))}
        </ul>
      </div>
    );
  };

  return (
    <div className={`${styles.ShortBy} ${className} ShortBy`} ref={ref}>
      <div
        className="ShortByInner"
        onClick={() => setShowFilter(!showFilter)}
        id="ShortByInner"
        ref={eleRef2}
      >
        {children ? (
          children
        ) : (
          <>
            <span className="SortBySelected">
              {keyMappingObject?.[filterName]
                ? keyMappingObject[filterName]
                : RHP(filterName)}
            </span>
            <span
              className={`${styles.SortByArrow} ${showFilter ? 'Active' : ''}`}
            >
              <span
                className="icon-caret-down"
                style={{
                  fontSize: 10,
                }}
              />
            </span>
          </>
        )}
      </div>

      {window.outerWidth > 767 && <SortByContent />}

      {window.outerWidth <= 767 && (
        <>
          {isMobileDrawer ? (
            <MaterialModalPopup
              showModal={showFilter}
              handleModalClose={(res: boolean) => setShowFilter(res)}
              isModalDrawer
            >
              <MobileSortBy />
            </MaterialModalPopup>
          ) : (
            <SortByContent />
          )}
        </>
      )}
    </div>
  );
};

export default React.forwardRef(SortBy);
