// NODE MODULES
import { useEffect, useState } from 'react';

// Components
import SectionComponent from '../SectionComponent/SectionComponent';
import AssetCardComponent from '../../primitives/AssetCardComponent/AssetCardComponent';
import VideoComponent from '../../primitives/VideoComponent/VideoComponent';
import ViewAllDeals from '../ViewAllDeals/ViewAllDeals';

// Apis
import {
  fetchDiscoveryAsset,
  fetchDiscoveryAssetsMoe,
} from '../../../api/assets';

// Utils
import { fetchAPI } from '../../../api/strapi';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../../redux/slices/hooks';
import {
  InvestedProductSectionArr,
  NonInvestedProductSectionArr,
  ProductSectionArr,
} from '../../../utils/discovery';

// Styles
import classes from './ProductAssets.module.css';

export default function ProductAssets() {
  const isMobileDevice = useMediaQuery();
  const userData = useAppSelector((state) => state.user.userData);
  const isInvestedUser = userData?.investmentData?.isInvested;

  const [sectionArr, setsectionArr] = useState([]);
  const [sectionApiData, setSectionApiData] = useState({});

  const handleDataFetch = async (idArr: any[] = []) => {
    if (idArr.length === 0) return;
    let data: any[] = [];
    if (idArr.includes('popularWithNewInvestors')) {
      try {
        const response: any = await fetchDiscoveryAssetsMoe(userData?.userID, [
          'popularwithinvestor',
        ]);
        data =
          JSON.parse(
            response?.data?.experiences?.popularwithinvestor?.payload?.data
              ?.value
          )?.data || [];
        idArr = idArr.filter((ele) => ele !== 'popularWithNewInvestors');
      } catch (error) {
        console.error('Error fetching popularWithNewInvestors data:', error);
      }
    }
    if (idArr.length === 0) {
      setSectionApiData({
        popularWithNewInvestors: data,
      });
      return;
    } else {
      const sectionsKeyes: string = idArr
        .map((ele: string) => ele.trim())
        .join(',');
      const response = await fetchDiscoveryAsset(
        userData?.userID,
        sectionsKeyes
      );
      setSectionApiData(
        data.length
          ? { ...response?.msg, popularWithNewInvestors: data }
          : response?.msg
      );
    }
  };

  const fetchContentSections = async () => {
    const pageData = await fetchAPI('/discovery', {
      populate: {
        sections: {
          populate: {
            contentSections: {
              populate: '*',
            },
          },
        },
      },
    });

    const finalPageData = pageData?.data?.attributes;
    const contentSections = finalPageData?.sections?.contentSections ?? [];
    let arr: any[] = [];
    if (contentSections.length > 0) {
      arr = contentSections.filter((ele) => {
        // removing explainer videos from array since we have nade seperate component for it
        if (ele?.sectionId == 'explainerVideos') {
          return false;
        }
        // FILTER FOR MOBILE AND DESKTOP VIEW
        const mobileDesktopVisibility = isMobileDevice
          ? ele?.isShowInMobile
          : ele?.isShowInDesktop;

        // FILTER BY VISIBILITY
        const eleVisibility = isInvestedUser
          ? ele.investedVisibility
          : ele.nonInvestedVisibility;
        return eleVisibility === true && mobileDesktopVisibility === true;
      });

      if (arr.length > 0) {
        // SORT BY GIVEN ORDER NUMBER
        arr.sort((a: any, b: any) => {
          let sortingOption = isInvestedUser
            ? 'investedDesktopOrder'
            : 'nonInvestedDesktopOrder';
          if (isMobileDevice) {
            sortingOption = isInvestedUser
              ? 'investedMobileOrder'
              : 'nonInvestedMobileOrder';
          }
          return Number(a?.[sortingOption]) - Number(b?.[sortingOption]);
        });

        // PUSH SECTIONS IDS FOR API USE
        let sectionIdArr: string[] = [];
        sectionIdArr = arr
          .map((ele) => ele?.sectionId?.trim())
          .filter((eleInner) =>
            isInvestedUser
              ? InvestedProductSectionArr.includes(eleInner)
              : NonInvestedProductSectionArr.includes(eleInner)
          );

        if (userData?.userID && sectionIdArr.length > 0) {
          handleDataFetch(sectionIdArr);
        }

        setsectionArr([...arr]);
      }
    }
  };

  useEffect(() => {
    fetchContentSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderSlideComponent = (ele: any, sectionId?: string) => {
    // ASSET SECTION CHECK

    if (ProductSectionArr.includes(sectionId)) {
      localStorage.setItem('isFromDiscover', 'true');
      return (
        <AssetCardComponent
          asset={ele}
          isPastDeal={sectionId === 'missedTopDeals'}
        />
      );
    }

    if (sectionId === 'explainerVideos') {
      const thumbnail = isMobileDevice
        ? ele?.mobileThumbnail?.data?.attributes?.url
        : ele?.desktopThumbnail?.data?.attributes?.url;

      return (
        <VideoComponent
          className={classes.ExplainerVideoComponent}
          link={ele?.videoUrl}
          videoDuration={ele?.videoDuration}
          videoTitle={ele?.videoTitle}
          autoPlayOnOpen={true}
          thumbnail={thumbnail}
          playIconWidth={38}
          playIconHeight={38}
          actionOverlayClassName={classes.ExplainerVideosActionOverlay}
        />
      );
    }

    if (sectionId === 'viewAllDeals') {
      return <ViewAllDeals />;
    }

    return null;
  };

  if (!sectionArr?.length) {
    return null;
  }

  return (
    <>
      {sectionArr.map((ele: any, index: number) => {
        let sliderDataArr = [];
        let slideCount = 2.4;
        let spaceBetween = 18;
        const sectionId: string = ele?.sectionId?.trim();
        if (ProductSectionArr.includes(sectionId)) {
          sliderDataArr = sectionApiData?.[sectionId] || [];
          slideCount = isMobileDevice ? 1.2 : 2.4;
          spaceBetween = isMobileDevice ? 14 : 18;
        }

        const isSliderSection =
          sliderDataArr.length > 0 || ProductSectionArr.includes(sectionId);

        if (isInvestedUser && !InvestedProductSectionArr.includes(sectionId)) {
          return;
        }

        if (
          !isInvestedUser &&
          !NonInvestedProductSectionArr.includes(sectionId)
        ) {
          return;
        }

        return (
          <SectionComponent
            data={ele}
            sectionKey={`SectionComponent__${index}`}
            handleSlideComponent={(slideData) =>
              renderSlideComponent(slideData, sectionId)
            }
            key={`SectionComponent__${ele?.id}`}
            sliderDataArr={sliderDataArr}
            isSliderSection={isSliderSection}
            sliderOptions={{
              slidesPerView: slideCount,
              spaceBetween: spaceBetween,
            }}
            stylingClass={classes.sliderPopular}
            isShowBlurEnd={!isMobileDevice}
          />
        );
      })}
    </>
  );
}
