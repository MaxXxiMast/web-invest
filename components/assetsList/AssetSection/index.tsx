//Node Modules
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

//Components
import Heading from '../Heading';
import AssetCard from '../../primitives/AssetCard';
import TitleSection from '../TitleSection';
import NoData from '../../common/noData';
import AssetCardSkeleton from '../../../skeletons/asset-card-skeleton/AssetCardSkeleton';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';
import XCasePlaceholder from '../xCasePlaceholder';
import LockedOverlay from '../locked-overlay/LockedOverlay';
import KnowMore from '../../discovery/KnowMore';
import ZeroState from '../AssetFilters/ZeroState/zeroState';
import {
  resetFiltersWithLoading,
  setShowFilterModal,
} from '../AssetFilters/AssetFilterSlice/assetFilters';
import FilterCard from '../AssetFilters/FilterCard';

//Utils
import {
  assetListIdMapping,
  getActiveStateByHash,
} from '../../../utils/assetList';
import { trackEvent } from '../../../utils/gtm';
import { callSuccessToast } from '../../../api/strapi';
import { ButtonType } from '../../primitives/Button';
import { isGCOrder } from '../../../utils/gripConnect';
import { financeProductTypeMapping } from '../../../utils/financeProductTypes';
import {
  dataBanner,
  getSellAnytimeBannerData,
} from '../../../utils/SellAnytime';
import { isRenderedInWebview } from '../../../utils/appHelpers';

// Hooks
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import useHash from '../../../utils/customHooks/useHash';

// Context
import { AssetsContext } from '../../../pages/assets';

// Redux Slices
import { setShowRBIModal } from '../../../redux/slices/assets';

//Styles
import styles from './AssetSection.module.css';

type Props = {
  xCaseData?: any;
  productType: assetListIdMapping;
};

