// NODE MODULES
import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

// Utils
import { innerPagesWithNav } from '../../../../utils/constants';
import { GRIP_INVEST_GI_STRAPI_BUCKET_URL } from '../../../../utils/string';
import { getStrapiMediaS3Url } from '../../../../utils/media';
import { GlobalContext } from '../../../../pages/_app';
import { fetchAPI } from '../../../../api/strapi';
import { isGCOrder } from '../../../../utils/gripConnect';

// Components
import Image from '../../../primitives/Image';
import CustomSkeleton from '../../../primitives/CustomSkeleton/CustomSkeleton';

// Redux
import { setAssetsSort } from '../../../../redux/slices/config';
import { useAppSelector } from '../../../../redux/slices/hooks';

// STYLES
import styles from './MobileFooter.module.css';

// TODO: Commented Chat for now from default icons later will be added
const DEFAULT_ICONS = [
  {
    label: 'Invest',
    src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}mobileFooter/IconsInvest.svg`,
    url: '/assets',
    clickedSrc: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}mobileFooter/selectedInvest.svg`,
  },
  {
    label: 'My PortFolio',
    src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}mobileFooter/Iconsportfolio.svg`,
    url: '/portfolio',
    clickedSrc: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}mobileFooter/selectedPortfolio.svg`,
  },
  {
    label: 'Resources',
    src: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}mobileFooter/Iconsresources.svg`,
    url: '/resources',
    clickedSrc: `${GRIP_INVEST_GI_STRAPI_BUCKET_URL}mobileFooter/selectedResources.svg`,
  },
];

const MobileFooter = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { experimentsData }: any = useContext(GlobalContext);
  const showReferral = experimentsData?.showReferral;

  const [mobileFooterLinks, setMobileFooterLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mobileBottomNav = useAppSelector(
    (state) => state.gcConfig.configData?.themeConfig?.mobileBottomNav
  );
  const routeWithoutMobileFooter = ['/user-kyc'];

  const isRenderedPage = !routeWithoutMobileFooter.includes(router.pathname);
  const configData = useAppSelector((state) => state.gcConfig.configData);
  const userData = useAppSelector((state) => state.user?.userData);

  useEffect(() => {
    const getFooterLinks = async () => {
      const mobileFooterOptions = await fetchAPI(
        '/inner-pages-data',
        {
          filters: {
            url: ['/nav-mobile-footer', '/footer-banner'],
          },
          populate: {
            pageData: {
              populate: '*',
            },
          },
        },
        {},
        false
      );

      let footerData = mobileFooterOptions?.data?.[0]?.attributes?.pageData;

      const shouldShowMarketplace = () => {
        if (!isGCOrder()) return true; // Non-GC users: always show
        // @ts-ignore - Type safety bypass for dynamic property access
        const marketplacePage = configData?.themeConfig?.pages?.marketplace;
        // If key does not exist, hide for GC
        if (
          typeof marketplacePage === 'undefined' ||
          typeof marketplacePage.showMarketplace === 'undefined'
        ) {
          return false;
        }
        // If key exists, show only if true
        return !!marketplacePage.showMarketplace;
      };

      const bottomNavData = Object.keys(mobileBottomNav ?? {});
      if (bottomNavData.length) {
        footerData = footerData?.filter((item: any) => {
          const label = item?.label?.toLowerCase();
          if (label === 'marketplace') {
            return shouldShowMarketplace();
          }
          // For other keys, show only if included and true
          return mobileBottomNav?.[label] === true;
        });
      }

      setMobileFooterLinks(footerData);
      setIsLoading(false);
    };
    if (isRenderedPage) {
      getFooterLinks();
    }
  }, [mobileBottomNav, isRenderedPage]);

  if (!isRenderedPage) return null;

  if (isGCOrder() && !mobileFooterLinks.length) return null;

  if (isLoading) {
    return <CustomSkeleton styles={{ width: '100%', height: 75 }} />;
  }

  const isInvestedUser = userData?.investmentData?.isInvested;
  let icons = mobileFooterLinks?.length ? mobileFooterLinks : DEFAULT_ICONS;

  // filter footer
  if (!showReferral || !isInvestedUser) {
    icons = icons?.filter((item) => item?.url !== '/referral');
  }

  if (isGCOrder() && !configData?.themeConfig) {
    icons = icons?.filter((item) => item?.url !== '/marketplace');
  }

  const redirectToPage = (url: string) => {
    router.push(url);
  };

  const getActiveTab = () => {
    return window.location.pathname;
  };

  const handleRedirection = (url: string) => {
    redirectToPage(url);
    localStorage.removeItem('isFromAssetDetail');
    dispatch(
      setAssetsSort({
        tabSection: 'Baskets',
        tab: 'active',
        sortType: 'default',
      })
    );
  };

  return (
    <>
      {innerPagesWithNav.includes(window.location.pathname) ? (
        <div className={styles.Container}>
          <div className={styles.subContainer}>
            {icons.map((item: any) => {
              let activeTab = getActiveTab();
              const isActive = item.url === activeTab;
              const isMarketplace = item.label === 'Marketplace';

              return (
                <div
                  key={item?.id}
                  className={styles.iconContainer}
                  onClick={() => handleRedirection(item.url)}
                >
                  <div className={styles.iconImage}>
                    {isMarketplace && (
                      <span
                        className={`flex items-center justify-center ${styles.newBadge}`}
                      >
                        New
                      </span>
                    )}
                    {item?.iconName ? (
                      <span
                        className={`${item?.iconName} ${styles.FooterIcon} ${
                          isActive ? styles.SelectedIcon : ''
                        }`}
                      />
                    ) : (
                      <Image
                        src={getStrapiMediaS3Url(
                          isActive ? item.clickedSrc : item.src
                        )}
                        alt={item.label}
                        width={24}
                        height={24}
                        layout="fixed"
                      />
                    )}
                  </div>
                  <span
                    className={
                      isActive ? styles.selectedIconText : styles.iconText
                    }
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default MobileFooter;
