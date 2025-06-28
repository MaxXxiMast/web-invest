import React from 'react';

import StickySidebar from '../../primitives/StickySidebar/StickySidebar';
import SidebarLinkCard from './SidebarLinkCard';
import SidebarSkeleton from '../../../skeletons/sidebar-skeleton/SidebarSkeleton';

import styles from './PortfolioFilter.module.css';
import { financeProductTypeMapping } from '../../../utils/financeProductTypes';
import { scrollIntoViewByScrollId } from '../../../utils/scroll';

const PortfolioFilter = ({
  isMobile = false,
  activeFilter = 'bonds',
  productTypes = [],
  handleFilter = (filter: string) => {},
  isSticky = true,
  parentId = '#MyInvestmentsMain',
  mobileTopPosition = 56.5,
  tabLoading = false,
}) => {
  if (!productTypes?.length || tabLoading) {
    return (
      <div
        className={
          isMobile ? styles.MobileFilterList : styles.MyInvestmentsLeft
        }
      >
        <SidebarSkeleton isMobileDevice={isMobile} />
      </div>
    );
  }

  const dynamicStyles = {
    '--mobile-top-position': `${mobileTopPosition}px`,
  } as React.CSSProperties;

  return (
    <>
      {isMobile && (
        <>
          <div
            className={styles.MobileFilterList}
            id="MobileFilterList"
            style={dynamicStyles}
          >
            <ul className={styles.MobileFilterUL}>
              {productTypes.map((ele) => {
                return (
                  <li key={ele?.id} id={ele.id + 'Tab'}>
                    <div
                      className={`${styles.MobileFilterItem} ${
                        activeFilter === ele.id
                          ? `${styles.ActiveFilter} ${
                              financeProductTypeMapping[ele.id]
                            }`
                          : ''
                      } `}
                      onClick={() => {
                        setTimeout(() => {
                          scrollIntoViewByScrollId(ele.id + 'Tab', {
                            block: 'center',
                            inline: 'nearest',
                            behavior: 'smooth',
                          });
                        }, 300);
                        handleFilter(ele.id);
                      }}
                    >
                      <div className={styles.ItemContent}>
                        <h6>{ele.name}</h6>
                        {!ele?.hideCount ? (
                          <span className={styles.AssetCount}>{ele.count}</span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
      {!isMobile && (
        <div className={styles.MyInvestmentsLeft}>
          <StickySidebar
            stickyClassName={styles.StickySidebar}
            parentId={parentId}
            bottomOffset={100}
            isSticky={isSticky}
          >
            <SidebarLinkCard
              handleOnClick={(itemid: string) => {
                handleFilter(itemid);
              }}
              activeFilter={activeFilter}
              linkArr={productTypes}
            />
          </StickySidebar>
        </div>
      )}
    </>
  );
};

export default PortfolioFilter;
