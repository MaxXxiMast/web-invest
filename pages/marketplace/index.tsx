import React, { createContext, useCallback, useEffect } from 'react';

// components
import Mobile from '../../components/Marketplace/Mobile';
import Desktop from '../../components/Marketplace/Desktop';
import RbiPopup from '../../components/unlisted-ptc/rbi-popup';

// APIs
import { callErrorToast, fetchAPI } from '../../api/strapi';
import { fetchAssets } from '../../api/assets';

// redux
import {
  setAssetProps,
  setRatingData,
  setShowRBIModal,
} from '../../redux/slices/assets';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';

// types
import type { Tabs } from '../../components/Sidebar/types';

// utils
import useHash from '../../utils/customHooks/useHash';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { trackEvent } from '../../utils/gtm';
import { getSortedDeals } from '../../components/Marketplace/utils';
import { customSortAssets } from '../../utils/object';

export const MarketPlaceContext = createContext<any>({});

const MarketPlace = () => {
  const isMobile = useMediaQuery();
  const { updateHash } = useHash();
  const dispatch = useAppDispatch();

  const updatedAt = Number(localStorage.getItem('marketplace-updated-at'));

  const isExpired = Date.now() - updatedAt > 5 * 60 * 1000; // 5 minutes

  const [loading, setLoading] = React.useState<boolean>(isExpired);

  const preLoadedAssets = localStorage.getItem('marketplace-assets');

  const [assets, setAssets] = React.useState(
    preLoadedAssets && !isExpired
      ? JSON.parse(preLoadedAssets)
      : {
          bonds: [],
          sdi: {
            sebi: [],
            rbi: [],
          },
        }
  );

  const preLoadedTabs = localStorage.getItem('marketplace-tabs');

  const marketPlaceEnable = useAppSelector(
    (state) => state.featureFlags.marketPlace
  );

  const [tabs, setTabs] = React.useState(
    preLoadedTabs && !isExpired
      ? JSON.parse(preLoadedTabs)
      : [
          { id: 'bonds', name: 'Bonds', count: 0 },
          { id: 'sdi', name: 'SDIs', count: 0 },
        ]
  );

  const localProps = useAppSelector((state) => state.assets.assetProps);

  const sectionVal = localProps?.pageData?.find(
    (item: any) => item.keyValue === 'financeProducts'
  );

  const assetPriorityList =
    localProps?.pageData?.find(
      (item: any) => item?.objectData?.name === 'Asset Priority List'
    )?.objectData?.list || [];

  const setSubCategory = (value: 'sebi' | 'rbi' = 'rbi') => {
    const minus = SDITabArr[0]?.key === value && isMobile ? 120 : 60;
    window.scrollTo(
      0,
      document.getElementById(value === 'sebi' ? 'sebi_section' : 'rbi_section')
        ?.offsetTop - minus
    );
  };

  const getAssets = useCallback(
    (productType: string, productSubType: string = '') => {
      if (productType === 'bonds') {
        const bondPriority = customSortAssets(
          assets?.bonds || [],
          assetPriorityList,
          'assetID'
        );
        return bondPriority;
      } else if (productType === 'sdi') {
        if (productSubType === 'rbi') {
          const rbiPriority = customSortAssets(
            assets?.sdi?.rbi || [],
            assetPriorityList,
            'assetID'
          );
          return rbiPriority;
        } else if (productSubType === 'sebi') {
          const sebiPriority = customSortAssets(
            assets?.sdi?.sebi || [],
            assetPriorityList,
            'assetID'
          );
          return sebiPriority;
        }
      }
      return null;
    },
    [assets, assetPriorityList]
  );

  const SDITabArr =
    localProps?.pageData?.find((item: any) => item.keyValue === 'SDITabArr')
      ?.objectData?.SDITabArr || [];

  const MarketPlaceContextValue = React.useMemo(
    () => ({
      data: sectionVal,
      SDITabArr,
      loading,
      setSubCategory,
      getAssets,
      isEmpty: tabs.every((item: any) => item.count == 0),
    }),
    [sectionVal, SDITabArr, loading, setSubCategory, getAssets, tabs]
  );

  const getData = async () => {
    const data = await getServerData();
    dispatch(setRatingData(data?.props?.ratingScaleMapping));
    dispatch(
      setAssetProps({
        loading: false,
        ...data?.props,
      })
    );
  };

  const loadAssets = async () => {
    const response = await fetchAssets({
      visibility: 1,
      status: 'active',
      marketPlace: 1,
    });
    let bonds = [];
    let sebi = [];
    let rbi = [];
    const sortedList = getSortedDeals(response?.msg?.list || []);
    for (const item of sortedList) {
      if (item?.productCategory === 'Corporate Bonds') {
        bonds.push(item);
      } else if (item?.productCategory === 'Securitized Debt Instruments') {
        sebi.push(item);
      } else if (item?.productCategory === 'Unlisted PTC') {
        rbi.push(item);
      }
    }
    const assets = {
      bonds,
      sdi: {
        sebi,
        rbi,
      },
    };
    localStorage.setItem('marketplace-updated-at', Date.now().toString());
    if (
      localStorage.getItem('marketplace-assets') &&
      JSON.stringify(assets) === localStorage.getItem('marketplace-assets') &&
      !isExpired
    ) {
      return;
    }
    setTabs((prev: Tabs) => {
      let newTabs = prev.map((tab) => {
        if (tab.id === 'bonds') {
          return { ...tab, count: bonds.length };
        } else if (tab.id === 'sdi') {
          return { ...tab, count: sebi.length + rbi.length };
        }
        return tab;
      });
      localStorage.setItem('marketplace-tabs', JSON.stringify(newTabs));
      return newTabs;
    });
    localStorage.setItem('marketplace-assets', JSON.stringify(assets));
    setAssets(assets);
    return;
  };

  useEffect(() => {
    if (!marketPlaceEnable) {
      setTabs([
        { id: 'bonds', name: 'Bonds', count: 0 },
        { id: 'sdi', name: 'SDIs', count: 0 },
      ]);
      setAssets({
        bonds: [],
        sdi: {
          sebi: [],
          rbi: [],
        },
      });
      setLoading(false);
      localStorage.removeItem('marketplace-assets');
      localStorage.removeItem('marketplace-tabs');
      localStorage.removeItem('marketplace-updated-at');
    } else {
      Promise.all([getData(), loadAssets()])
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          callErrorToast(error);
        });
    }
  }, [marketPlaceEnable, isExpired]);

  useEffect(() => {
    if (!loading) {
      const liveDealsCount = tabs.reduce(
        (acc: number, tab: any) => acc + tab.count,
        0
      );
      trackEvent('view_marketplace', {
        liveDeals: liveDealsCount,
        msg: liveDealsCount ? 'Assets' : 'Deals go fast - Check back soon!',
      });
    }
  }, [loading]);

  const handleTabChange = (tabId: string) => {
    updateHash(`#${tabId}`);
  };

  const handleSubTabChange = (subTab: string = 'rbi') => {
    const subCategory = subTab.startsWith('SEBI Regulated') ? 'sebi' : 'rbi';
    setSubCategory(subCategory);
  };

  const showRBIModal = useAppSelector((state) => state.assets.showRBIModal);

  return (
    <MarketPlaceContext.Provider value={MarketPlaceContextValue}>
      <>
        {isMobile ? (
          <Mobile
            tabs={tabs}
            handleTabChange={handleTabChange}
            handleSubTabChange={handleSubTabChange}
          />
        ) : (
          <Desktop tabs={tabs} />
        )}
        <RbiPopup
          showModal={showRBIModal}
          onClose={() => dispatch(setShowRBIModal(false))}
        />
      </>
    </MarketPlaceContext.Provider>
  );
};

async function getServerData() {
  try {
    const [pageData, ratingScaleMapping] = await Promise.all([
      fetchAPI(
        '/inner-pages-data',
        {
          filters: {
            url: '/assets',
          },
          populate: '*',
        },
        {},
        false
      ),
      fetchAPI('/inner-pages-data', {
        filters: {
          url: '/rating-scale',
        },
        populate: '*',
      }),
    ]);

    return {
      props: {
        pageData: pageData?.data?.[0]?.attributes?.pageData,
        ratingScaleMapping:
          ratingScaleMapping?.data?.[0]?.attributes?.pageData?.find(
            (item: any) => item.keyValue === 'map'
          )?.objectData,
      },
    };
  } catch (e) {
    console.log(e, 'error');
    return {};
  }
}

export default MarketPlace;
