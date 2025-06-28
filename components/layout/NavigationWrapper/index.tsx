import { innerPagesWithNav } from '../../../utils/constants';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import Navigation from '../../primitives/Navigation/Navigation';

export default function NavigationWrapper() {
  const isMobile = useMediaQuery();
  // Safe access to window object for SSR compatibility
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '';

  if (isMobile && !innerPagesWithNav.includes(pathname)) {
    return null;
  }

  return <Navigation />;
}
