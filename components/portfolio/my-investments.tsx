// NODE MODULES
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// CUSTOM COMPONENTS
import { LeasingInvestments } from '../portfolio-investment';
import NoData from '../common/noData';
import PortfolioFilter from '../portfolio-investment/PortfolioFilter';

// UTILS
import {
  financeProductTypeConstants,
  financeProductTypeMapping,
  hideAssetsInPortfolio,
} from '../../utils/financeProductTypes';
import { trackEvent } from '../../utils/gtm';
import { SidebarLinks } from './utils';

//Skeletons
import CustomSkeleton from '../primitives/CustomSkeleton/CustomSkeleton';
import AssetCardSkeleton from '../../skeletons/asset-card-skeleton/AssetCardSkeleton';

//Redux
import { getPortfolio } from '../../redux/slices/user';

//Hooks
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';

// STYLESHEETS
import styles from './MyInvestments.module.css';

const NotificationBannerMobile = dynamic(
  () => import('../primitives/NotificationBannerMobile'),
  {
    ssr: false,
  }
);

function scrollTo(element: HTMLElement) {
  if (element) {
    const header = document.getElementById('NavigationMain');
    const headerHeight = header ? header.offsetHeight : 92;
    window.scroll({
      behavior: 'smooth',
      left: 0,
      top: window.scrollY + element.getBoundingClientRect().top - headerHeight,
    });
  }
}

const MyInvestments = () => {
  const user = useAppSelector((state) => state.user);

  const isMobile = useMediaQuery();
  const dispatch = useAppDispatch();

  const [activeFilter, setActiveFilter] = useState('Bonds');
  const [loading, setLoading] = useState(true);
  const [productTypes, setProductType] = useState([]);

  const productTypeCount = user?.portfolio?.investmentCount || {};

  const getInvestmentCount = (type?: string) => productTypeCount?.[type] || 0;

  const getAssetProductTypes = () => {
    const newProductTypes = [];
    for (const link of SidebarLinks) {
      const linkCount = getInvestmentCount(link.id);
      const hideAsset = hideAssetsInPortfolio(
        financeProductTypeMapping[link.id]
      );
      const isFD = financeProductTypeConstants.highyieldfd === link.id;
      if (hideAsset || isFD) {
        if (!!Number(linkCount)) {
          newProductTypes.push({ ...link, count: linkCount });
        }
      } else {
        newProductTypes.push({ ...link, count: linkCount });
      }
    }
    const sortedProductTypes = newProductTypes.sort(
      (a, b) => a.order - b.order
    );
    setProductType(sortedProductTypes);
  };

  useEffect(() => {
    const getPortfolioList = async () => {
      await dispatch(getPortfolio() as any);
      setLoading(false);
    };
    if (user?.userData?.userID) {
      getPortfolioList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userData?.userID]);

  useEffect(() => {
    if (!loading) {
      getAssetProductTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleOnClick = (itemid: string) => {
    const scrollEle = document.getElementById(`${itemid}_scroll`);
    scrollTo(scrollEle);
    trackEvent('Portfolio Tab Switch', {
      tab: itemid,
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollSectionArr = document.querySelectorAll('.scrollSectionDiv');
      const leftSidebarListArr = document.querySelectorAll('.sidebarlistItem');
      scrollSectionArr.forEach((item) => {
        const elementId = item.getAttribute('id');

        const header = document.getElementById('NavigationMain');
        const headerHeight = header ? header.offsetHeight + 20 : 92;
        if (item) {
          if (item.getBoundingClientRect().top <= headerHeight) {
            if (leftSidebarListArr.length > 0) {
              leftSidebarListArr.forEach((ele) => {
                const eleId = ele.getAttribute('id');
                if (`${eleId}_scroll` === elementId) {
                  ele.classList.add('Active');
                } else {
                  ele.classList.remove('Active');
                }
              });
            }
          }
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleFilter = (itemId: any) => {
    setActiveFilter(itemId);
  };

  const { portfolio = {} } = user;
  let portfolioList = portfolio?.list?.length ? [...portfolio.list] : [];

  portfolioList = portfolioList.sort((portfolio1: any, portfolio2: any) => {
    return (
      Math.max(...portfolio2?.txns.map((e: any) => new Date(e.orderDate))) -
      Math.max(...portfolio1?.txns.map((e: any) => new Date(e.orderDate)))
    );
  });

  const noData = () => (
    <NoData subHeader="You have no investments in this product" header="" />
  );

  const renderNoData = () => {
    if (!isMobile) {
      return null;
    }

    if (activeFilter === 'all' && portfolioList.length === 0) {
      return noData();
    }
    if (
      portfolioList?.filter((data: any) => {
        return data.assetDetails.financeProductType === activeFilter;
      }).length === 0 &&
      activeFilter !== 'all'
    ) {
      return noData();
    }
    return null;
  };

  const renderSkeleton = () => (
    <div className={`flex width100`}>
      {isMobile ? (
        <div className={`flex-column width100 gap-12`}>
          {[...Array(2)].map((e, index) => (
            <AssetCardSkeleton
              width={`100%`}
              key={`portfolio_item_${index}-${Date.now()}`}
            />
          ))}
        </div>
      ) : (
        <div className={`flex-column width100`}>
          <div className="flex justify-between item-center">
            <CustomSkeleton
              styles={{
                width: 120,
                height: 48,
              }}
            />
            <CustomSkeleton
              styles={{
                width: 100,
                height: 32,
              }}
            />
          </div>
          <div className="flex-column justify-between width100 gap-12 mt-12">
            {[...Array(4)].map((el, index) => (
              <div
                key={`Skeleton_${index}-${Date.now()}`}
                className={`flex flex-column gap-12 SkeletonCard`}
              >
                <CustomSkeleton
                  styles={{
                    width: '100%',
                    height: 60,
                  }}
                />
                <CustomSkeleton
                  styles={{
                    width: '100%',
                    height: 24,
                  }}
                />
                <CustomSkeleton
                  styles={{
                    width: '100%',
                    height: 32,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile && (
        <PortfolioFilter
          isMobile={true}
          activeFilter={activeFilter}
          handleFilter={handleFilter}
          productTypes={productTypes}
          mobileTopPosition={43.5}
        />
      )}
      <NotificationBannerMobile
        pageName="portfolio"
        subPage="myInvestments"
        isAnyPendingOrder={portfolioList?.some((ele) => ele?.status === 0)}
      />
      <div className={styles.MyInvestmentsMain} id="MyInvestmentsMain">
        {!isMobile && (
          <PortfolioFilter
            isMobile={false}
            activeFilter={activeFilter}
            handleFilter={handleOnClick}
            productTypes={productTypes}
          />
        )}
        <div className={styles.MyInvestmentsRight}>
          {loading ? (
            renderSkeleton()
          ) : (
            <>
              {productTypes
                .filter((data: any) => {
                  if (window.innerWidth < 768 && activeFilter !== 'all') {
                    return data.id === activeFilter;
                  }
                  return true;
                })
                .map((data: any, index: number) => {
                  return (
                    <LeasingInvestments
                      heading={data.name}
                      dataId={data?.id}
                      className={`${
                        index !== 0 ? styles.EquityInvestments : ''
                      } scrollSectionDiv`}
                      id={`${data.id}_scroll`}
                      key={data?.id}
                      portfolio={portfolioList.filter(
                        (ele) =>
                          ele?.assetDetails?.financeProductType === data.id
                      )}
                    />
                  );
                })}
              {renderNoData()}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MyInvestments;
