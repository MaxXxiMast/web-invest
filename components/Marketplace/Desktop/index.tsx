import React, { useContext, useEffect } from 'react';

// components
import Sidebar from '../../Sidebar';
import AssetSection from '../AssetSection';
import SidebarBanner from '../SidebarBanner';

// context
import { MarketPlaceContext } from '../../../pages/marketplace';

// utils
import useHash from '../../../utils/customHooks/useHash';
import { assetListIdMapping } from '../../../utils/assetList';
import { breakDownHash } from '../utils';

// types
import type { Tabs } from '../../Sidebar/types';

// styles
import styles from './Marketplace.module.css';

//hooks
import { useAppSelector } from '../../../redux/slices/hooks';

type Props = {
  tabs: Tabs;
};

export const renderActiveAssetList = (tabs: Tabs, xCaseData: any) => {
  const productList = ['bonds', 'sdi'];
  return productList.map((product: assetListIdMapping) => {
    return (
      <React.Fragment key={product}>
        <div
          className={`scrollSectionDiv ${styles.ContentSection}`}
          id={'marketplace-' + product}
        >
          <AssetSection productType={product} xCaseData={xCaseData} />
        </div>
      </React.Fragment>
    );
  });
};

const Desktop = ({ tabs }: Props) => {
  const localProps = useAppSelector((state) => state.assets.assetProps);
  const xCaseData = localProps?.pageData?.find(
    (item: any) => item.keyValue === 'xCase'
  )?.objectData;
  const { hash, updateHash } = useHash();

  const { main, sub }: any = breakDownHash(hash);

  const { SDITabArr, loading } = useContext(MarketPlaceContext);

  useEffect(() => {
    if (!SDITabArr?.length || !tabs.length || loading) return;
    const triggerScroll = () => {
      if (main === 'sdi') {
        if (sub === SDITabArr?.[1]?.key) {
          const element = document.getElementById(
            SDITabArr?.[1]?.key + '_section'
          );
          if (element) {
            window.scrollTo(0, element.offsetTop);
          }
        } else {
          const element = document.getElementById('marketplace-sdi');
          if (element) {
            window.scrollTo(0, element.offsetTop);
          }
        }
      } else {
        const bondsCount = tabs.find((item: any) => item.id === 'bonds')?.count;
        const sdiCount = tabs.find((item: any) => item.id === 'sdi')?.count;
        if (sdiCount && !bondsCount) {
          const element = document.getElementById('marketplace-sdi');
          window.scrollTo(0, element?.offsetTop);
          updateHash('#sdi');
        } else {
          window.scrollTo(0, 0);
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
      const sdi1 = document.getElementById('marketplace-sdi');
      const sdi2 = document.getElementById(SDITabArr?.[1]?.key + '_section');
      if (!sdi1 || !sdi2) return;
      let hash = '#bonds';
      if (sdi1.getBoundingClientRect().top < 250) {
        hash = '#sdi#' + SDITabArr?.[0]?.key;
      }
      if (sdi2.getBoundingClientRect().top < 250) {
        hash = '#sdi#' + SDITabArr?.[1]?.key;
      }
      updateHash(hash);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [SDITabArr]);

  const handleTabChange = (tabId: string) => {
    const element = document.getElementById('marketplace-' + tabId);
    window.scrollTo(0, element?.offsetTop);
  };

  return (
    <div id="MarketPlace" className={`${styles.container} flex containerNew`}>
      <Sidebar
        tabs={tabs}
        activeTabId={main || tabs[0]?.id}
        handleTabChange={handleTabChange}
        banner={<SidebarBanner />}
      />
      <div className={`${styles.rightSection}`}>
        {renderActiveAssetList(tabs, xCaseData)}
      </div>
    </div>
  );
};

export default Desktop;
