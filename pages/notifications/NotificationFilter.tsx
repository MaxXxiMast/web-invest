// Utils
import { isGCOrder } from '../../utils/gripConnect';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../utils/appHelpers';
import { getOS } from '../../utils/userAgent';
import { useAppSelector } from '../../redux/slices/hooks';

// Styles
import styles from './NotificationFilter.module.css';

const NotificationFilter = () => {
  const isRenderedApp = isRenderedInWebview();
  const investmentData =
    useAppSelector((state) => state.user?.userData?.investmentData) || {};

  const isLLPUser =
    Boolean(investmentData?.['Leasing']?.investments) ||
    Boolean(investmentData?.['Inventory']?.investments);

  const isGC = isGCOrder();
  const handleAlertsClick = () => {
    if (isRenderedApp && !isGC) {
      postMessageToNativeOrFallback('app_notification_screen_open', {});
    }
  };

  const deviceType = getOS();
  const hideOthersTab = isRenderedApp && deviceType === 'iOS' && isLLPUser;

  return (
    <div className={styles.container}>
      <button className={`${styles.tab} ${styles.activeTab}`}>
        <span className={`${styles.tabText} ${styles.activeText}`}>
          Priority
        </span>
      </button>

      {!hideOthersTab ? (
        <button
          onClick={handleAlertsClick}
          className={`${styles.tab} ${styles.inactiveTab}`}
        >
          <span className={`${styles.tabText} ${styles.inactiveText}`}>
            Others
          </span>
        </button>
      ) : null}
    </div>
  );
};

export default NotificationFilter;
