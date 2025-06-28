import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// redux
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../redux/slices/hooks';

// global context
import { GlobalContext } from '../../../pages/_app';
import { fetchUserNotifications, logout } from '../../../redux/slices/user';
import {
  setAfterEsignDone,
  showNotification,
} from '../../../redux/slices/config';

// components
import {
  LinkModel,
  NavigationLinkModel,
  NavigationProps,
} from './NavigationModels';
import Image from '../Image';
import NotificationsList from '../../layout/Notifications';
import ProfileImage from './ProfileImage';
import NavigationLogo from './NavigationLogo';
import PreLoginButton from './PreLoginButton';
import ReferEarnBtn from './ReferEarnBtn';
import MenuToggle from './MenuToggle';
import PaymentPendingHeader from '../../common/PaymentPendingHeader';
import PoweredByGrip from '../PoweredByGrip';
import Notifications from './Notifications';
import NavItem from './NavItem';

// utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import { getNoOfNotifications, isUserLogged } from '../../../utils/user';
import {
  allowWithoutLogin,
  checkInAllowedSubRoutes,
  innerPagesWithoutNav,
  routesFornavigationToStickOnScroll,
} from '../../../utils/constants';
import { checkInAllowedDynamicSubRoutes } from '../../../utils/login';
import { pushToDataLayer, trackEvent } from '../../../utils/gtm';
import { isGCOrder } from '../../../utils/gripConnect';
import { debounce } from '../../../utils/timer';
import {
  blogCategoryForNavigation,
  blogPopulateQuery,
} from '../../../utils/blog';
import { isRenderedInWebview } from '../../../utils/appHelpers';
import { getOS } from '../../../utils/userAgent';

//API
import { fetchAPI } from '../../../api/strapi';

// Hooks
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import withLazyLoad from '../../../utils/withLazyLoad';

// css
import classes from './Navigation.module.css';

