import React, { useContext, useEffect } from 'react';

// components
import MobileTabs from '../../MobileTabs';
import MobileBanner from '../MobileBanner';
import AssetSection from '../AssetSection';
import SDIFilterTab from '../../assetsList/SDIFilterTab';

// context
import { MarketPlaceContext } from '../../../pages/marketplace';

// utils
import useHash from '../../../utils/customHooks/useHash';
import { breakDownHash } from '../utils';

// types
import type { Tabs } from '../../MobileTabs/types';

// styles
import styles from './Marketplace.module.css';

//Hooks
import { useAppSelector } from '../../../redux/slices/hooks';

type Props = {
  tabs: Tabs;
  handleTabChange: (tabId: string) => void;
  handleSubTabChange?: (subTab: string) => void;
};

export const renderActiveAssetList = ({ product }) => {
  return <React.Fragment key={product}></React.Fragment>;
};

const Mobile = ({ tabs, handleTabChange, handleSubTabChange }: Props) => {
  const { hash, updateHash } = useHash();
  const { main, sub }: any = breakDownHash(hash);

  const { SDITabArr, loading } = useContext(MarketPlaceContext);
  const localProps = useAppSelector((state) => state.assets.assetProps);
  const xCaseData = localProps?.pageData?.find(
    (item: any) => item.keyValue === 'xCase'
  )?.objectData;

  useEffect(() => {
    if (!SDITabArr?.length || !tabs.length || loading) return;
    const triggerScroll = () => {
      if (main === 'sdi') {
        if (SDITabArr?.[1]?.key === sub) {
          window.scrollTo(
            0,
            document.getElementById(sub + '_section')?.offsetTop
          );
        } else {
          updateHash('#sdi#' + SDITabArr?.[0]?.key);
        }
      } else {
        const bondsCount = tabs.find((item: any) => item.id === 'bonds')?.count;
        const sdiCount = tabs.find((item: any) => item.id === 'sdi')?.count;
        window.scrollTo(0, 0);
        if (sdiCount && !bondsCount) {
          updateHash('#sdi');
        } else {
          updateHash('#bonds');
        }
      }
    };
    const timeout = setTimeout(() => {
      triggerScroll();
    }, 200);
    return () => {
      clearTimeout(timeout);
    };
  }, [SDITabArr, loading, tabs]);

  useEffect(() => {
    if (!SDITabArr?.length) return;
    const handleScroll = () => {
      const element = document.getElementById(SDITabArr?.[1]?.key + '_section');
      if (!element || !window.location.hash.includes('sdi')) return;
      let hash = '';
      if (element.getBoundingClientRect().top < 200) {
        hash = '#sdi#' + SDITabArr?.[1]?.key;
      } else {
        hash = '#sdi#' + SDITabArr?.[0]?.key;
      }
      updateHash(hash);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [SDITabArr]);

  return (
    <div className={styles.container}>
      <MobileBanner />
      <div id="MobileTabs" className={styles.stickyContainer}>
        <MobileTabs
          tabs={tabs}
          activeTabId={main}
          handleTabChange={handleTabChange}
        />
        {main === 'sdi' ? (
          <div className={styles.subTabs}>
            <SDIFilterTab
              handleSubTabChange={handleSubTabChange}
              SDITabArr={SDITabArr}
              subCategory={sub}
              customClass={`${styles.FilterTab}`}
            />
          </div>
        ) : null}
      </div>

      <div className={styles.assetSection}>
        <AssetSection productType={main} xCaseData={xCaseData} />
      </div>
    </div>
  );
};

export default Mobile;
