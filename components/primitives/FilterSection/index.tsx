import React from 'react';

import CloseLineIcon from '../../assets/CloseLineIcon';
import TooltipCompoent from '../TooltipCompoent/TooltipCompoent';

import styles from './FilterSection.module.css';

const FilterSection = ({
  options,
  label,
  setSelectedFilter,
  selectedFilters,
  isCloseIcon = false,
  filterAndCompareData,
}) => {
  return (
    <div className={`flex ${styles.filterSection}`}>
      <span className={`items-align-center-row-wise gap-2 ${styles.filterCompare}`}>
        <span className={styles.filterLabel}>
          {label === 'IRR/YTM' ? 'Returns' : label}
        </span>
        {Boolean(filterAndCompareData?.tooltips?.[label]) ? (
          <TooltipCompoent
            toolTipText={filterAndCompareData?.tooltips?.[label]}
          >
            <span className="icon-info" />
          </TooltipCompoent>
        ) : null}
      </span>
      <div className="flex gap-8">
        {options.map((filter) => (
          <button
            onClick={() => {
              if (selectedFilters === filter && label === 'Tenure') {
                setSelectedFilter('', label);
              } else {
                setSelectedFilter(filter, label);
              }
            }}
            className={`${styles.filterButton} ${
              selectedFilters?.includes(filter) ? styles.active : ''
            }`}
            key={filter}
          >
            <span className={`flex_wrapper gap-6`}>
              {filter}
              {isCloseIcon && selectedFilters?.includes(filter) && (
                <CloseLineIcon
                  height="6px"
                  width="6px"
                  className={styles.active}
                  strokeWidth={1.5}
                />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterSection;
