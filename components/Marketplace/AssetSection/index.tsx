//Node Modules
import React, { useContext, useEffect, useState } from 'react';

//Components
import Heading from '../../assetsList/Heading';
import AssetCard from '../../primitives/AssetCard';
import TitleSection from '../../assetsList/TitleSection';
import NoData from '../../common/noData';
import AssetCardSkeleton from '../../../skeletons/asset-card-skeleton/AssetCardSkeleton';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';
import XCasePlaceholder from '../../assetsList/xCasePlaceholder';
import KnowMore from '../../discovery/KnowMore';
import { MarketPlaceContext } from '../../../pages/marketplace';
import AppDownloadModal from '../../app-download-modal';

//Utils
import { assetListIdMapping } from '../../../utils/assetList';
import { trackEvent } from '../../../utils/gtm';
import { callSuccessToast } from '../../../api/strapi';
import { ButtonType } from '../../primitives/Button';
import { isGCOrder } from '../../../utils/gripConnect';
import {
  dataBanner,
  getSellAnytimeBannerData,
} from '../../../utils/SellAnytime';
import { breakDownHash } from '../utils';
import { isRenderedInWebview } from '../../../utils/appHelpers';

// Hooks
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import useHash from '../../../utils/customHooks/useHash';

// Redux Slices
import { setShowRBIModal } from '../../../redux/slices/assets';

//Styles
import styles from './AssetSectionMarketPlace.module.css';

type Props = {
  xCaseData?: any;
  productType: assetListIdMapping;
};

