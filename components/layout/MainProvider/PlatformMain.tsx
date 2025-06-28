// NODE MODULES
import { type PropsWithChildren, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Cookie from 'js-cookie';

// Components
import GripLoading from '../Loading';

// Hooks
import { useAppSelector } from '../../../redux/slices/hooks';

// APIs/Redux APIs
import { fetchUserInfo, getUserKycDocuments } from '../../../redux/slices/user';
import { getRFQMarketTiming } from '../../../redux/slices/config';

// Utils
import { checkInAllowedDynamicSubRoutes } from '../../../utils/login';
import { checkInAllowedSubRoutesPlatform, allowWithoutLogin } from './utils';
import { isGCOrder } from '../../../utils/gripConnect';
import { newRelicErrLogs, trackUser } from '../../../utils/gtm';
import { identifyClarityUser } from '../../../utils/clarity';
import { isUserLogged } from '../../../utils/user';

export default function PlatformMain({ children }: PropsWithChildren<{}>) {
  const dispatch = useDispatch();
  const sessionExpiry = useAppSelector((state) => state.sessionExpiry.show);
  const access = useAppSelector((state) => state.access);
  const userID = useAppSelector((state) => state.user?.userData?.userID) || '';
  const mcaLoading = useAppSelector((state) => state.orders.mcaEsignLoading);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '';
    const gcloginIdVal = sessionStorage.getItem('gcloginIdVal');
    if (
      !checkInAllowedDynamicSubRoutes(pathname) &&
      !allowWithoutLogin.includes(pathname) &&
      !checkInAllowedSubRoutesPlatform(pathname) &&
      !isGCOrder() &&
      !gcloginIdVal //THIS CHECK ADDED TO RESTRICT REDIRECTION TO LOGIN PAGE IN CASE OF GC
    ) {
      newRelicErrLogs('Login_error_Route_check_Redirection', 'info', {
        access: JSON.stringify(access),
      });
      if (
        !access ||
        !(access.userID && access.accessToken) ||
        !(access.emailID && access.mobileNo)
      ) {
        newRelicErrLogs('Login_error_Route_check_no_access_data', 'info', {
          access: JSON.stringify(access),
        });
        const location = window.location;
        Cookie.set(
          'redirectTo',
          `${location.pathname}${location.hash ? location.hash : ''}` +
            location.search
        );

        setTimeout(() => {
          if (!sessionExpiry) {
            newRelicErrLogs('Login_error_Redirect_From_Main_Layout', 'info', {
              data: access,
              userID: access?.userID,
              sessionExpiry: sessionExpiry,
            });
            window.location.href = access.accessToken ? '/signup' : '/login';
          }
        }, 1000);
        return;
      }
    }

    if (access?.userID) {
      dispatch(
        fetchUserInfo(access?.userID, (data) => {
          identifyClarityUser(data.userID);
          trackUser(data.userID);
        }) as any
      );
    }

    if (!allowWithoutLogin.includes(pathname) && isUserLogged()) {
      dispatch(getUserKycDocuments(userID, null, false) as any);
    }

    // Fetch market timing
    if (isUserLogged()) {
      dispatch(getRFQMarketTiming() as any);
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || mcaLoading) {
    return <GripLoading />;
  }

  return <>{children}</>;
}
