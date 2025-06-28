//Node Modules
import React, { createContext, useContext, useEffect, useState } from 'react';
import { NextPage } from 'next/types';
import orderBy from 'lodash/orderBy';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

//Components
import {
  AssetSection,
  LeftSidebar,
  PastOfferingTableView,
} from '../../components/assetsList';
import Seo from '../../components/layout/seo';
import KycBanner from '../../components/kycBanner';
import AssetFilter from '../../components/assetsList/AssetFilters/Asset-filter/AssetFilter';

//Redux
import {
  fetchAndSetAssets,
  setShowRBIModal,
  setShowFdModal,
  setAssetProps,
  setRatingData,
} from '../../redux/slices/assets';

//redux
import {
  setAssetsSort,
  tabName as sectionTabName,
} from '../../redux/slices/config';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
import { fetchUccStatus, updateUserKYCConsent } from '../../redux/slices/user';
import { setSdiTabChangeCount } from '../../redux/slices/userConfig';

//API
import { fetchAPI } from '../../api/strapi';

//Utils
import {
  assetListIdMapping,
  getActiveStateByHash,
  getAssetSectionMapping,
  offerTypeArr as tabArr,
} from '../../utils/assetList';
import { validSections } from '../../utils/asset';
import { isHighYieldFd } from '../../utils/financeProductTypes';
import { trackEvent } from '../../utils/gtm';
import { customSortAssets } from '../../utils/object';
import { isGCOrder } from '../../utils/gripConnect';
import { removeDuplicateFromArray } from '../../utils/arr';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import useHash from '../../utils/customHooks/useHash';
import { isRenderedInWebview } from '../../utils/appHelpers';
import {
  FiltersState,
  resetFiltersWithLoading,
  setSortAndFilter,
  SortOption,
} from '../../components/assetsList/AssetFilters/AssetFilterSlice/assetFilters';
import { hasAnyFilterApplied } from '../../components/assetsList/AssetFilters/utils';

//Styles
import styles from '../../styles/AssetsList.module.css';
import useAssetVisibilityOsBased from '../../utils/customHooks/useAssetVisibilityOsBased';

const RbiPopup = dynamic(
  () => import('../../components/unlisted-ptc/rbi-popup'),
  {
    ssr: false,
  }
);

export const AssetsContext = createContext<any>({});

