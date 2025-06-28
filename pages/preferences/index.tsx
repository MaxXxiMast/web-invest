//Node Modules
import React, { useEffect, useState } from 'react';
import { NextPage } from 'next/types';

//Components
import Header from '../../components/common/Header';
import PageContainer from '../../components/common/PageContainer';
import { getObjectClassNames } from '../../components/utils/designUtils';
import { mediaQueries } from '../../components/utils/designSystem';
import ToggleSwitch from '../../components/primitives/ToggleSwitch/ToggleSwitch';
import TooltipCompoent from '../../components/primitives/TooltipCompoent/TooltipCompoent';
import GripLoading from '../../components/layout/Loading';

//Redux
import {
  fetchPreferences,
  fetchUserInfo,
  updatePreferences,
} from '../../redux/slices/user';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';

//Utils
import {
  callErrorToast,
  callSuccessToast,
  processError,
} from '../../api/strapi';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from '../../utils/appHelpers';

const classes: any = getObjectClassNames({
  preferencesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2 , 1fr)',
    columnGap: 30,
    [mediaQueries.phone]: {
      gridTemplateColumns: 'repeat(1 , 1fr)',
    },
    marginBottom: 200,
  },
  heading: {
    lineHeight: '32px',
    fontSize: 24,
    fontWeight: 600,
    marginTop: 32,
    paddingBottom: 8,
    color: '#282C3F',
    borderBottom: '1px solid var(--gripMercuryThree, #e6e6e6)',
    textTransform: 'capitalize',
    width: '100%',
    [mediaQueries.phone]: {
      paddingBottom: 16,
      lineHeight: '24px',
      fontSize: 18,
      fontWeight: 700,
    },
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '40% 60%',
    columnGap: 30,
    alignItems: 'center',
    width: '100%',
    borderBottom: '1px solid var(--gripMercuryThree, #e6e6e6)',
    padding: '20px 0 16px 0',
    [mediaQueries.phone]: {
      gridTemplateColumns: '80% 20%',
    },
  },
  label: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '24px',
    color: '#555770',
  },
  InfoIcon: {
    // marginTop: 5,
  },
  value: {
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '24px',
  },
  fullWidth: {
    [mediaQueries.phone]: {
      display: 'grid',
      gridTemplateColumns: '100%',
    },
  },
});

type PreferenceCategory = 'email' | 'whatsapp' | 'sms' | 'app';

type PreferenceData = {
  id: string;
  label: string;
  tooltip?: string;
  disabled?: boolean;
  disabledTooltip?: string;
};

const preferencesData: Record<PreferenceCategory, PreferenceData[]> = {
  email: [
    {
      id: 'profile',
      label: 'Your Email',
    },
    {
      id: 'newdeals',
      label: 'Receive emails on awesome new deal launches',
      tooltip:
        'Examples of such emails include new deal launch emails, new deal progress emails when the deal subscription reaches 50%, 80% and 90% of the total amount to be raised',
    },
    {
      label: 'Receive transactional emails from Grip',
      tooltip:
        'Examples of such emails includes the OTP emails, payment successful emails, repayment emails etc.',
      id: 'transactional',
      disabled: true,
      disabledTooltip:
        'Transactional communication preferences cannot be changed',
    },
  ],
  whatsapp: [
    {
      id: 'profile',
      label: 'Your Mobile',
    },
    {
      label: 'Receive notifications on awesome new deal launches',
      tooltip:
        'Examples of such notifications include new deal launch notifications, new deal progress notifications when the deal subscription reaches 50%, 80% and 90% of the total amount to be raised',
      id: 'newdeals',
      disabled: false,
    },
    {
      label: 'Receive transactional notifications from Grip',
      tooltip:
        'Examples of such notifications includes the OTP notifications, payment successful notifications, repayment notifications etc.',
      id: 'transactional',
      disabled: false,
    },
  ],
  sms: [
    {
      id: 'profile',
      label: 'Your Mobile',
    },
    {
      label: 'Receive notifications on awesome new deal launches',
      tooltip:
        'Examples of such notifications include new deal launch notifications, new deal progress notifications when the deal subscription reaches 50%, 80% and 90% of the total amount to be raised',
      id: 'newdeals',
    },
    {
      label: 'Receive transactional notifications from Grip',
      tooltip:
        'Examples of such notifications includes the OTP notifications, payment successful notifications, repayment notifications etc.',
      id: 'transactional',
      disabled: true,
      disabledTooltip:
        'Transactional communication preferences cannot be changed',
    },
  ],
  app: [
    {
      label: 'Promotional Notifications',
      tooltip: '',
      id: 'newdeals',
    },
    {
      label: 'Transactional Notifications',
      tooltip: '',
      id: 'transactional',
    },
  ],
};

