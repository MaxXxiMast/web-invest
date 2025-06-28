// Components
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';
import FilterGroup from '../FilterGroup/FilterGroup';
import SortFilter from '../SortFilter/SortFilter';
import Button, { ButtonType } from '../../../primitives/Button';

import { SortOption } from '../AssetFilterSlice/assetFilters';

// Utils
import { assetFilters, sortOptions } from '../utils';

// Styles
import styles from './AssetFilter.module.css';

// Props
type AssetFiltersProps = {
  showModal?: boolean;
  handleModalClose: () => void;
  sortOptionState: SortOption;
  handleSortChange: (sort: string) => void;
  filtersState: any;
  handleFilterChange: (key: any, selectedValue: any) => void;
  handleResetBtn: () => void;
  handleApplyBtn: () => void;
};

const AssetFilters = ({
  showModal = false,
  handleModalClose,
  handleFilterChange,
  sortOptionState,
  handleSortChange,
  filtersState,
  handleResetBtn,
  handleApplyBtn,
}: AssetFiltersProps) => {
  return (
      <MaterialModalPopup
        showModal={showModal}
        handleModalClose={handleModalClose}
        isModalDrawer
      >
        <div className={styles.container}>
          <h4>Apply Sort & Filter</h4>
          <div className={styles.assetFilterContainer}>
            <div className={styles.sortLabel}>SORT BY</div>
            <SortFilter
              options={sortOptions}
              value={sortOptionState}
              onChange={handleSortChange}
            />
            <div>
              <div className={styles.sortLabel}>FILTER BY</div>
              {Object.entries(assetFilters).map(([key, filter]) => (
                <FilterGroup
                  value={filtersState?.[key as keyof typeof filtersState] || []}
                  key={key}
                  label={filter?.label}
                  tooltipContent={filter?.tooltipContent}
                  options={filter?.options}
                  onChange={(selectedValues) =>
                    handleFilterChange(
                      key as keyof typeof filtersState,
                      selectedValues
                    )
                  }
                />
              ))}
            </div>
            </div>

            <div
              className={`${styles.buttonsContainer} flex justify-between gap-12`}
            >
              <Button
                width={'100%'}
                onClick={handleResetBtn}
                variant={ButtonType.Inverted}
              >
                Reset
              </Button>
              <Button width={'100%'} onClick={handleApplyBtn}>
                Apply
              </Button>
            </div>
          </div>
      </MaterialModalPopup>
  );
};

export default AssetFilters;
