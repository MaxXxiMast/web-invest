import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

import Button, { ButtonType } from '../Button';
import Image from '../Image';

import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { bannerData, BannerData } from './util';
import { trackEvent } from '../../../utils/gtm';
import { getOverallDefaultKycStatus } from '../../../utils/discovery';
import { postMessageToNativeOrFallback } from '../../../utils/appHelpers';

import { useAppSelector } from '../../../redux/slices/hooks';
import { fetchUserPreferences } from '../../../api/user';

import classes from './NotificationBannerMobile.module.css';

type Props = {
  pageName?: 'discover' | 'portfolio';
  subPage?: 'summary' | 'myInvestments';
  isAnyPendingOrder?: boolean;
};

export default function NotificationBannerMobile({
  pageName = 'discover',
  subPage,
  isAnyPendingOrder = false,
}: Props) {
  const isRenderInWebView = Cookies.get('webViewRendered');
  const [isCookieExists, setIsCookieExists] = useState(false);
  const [isNotificationPermission, setIsNotificationPermission] =
    useState(true);

  const userData = useAppSelector((state) => state.user.userData);
  const kycConfigStatus =
    useAppSelector((state) => state?.user?.kycConfigStatus) || {};

  const isInvestedUser = userData?.investmentData?.isInvested;
  const userAgent = navigator.userAgent;

  const rfqStatusKYC = getOverallDefaultKycStatus(kycConfigStatus);
  const noUserKyc = rfqStatusKYC === 'pending';
  const isKycUnderVerification = rfqStatusKYC === 'pending verification';
  const isKycComplete = rfqStatusKYC === 'verified';

  const data: BannerData = bannerData({
    pageName,
    isInvestedUser,
    subPage,
    isAnyPendingOrder,
    isKycUnderVerification: isKycUnderVerification,
  });

  const handleLaterBtnClick = () => {
    setIsCookieExists(true);
    Cookies.set('mayBeLaterGc', 'clicked', { expires: 2 });

    postMessageToNativeOrFallback('MaybeLaterClick', {});

    trackEvent('maybe_later_clicked', {
      platform_os: userAgent,
    });
  };

  const handleEnableBtnClick = () => {
    postMessageToNativeOrFallback('AppAlerts', {
      data: {
        transactional: true,
      },
    });
    trackEvent('enable_clicked', {
      platform_os: userAgent,
    });
  };

  useEffect(() => {
    const getUserPreferences = async () => {
      try {
        const data = await fetchUserPreferences('');
        const { config } = data;
        setIsNotificationPermission(config?.app?.transactional);
      } catch (error) {
        console.error('Failed to fetch user preferences:', error);
      }
    };
    if (isRenderInWebView) {
      getUserPreferences();
    }

    const cookieValue = Cookies.get('mayBeLaterGc');
    setIsCookieExists(Boolean(cookieValue));
  }, [isRenderInWebView]);

  const renderCard = (
    <div className={`flex-column ${classes.Wrapper}`}>
      <div className={`flex ${classes.Top}`}>
        <div className={classes.Icon}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}gc-icons/blue-bell.svg`}
            alt="bell"
            width={68}
            height={68}
            layout="fixed"
          />
        </div>
        <div className={`flex-column ${classes.Content}`}>
          <h3>{data?.heading}</h3>
          <p>{data?.message}</p>
        </div>
      </div>
      <div className={`flex ${classes.Bottom}`}>
        <Button variant={ButtonType.PrimaryLight} onClick={handleLaterBtnClick}>
          Maybe later
        </Button>
        <Button variant={ButtonType.Primary} onClick={handleEnableBtnClick}>
          Enable
        </Button>
      </div>
    </div>
  );

  if (isRenderInWebView && !isCookieExists && !isNotificationPermission) {
    // Portfolio every time
    // Discover only for invested user
    if (
      pageName === 'portfolio' ||
      (pageName === 'discover' && isInvestedUser)
    ) {
      return renderCard;
    }

    // New User Cases
    if (!isInvestedUser) {
      // KYC under verification or KYC complete
      if (isKycUnderVerification || isKycComplete) {
        return renderCard;
      }

      // KYC pending and if pending state of any kyc
      if (noUserKyc || rfqStatusKYC === 'continue') {
        return null;
      }
    }
  }

  return null;
}