const AssetList: NextPage = () => {
  const isMobile = useMediaQuery();
  const handleAssetVisibiltyOsBased = useAssetVisibilityOsBased();
  const [deals, setDeals] = useState([]);

  const localProps = useAppSelector((state) => state.assets.assetProps);
  const dispatch = useAppDispatch();

  const activeAssets = useAppSelector((state) => state.assets.active);
  const completedAssets = useAppSelector((state) => state.assets.past);
  const allAssets = { activeAssets, completedAssets };
  const enableMF = useAppSelector((state) => state.featureFlags.enabledMF);
  const router = useRouter();

  const { tabSection } = useAppSelector((state) => state.config.assetsSort);

  const sortAssetsIDComponent =
    (localProps?.pageData || []).find(
      (item: any) =>
        item.__component === 'shared.key-value' && item?.name === 'sortAssetsID'
    ) || {};

  const sortAssetsID =
    (sortAssetsIDComponent.Value || '')
      .split(',')
      .map((id: any) => Number(id)) || [];

  const SDITabArr =
    localProps?.pageData?.find((item: any) => item.keyValue === 'SDITabArr')
      ?.objectData?.SDITabArr || [];
  const isFilter = useAppSelector(
    (state) => state.assetFilters.hasAppliedFilters
  );
  const filteredDeals = useAppSelector(
    (state) => state.assetFilters.filteredDeals
  );

  const [removeAssetArr, setRemoveAssetArr] = useState<assetListIdMapping[]>(
    []
  );
  const [sideArrloaded, setSideArrLoaded] = useState(false);

  const { hash, updateHash } = useHash();
  const {
    offerType: activeTab,
    assetSubType: subCategory,
    assetType: scrollActiveSection,
  } = getActiveStateByHash(hash, isGCOrder(), removeAssetArr);

  const loading =
    useAppSelector((state) => state?.assets?.loading?.active) ||
    localProps?.loading ||
    !sideArrloaded;
  const pdLoading = useAppSelector((state) => state?.assets?.loading?.past);
  const [showAIFConsent, setShowAIFConsent] = useState(false);

  const gcAssetListShow = useAppSelector(
    (state) =>
      state.gcConfig?.configData?.themeConfig?.pages?.assetClassesToShow
  );

  const tabSwitchCount = useAppSelector(
    (state) => state.userConfig.sdiTabChangeCount
  );
  const isTwoFAModalClosed = useAppSelector(
    (state) => state.user.isDOBVerifiedTwoFAModal
  );

  useEffect(() => {
    if (isTwoFAModalClosed && isRenderedInWebview()) {
      const timeout = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 100); // 100ms delay

      return () => clearTimeout(timeout);
    }
  }, [isTwoFAModalClosed]);

  useEffect(() => {
    if (subCategory && activeTab.title === 'Active Offers') {
      trackEvent('sdi_tab_switch', {
        sdi_type: subCategory === 'sebi' ? 'SEBI regulated' : 'RBI regulated',
        switch_count: tabSwitchCount + 1,
      });
      dispatch(setSdiTabChangeCount(tabSwitchCount + 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategory]);

  useEffect(() => {
    if (!router.isReady) return;

    if (hasAnyFilterApplied(router.query)) {
      handlingUrlWithState();
    } else {
      dispatch(resetFiltersWithLoading());
    }
  }, [router.isReady]);

  useEffect(() => {
    trackEvent('asset_list_interaction', {
      page_name: 'Asset_List',
      application_type: isMobile
        ? isRenderedInWebview()
          ? 'mweb'
          : 'mobile_app'
        : 'desktop',
      filters_retained: isFilter,
    });
  }, [isFilter]);

  useEffect(() => {
    let arr = [];
    if (activeTab === tabArr[1]) {
      // For "Past Offers" tab, remove specific assets
      arr = ['Baskets', 'highyieldfd', 'bondsMFs'];
      // For GC Order, filter assets based on gcAssetListShow
    } else if (isGCOrder() && Object.keys(gcAssetListShow ?? {}).length > 0) {
      const gcAssetData = ['sdi', 'bonds', 'Baskets', 'highyieldfd'];
      const gcAssetListHideKeys = enableMF
        ? gcAssetData
        : [...gcAssetData, 'bondsMFs'];
      const disabledProducts = gcAssetListHideKeys.filter(
        (key) => !gcAssetListShow[key]
      );
      arr = removeDuplicateFromArray(disabledProducts) as assetListIdMapping[];
    } else {
      // For other cases, handle bondsMFs based on enableMF flag
      arr = enableMF ? [] : ['bondsMFs'];
    }
    // Set the removeAssetArr state before rendering the sidebar
    setRemoveAssetArr(arr);
    setSideArrLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, gcAssetListShow, enableMF]);

  const sectionMapping = getAssetSectionMapping(removeAssetArr);

  const sortedSectionMapping = (() => {
    let sections = Object.keys(getAssetSectionMapping(removeAssetArr));
    return sections;
  })();

  const [pastOfferSearchText, setPastOfferSearchText] = useState('');

  const showRBIModal = useAppSelector((state) => state.assets.showRBIModal);
  const showFdModal = useAppSelector((state) => state.assets.showFdModal);

  const handlingUrlWithState = () => {
    const query = router.query;
    const sortOption = (query.sort as SortOption) || 'relevance';
    const filters: FiltersState = {
      ytm: Array.isArray(query.ytm) ? query.ytm : query.ytm ? [query.ytm] : [],
      tenure: Array.isArray(query.tenure)
        ? query.tenure
        : query.tenure
        ? [query.tenure]
        : [],
      minInvestment: Array.isArray(query.minInvestment)
        ? query.minInvestment
        : query.minInvestment
        ? [query.minInvestment]
        : [],
      principalRepayment: Array.isArray(query.principalRepayment)
        ? query.principalRepayment
        : query.principalRepayment
        ? [query.principalRepayment]
        : [],
      rating: Array.isArray(query.rating)
        ? query.rating
        : query.rating
        ? [query.rating]
        : [],
    };
    dispatch(setSortAndFilter(sortOption, filters));

    trackEvent('sort_and_filter_interaction', {
      functionality: 'applied_with_url',
      sort_option: sortOption,
      applied_filters: filters,
      page_name: 'Asset_List',
      close_method: 'null',
      application_type: isMobile
        ? isRenderedInWebview()
          ? 'mweb'
          : 'mobile_app'
        : 'desktop',
    });
  };

  const handleSubCategoryChange = (subCategory: string) => {
    if (activeTab.title === 'Active Offers') {
      const ele = document.getElementById(
        SDITabArr?.[1]?.key === subCategory ? subCategory + '_section' : 'sdi'
      );
      if (SDITabArr?.[1]?.key === subCategory) {
        const AssetHeading = document.getElementById('AssetHeading');
        const MobileStickySidebar = document.getElementById(
          'MobileStickySidebar'
        );
        let ua = navigator.userAgent.toLowerCase();
        let isAndroid = ua.indexOf('android') > -1;
        const extraSpace = isAndroid ? 10 : 0;
        const distance = isMobile
          ? -(MobileStickySidebar.offsetHeight + extraSpace)
          : AssetHeading?.offsetHeight + 45 || 0;
        scrollTo(ele, 'auto', distance);
      } else {
        scrollTo(ele, 'auto', isMobile ? 0 : -20);
      }
    } else {
      const ele = document.getElementById('sdi');
      const AssetHeading = document.getElementById('AssetHeading');
      scrollTo(ele, 'auto', isMobile ? 0 : AssetHeading?.offsetHeight || 0);
    }
    updateHash(
      `${
        activeTab.title === 'Active Offers' ? 'active' : 'past_offerings'
      }#sdi#${subCategory}`
    );
  };

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

  useEffect(() => {
    const fetchAssetCB = async (deals) => {
      setDeals(deals);
      const FdDeals = deals.filter((d) => isHighYieldFd(d));
      await getData();
      try {
        await trackEvent('View Assets', {
          active_deal_count: deals?.length,
          active_fd_count: FdDeals?.length,
        });
      } catch (e) {
        console.error(e, 'error');
      }
    };

    Promise.all([
      dispatch(fetchAndSetAssets(fetchAssetCB)),
      dispatch(fetchUccStatus()),
      // Add more dispatch actions if needed
    ]).catch((error) => console.error('Error in dispatching actions:', error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === tabArr[1]) {
      const handler = setTimeout(() => {
        dispatch(fetchAndSetAssets(() => {}, 'past'));
      }, 300);

      return () => {
        clearTimeout(handler);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function scrollTo(
    element: HTMLElement,
    scrollBehavior: ScrollBehavior = 'auto',
    minus = 0
  ) {
    const header = document.getElementById('NavigationMain');
    if (header) {
      minus += header.offsetHeight;
    }
    const assetFilter = document.getElementById('AssetFilter');
    if (
      assetFilter &&
      (element?.id?.includes('sdi') || element?.id?.includes('rbi'))
    ) {
      minus += assetFilter.offsetHeight;
    }

    if (element) {
      window.scroll({
        behavior: scrollBehavior,
        left: 0,
        top: element.offsetTop - minus,
      });
    }
  }

  const getSortedDeals = (
    dealsToShow: any = [],
    tab: string,
    product: string
  ) => {
    let sortedDeals: any = [];

    if (tab === 'active') {
      sortedDeals = orderBy(
        dealsToShow,
        'overallDealCompletionPercentage',
        'desc'
      );

      sortedDeals = orderBy(
        sortedDeals,
        (deal) => deal?.badges?.includes('match preferences'),
        'desc'
      );

      sortedDeals = orderBy(
        sortedDeals,
        (deal) => deal?.badges?.includes('exclusive'),
        'desc'
      );

      if (product === 'highyieldfd') {
        sortedDeals = dealsToShow.sort((deal1: any, deal2: any) => {
          return (
            (Number(
              deal2?.assetMappingData?.calculationInputFields?.maxInterest
            ) || 0) -
            (Number(
              deal1?.assetMappingData?.calculationInputFields?.maxInterest
            ) || 0)
          );
        });
      }
      if (sortAssetsID?.length) {
        sortedDeals = customSortAssets(sortedDeals, sortAssetsID, 'assetID');
      }
    } else {
      sortedDeals = orderBy(
        dealsToShow,
        'overallDealCompletionPercentage',
        'desc'
      );
    }
    return sortedDeals;
  };

  const getSectionCount = (
    section: validSections,
    getTotalCount?: boolean,
    tab?: string
  ) => {
    const isPastTab = activeTab.title === 'Past Offers';
    let tabVal = isPastTab ? 'completed' : 'active';
    if (tab) {
      tabVal = tab === 'Past Offers' ? 'completed' : 'active';
    }

    let tabAssets = allAssets?.[`${tabVal}Assets`];
    tabAssets = handleAssetVisibiltyOsBased(tabAssets);
    const getAssetsLength = (length: string | number) => {
      return Number(length) > 0 && Number(length) < 10 ? `0${length}` : length;
    };

    const filterAssets = (item: any) => {
      const isSdiSection = section === 'sdi';
      if (isSdiSection) {
        return [sectionMapping.sdi.rbi, sectionMapping.sdi.sebi].includes(
          item.productCategory
        );
      }
      if (section === 'bonds') {
        return item.productCategory === sectionMapping[section];
      }
      return item.productCategory === sectionMapping[section];
    };

    if (Object.keys(sectionMapping).includes(section)) {
      let assetsLength = 0;
      if (getTotalCount) {
        assetsLength = completedAssets.filter(filterAssets).length || 0;
        assetsLength += activeAssets.filter(filterAssets).length || 0;
      } else {
        assetsLength = tabAssets?.filter(filterAssets).length || 0;
      }
      return getAssetsLength(assetsLength);
    }

    return (
      ((activeAssets && activeAssets.length) || 0) +
      ((completedAssets && completedAssets.length) || 0)
    );
  };

  const getActiveTabName = (activeSectionTabName: string) => {
    return activeSectionTabName === 'Past Offers' ? 'past' : 'active';
  };

  const handleLinkClick = (linkName: string) => {
    if (loading || window.location.pathname !== '/assets') {
      return;
    }
    if (linkName === 'sdi') {
      handleSubCategoryChange(subCategory || SDITabArr?.[0]?.key);
    } else if (isMobile || activeTab.title === 'Past Offers') {
      updateHash(
        `#${
          activeTab.title === 'Active Offers' ? 'active' : 'past_offerings'
        }#${linkName}`
      );
    } else {
      const ele = document.getElementById(linkName);
      if (ele) {
        const AssetHeading = document.getElementById('AssetHeading');
        scrollTo(ele, 'auto', isMobile ? 0 : AssetHeading?.offsetHeight || 0);
      }
    }
  };

  useEffect(() => {
    const previousPath = sessionStorage.getItem('lastVisitedPage') as string;
    trackEvent('Assets Section Switch', {
      section: scrollActiveSection,
      path: previousPath,
    });
  }, [scrollActiveSection]);

  useEffect(() => {
    if (loading) {
      return;
    }
    setTimeout(() => {
      handleLinkClick(scrollActiveSection);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    handlePastOfferSearchText('');
  }, [scrollActiveSection, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      if (!isMobile && activeTab.title === 'Active Offers') {
        const ele = document.getElementById('AssetsListMain');
        let sidebarListArr = document.querySelectorAll('.scrollSectionDiv');
        sidebarListArr = Array.prototype.slice.call(sidebarListArr).reverse();

        if (ele && ele.getBoundingClientRect().top === 0) {
          updateHash(
            `#${activeTab.title === 'Active Offers' ? 'active' : 'past'}`
          );
        } else {
          const header = document.getElementById('NavigationMain');
          const headerHeight = header ? header.offsetHeight + 35 : 92;
          for (let i = 0; i < sidebarListArr.length; i++) {
            const item = sidebarListArr[i];
            const element = document.getElementById(item.id);
            if (
              element &&
              element.getBoundingClientRect().top <= headerHeight + 100
            ) {
              const subCategoryElement = document.getElementById(
                SDITabArr?.[1]?.key + '_section'
              );

              const isSubCategoryStickyData =
                subCategoryElement &&
                subCategoryElement.getBoundingClientRect().top <
                  headerHeight + 200 &&
                item.id === 'sdi';

              let lastHash = '';
              if (isSubCategoryStickyData) {
                lastHash = `#${SDITabArr?.[1]?.key}`;
              } else if (item.id === 'sdi') {
                lastHash = `#${SDITabArr?.[0]?.key}`;
              }

              updateHash(
                `#${activeTab.title === 'Active Offers' ? 'active' : 'past'}#${
                  item.id
                }${lastHash}`
              );
              break;
            }
          }
        }
      } else if (
        isMobile &&
        activeTab.title === 'Active Offers' &&
        scrollActiveSection === 'sdi'
      ) {
        const subCategoryElement = document.getElementById(
          SDITabArr?.[1]?.key + '_section'
        );
        const header = document.getElementById('NavigationMain');
        if (!subCategoryElement || !header) return;
        const headerHeight = header ? header.offsetHeight + 35 : 92;
        const subCategoryElementTop =
          subCategoryElement.getBoundingClientRect().top;
        if (subCategoryElementTop < headerHeight + 200) {
          updateHash(
            `#${activeTab.title === 'Active Offers' ? 'active' : 'past'}#sdi#${
              SDITabArr?.[1]?.key
            }`
          );
        } else {
          updateHash(
            `#${activeTab.title === 'Active Offers' ? 'active' : 'past'}#sdi#${
              SDITabArr[0].key
            }`
          );
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isMobile, SDITabArr, updateHash]);

  const tabChangeEvent = (ele = '') => {
    if (ele === activeTab.title) {
      return;
    }
    let tabName = tabArr[1];
    if (activeTab === tabArr[1]) {
      tabName = tabArr[0];
    }
    updateAssetsSort(tabSection, getActiveTabName(tabName.title));
    localStorage.setItem('isFromAssetDetail', 'true');
    const tabVal =
      tabName.title === 'Past Offers' ? '#past_offering#bonds' : '#active';
    updateHash(tabVal);
    if (isMobile) {
      var element = document.getElementById('SidebarLinks');
      if (element) {
        element.scrollLeft = 0;
      }
    }

    trackEvent('Assets Tab Switch', {
      tab: tabName,
    });
    dispatch(setSdiTabChangeCount(0));
  };

  const getAssets = (product: string, subCategory?: string) => {
    const tabVal = activeTab.title === 'Past Offers' ? 'completed' : 'active';

    const tabAssets = allAssets?.[`${tabVal}Assets`] || [];

    let assets =
      tabVal === 'active' ? (isFilter ? filteredDeals : tabAssets) : tabAssets;
    assets = handleAssetVisibiltyOsBased(assets);

    if (assets && assets.length) {
      assets = assets.filter((a: any) => {
        const type = a?.productCategory || a?.financeProductType;
        if (product === 'sdi') {
          if (subCategory) {
            return type === sectionMapping.sdi?.[subCategory];
          } else {
            return (
              type === sectionMapping.sdi.rbi ||
              type === sectionMapping.sdi.sebi
            );
          }
        }
        return type === sectionMapping[product];
      });
    }

    const sortedTabName =
      activeTab.title === 'Active Offers' ? 'active' : activeTab.title;
    if (!isFilter) {
      assets = getSortedDeals(assets, sortedTabName, product);
    }
    return assets;
  };

  const onSubmitKYCConsent = async (data: any, id: string) => {
    if (id === 'accredited_investor_consent') {
      const consentDetails = data?.content?.split(',');
      const isNoneSelected = consentDetails?.find((x) => x?.includes?.('none'));
      let isEarlyStage = false;
      let searialEntrepenuer = false;
      let managementProfessional = false;
      if (!isNoneSelected) {
        isEarlyStage = consentDetails?.some((x) =>
          x?.includes?.('early stage')
        );
        searialEntrepenuer = consentDetails?.some((x) =>
          x?.includes?.('entrepreneur')
        );
        managementProfessional = consentDetails?.some((x) =>
          x?.includes?.('management')
        );
      }

      const rudderData = {
        active_tab: scrollActiveSection,
        early_stage_experience: isEarlyStage,
        serial_entrepreneur: searialEntrepenuer,
        senior_management_professional: managementProfessional,
      };
      trackEvent('accreditation_added', rudderData);
    }

    dispatch(
      updateUserKYCConsent({
        ...data,
        referringLocation: activeTab,
      })
    );
  };

  const updateAssetsSort = (
    tabSection: validSections,
    activeTabName: sectionTabName
  ) => {
    dispatch(
      setAssetsSort({
        tabSection: tabSection,
        tab: activeTabName,
      })
    );
  };

  const xCaseData = localProps?.pageData?.find(
    (item: any) => item.keyValue === 'xCase'
  )?.objectData;

  const leftSideBar = (hideSideBar = false) => (
    <LeftSidebar
      activeLinkName={scrollActiveSection}
      onLinkClick={handleLinkClick}
      getSectionCount={getSectionCount}
      hideSideBar={hideSideBar}
      pastOfferSearchText={pastOfferSearchText}
      handlePastOfferSearchText={handlePastOfferSearchText}
      loading={loading}
      SDITabArr={SDITabArr}
      setSubCategory={handleSubCategoryChange}
      xCaseData={xCaseData}
      removeAssetArr={removeAssetArr}
    />
  );

  const sectionVal = localProps?.pageData?.find(
    (item: any) => item.keyValue === 'financeProducts'
  );

  const handlePastOfferSearchText = (
    search: string,
    error: boolean = false
  ) => {
    setPastOfferSearchText(search);
  };

  const renderAllCards = (product: string, isMobile = false) =>
    !(isMobile && scrollActiveSection !== product);

  const AssetContextValue = {
    loading,
    data: sectionVal,
    getAssets,
    onSubmitKYCConsent,
    showAIFConsent,
    setShowAifConsent: setShowAIFConsent,
    pdLoading,
    searchText: pastOfferSearchText,
    setSubCategory: handleSubCategoryChange,
    SDITabArr,
  };

  const renderActiveAssetList = () => {
    return sortedSectionMapping.map(
      (product: assetListIdMapping, index: number) => {
        return (
          <React.Fragment key={product}>
            {renderAllCards(product, isMobile) ? (
              <div
                className={`scrollSectionDiv ${styles.ContentSection} ${
                  scrollActiveSection === product ||
                  (!scrollActiveSection && index === 0)
                    ? 'active'
                    : ''
                }`}
                id={product}
              >
                <AssetSection productType={product} xCaseData={xCaseData} />
              </div>
            ) : null}
          </React.Fragment>
        );
      }
    );
  };

  const renderPastAssetList = () => {
    return <PastOfferingTableView />;
  };

  const renderKycEntryBanner = () => {
    if (localProps.loading) return null;
    return (
      <div className={styles.kycEntryBanner} id="KYC-ENTRY-BANNER">
        <KycBanner />
      </div>
    );
  };

  const RenderAssetList = () => {
    return (
      <div className={styles.AssetsListMain} id="AssetsListMain">
        <AssetFilter
          searchText={pastOfferSearchText}
          handlePastOfferSearchText={handlePastOfferSearchText}
          totalDeals={deals.length}
        />
        {isMobile ? (
          <div
            className={`${styles.MobileLeftContainer}`}
            id="MobileHeaderTabs"
          >
            {leftSideBar(isMobile)}
          </div>
        ) : null}
        <div className="containerNew">
          <div
            className={` flex ${styles.TabContentInner}`}
            id="TabContentInner"
          >
            <div className={`${styles.LeftContent}`}>
              {!isMobile ? leftSideBar(isMobile) : null}
            </div>
            <AssetsContext.Provider value={AssetContextValue}>
              <div
                className={`${styles.RightContent} ${
                  activeTab.title === 'Past Offers' ? styles.reducePadding : ''
                }`}
              >
                {renderKycEntryBanner()}
                {activeTab.title === 'Past Offers'
                  ? renderPastAssetList()
                  : renderActiveAssetList()}
              </div>
            </AssetsContext.Provider>
          </div>
        </div>
      </div>
    );
  };

  const seoData = localProps?.pageData?.filter(
    (item) => item.__component === 'shared.seo'
  )[0];

  return (
    <>
      <Seo seo={seoData} />
      {RenderAssetList()}
      <RbiPopup
        showModal={showRBIModal}
        onClose={() => dispatch(setShowRBIModal(false))}
      />
      <RbiPopup
        showModal={showFdModal}
        onClose={() => dispatch(setShowFdModal(false))}
        modalType="fdModal"
      />
    </>
  );
};

export async function getServerData() {
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

export default AssetList;