const Preferences: NextPage = () => {
  const dispatch = useAppDispatch();
  const isMobileApp = isRenderedInWebview();
  const [loading, setLoading] = useState(true);
  const access = useAppSelector((state) => state.access);
  const { userData, preferences = {} } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(
      fetchUserInfo(access?.userID, () =>
        dispatch(fetchPreferences('', () => setLoading(false)))
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changePreference = async (
    label: string,
    id: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const prefUpdate = event.target.checked;
    const { config } = preferences;
    const dataToUpdate = {
      channel: label,
      data: {
        [id]: prefUpdate,
      },
    };

    try {
      await dispatch(updatePreferences(dataToUpdate, ''));
    } catch (err) {
      callErrorToast(processError(err || 'Failed to update preferences!'));
    }

    //show native prompt if both app alerts are off
    const bothAppAlertsOff =
      !config?.app?.transactional && !config?.app?.newdeals;

    //show native prompt if update transactional app alerts
    const updateTransactional = id === 'transactional';

    if (
      label === 'app' &&
      isMobileApp &&
      (bothAppAlertsOff || updateTransactional)
    ) {
      postMessageToNativeOrFallback('AppAlerts', dataToUpdate);
    } else {
      callSuccessToast('Changes saved!');
    }
  };

  const RenderRow = ({
    label,
    data,
  }: {
    label: PreferenceCategory;
    data: PreferenceData;
  }) => {
    const { mobileCode, mobileNo, emailID, config } = preferences;
    const disableMobile = label === 'sms' && userData?.mobileCode !== 91;
    return (
      <div
        className={`${classes.row} ${
          data.id === 'profile' ? classes.fullWidth : ''
        }`}
      >
        <div className={classes.label}>
          {data.label}{' '}
          {data.tooltip ? (
            <span>
              <TooltipCompoent toolTipText={data.tooltip}>
                <span
                  className={`icon-info`}
                  style={{
                    color: 'var(--gripBlue, #00357c)',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              </TooltipCompoent>
            </span>
          ) : null}
        </div>
        <div className={classes.value}>
          {data.id === 'profile' ? (
            label === 'email' ? (
              emailID
            ) : (
              `+${mobileCode} ${mobileNo}`
            )
          ) : (
            <ToggleSwitch
              handleChange={(event) => changePreference(label, data.id, event)}
              disabled={data.disabled || disableMobile}
              checked={config[label]?.[data?.id]}
              tooltip={
                disableMobile
                  ? 'SMS alerts are only supported for Indian numbers for now.'
                  : data.disabledTooltip
              }
            />
          )}
        </div>
      </div>
    );
  };
  const PreferenceDetails = ({
    label,
    customHeaderName,
  }: {
    label: PreferenceCategory;
    customHeaderName?: string;
  }) => (
    <div className="flex-column">
      <div className={classes.heading}>
        {customHeaderName || (label !== 'app' ? label : 'app alerts')}
      </div>
      {preferencesData[label].map((data: PreferenceData) => (
        <RenderRow key={data?.id} data={data} label={label} />
      ))}
    </div>
  );
  return loading ? (
    <GripLoading />
  ) : (
    <>
      <Header pageName="Preferences" />
      <PageContainer containerStyle={'backgroundWhite'}>
        <div className={classes.preferencesGrid}>
          <PreferenceDetails label={'email'} />
          <PreferenceDetails label={'whatsapp'} />
          <PreferenceDetails label={'sms'} customHeaderName="SMS" />
          {isMobileApp ? <PreferenceDetails label={'app'} /> : null}
        </div>
      </PageContainer>
    </>
  );
};

export default Preferences;
