import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

// swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';

// components
import GripSelect from '../../../common/GripSelect';
import CustomSkeleton from '../../../primitives/CustomSkeleton/CustomSkeleton';
import AssetCard from '../../asset-card/component';
import MobileDrawer from '../../../primitives/MobileDrawer/MobileDrawer';

// utils
import { getAssetCategory, getOptions } from '../utils';
import { trackEvent } from '../../../../utils/gtm';
import { getMostInvestmentCategory } from '../../utils';
import { useAppSelector } from '../../../../redux/slices/hooks';

// css
import styles from './AssetSlider.module.css';

type props = {
  showFlyer?: boolean;
  closeFlyer?: () => void;
  setAssetSuggestion?: Dispatch<SetStateAction<string>>;
};

const AssetSlider = ({
  showFlyer = false,
  closeFlyer = () => {},
  setAssetSuggestion,
}: props) => {
  const { active: activeAssets = [] } = useAppSelector((state) => state.assets);

  const {
    preTaxIrr: currentInvestmentIRR = 0,
    selectedAssetType = 'Bonds, SDIs & Baskets',
    totalAmountInvested = 0,
    interestBracket = null,
  } = useAppSelector((state) => state?.portfolioSummary);
  const [assetByYTM, setAssetByYTM] = useState({
    asset8: [],
    asset11: [],
    asset14: [],
  });
  const [selectedAsset, setSelectedAsset] = useState('');
  const [loading, setLoading] = useState(true);

  // GET UserID
  const { userID = '' } = useAppSelector((state) => state?.user?.userData);

  useEffect(() => {
    if (
      activeAssets.length &&
      assetByYTM.asset8.length === 0 &&
      assetByYTM.asset11.length === 0 &&
      assetByYTM.asset14.length === 0
    ) {
      let assetByYTM = {
        asset8: [],
        asset11: [],
        asset14: [],
      };
      let asset8Count = 0,
        asset11Count = 0,
        asset14Count = 0;
      activeAssets.forEach((asset: any) => {
        if (!['SDI Secondary', 'Bonds'].includes(asset?.financeProductType)) {
          return;
        }
        let returns = asset?.bonds?.preTaxYtm || asset?.irr;
        if (returns >= 8 && returns < 11 && asset8Count < 3) {
          asset8Count++;

          assetByYTM?.asset8.push(asset);
        }
        if (returns >= 11 && returns < 14 && asset11Count < 3) {
          asset11Count++;

          assetByYTM?.asset11.push(asset);
        }
        if (returns >= 14 && asset14Count < 3) {
          asset14Count++;

          assetByYTM?.asset14.push(asset);
        }
      });
      setAssetByYTM(assetByYTM);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAssets]);

  const navClick = (el: any) => {
    trackEvent('portfolio_summary_navigation_arrows', {
      asset_type: selectedAssetType,
      widget_used: 'Deal recommendation',
      amount_invested: totalAmountInvested,
    });
  };

  const renderNavigation = () => {
    return (
      <div className={`flex_wrapper ${styles.navigation}`} onClick={navClick}>
        <div id="prevRef" className={`flex ${styles.navigationButton}`}>
          <span
            className={`icon-caret-left-circle ${styles.Arrows} ${styles.left}`}
          />
        </div>
        <div>
          <div
            id="AssetSliderPagination"
            className={`flex items-center ${styles.pagination}`}
          ></div>
        </div>

        <div id="nextRef" className={`flex ${styles.navigationButton}`}>
          <span
            className={`icon-caret-left-circle ${styles.Arrows} ${styles.right}`}
            style={{
              transform: `rotate(180deg)`,
              display: 'inline-block',
            }}
          />
        </div>
      </div>
    );
  };

  const handleAssetTypeChange = (e: any) => {
    trackEvent('asset_recommendation', {
      dropdown_interest: getAssetCategory(e.target.value),
      user_XIRR: currentInvestmentIRR,
      asset_type: selectedAssetType,
      amount_SDI: totalAmountInvested,
      most_investment: getMostInvestmentCategory(currentInvestmentIRR),
    });
    trackEvent('portfolio_summary_performance_banner', {
      timestamp: new Date().toISOString(),
      'user id': userID,
      asset_type: selectedAssetType,
      user_XIRR: currentInvestmentIRR,
    });
    setSelectedAsset(e.target.value);
  };

  useEffect(() => {
    if (
      ['14andAbove', '11to14'].includes(interestBracket) &&
      assetByYTM.asset14.length
    ) {
      setSelectedAsset('asset14');
    } else if (interestBracket === '8to11' && assetByYTM.asset11.length) {
      setSelectedAsset('asset11');
    } else if (assetByYTM.asset14.length) {
      setSelectedAsset('asset14');
    } else if (assetByYTM.asset11.length) {
      setSelectedAsset('asset11');
    } else {
      setSelectedAsset('asset8');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    if (setAssetSuggestion && !loading) {
      if (selectedAsset === 'asset14') {
        setAssetSuggestion('14%+');
      } else if (selectedAsset === 'asset11') {
        setAssetSuggestion('11-14%');
      } else {
        setAssetSuggestion('8-11%');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsset, loading]);

  if (loading || selectedAsset === '') {
    return (
      <CustomSkeleton
        styles={{
          height: 350,
          width: '100%',
          borderRadius: 20,
        }}
      />
    );
  }

  if (!loading && !activeAssets.length) return null;

  const selectAssetCategory = () => {
    return (
      <div style={{ marginBottom: 20 }}>
        <GripSelect
          value={selectedAsset}
          onChange={handleAssetTypeChange}
          options={getOptions(assetByYTM, selectedAsset)}
          placeholder="Select Asset"
          withLabelName="Select desired return range to find investments"
          name="assetByYTM"
          showScrollbar={true}
          showPlaceholder={false}
          classes={{
            selectMenuIcon: styles.selectMenuIcon,
            formControlRoot: styles.formControlRoot,
            select: styles.select,
          }}
        />
      </div>
    );
  };

  const renderDesktopView = () => {
    return (
      <>
        {selectAssetCategory()}
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          centeredSlides={true}
          navigation={{
            prevEl: '#prevRef',
            nextEl: '#nextRef',
          }}
          pagination={{
            clickable: true,
            el: '#AssetSliderPagination',
            bulletActiveClass: styles.swiperBulletActive,
            bulletClass: styles.swiperBullet,
          }}
          modules={[Navigation, Pagination]}
        >
          {assetByYTM[selectedAsset].length
            ? assetByYTM[selectedAsset].map((asset: any) => (
                <SwiperSlide key={'asset-slide-' + asset}>
                  <AssetCard
                    asset={asset}
                    category={getAssetCategory(selectedAsset)}
                  />
                </SwiperSlide>
              ))
            : null}
          {renderNavigation()}
        </Swiper>
      </>
    );
  };

  const renderMobileView = () => {
    return (
      <MobileDrawer showFlyer={showFlyer} handleDrawerClose={closeFlyer}>
        {selectAssetCategory()}
        {assetByYTM[selectedAsset].length
          ? assetByYTM[selectedAsset].map((asset: any) => (
              <AssetCard asset={asset} key={'asset-card-' + asset} />
            ))
          : null}
      </MobileDrawer>
    );
  };

  return (
    <>
      <div className={styles.desktopContainer}>{renderDesktopView()}</div>
      <div className={styles.mobileContainer}>{renderMobileView()}</div>
    </>
  );
};

export default AssetSlider;