const AssetSection = ({ productType, xCaseData }: Props) => {
  const dispatch = useAppDispatch();
  const {
    loading,
    data = {},
    getAssets = () => [],
    sortType = '',
    setSubCategory = () => {},
    SDITabArr,
    isEmpty,
  } = useContext(MarketPlaceContext);
  const [localLoading, setLocalLoading] = useState(true);
  // Prevent double firing of view_popup event
  const assetCardClickHandledRef = React.useRef(false);

  const { hash } = useHash();
  const { main: tab, sub: subCategory } = breakDownHash(hash);
  const [openModal, setOpenModal] = useState(false);

  const { userData } = useAppSelector((state) => state.user);
  const { isTimeLessThanTwoHoursRBI } = useAppSelector((state) => state.access);

  const [assets, setAssets] = useState([]);

  const storedList = useAppSelector((state) => state.assets.active);

  const handleOpenAppDownloadModal = () => {
    setOpenModal(true);
  };

  const handleAssetCardClick = () => {
    if (isRenderedInWebview()) {
      return true;
    } else if (handleOpenAppDownloadModal) {
      if (!assetCardClickHandledRef.current) {
        trackEvent('view_popup', {
          popupName: 'Download App',
          page: 'Marketplace',
        });
        handleOpenAppDownloadModal();
        assetCardClickHandledRef.current = true;
        setTimeout(() => {
          assetCardClickHandledRef.current = false;
        }, 500);
      }
      return false;
    }
  };

  const loadAssets = () => {
    let assets: any[] =
      productType === 'sdi'
        ? getAssets('sdi', SDITabArr?.[0]?.key)
        : getAssets(productType);
    setAssets(assets);
    setLocalLoading(false);
  };

  useEffect(() => {
    if (!loading) {
      loadAssets();
      if (tab === 'sdi' && subCategory === 'rbi' && isTimeLessThanTwoHoursRBI) {
        dispatch(setShowRBIModal(true));
      }
    }
  }, [loading, tab, subCategory, storedList, productType, getAssets]);

  const getTitle = () => {
    if (productType === 'sdi') {
      const isRBIKey = SDITabArr?.[0]?.key === 'rbi';
      return isRBIKey ? data?.objectData?.unlisted : data?.objectData?.sdi;
    }
    return data?.objectData?.[productType];
  };

  const title = getTitle();

  const isMobile = useMediaQuery();

  const [foundSellAnytime, setFoundSellAnytime] = useState(false);

  useEffect(() => {
    if (assets?.length > 0) {
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
      return (
        badges.includes('irr dropping soon') &&
        asset?.irrDroppingDate &&
        irrDroppingDate.getTime() > Date.now()
      );
    };

    const irrDroppingAssets = assetList?.filter(hasIrrDroppingBadge);
    const isIrrDroppingDealsOdd = irrDroppingAssets?.length % 2 === 1;
    const showBanner = shouldShowSellAnytimeBanner() && !isMobile;
    const isBondsSection = productType === 'bonds';

    assetList?.sort((a, b) => {
      const aHasBadge = hasIrrDroppingBadge(a);
      const bHasBadge = hasIrrDroppingBadge(b);

      if (aHasBadge && bHasBadge) return 0;
      return aHasBadge ? -1 : 1;
    });

    return (
      <div
        className={`${styles.assetListContainer} ${
          isBondsSection ? styles.bondsContainer : ''
        }`}
      >
        <div className={`flex ${styles.assetGrid}`}>
          {assetList?.map((asset: any, index: number) => (
            <React.Fragment key={asset.assetID}>
              <AssetCard
                key={asset.assetID}
                asset={asset}
                className={`${styles.InnerCard} ${
                  index === 0 && showBanner ? styles.firstCard : ''
                }`}
                cardHeaderClass={styles.InnerCardHeader}
                userInfo={userData}
                sortType={sortType}
                isMobile={isMobile}
                showModal={true}
                onAppDownloadModalOpen={handleOpenAppDownloadModal}
                isMarketplace={true}
                customOnClick={handleAssetCardClick}
              />
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

  const noDataFunction = () => {
    if (isGCOrder()) {
      return null;
    }

    return (
      <NoData
        header="Deals go fast - check back soon!"
        subHeader={`Marketplace deals are listed in real-time and go fast`}
        customButtonText="Notify me"
        customButtonAction={notifyAction}
        buttonType={ButtonType.Primary}
        buttonClassName={styles.notifyMeButton}
      />
    );
  };

  const handleAssetList = (assetsList: any[]) => {
    return (
      <div
        className={`flex justify-between ${styles.CardList}  ${
          assetsList?.length === 0 ? styles.minHeight : ''
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
            {assetsList?.length === 0 ? (
              <div className={`flex justify-center width100 ${styles.NoData}`}>
                {noDataFunction()}
              </div>
            ) : null}
          </>
        )}
      </div>
    );
  };

  const renderAssetListOnRfqBasis = ({ assets }) => {
    const assetsToBeShown = assets;

    return handleAssetList(assetsToBeShown);
  };

  const getSecondarySubCategoryListOfSDI = () => {
    let assets = getAssets('sdi', SDITabArr?.[1]?.key);
    return renderAssetListOnRfqBasis({ assets });
  };

  const handleSubTabChange = (subTab: string) => {
    const isSebiRegulated = subTab.startsWith('SEBI Regulated');
    const subCategorySelected = isSebiRegulated ? 'sebi' : 'rbi';
    setSubCategory(subCategorySelected);
  };

  if (isEmpty && isMobile) {
    return noDataFunction();
  }

  return (
    <>
      <Heading
        title={title?.title}
        SDITabArr={SDITabArr}
        handleSubTabChange={handleSubTabChange}
        subCategory={subCategory}
        headerStyle={styles.HeaderStyle}
      />
      <TitleSection
        data={title}
        className={styles.SectionTitle}
        productType={productType}
        id={
          productType === 'sdi' ? SDITabArr?.[0]?.key + '_section' : undefined
        }
      />
      {handleAssetList(assets)}
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

      {openModal && (
        <AppDownloadModal
          showModal={openModal}
          onClose={() => setOpenModal(false)}
        />
      )}
    </>
  );
};

export default AssetSection;