const AssetSection = ({ productType, xCaseData }: Props) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    loading = true,
    data = {},
    getAssets = () => [],
    sortType = '',
    setSubCategory = () => {},
    SDITabArr,
  } = useContext(AssetsContext);

  const [localLoading, setLocalLoading] = useState(true);
  const [isOverlay, setIsOverlay] = useState(false);

  const { hash } = useHash();
  const {
    offerType: tab,
    assetSubType: subCategory,
    assetType: scrollActiveSection,
  } = getActiveStateByHash(hash);
  const { userData } = useAppSelector((state) => state.user);
  const { isTimeLessThanTwoHoursRBI } = useAppSelector((state) => state.access);
  const hasAppliedFilters = useAppSelector(
    (state) => state.assetFilters.hasAppliedFilters
  );

  const [assets, setAssets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const storedList = useAppSelector((state) => state.assets.active);

  const loadAssets = () => {
    let assets: any[] =
      productType === 'sdi'
        ? getAssets('sdi', SDITabArr?.[0]?.key)
        : getAssets(productType);
    //separate rfq and non rfq assets if required
    // let rfqAssets = assets.filter(({ isRfq }) => isRfq);
    // let nonRfqAssets = assets.filter(({ isRfq }) => !isRfq);
    setAssets(assets);
    // setRfqAssets(rfqAssets);
    // setNonRfqAssets(nonRfqAssets);
    setLocalLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById(`product_count_${productType}`);
      if (el?.innerText) {
        setTotalCount(Number(el?.innerText));
      }
    }, 0); // Run after current render cycle

    return () => clearTimeout(timer);
  }, [productType, loading]);

  useEffect(() => {
    if (!loading) {
      loadAssets();
      const hash = router.asPath;
      if (
        subCategory === 'rbi' &&
        tab.title === 'Active Offers' &&
        scrollActiveSection === 'sdi' &&
        hash?.toLowerCase()?.includes('leasex') &&
        isTimeLessThanTwoHoursRBI
      ) {
        dispatch(setShowRBIModal(true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, subCategory, scrollActiveSection, storedList]);

  const getTitle = () => {
    if (productType === 'sdi') {
      const isRBIKey = SDITabArr?.[0]?.key === 'rbi';
      return isRBIKey ? data?.objectData?.unlisted : data?.objectData?.sdi;
    }
    return data?.objectData?.[productType];
  };

  const title = getTitle();
  const getProductType = (title: string) => {
  if (title === 'Corporate Bonds') return 'Bonds';
     if (
      title === 'SDIs - LeaseX, LoanX and Invoicex' ||
      title === 'SDIs - LeaseX, LoanX and InvoiceX'
    )
      return 'SDIs';
    if (title === 'Baskets') return 'Baskets';
    if (title === 'High Yield FDs') return 'FDs';
    if (title === 'Bonds MFs') return 'Mutual Funds';
  };

  const ZeroStateTitle = getProductType(title?.title);

  const listRef = React.useRef(null);
  const isMobile = useMediaQuery();

  const [foundSellAnytime, setFoundSellAnytime] = useState(false);

  useEffect(() => {
    if (assets.length > 0) {
      const hasAnySellAnytimeAsset = assets.some((asset) => {
        const badges = asset?.badges?.split(',') || [];
        return badges.includes('sell anytime');
      });
      setFoundSellAnytime(hasAnySellAnytimeAsset);
    }
  }, [assets]);

  const shouldShowSellAnytimeBanner = () => {
    if (productType !== 'bonds') return false;
    const isIRRDropFilterActive = sortType.includes('irr dropping');
    const isSellAnytimeFilterActive = sortType.includes('sell anytime');

    return isIRRDropFilterActive && isSellAnytimeFilterActive
      ? !isMobile
      : foundSellAnytime;
  };

  const renderAssetList = (assetList: any[]) => {
    const hasIrrDroppingBadge = (asset: any) => {
      const irrDroppingDate = asset?.irrDroppingDate
        ? new Date(asset.irrDroppingDate)
        : null;
      const badges = asset?.badges?.split(',') || [];
      return !hasAppliedFilters
        ? badges.includes('irr dropping soon') &&
            asset?.irrDroppingDate &&
            irrDroppingDate.getTime() > Date.now()
        : null;
    };

    const irrDroppingAssets = assetList.filter(hasIrrDroppingBadge);
    const isIrrDroppingDealsOdd = irrDroppingAssets.length % 2 === 1;
    const showBanner = shouldShowSellAnytimeBanner() && !isMobile;
    const isBondsSection = productType === 'bonds';

    assetList.sort((a, b) => {
      const aHasBadge = hasIrrDroppingBadge(a);
      const bHasBadge = hasIrrDroppingBadge(b);

      if (aHasBadge && bHasBadge) return 0;
      return aHasBadge ? -1 : 1;
    });
    const renderFilterSortCard = () => {
      if (hasAppliedFilters) {
        return (
          <FilterCard
            productTypeTitle={title?.title}
            filteredAssetsLen={assetList?.length}
            totalAssetsLen={totalCount}
          />
        );
      }
    };

    return (
      <div
        className={`${styles.assetListContainer} ${
          isBondsSection ? styles.bondsContainer : ''
        }`}
      >
        <div className={`flex ${styles.assetGrid}`}>
          {assetList.map((asset: any, index: number) => (
            <React.Fragment key={asset.assetID}>
              <AssetCard
                key={asset.assetID}
                asset={asset}
                className={`${styles.InnerCard} ${
                  index === 0 && showBanner ? styles.firstCard : ''
                }`}
                cardHeaderClass={styles.InnerCardHeader}
                userInfo={userData}
                tab={tab}
                sortType={sortType}
                isMobile={isMobile}
              />
              {((assetList as any[]) || []).length - 1 === index && isMobile
                ? renderFilterSortCard()
                : null}

              {index === 0 && showBanner && (
                <div className="flex">
                  <XCasePlaceholder
                    id="sell-anytime"
                    data={getSellAnytimeBannerData}
                  />
                </div>
              )}
              {isMobile && shouldShowSellAnytimeBanner() && index === 0 && (
                <div className={styles.mobileBanner}>
                  <KnowMore innerPageData={{ nonInvestedBanner: dataBanner }} />
                </div>
              )}
              {((assetList || []).length - 1 === index && isMobile) ||
              (!isMobile && index === 0) ? (
                <>
                  <React.Fragment key={`${asset.assetID}-XCase`}>
                    {asset?.productCategory === 'XCase' ? (
                      <XCasePlaceholder
                        className={styles.XCasePlaceholder}
                        data={xCaseData?.cardData}
                      />
                    ) : null}
                  </React.Fragment>
                  <React.Fragment key={`${asset.assetID}-irr-dropping`}>
                    {irrDroppingAssets.length &&
                    isIrrDroppingDealsOdd &&
                    !showBanner ? (
                      <XCasePlaceholder
                        id="irr-dropping"
                        className={styles.XCasePlaceholder}
                        data={xCaseData?.irrDroppingCard}
                      />
                    ) : null}
                  </React.Fragment>
                </>
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const notifyAction = () => {
    const dataToSend = {
      userID: userData?.userID,
      email: userData?.emailID,
      productType,
    };
    trackEvent('Notify Me', dataToSend);
    callSuccessToast('We will notify you on next deal launch!');
  };

  if (loading || localLoading) {
    return (
      <>
        <CustomSkeleton className={styles.NavSkeleton} />
        <div className={styles.SkeletonWrapper}>
          {[...Array(4)].map((ele: any, index) => {
            return (
              <AssetCardSkeleton
                key={`skeleton-${index}-${Date.now()}`}
                width={`${isMobile ? '100%' : 'calc(50% - 10px)'}`}
              />
            );
          })}
        </div>
      </>
    );
  }
  const resetFilter = () => {
    dispatch(resetFiltersWithLoading());
    router.push(
      {
        pathname: router.pathname,
        query: {},
      },
      `${router.pathname}#active#${productType
        .toLowerCase()
        .replace(/\s+/g, '')}`,
      { shallow: true }
    );
    trackEvent('asset_list_interaction', {
      functionality: 'reset_filter',
      page_name: 'Asset_List',
      application_type: isMobile
        ? isRenderedInWebview()
          ? 'mweb'
          : 'mobile_app'
        : 'desktop',
    });
  };

  const changeFilter = () => {
    dispatch(setShowFilterModal(true));
    trackEvent('asset_list_interaction', {
      functionality: 'change_filter',
      page_name: 'Asset_List',
      application_type: isMobile
        ? isRenderedInWebview()
          ? 'mweb'
          : 'mobile_app'
        : 'desktop',
    });
  };

  const noDataFunction = () => {
    if (hasAppliedFilters) {
      return (
        <ZeroState
          header={
            ZeroStateTitle === 'SDIs'
              ? 'Filter(s) Applied'
              : `0 of ${totalCount} ${ZeroStateTitle} found!`
          }
          subHeader={`Try adjusting filters to discover more investment opportunities`}
          customButtonText1="Reset Filter"
          customButtonAction1={resetFilter}
          buttonClassName1={styles.notifyMeButton}
          customButtonText2="Change Filter"
          customButtonAction2={changeFilter}
          buttonClassName2={styles.notifyMeButton}
        />
      );
    }

    if (isGCOrder()) {
      return null;
    }

    return (
      <NoData
        header=""
        subHeader={`There are presently no deals available for ${title?.title}`}
        customButtonText="Notify me"
        customButtonAction={notifyAction}
        buttonType={ButtonType.Primary}
        buttonClassName={styles.notifyMeButton}
      />
    );
  };

  // NOSONAR: This function is for SE and CRE Deals Overlay will be enabled at later stage
  const handleAccredationOverlay = () => {
    const nonAccredAssetArr: string[] = [
      financeProductTypeMapping['Commercial Property'],
      financeProductTypeMapping['Startup Equity'],
    ];

    if (nonAccredAssetArr.includes(productType)) {
      return (
        <LockedOverlay
          handleKycCheck={(res: boolean) => {
            setIsOverlay(res);
          }}
          className={styles.DealLockOverlay}
        />
      );
    }
    return null;
  };
  const handleAssetList = (assetsList: any[]) => {
    return (
      <div
        ref={listRef}
        className={`flex justify-between ${styles.CardList}  ${
          assetsList.length === 0 ? styles.minHeight : ''
        }`}
      >
        {renderAssetList(assetsList)}

        {loading && assetsList.length === 0 ? (
          <div className={styles.SkeletonWrapper}>
            {[...Array(4)].map((ele: any, index) => {
              return (
                <>
                  <AssetCardSkeleton
                    showHeader={false}
                    showFooter={false}
                    key={`StaticSkeleton_-${index}-${Date.now()}`}
                    width={`${isMobile ? '100%' : 'calc(50% - 10px)'}`}
                  />
                </>
              );
            })}
          </div>
        ) : (
          <>
            {assetsList.length === 0 ? (
              <div className="flex justify-center width100">
                {noDataFunction()}
              </div>
            ) : null}
          </>
        )}

        {/* TODO: Need to add in after moving to select.gripinvest.in */}
        {/* NOSONAR: This function is for SE and CRE Deals Overlay will be enabled at later stage */}
        {/* {handleAccredationOverlay()} */}
      </div>
    );
  };

  const renderAssetListOnRfqBasis = ({ assets }) => {
    const assetsToBeShown = assets;

    //show all assets and remove marketTimer dependency
    return handleAssetList(assetsToBeShown);
  };

  const getSecondarySubCategoryListOfSDI = () => {
    let assets: any[] = getAssets('sdi', SDITabArr?.[1]?.key);
    //separate rfq and non rfq assets if required

    // let rfqAssets = assets.filter(({ isRfq }) => isRfq);
    // let nonRfqAssets = assets.filter(({ isRfq }) => !isRfq);

    return renderAssetListOnRfqBasis({ assets });
  };

  const handleSubTabChange = (subTab: string) => {
    const isSebiRegulated = subTab.startsWith('SEBI Regulated');
    const subCategorySelected = isSebiRegulated ? 'sebi' : 'rbi';
    setSubCategory(subCategorySelected);
  };

  return (
    <>
      <Heading
        title={title?.title}
        totalCount={totalCount}
        SDITabArr={SDITabArr}
        handleSubTabChange={handleSubTabChange}
        subCategory={subCategory}
      />
      <TitleSection
        data={title}
        className={styles.SectionTitle}
        productType={productType}
        id={
          productType === 'sdi' ? SDITabArr?.[0]?.key + '_section' : undefined
        }
      />
      {renderAssetListOnRfqBasis({ assets })}
      {productType === 'sdi' ? (
        <div>
          <br />
          <TitleSection
            data={
              SDITabArr?.[1]?.key === 'rbi'
                ? data?.objectData?.unlisted
                : data?.objectData?.[productType]
            }
            className={styles.SectionTitle}
            productType={productType}
            id={SDITabArr?.[1]?.key + '_section'}
          />
          {getSecondarySubCategoryListOfSDI()}
        </div>
      ) : null}
    </>
  );
};

export default AssetSection;
