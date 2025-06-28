import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { connect } from 'react-redux';
import { getObjectClassNames } from '../../components/utils/designUtils';
import Header from '../../components/common/Header';
import NotificationsList from '../../components/layout/Notifications';
import { getNoOfNotifications } from '../../utils/user';
import { AppState, RootState } from '../../redux';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import Image from '../../components/primitives/Image';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { mediaQueries } from '../../components/utils/designSystem';
import { showNotification } from '../../redux/slices/config';
import BackdropComponent from '../../components/common/BackdropComponent';
import NotificationFilter from './NotificationFilter';
import { isRenderedInWebview } from '../../utils/appHelpers';
import { isGCOrder } from '../../utils/gripConnect';
import { useAppSelector } from '../../redux/slices/hooks';

const classes: any = getObjectClassNames({
  NoNotificationDiv: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 64px)',
    gap: 8,
    overflow: 'hidden',
  },
  NoNotificationText: {
    fontFamily: 'var(--fontFamily)',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: '24px',
    display: 'flex',
    alignTtems: 'center',
    color: '#282c3f',
  },
  NotificationBell: {
    width: 160,
    height: 160,
    [mediaQueries.phone]: {
      maxWidth: '60px !important',
      maxHeight: '60px !important',
    },
  },
});
const Notifications: NextPage = (props: any) => {
  const router = useRouter();
  const isMobile = useMediaQuery();
  const [showLoader, setShowLoader] = React.useState(false);

  const isGC = isGCOrder();
  const { userData } = useAppSelector((state) => state.user);

  const isLLPUser = Boolean(userData?.investmentData?.['Leasing']?.investments) ||
    Boolean(userData?.investmentData?.['Inventory']?.investments);

  const renderNotificationFilter = () => {
    if (isRenderedInWebview() && !isGC && isLLPUser) {
      return <NotificationFilter />;
    }
  }
  const notificationPreset = Boolean(
    getNoOfNotifications(
      props.notifications,
      props.pendingResignations,
      props.pendingMcaEsign
    )
  );
  useEffect(() => {
    if (!isMobile) {
      props.showNotification(true);
      router.push('/assets');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.innerWidth]);

  //Loader
  useEffect(() => {
    router.events.on('routeChangeStart', () => setShowLoader(true));
    router.events.on('routeChangeComplete', () => setShowLoader(false));

    return () => {
      router.events.off('routeChangeStart', () => setShowLoader(true));
      router.events.off('routeChangeComplete', () => setShowLoader(false));
    };
  }, [router]);

  const noNotification = () => {
    return (
      <div className={classes.NoNotificationDiv}>
        <div className={classes.NotificationBell}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}commons/noNotification.svg`}
            width={16}
            height={20}
            alt="nonotificationlogo"
          />
        </div>
        <text className={classes.NoNotificationText}>No new notifications</text>
      </div>
    );
  };
  return (
    <>
      <Header pageName="Notifications" />
      {notificationPreset ? (
        <div>
          {renderNotificationFilter()}
          <NotificationsList showAllNotifications={true} />
        </div>
      ) : (
        noNotification()
      )}
      <BackdropComponent open={showLoader} />
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  notifications: state.user.notifications,
  pendingResignations: state.user.pendingResignations,
  pendingMcaEsign: state.user.pendingMcaEsign,
});

const mapDispatchToProps = {
  showNotification,
};

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
