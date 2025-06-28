// NODE MODULES
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

// Components
import Image from '../../primitives/Image';
import ToggleSwitch from '../../primitives/ToggleSwitch/ToggleSwitch';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// Utils
import {
  callErrorToast,
  callSuccessToast,
  processError,
} from '../../../api/strapi';
import { preferences } from '../../../utils/discovery';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Redux Actions
import {
  fetchPreferences,
  updatePreferences,
} from '../../../redux/slices/user';
import { useAppSelector } from '../../../redux/slices/hooks';

// Styles
import styles from './NotificationCard.module.css';

function NotificationCard() {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery();

  const preferencesData = useAppSelector((state) => state.user.preferences);

  const whatsAppToggle = preferencesData?.config?.whatsapp?.newdeals || false;
  const emailToggle = preferencesData?.config?.email?.newdeals || false;
  const smsToggle = preferencesData?.config?.sms?.newdeals || false;

  const [preferenceLoading, setPreferenceLoading] = useState(true);

  const [toggleStatus, setToggleStatus] = useState({
    [preferences[0].id]: whatsAppToggle,
    [preferences[1].id]: emailToggle,
    [preferences[2].id]: smsToggle,
  });

  useEffect(() => {
    if (!preferenceLoading) {
      setToggleStatus({
        [preferences[0].id]: whatsAppToggle,
        [preferences[1].id]: emailToggle,
        [preferences[2].id]: smsToggle,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferenceLoading]);

  useEffect(() => {
    dispatch(
      fetchPreferences('', () => {
        setPreferenceLoading(false);
      }) as any
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changePreference = (label: string, event: any) => {
    const id = 'newdeals';
    const dataToUpdate = {
      channel: label,
      data: {
        [id]: event.target.checked,
      },
    };
    try {
      dispatch(updatePreferences(dataToUpdate, '') as any);
      callSuccessToast('Changes saved!');
    } catch (err) {
      callErrorToast(processError(err || 'Failed to update preferences!'));
    }
  };

  const getToggleStatus = (id) => {
    switch (id) {
      case preferences[0].id:
        return whatsAppToggle;
      case preferences[1].id:
        return emailToggle;
      case preferences[2].id:
        return smsToggle;
      default:
        return whatsAppToggle;
    }
  };

  const getToggleUI = () => {
    return preferences.map((el, index) => {
      return getSingleToggleUI(el, index);
    });
  };

  const getSingleToggleUI = (toggleData: any, index: number) => {
    if (toggleStatus[toggleData?.id]) {
      return null;
    }
    return (
      <div
        className={`flex ${styles.SingleNotificationContainer}`}
        key={`preference_toggle_${index}`}
      >
        <div className={styles.IconContainer}>
          {toggleData?.iconCode ? (
            <span
              className={toggleData?.iconCode}
              style={{
                color: toggleData?.iconColor,
                fontSize: 19,
              }}
            />
          ) : (
            <Image
              width={19}
              height={19}
              src={toggleData?.icon}
              layout={'fixed'}
              alt={toggleData?.id}
            />
          )}
        </div>
        <div className={styles.NotificationText}>{toggleData?.title}</div>
        <div>
          <ToggleSwitch
            handleChange={(event) => changePreference(toggleData?.id, event)}
            checked={getToggleStatus(toggleData?.id)}
          />
        </div>
      </div>
    );
  };

  if (preferenceLoading) {
    return (
      <div className={`containerNew ${styles.NotificationsContainer}`}>
        <CustomSkeleton styles={{ height: 120, width: '100%' }} />
      </div>
    );
  }

  if (
    toggleStatus[preferences[0].id] &&
    toggleStatus[preferences[1].id] &&
    toggleStatus[preferences[2].id]
  ) {
    return null;
  }
  return (
    <div className={styles.NotificationsContainer}>
      <div className={styles.Heading}>
        {isMobile
          ? 'Never Miss a Deal Again.'
          : 'Never Miss a Deal Again. Make sure you are subscribed to all our channels of communication'}
      </div>
      <div className={styles.SubLabel}>
        Make sure you are subscribed to all our channels of communication
      </div>
      <div className={`flex ${styles.NotificatioToggleContainer}`}>
        {getToggleUI()}
      </div>
    </div>
  );
}

export default NotificationCard;
