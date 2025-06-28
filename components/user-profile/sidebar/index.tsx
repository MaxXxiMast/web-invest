// redux
import { useAppSelector } from '../../../redux/slices/hooks';

// components
import Button from '../../primitives/Button';
import Image from '../../primitives/Image';

// utils
import { SectionType, sidebarArr } from '../utils/sidebar';
import { postMessageToNativeOrFallback } from '../../../utils/appHelpers';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { isGCOrder } from '../../../utils/gripConnect';
import { trackEvent } from '../../../utils/gtm';
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';

// styles
import classes from './ProfileSidebar.module.css';
import { useEffect, useState } from 'react';

type Props = {
  handleChange?: (val: SectionType, val1: string) => void;
  active: SectionType;
  className?: string;
};

const ProfileSidebar = ({ handleChange, active, className = '' }: Props) => {
  const isMobile = useMediaQuery('(max-width: 992px)');

  const { userData } = useAppSelector((state) => state.user);
  const [appDetails, setAppDetails] = useState({
    appVersion: null,
    otaVersion: null,
    isUpdateRequired: false,
  });

  const gcProfileConfig = useAppSelector(
    (state) => state.gcConfig?.configData?.themeConfig?.pages?.profile
  );

  const gcProfileData = Object.keys(gcProfileConfig ?? {}) || [];

  let sidebarItemArr = !isMobile
    ? sidebarArr?.filter((ele) => !ele?.showInMobile)
    : sidebarArr;

  if (isGCOrder() && gcProfileData?.length) {
    const activeSections = gcProfileData?.filter((ele) => gcProfileConfig[ele]);
    sidebarItemArr = sidebarItemArr.filter((ele) =>
      activeSections.includes(ele.gcId)
    );
  }

  const updateApp = () => {
    trackEvent('app_update_clicked');
    postMessageToNativeOrFallback('click_update_app', {});
  };

  useEffect(() => {
    const { appVersion, otaVersion, isUpdateRequired } =
      JSON.parse(localStorage.getItem('AppDetails')) || {};
    setAppDetails({ appVersion, otaVersion, isUpdateRequired });
  }, []);

  return (
    <div
      className={`flex-column ${classes.Sidebar} ${handleExtraProps(
        className
      )}`}
    >
      {sidebarItemArr.map((ele) => {
        const isTransaction = ele?.id === 'mytransactions';
        let route = '';

        // If it's a transaction but there are no investments in Leasing or Inventory, return null
        if (
          isTransaction &&
          !userData?.investmentData?.['Leasing']?.investments &&
          !userData?.investmentData?.['Inventory']?.investments
        ) {
          return null;
        }

        if (isTransaction) {
          route = '/transactions';
        }

        return (
          <div
            className={`flex items-center ${classes.Item} ${
              active === ele.id ? classes.Active : null
            }`}
            key={ele.id}
            onClick={() => handleChange(ele.id, route)}
          >
            {isMobile && ele?.icon && (
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}${ele.icon}`}
                alt={ele.name}
                layout="fixed"
                width={20}
                height={20}
              />
            )}
            {ele.name}
            {isMobile && (
              <span className={`icon-caret-right ${classes.Arrow}`} />
            )}
          </div>
        );
      })}
      {appDetails.appVersion && (
        <div className={classes.appInfo}>
          <p className={classes.appVersion}>
            Current App Version {appDetails.appVersion}
            {appDetails.otaVersion && appDetails.otaVersion !== '0' && (
              <> ({appDetails.otaVersion})</>
            )}
          </p>
        </div>
      )}
      {appDetails.isUpdateRequired && (
        <div className={`flex justify-between ${classes.appUpdate}`}>
          <div className="flex items-center">
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/update.svg`}
              alt="update"
              height={24}
              width={24}
              layout="intrinsic"
            />
            <span className={classes.updateTxt}>App Update Available</span>
          </div>
          <Button className={classes.updateBtn} onClick={updateApp}>
            Update Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileSidebar;
