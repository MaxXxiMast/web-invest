import { useEffect, useState } from 'react';
import { AppState } from '../../../../redux/slices';
import { useAppSelector } from '../../../../redux/slices/hooks';
import { isRenderedInWebview, postMessageToNativeOrFallback } from '../../../../utils/appHelpers';
import { isGCOrder } from '../../../../utils/gripConnect';
import classes from './Notifications.module.css';

type Props = {
  handleNotifyClick?: () => void;
  id?: string;
  noOfNotifications?: any;
};
export default function Notifications({
  handleNotifyClick,
  id = '',
  noOfNotifications,
}: Props) {

  const [appNotificationDetails, setAppNotificationDetails] = useState({
    appUnreadNotificationsCount: null,
  });

  useEffect(() => {
    const { appUnreadNotificationsCount } =
      JSON.parse(localStorage.getItem('appUnreadNotificationsCount')) || {};
    setAppNotificationDetails({
      appUnreadNotificationsCount
    });
  }, []);


  const isGC = isGCOrder();
  const { userData } = useAppSelector((state) => state.user);
  const isLLPUser = Boolean(userData?.investmentData?.['Leasing']?.investments) ||
    Boolean(userData?.investmentData?.['Inventory']?.investments);

  return (
    <div className={classes.Notifications} id={id}>
      <div onClick={() => {
        if (isRenderedInWebview() && !isGC && !isLLPUser) {
          postMessageToNativeOrFallback('app_notification_screen_open', {});
        }
        else {
          handleNotifyClick();
        }
      }
      }>
        <span className={`icon-bell ${classes.Icon}`}></span>
      </div>
      {(Boolean(appNotificationDetails?.appUnreadNotificationsCount) || Boolean(noOfNotifications)) && (
        <span className={classes.NotifyAlert}></span>
      )}
    </div>
  );
}