const GetAppButton = () => {
  const pathName = usePathname();
  if (isGCOrder() || isRenderedInWebview()) {
    return null;
  }

  const userAgent = navigator.userAgent;
  const url = 'https://gripinvest.app.link/Website_Nav_Bar';

  const hideAppText =
    typeof pathName === 'string' && pathName.startsWith('/marketplace');

  const handleClick = () => {
    trackEvent('get_app_clicked', {
      platform_os: userAgent,
    });
  };

  return (
    <Link
      href={url}
      onClick={handleClick}
      target="_blank"
      className={`flex justify-center items-center ${
        hideAppText ? classes.AppIconMarketplace : classes.AppIcon
      }`}
    >
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}icons/app-gif.gif`}
        alt="Get App"
        width={20}
        height={20}
        layout="fixed"
        unoptimized
      />
      {!hideAppText && <span className={classes.AppIconText}>App</span>}
    </Link>
  );
};

const FooterBanner = dynamic(() => import('../../FooterBanner/FooterBanner'), {
  ssr: false,
});

const LazyFooterBanner = withLazyLoad(FooterBanner);

const Navigation = ({ className = '' }: NavigationProps) => {
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const isGC = isGCOrder();
  const isMobileDevice = useMediaQuery('(max-width: 992px)');

  const showLogoutBtn = router.pathname === '/signup';
  const notifications = useAppSelector((state) => state.user.notifications);
  const pendingResignations = useAppSelector(
    (state) => state.user?.pendingResignations
  );
  const pendingMcaEsign = useAppSelector(
    (state) => state.user?.pendingMcaEsign
  );
  const userData = useAppSelector((state) => state.user?.userData);

  const afterEsign = useAppSelector((state) => state.config?.afterEsignDone);
  const isShowNotification = useAppSelector(
    (state) => state.config?.showNotification
  );

  const isShowHamBurger = useAppSelector(
    (state) => state.gcConfig.configData?.themeConfig?.hamburgerMenu
  );
  const showNotificationsFlag = useAppSelector(
    (state) => state.gcConfig.configData?.themeConfig?.showNotifications
  );
  const isHideProfile =
    useAppSelector(
      (state) => state.gcConfig.configData?.themeConfig?.hideProfile
    ) || false;

  const tokenexpired = useAppSelector((state) => state.sessionExpiry.show);

  const showHamburger = isGC ? isShowHamBurger : true;
  const isLoggedIn = isUserLogged() || tokenexpired;

  const activeLink = router.pathname;
  const showLoginBtn =
    !isLoggedIn &&
    activeLink !== '/login' &&
    activeLink !== '/verify-otp' &&
    activeLink !== '/signup';

  const {
    profileLinks,
    loggedinHeaderLinks = [],
    headerLinks,
    experimentsData,
    toolsCategory,
  }: any = useContext(GlobalContext);

  const showReferral = experimentsData?.showReferral;

  const NavigationRef = React.useRef<HTMLDivElement>(null);
  const [activeClass, setActiveClass] = React.useState(false);
  const [notificationsFetched, setNotificationsFetched] = useState(false);
  const [notificationToggle, setNotificationToggle] =
    React.useState<boolean>(false);
  const [notificationMenu, setNotificationMenu] =
    React.useState<boolean>(false);
  const wrapperRef = React.useRef(null);

  const showNavigationMenu =
    !isMobileDevice &&
    (allowWithoutLogin.includes(activeLink) ||
      checkInAllowedDynamicSubRoutes(activeLink));

  let categories = isLoggedIn ? loggedinHeaderLinks : headerLinks;

  const configData = useAppSelector((state) => state.gcConfig.configData);

  const shouldShowMarketplace = () => {
    if (!isGC) return true; // Non-GC users: always show
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

  categories = categories.filter((category) => {
    if (category?.link?.title === 'Marketplace') {
      return shouldShowMarketplace();
    }
    return true;
  });

  categories = [...categories, toolsCategory];

  const handleLogoutClick = () => {
    dispatch(logout({ isAutoLogout: false, redirect: '' }) as any);
  };

  const reloadUserNotifications = () => {
    if (userData?.userID) {
      dispatch(fetchUserNotifications(userData?.userID));
    }
  };

  const debouncedReloadUserNotifications = debounce(
    reloadUserNotifications,
    300
  );

  const [contextData, setContextData] = useState({
    loading: true,
    recentArticles: [],
    totalBlogCount: 0,
    countBlogCategory: {},
    blogCategories: [],
  });

  const fetchBlogData = async () => {
    try {
      // Fetch blog categories and recent articles in parallel
      const [blogCategoriesRes, recentArticlesRes] = await Promise.all([
        fetchAPI('/blog-categories', blogCategoryForNavigation),
        fetchAPI('/articles', {
          populate: blogPopulateQuery,
          sort: ['createdAt:desc'],
          pagination: {
            page: 1,
            pageSize: 2,
          },
        }),
      ]);

      // Process blog categories
      const blogCategoriesArr =
        blogCategoriesRes?.data?.map((ele: any) => ele?.attributes || {}) || [];
      const categoriesLabel = blogCategoriesArr
        .filter(
          (ele: any) => ele?.showNavigationDesktop || ele?.showNavigationMobile
        )
        .map((ele: any) => ele?.label);

      let countByBlogCategory: any = {};

      // Fetch articles for each category in parallel
      await Promise.all(
        categoriesLabel.map((category) =>
          fetchAPI('/articles', {
            filters: {
              blog_categories: {
                label: {
                  $contains: category,
                },
              },
            },
            pagination: {
              page: 1,
              pageSize: 200,
            },
          }).then((articleRes) => {
            countByBlogCategory[category] =
              articleRes?.meta?.pagination?.total || 0;
          })
        )
      );

      // Process recent articles
      const recentArticlesData =
        recentArticlesRes?.data?.map((ele: any) => ele?.attributes || {}) || [];
      const totalBlogCount = recentArticlesRes?.meta?.pagination?.total ?? 0;

      // Set context data
      setContextData({
        loading: false,
        recentArticles: recentArticlesData,
        totalBlogCount,
        countBlogCategory: countByBlogCategory,
        blogCategories: blogCategoriesArr,
      });
    } catch (error) {
      console.error('Error fetching blog data:', error);
      setContextData((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, []);

  const isNotificationMoreThanOne = () => {
    const totalLen =
      Number(notifications?.length || 0) +
      Number(pendingMcaEsign?.length || 0) +
      Number(pendingResignations?.length || 0);
    return totalLen > 1;
  };

  useEffect(() => {
    if (!isMobileDevice) {
      if (afterEsign) {
        const showNotificationValue = isNotificationMoreThanOne();
        setNotificationMenu(showNotificationValue);
        dispatch(showNotification(showNotificationValue));
      } else {
        if (isShowNotification) {
          setNotificationMenu(true);
          dispatch(showNotification(false));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!notificationsFetched && notificationMenu) {
      debouncedReloadUserNotifications();
      setNotificationsFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationMenu]);

  let scrollPosition = 0;

  //SCROLL EVENT: NAVIGATION CLASS TOGGLE
  let scrollTimeout; // Variable for throttling
  const handleScrollEvent = () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      if (!NavigationRef?.current) return;

      const currentScrollY = window.scrollY;
      if (currentScrollY > 0) {
        NavigationRef.current.classList.add(classes.Sticky);
        const mobileTabs = document.getElementById('MobileTabs');
        if (scrollPosition < currentScrollY) {
          NavigationRef.current.classList.add(classes.hideInTop);
          if (mobileTabs) mobileTabs.style.top = '0px';
        } else {
          NavigationRef.current.classList.remove(classes.hideInTop);
          if (mobileTabs) mobileTabs.style.top = '56px';
        }
      } else {
        NavigationRef.current.classList.remove(classes.Sticky);
        NavigationRef.current.classList.remove(classes.hideInTop);
      }
      scrollPosition = currentScrollY;
      scrollTimeout = null;
    }, 100);
  };

  // ENABLE SCROLL EVENT FOR NAVIGATION ON INITIALIZATION
  React.useEffect(() => {
    if (
      !routesFornavigationToStickOnScroll.some((el) =>
        router.pathname.includes(el)
      )
    ) {
      window.addEventListener('scroll', handleScrollEvent);
    }
    return () => {
      document.body.style.overflow = '';
      if (
        !routesFornavigationToStickOnScroll.some((el) =>
          router.pathname.includes(el)
        )
      ) {
        window.removeEventListener('scroll', handleScrollEvent);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        wrapperRef &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        !isMobileDevice
      ) {
        hideNotificationPanel();
      }
    };

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (innerPagesWithoutNav.includes(router.pathname)) {
    return (
      <PaymentPendingHeader
        isClickable={router.pathname === '/rfq-payment-processing'}
      />
    );
  }

  const openReferPage = () => {
    pushToDataLayer({
      event: 'referAndEarnClicked',
    });
    window.open(`/referral`, '_self');
  };

  const renderProfileImage = (profileLinkArr: LinkModel) => {
    if (isGC && isHideProfile) {
      return null;
    }

    return (
      <div className={`${classes.UserProfileWidget} flex_wrapper`}>
        <ProfileImage onclickEvent={() => router.push('/profile')} />
        <div className={`${classes.UserProfile} ${classes.NavItem}`}>
          <NavItem
            linkData={profileLinkArr}
            handleLogoutClick={handleLogoutClick}
            handleMenuToggleClick={handleMenuToggleClick}
          />
        </div>
      </div>
    );
  };

  const isUserInvestedInLLpDeals =
    Boolean(userData?.investmentData?.['Leasing']?.investments) ||
    Boolean(userData?.investmentData?.['Inventory']?.investments);

  const isRenderedInAPP = isRenderedInWebview();

  // AFTER LOGIN WIDGETS
  const PostLoginHTML = () => {
    if (profileLinks) {
      const profileLinkArr: LinkModel = JSON.parse(
        JSON.stringify(profileLinks)
      );

      const TransactionLink: NavigationLinkModel = {
        accessibilityLabel: 'my transactions',
        clickUrl: '/transactions',
        id: profileLinkArr.childrenLinks.length,
        openInNewTab: false,
        title: 'My Transactions',
      };

      profileLinkArr.childrenLinks.push(TransactionLink);

      const LogoutLink: NavigationLinkModel = {
        accessibilityLabel: 'logout',
        clickUrl: '/',
        id: profileLinkArr.childrenLinks.length,
        openInNewTab: false,
        title: 'Logout',
      };
      profileLinkArr.childrenLinks.push(LogoutLink);

      // Determine whether to show notification bell in the navigation
      // Show notifications when:
      // 1. Non-GC users who have invested in LLP deals (Leasing/Inventory)
      // 2. Non-GC users who are viewing the app in a webview
      // 3. GC users with notifications enabled AND viewing in webview
      const showNotification =
        (!isGC && isUserInvestedInLLpDeals) ||
        (!isGC && isRenderedInAPP) ||
        (isGC && showNotificationsFlag === true && isRenderedInAPP);

      return (
        <div className={`${classes.PostLoginWidgets} flex_wrapper`}>
          {showReferral ? (
            <ReferEarnBtn handleBtnClickEvent={openReferPage} />
          ) : null}

          {isGC ? <PoweredByGrip /> : null}
          {isMobileDevice && <GetAppButton />}
          {showNotification ? notification() : null}
          {renderProfileImage(profileLinkArr)}
        </div>
      );
    }
    return null;
  };

  const handleMenuToggleClick = () => {
    setActiveClass(!activeClass);
    const bodyEle = document.body;
    if (bodyEle.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
  };

  // NOTIFICATION LOGICS
  const hideNotificationPanel = () => {
    setNotificationMenu(false);
    dispatch(setAfterEsignDone(false));
  };

  const notification = () => {
    let noOfNotifications = getNoOfNotifications(
      notifications,
      pendingResignations,
      pendingMcaEsign
    );

    const viewButton = () => {
      if (noOfNotifications <= 2) {
        return (
          <div className={classes.NotificationBottom}>
            <p className={` ${classes.thats_all_text}`}>{`That's All !`}</p>
          </div>
        );
      }
      return (
        <div
          onClick={() => setNotificationToggle(!notificationToggle)}
          className={classes.NotificationBottom}
        >
          <p className={classes.NotificationBottomTitle}>
            {notificationToggle ? 'View Less' : 'View All'}
          </p>
        </div>
      );
    };

    const noNotification = () => {
      return (
        <div className={classes.NoNotificationDiv}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}commons/noNotification.svg`}
            alt="noNotification"
          />
          <p>No new notifications</p>
        </div>
      );
    };

    const showNotificcations = () => {
      if (Boolean(noOfNotifications)) {
        return <NotificationsList showAllNotifications={notificationToggle} />;
      }
      return noNotification();
    };

    const handleNotifyClick = () => {
      if (isMobileDevice) {
        router.push('/notifications');
      } else {
        setNotificationMenu(!notificationMenu);
        if (!notificationMenu) {
          setNotificationsFetched(false);
        }
      }
    };

    const { appVersion } = JSON.parse(localStorage.getItem('AppDetails')) || {};

    if (appVersion) {
      // Below logic is to check if the appVersion is greater than the 1.8.0 in app
      // If it is, then we need to show the notification
      // If it is not, then we need not to show the notification
      const isAppVersionLatest =
        appVersion && appVersion.split('.').map(Number);
      const isVersionGreaterThan18 =
        isAppVersionLatest && isAppVersionLatest?.[1] > 8;

      if (isRenderedInAPP && !isVersionGreaterThan18) return null;
    }

    // Problem :-
    // In ios :-
    // 1. Hide the bell icon for non - llp users.
    // 2. For LLP users hide the others notification tab.

    const deviceType = getOS();
    if (isRenderedInAPP && deviceType === 'iOS' && !isUserInvestedInLLpDeals)
      return null;

    // NOTIFICATION WIDGET
    return (
      <div className={classes.Notification}>
        <Notifications
          id="notificationBell"
          handleNotifyClick={handleNotifyClick}
          noOfNotifications={noOfNotifications}
        />
        {notificationMenu ? (
          <div className={classes.NotificationWrapper} ref={wrapperRef}>
            <>
              <div className={classes.NotificationHeader}>
                <h3 className={classes.NotificationTitle}>{'Notifications'}</h3>
              </div>
              {showNotificcations()}
              {Boolean(noOfNotifications) && viewButton()}
            </>
          </div>
        ) : null}
      </div>
    );
  };

  const handleLoginSignupClick = () => {
    trackEvent('login_signup_page', { page: 'primary' });
    router.push('/login?signup=true');
  };
  // BEFORE LOGIN HTML
  const PreLoginHTML = () => {
    return (
      <PreLoginButton
        handleLoginSignupClick={handleLoginSignupClick}
        handleLogoutClick={handleLogoutClick}
        showLoginBtn={showLoginBtn}
        showLogoutBtn={showLogoutBtn}
        showReferral={showReferral}
      />
    );
  };

  return (
    <div
      className={`${classes.NavigationMain} ${
        checkInAllowedSubRoutes(window.location.pathname) ? 'gciHeader' : ''
      } ${handleExtraProps(className)}`}
      id={'NavigationMain'}
      ref={NavigationRef}
    >
      <div className="containerNew">
        <div className={classes.NavigationWrapper}>
          {showHamburger ? (
            <MenuToggle
              handleOnClick={handleMenuToggleClick}
              activeClass={activeClass}
            />
          ) : null}

          {/* LOGO */}
          <NavigationLogo />

          {/* Categories are filtered based on showMarketplace config */}

          {/* KnowYourInvestor component was re-rendering in mobile  */}
          {/* Moved from the function as it was re-rendering 4 times */}
          {/* Moving here removed the re-rendering to at least 2 times */}
          {/* Updating the FooterBanner with lazy load component to only calls when navigation button is clicked */}
          {/* NAVIGATION MENU START */}
          {isLoggedIn || showNavigationMenu ? (
            <div
              className={`${classes.Navigation} ${classes.FlexContainer} ${
                activeClass ? classes.ShowNavigation : ''
              }`}
            >
              {categories.length > 0 && (
                <ul className={`flex_wrapper`}>
                  {categories.map((ele: LinkModel, index: number) => {
                    return (
                      <NavItem
                        linkData={ele}
                        key={index}
                        keyIndex={index}
                        handleLogoutClick={handleLogoutClick}
                        handleMenuToggleClick={handleMenuToggleClick}
                        contextData={contextData}
                      />
                    );
                  })}
                </ul>
              )}

              {isMobileDevice ? (
                <LazyFooterBanner className={classes.FooterBanner} />
              ) : null}
            </div>
          ) : null}
          {/* NAVIGATION MENU END */}

          {/* NAVIGATION RIGHT CONTENT */}
          <div className={`flex_wrapper ${classes.NavRightWidget}`}>
            {isLoggedIn ? <PostLoginHTML /> : <PreLoginHTML />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Navigation);
