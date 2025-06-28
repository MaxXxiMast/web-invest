// NODE MODULES
import dynamic from 'next/dynamic';

// Utils
import {
  checkInAllowedSubRoutes,
  innerPagesWithNav,
} from '../../../utils/constants';
import { isUserLogged } from '../../../utils/user';

// Hooks
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../../redux/slices/hooks';
import withLazyLoad from '../../../utils/withLazyLoad';

const AppLayoutFooter = dynamic(() => import('./AppLayoutFooter'), {
  ssr: false,
});

const LazyAppLayoutFooter = withLazyLoad(AppLayoutFooter);

const MobileFooter = dynamic(() => import('./MobileFooter'), {
  ssr: false,
});

export default function FooterWrapper() {
  const isMobile = useMediaQuery();
  const tokenexpired = useAppSelector((state) => state.sessionExpiry.show);
  const isLoggedIn = isUserLogged() || tokenexpired;

  const windowPathName = window?.location?.pathname || '';

  if (!isMobile) {
    return !checkInAllowedSubRoutes(windowPathName) ? (
      <LazyAppLayoutFooter />
    ) : null;
  }

  return !checkInAllowedSubRoutes(windowPathName) &&
    innerPagesWithNav.includes(windowPathName) ? (
    !isLoggedIn ? (
      <LazyAppLayoutFooter />
    ) : (
      <MobileFooter />
    )
  ) : null;
}
