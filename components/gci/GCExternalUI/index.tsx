import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

// Components
import ProcessingPaymentLayout from '../../layouts/ProcessingPaymentLayout';

// Redux Slices
import { GCData, getGCCredentials } from '../../../redux/slices/gc';
import { fetchUserInfo } from '../../../redux/slices/user';
import { newRelicErrLogs, trackEvent } from '../../../utils/gtm';

import { useAppSelector } from '../../../redux/slices/hooks';

function GCExternalUI({ urlToken }) {
  const dispatch = useDispatch();
  const gcData = useAppSelector(
    (state) => state?.gcConfig?.configData?.themeConfig
  );

  const oldUrlToken =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('gcloginIdVal')
      : null;

  useEffect(() => {
    newRelicErrLogs('GC_user_external_page_landing', 'info', {
      loadUrl: urlToken,
    });
    trackEvent('GC_user_external_page_landing', {
      loadUrl: urlToken,
    });

    const handleRedirection = async () => {
      sessionStorage.setItem('gcloginIdVal', urlToken);
      const isVisitedSamePage = oldUrlToken === urlToken;

      if (isVisitedSamePage) {
        await trackEvent('GC_user_revisited_same_url', {
          loadUrl: urlToken,
          redirectionUrl: gcData?.redirectUrlToGc,
          gcData: JSON.stringify(gcData),
        });
        newRelicErrLogs('GC_user_revisited_same_url', 'info', {
          loadUrl: urlToken,
          redirectionUrl: gcData?.redirectUrlToGc,
          gcData: JSON.stringify(gcData),
        });

        window.open(
          gcData?.redirectUrlToGc || '/login?gcsrc=external-ui',
          '_self'
        );
      } else {
        localStorage.clear();
        if (Boolean(urlToken) && urlToken !== 'undefined') {
          newRelicErrLogs('GC_user_journey_started', 'info', {
            loadUrl: urlToken,
          });
          trackEvent('GC_user_journey_started', {
            loadUrl: urlToken,
          });
          getRedirectionUrl(urlToken);
        }
      }
    };
    handleRedirection();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSuccessCBAuth = (data: GCData) => {
    // GET Redirect URL
    if (data?.redirectUrl) {
      newRelicErrLogs('GC_user_success_callback_function', 'info', {
        redirectUrl: data?.redirectUrl,
        gcData: JSON.stringify(data),
      });
      dispatch(
        fetchUserInfo(
          data?.userData?.userID,
          (userData) => {
            newRelicErrLogs('GC_user_success_user_data_fetch', 'info', {
              redirectUrl: data?.redirectUrl,
              userData: JSON.stringify(userData),
              gcData: JSON.stringify(data),
            });

            // REDIRECT USER TO ASSET DETAILS PAGE IF REDIRECT URL CONTAINS ASSETDETAILS
            setTimeout(() => {
              trackEvent('GC_user_success_redirect_to_page', {
                redirectUrl: data?.redirectUrl,
                userID: data?.userData?.userID,
                gcData: JSON.stringify(data),
              });

              newRelicErrLogs('GC_user_success_redirect_to_page', 'info', {
                redirectUrl: data?.redirectUrl,
                userID: data?.userData?.userID,
                gcData: JSON.stringify(data),
              });

              window.open(data?.redirectUrl || '/assets', '_self');
            }, 1000);
          },
          false
        ) as any
      );
    }
  };

  const getRedirectionUrl = (id: string) => {
    dispatch(getGCCredentials(id, onSuccessCBAuth) as any);
  };

  return (
    <ProcessingPaymentLayout
      title="Your redirect is in progress"
      subTitle="Please do not hit back or refresh button…"
    />
  );
}

export default GCExternalUI;
