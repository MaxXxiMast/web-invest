import { useEffect, useRef, useState } from 'react';
import { scrollBy } from 'seamless-scroll-polyfill';
import { useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { trackEvent } from '../../../utils/gtm';
import styles from './AssetContentSticky.module.css';

export default function AssetContentSticky() {
  const listRef = useRef(null);
  const isMobileChange = useMediaQuery();
  const [activeTab, setActiveTab] = useState('');
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const { grid = {}, detailsHeadings = [] } = useAppSelector(
    (state) => state.assets.selectedAsset
  );
  const asset = useAppSelector((state) => state.access.selectedAsset);
  const documents = useAppSelector(
    (state) => state.assets.selectedAssetDocuments
  );
  let activeScrollTab = '';

  // Scroll to the tab content when the label is clicked
  const handleLinkClick = (linkName: string, index: number) => {
    const element = document.getElementById(linkName);
    if (element) scrollTo(element, index);
    const currentActiveTab = document.getElementById(
      `detailsHeadings_${linkName}`
    );
    if (currentActiveTab) {
      currentActiveTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
    setActiveTab(linkName);
    trackEvent('Asset Detail Tab Clicked', { tab_name: linkName });
  };

  const scrollTo = (element: HTMLElement, index: number) => {
    if (element) {
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      const headerElement = document.getElementById('InfiniteScrollLinks');
      const headerHeight = headerElement ? headerElement.clientHeight + 10 : 80;
      const topOffset = index ? headerHeight + 100 : 0;

      if (isSafari) {
        scrollBy(window, {
          left: 0,
          top: element.getBoundingClientRect().top - topOffset,
        });
      } else {
        window.scroll({
          left: 0,
          top: window.scrollY + element.getBoundingClientRect().top - 170,
        });
      }
    }
  };

  // Scroll event handler to track and update active tab
  const handleOnScroll = () => {
    const sections = document.querySelectorAll(
      '.scrollSectionDiv,.PartnerWrapper'
    );
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const stickyNavigation = document.getElementById('InfiniteScrollLinks');
      const stickyHeight = stickyNavigation
        ? stickyNavigation.offsetHeight + 150
        : 180;

      if (rect.top <= stickyHeight && rect.bottom >= stickyHeight) {
        const newActiveTab = section.id;
        if (activeScrollTab !== newActiveTab) {
          activeScrollTab = section.id;
          setActiveTab(newActiveTab);
          const currentActiveTab = document.getElementById(
            `detailsHeadings_${newActiveTab}`
          );
          if (currentActiveTab) {
            currentActiveTab.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            });
          }
          trackEvent('Asset Detail Tab Change', {
            tab_name: newActiveTab,
            asset: asset?.assetID,
            title: asset?.header,
            finance_product_type: asset?.financeProductType,
            product_category: asset?.productCategory,
            product_sub_category: asset?.productSubcategory,
          });
        }
      }
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleOnScroll);
    return () => window.removeEventListener('scroll', handleOnScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkButtons = () => {
    if (listRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = listRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft + clientWidth < scrollWidth - 20);
    }
  };

  useEffect(() => {
    if (listRef.current) checkButtons();
  }, [documents]);

  useEffect(() => {
    const currentRef = listRef.current;
    if (currentRef) currentRef.addEventListener('scroll', checkButtons);
    return () => {
      if (currentRef) currentRef.removeEventListener('scroll', checkButtons);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRef.current, isMobileChange]);

  const handleButtonScroll = (direction: 'left' | 'right') => {
    const ele = listRef.current;
    if (ele) {
      ele.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
    trackEvent('Asset Detail Tab Scroll Button Clicked', {
      button_type: direction,
    });
  };

  const renderArrowButton = (type: 'left' | 'right') => (
    <div
      className={`${styles.bgScroll} ${
        type === 'left' ? styles.leftButton : styles.rightButton
      }`}
    >
      <div
        className={`flex_wrapper ${styles.SideArrow}`}
        onClick={() => handleButtonScroll(type)}
      >
        <span
          className={type === 'left' ? 'icon-caret-left' : 'icon-caret-right'}
          style={{ fontSize: 12 }}
        />
      </div>
    </div>
  );

  const renderLeftButton = () => showLeftButton && renderArrowButton('left');
  const renderRightButton = () => showRightButton && renderArrowButton('right');

  const renderList = () => (
    <div
      className={`flex ${styles.LinksContainer}`}
      id="LinksContainer"
      ref={listRef}
    >
      <ul className="flex">
        {detailsHeadings.map((label: string, index: number) => {
          if (label === 'Documents' && documents.length === 0) return null;
          return (
            <li
              id={`detailsHeadings_${label}`}
              key={`heading-${label}`}
              onClick={() => handleLinkClick(label, index)}
              className={`LinksContainerItem ${styles.LinksContainerItem} ${
                activeTab === label || (!activeTab && index === 0)
                  ? styles.ActiveLinks
                  : ''
              }`}
            >
              <span>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div
      className={`flex ${styles.InfiniteScrollLinks} ${
        grid && Object.keys(grid).length && styles.infiniteScrollLinks
      }`}
      id="InfiniteScrollLinks"
    >
      <div
        className={styles.InfiniteLinkInnerContainer}
        id="InfiniteLinkInnerContainer"
      >
        {renderLeftButton()}
        {renderList()}
        {renderRightButton()}
      </div>
    </div>
  );
}
