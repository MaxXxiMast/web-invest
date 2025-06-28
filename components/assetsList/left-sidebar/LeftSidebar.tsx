import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Skeleton from '@mui/material/Skeleton';

// Utils
import {
  assetListMapping,
  getActiveStateByHash,
  getEnableAssetList,
  offerTypeArr as tabArr,
} from '../../../utils/assetList';
import { scrollIntoViewByScrollId } from '../../../utils/scroll';
import { isGCOrder } from '../../../utils/gripConnect';

// Components
import SearchBox from '../../primitives/SearchBox/SearchBox';
import SidebarSkeleton from '../../../skeletons/sidebar-skeleton/SidebarSkeleton';
import SDIFilterTab from '../SDIFilterTab';
import MarketplaceBanner from '../MarketplaceBanner';

//Hooks
import useHash from '../../../utils/customHooks/useHash';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Redux Slices
import { setShowRBIModal, setShowFdModal } from '../../../redux/slices/assets';
import { useAppSelector } from '../../../redux/slices/hooks';

// Styles
import styles from './LeftSidebar.module.css';

const LeftSidebar = ({
  onLinkClick,
  activeLinkName,
  getSectionCount,
  hideSideBar,
  pastOfferSearchText = '',
  handlePastOfferSearchText = () => {},
  loading = false,
  setSubCategory,
  SDITabArr,
  xCaseData,
  removeAssetArr = [],
}: any) => {
  const dispatch = useDispatch();
  const { showRBIModal } = useAppSelector((state) => state.assets);
  const isMobileDevice = useMediaQuery();

  const { hash } = useHash();
  const { offerType: tabValue, assetSubType: subCategory } =
    getActiveStateByHash(hash);

  const { isTimeLessThanTwoHoursRBI, isTimeLessThanTwoHoursFD } =
    useAppSelector((state) => state.access);

  const productTypes = getEnableAssetList(removeAssetArr);

  const listRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const checkButtons = async () => {
    if (listRef.current) {
      const { scrollLeft = 0, scrollWidth, clientWidth } = listRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft + clientWidth < scrollWidth - 20);
    }
  };

  const assetFilterScroll = (direction: 'right' | 'left') => {
    const scroll = direction === 'right' ? 200 : -200;
    if (listRef.current) {
      listRef.current.scrollBy({ left: scroll, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (listRef?.current) {
      checkButtons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRef?.current, productTypes]);

  useEffect(() => {
    const currentRef = listRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkButtons);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkButtons);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRef?.current]);

  /**
   * @description This useEffect is used to show the RBI Modal Popup when the user lands on the page
   * It also works when the user clicks on the asset name
   * It works for both Mobile and Desktop
   *
   * @param {boolean} loading - The loading state of the page
   * @param {string} subCategory - The subCategory of the asset
   * @param {string} activeLinkName - The active link name
   * @param {string} tabValue - The tab value
   * @returns {void}
   */
  useEffect(() => {
    if (!loading && tabValue.title === 'Active Offers') {
      if (
        activeLinkName === 'sdi' &&
        subCategory === 'rbi' &&
        isTimeLessThanTwoHoursRBI
      ) {
        dispatch(setShowRBIModal(true));
      }
      if (
        activeLinkName === 'highyieldfd' &&
        !showRBIModal &&
        isTimeLessThanTwoHoursFD
      ) {
        dispatch(setShowFdModal(true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, subCategory, activeLinkName]);

  useEffect(() => {
    let scrollTimeut: any, lastScrollTimeout: any;
    if (!loading && isMobileDevice) {
      clearTimeout(scrollTimeut);
      clearTimeout(lastScrollTimeout);

      scrollTimeut = setTimeout(() => {
        scrollIntoViewByScrollId(activeLinkName + 'Tab', {
          block: 'center',
          inline: 'center',
          behavior: 'smooth',
        });
      }, 300);

      const element = document.getElementById(activeLinkName + 'Tab');
      const scrollContainer = document.getElementById('SidebarLinks');
      const isLastElement = element === scrollContainer.lastElementChild;

      if (isLastElement) {
        lastScrollTimeout = setTimeout(() => {
          const maxScrollLeft =
            scrollContainer.scrollWidth - scrollContainer.clientWidth;
          if (scrollContainer.scrollLeft < maxScrollLeft) {
            scrollContainer.scrollLeft = maxScrollLeft;
          }
        }, 450);
      }
    }
    return () => {
      clearTimeout(scrollTimeut);
      clearTimeout(lastScrollTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLinkName, loading]);

  let scrollPosition = 0;
  const handleScroll = () => {
    if (window.innerWidth <= 767) {
      const MobileHeaderTabs = document.getElementById('MobileHeaderTabs');
      const AssetFilterTab = document.getElementById('AssetFilter');
      const isGC = isGCOrder();
      if (scrollY > 0 && MobileHeaderTabs) {
        if (scrollPosition < scrollY) {
          MobileHeaderTabs.style.top = '0px';
          if (!isGC) {
            AssetFilterTab.style.top = 'unset';
          }
        } else {
          MobileHeaderTabs.style.top = '48px';
          if (!isGC) {
            AssetFilterTab.style.top = '0px';
            AssetFilterTab.style.paddingTop = '20px';
          }
        }
      } else {
        // When Reaches to the top
        if (AssetFilterTab) {
          AssetFilterTab.style.paddingTop = '0px';
        }
        if (MobileHeaderTabs) {
          MobileHeaderTabs.style.top = '48px';
        }
      }
    }
    scrollPosition = scrollY;
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSearchBox = () => {
    return tabValue.title === 'Past Offers' && hideSideBar;
  };

  if (loading) {
    return (
      <>
        <SidebarSkeleton isMobileDevice={isMobileDevice} />
        {!isMobileDevice && (
          <Skeleton
            animation="wave"
            variant="rounded"
            height={194}
            width={'100%'}
            style={{
              marginTop: 40,
            }}
          />
        )}
      </>
    );
  }

  const getAssetCount = (item: any) => {
    const inActiveAssetArr = assetListMapping
      .filter((ele) => ele?.showAnnoucementWidget)
      .map((ele) => ele.id);

    if (tabValue == tabArr[0] && inActiveAssetArr.includes(item?.id)) {
      return 0;
    }
    return parseInt(getSectionCount(item?.id));
  };

  const handleSubTabChange = (subTab: string) => {
    const subCategory = subTab.startsWith('SEBI Regulated') ? 'sebi' : 'rbi';
    setSubCategory(subCategory);
  };

  const renderArrow = (direction: 'right' | 'left') => (
    <div
      className={`${styles.bgScroll} ${
        direction === 'right' ? styles.rightScroll : styles.leftScroll
      }`}
    >
      <div
        onClick={() => assetFilterScroll(direction)}
        className={`flex items-center justify-center  ${styles.scrollButton}`}
      >
        <span className={`icon-caret-down ${styles.CaretDown}`} />
      </div>
    </div>
  );

  const handleLinkClick = (item: any) => {
    onLinkClick(item?.id);
  };
  const renderAssetTabs = () => (
    <>
      {productTypes.map((item, index) => {
        return (
          <div
            key={`item__${item?.id}`}
            className={`LeftSidebarLink ${styles.LinkItem} ${item?.id} ${
              activeLinkName === item?.id || (!activeLinkName && index === 0)
                ? 'active'
                : ''
            }`}
            id={item.id + 'Tab'}
            onClick={() => handleLinkClick(item)}
          >
            <div className={`flex ${styles.LinkItemInner}`}>
              <span>{item?.name}</span>
              {item?.isSpecialNew ? (
                <span
                  className={`${styles.leftPanelNewIcon} ${styles.xCaseLabel}`}
                >
                  {isMobileDevice ? (
                    <span className={`icon-star ${styles.Star}`} />
                  ) : null}
                  {xCaseData?.sideBarData?.label}
                </span>
              ) : (
                <>
                  {!!item?.isNew && !hideSideBar && (
                    <span className={styles.leftPanelNewIcon}>New</span>
                  )}
                </>
              )}

              <span
                className={`${styles.LinkCount} ${
                  item?.isSpecialNew ? styles.xCaseCount : ''
                } ${
                  activeLinkName === item?.id ||
                  (!activeLinkName && index === 0)
                    ? 'active'
                    : ''
                }`}
                id={`product_count_${item.id}`}
              >
                {getAssetCount(item)}
              </span>
            </div>
            {(activeLinkName === item?.id ||
              (!activeLinkName && index === 0)) && (
              <div className={styles.bottomLine}></div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <>
      <div className={`${styles.LeftSidebarMain}  ${styles.SmallPillsTab}`}>
        <div className={`${styles.SidebarLinksContainer}`}>
          <div
            className={`${styles.SidebarAndSearchContainer} ${
              !isGCOrder() ? 'gc' : ''
            }`}
            id="MobileStickySidebar"
          >
            <div
              className={`${styles.scrollContainer} ${
                productTypes.length <= 1 ? styles.GCSingleAsset : ''
              }`}
            >
              {showLeftButton && renderArrow('left')}
              <div
                className={styles.SidebarLinks}
                id={`SidebarLinks`}
                ref={listRef}
              >
                {renderAssetTabs()}
              </div>
              {showRightButton && renderArrow('right')}
            </div>
            {/* Filter Tab for Mobile Only for SDI */}
            <div className={styles.filterTabContainer}>
              {activeLinkName === 'sdi' ? (
                <SDIFilterTab
                  handleSubTabChange={handleSubTabChange}
                  SDITabArr={SDITabArr}
                  subCategory={subCategory}
                  customClass={`${styles.FilterTab} ${
                    showSearchBox() ? 'Past' : ''
                  }`}
                />
              ) : null}
            </div>
            {showSearchBox() ? (
              <div className={styles.MobileSearchBoxContainer}>
                <div className={styles.MobileSearchBoxBackGround} />
                <SearchBox
                  value={pastOfferSearchText}
                  handleInputChange={handlePastOfferSearchText}
                />
              </div>
            ) : null}
          </div>
        </div>
        <MarketplaceBanner className={styles.BottomCard} />
      </div>
    </>
  );
};

export default LeftSidebar;
