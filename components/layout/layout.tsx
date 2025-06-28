// NODE MODULES
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';

// Components
import PaymentPendingHeader from '../common/PaymentPendingHeader';
import ScrollToTop from '../primitives/ScrollToTop/ScrollToTop';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import NavigationWrapper from './NavigationWrapper';
// import ServerDown from '../ServerDown';

// Utils
import { isUserLogged } from '../../utils/user';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
import { pagesToShowTwoFA, persistRouteArr } from '../../utils/constants';
import { checkInAllowedDynamicSubRoutes } from '../../utils/login';
import { isPanVerifiedTimeCheck } from '../TwoFactorAuthSingupModal/utils';
import { isGCOrder } from '../../utils/gripConnect';

// Hooks
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

// Redux Slice and Types
import { resetProductType } from '../../redux/slices/access';
import {
  fetchKycConfigStatus,
  setInvestmentData,
  setIsTimeLessThanThirtyMins,
  setShowTwoFAModal,
} from '../../redux/slices/user';
import { getUserPortfolioCategoryCount } from '../../api/user';
import { fetchFeatureFlags } from '../../redux/slices/featureFlags';

// Dynamic Imports
const TwoFactorAuthSingupModal = dynamic(
  () => import('../TwoFactorAuthSingupModal'),
  {
    ssr: false,
  }
);

const LoggingOut = dynamic(() => import('../2fa/LoggingOut'), {
  ssr: false,
});

const FooterWrapper = dynamic(() => import('./FooterWrapper'), {
  ssr: false,
});

// Layout Component Definition
const Layout = ({ children }) => {
  const isMobile = useMediaQuery();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isGC = isGCOrder();

  const showTwoFAModal = useAppSelector((state) => state.user.showTwoFAModal);
  const showLogginOutModal = useAppSelector(
    (state) => state.user.showLogginOutModal
  );
  const isTimeLessThanThirtyMins = useAppSelector(
    (state) => state.user.isTimeLessThanThirtyMins
  );
  let is2faRequired = useAppSelector((state) => state.access.is2faRequired);
  // const isServerDown = useAppSelector((state) => state.access.isServerDown);

  if (isGC) {
    // when user coming from GC this field always true
    is2faRequired = true;
  }
  const tokenexpired = useAppSelector((state) => state.sessionExpiry.show);

  const isLoggedIn = isUserLogged() || tokenexpired;

  useEffect(() => {
    if (isLoggedIn) {
      Promise.all([
        dispatch(fetchFeatureFlags()),
        getUserPortfolioCategoryCount(),
      ])
        .then(([_, res]) => {
          const totalInvestments: any = Object.values(res).reduce(
            (total, item: any) => {
              return typeof item === 'object' && item.investments
                ? total + item.investments
                : total;
            },
            0
          );
          const isInvested = totalInvestments > 0;
          dispatch(
            setInvestmentData({
              ...res,
              isInvested,
              totalInvestments,
            })
          );
        })
        .catch((err) => {
          console.log(
            'Error in fetching feature flags or user portfolio category count',
            err
          );
        });
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    // Reset selected asset from access redux slice
    if (!persistRouteArr.some((el) => router.pathname.includes(el))) {
      dispatch(resetProductType());
    }

    // Portfolio redirection fix for assets page
    if (router.pathname !== '/assets') {
      localStorage.removeItem('redirectedFrom');
    }

    // GET partner_id from the url query params and store it in the cookies with the keyName gcPartnerCode
    const partnerId = router?.query?.partner_id;
    if (partnerId) {
      Cookies.set('gcPartnerCode', partnerId.toString());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  useEffect(() => {
    const handle2FAModal = (data: any) => {
      if (!(isTimeLessThanThirtyMins && isLoggedIn && is2faRequired && data))
        return;

      const pageName = '/' + router.pathname?.split('/')?.[1];
      // Given timestamp in ISO format
      const givenTimestamp = data?.kycTypes?.[0]?.fields?.flag;
      const isPanVerified = data?.kycTypes?.[0]?.fields?.status === 1;
      const isShow2FAModal =
        (pagesToShowTwoFA.includes(pageName) ||
          checkInAllowedDynamicSubRoutes(pageName)) &&
        isPanVerified &&
        isPanVerifiedTimeCheck(givenTimestamp);
      dispatch(setShowTwoFAModal(isShow2FAModal));
    };

    if (router.isReady) {
      dispatch(setIsTimeLessThanThirtyMins(!Cookies.get('storedTime2FA')));

      if (isLoggedIn && router.pathname && router.pathname !== '/profile') {
        //remove duplicate API call for profile
        dispatch(
          fetchKycConfigStatus(undefined, (config) => {
            handle2FAModal(config);
          }) as any
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.pathname, isLoggedIn]);

  /** GC Related Code End */

  const renderLayoutElements = () => {
    // if (isServerDown) {
    //   return <ServerDown />;
    // }
    if (router.pathname === '/health') {
      return <>{children}</>;
    }
    return (
      <>
        <ErrorBoundary showComponentLevelError>
          <NavigationWrapper />
        </ErrorBoundary>
        {isMobile &&
          (window?.location?.pathname || router.pathname) ===
            '/payment-processing' && (
            <PaymentPendingHeader isClickable={false} />
          )}

        {isMobile &&
          window?.location?.pathname?.startsWith('/assetdetails') && (
            <ScrollToTop />
          )}

        <ErrorBoundary> {children}</ErrorBoundary>
        <ErrorBoundary showComponentLevelError>
          <FooterWrapper />
        </ErrorBoundary>
        {!isMobile ? <ScrollToTop /> : null}
      </>
    );
  };

  return (
    <>
      {showTwoFAModal && isTimeLessThanThirtyMins ? (
        <TwoFactorAuthSingupModal />
      ) : null}
      {showLogginOutModal ? <LoggingOut /> : null}
      {renderLayoutElements()}
    </>
  );
};

export default Layout;
