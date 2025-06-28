import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import store, { AppThunk } from '../index';
import { processError } from '../../api/strapi';
import { getGCAuthentation, getRedirectDataUsingJWT } from '../../api/redirect';
import { setUserData, showKycPopup } from './user';
import { setAccessDetails } from './access';
import type { GCAuthResponse } from '../types/gc';
import { getDataFromJWTToken } from '../../utils/login';
import { newRelicErrLogs, trackEvent } from '../../utils/gtm';

export type GCData = Partial<
  GCAuthResponse & {
    redirectUrl: string;
    gcCallbackUrl: string;
    gciConfigID: number;
    gciName: string;
    externalUserID: string;
  }
>;

type GCConfig = {
  themeConfig: {
    pages: {
      referral: {
        gcReferralUrl: string;
        gcReferralInviteText: string;
        assetCardsToShow: string[];
      };
      profile: {
        terms: boolean;
        signOut: boolean;
        support: boolean;
        mydocuments: boolean;
        preferences: boolean;
        wealthmanager: boolean;
        accountdetails: boolean;
        hideBookCallTopNav: boolean;
        hideKYI: boolean;
      };
      assetDetail: {
        hideBackArrow: boolean;
        hideSupportBanner: boolean;
      };
      assetList: {
        hideRMAboutBonds: boolean;
      };
      assetClassesToShow: {
        fd: boolean;
        sdi: boolean;
        bonds: boolean;
        basket: boolean;
      };
      portfolio: {
        summary: {
          blogs: boolean;
          rmCard: boolean;
          bottomBanners: boolean;
          portfolioPerformance: boolean;
          portfolioReturnDistribution: boolean;
        };
      };
      orderConfirmation: {
        upsellBanner: boolean;
      };
      kyc: {
        hideKYC: boolean;
      };
    };
    showNotifications: boolean;
    fontFamily: string;
    'root-colors': Record<string, string>;
    fontFamilyURL: string;
    mobileBottomNav: Record<string, boolean>;
    hamburgerMenu: boolean;
    showBetterRatingAssets: boolean;
    redirectToPartner: {
      paymentFailedRetryNow: boolean;
      orderSuccessViewPortfolio: boolean;
      completeKycWhenBackInIndia: boolean;
      exploreInvestmentOpportunities: boolean;
    };
    hideProfile?: boolean;
    redirectUrlToGc?: string;
  };
};

type currentDisplayState = {
  gcUserId: string;
  gcData: GCData;
  configData?: GCConfig;
};

const initialState: currentDisplayState = {
  gcUserId: '',
  gcData: {},
};

const gcSlice = createSlice({
  name: 'gc',
  initialState,
  reducers: {
    setGCAuthData: (state, action: PayloadAction<GCData>) => {
      state.gcData = action.payload;
    },
    setGCConfig: (state, action: PayloadAction<GCConfig>) => {
      state.configData = action.payload;
    },
    setGCUserId: (state, action: PayloadAction<string>) => {
      state.gcUserId = action.payload;
    },
  },
});

export const { setGCAuthData, setGCConfig, setGCUserId } = gcSlice.actions;

export default gcSlice.reducer;

/**
 * @description fetches and sets in redux store vault transactions of current user.
 * @param page number to get paginated result
 * @returns Appthunk
 */

function waitForAccessData(
  retries: number = 20,
  interval: number = 500
): Promise<any> {
  return new Promise((resolve, reject) => {
    const checkCondition = async () => {
      const accessData = store.getState().access;
      if (accessData?.accessToken) {
        const tokenData = getDataFromJWTToken(accessData?.accessToken);
        if (dayjs(Number(tokenData?.exp * 1000)).isAfter(dayjs())) {
          // THIS WILL CHECK FOR NEW TOKEN ON EVERY ITERATION
          newRelicErrLogs('GC_user_access_data_fn_resolve', 'info', {
            accessData: JSON.stringify(accessData),
          });

          resolve(accessData);
        }
      } else if (retries <= 0) {
        newRelicErrLogs('GC_user_access_data_retry_exceed', 'info', {
          accessData: JSON.stringify(accessData),
        });
        reject(new Error('Timeout waiting for access data'));
      } else {
        retries -= 1;
        setTimeout(checkCondition, interval);
      }
    };
    checkCondition();
  });
}

export function getGCCredentials(
  id: string,
  cb: (data: GCData) => void
): AppThunk {
  return async (dispatch, getState) => {
    try {
      dispatch(setAccessDetails({ accessToken: '' }));
      dispatch(setUserData({}));

      dispatch(setGCUserId(id));
      const result = await getGCAuthentation(id);
      await trackEvent('GC_user_gci_auth_api_called', {
        auth_result: JSON.stringify(result),
      });
      newRelicErrLogs('GC_user_gci_auth_api_called', 'info', {
        auth_result: JSON.stringify(result),
      });

      const redirectData = await getRedirectDataUsingJWT(result.accessToken);
      await trackEvent('GC_user_redirect_url_api_called', {
        auth_result: JSON.stringify(result),
        redirect_data: JSON.stringify(redirectData),
      });
      newRelicErrLogs('GC_user_redirect_url_api_called', 'info', {
        auth_result: JSON.stringify(result),
        redirect_data: JSON.stringify(redirectData),
      });

      const tokenData = getDataFromJWTToken(result?.accessToken);

      newRelicErrLogs('GC_user_data_encrypt_token_data', 'info', {
        tokenData: JSON.stringify(tokenData),
      });

      // Redirect URL for GC to redirect to on our platform
      // GC Callback URL for us to redirect to GC from confirmation
      const finalData = {
        ...result,
        redirectUrl: result.redirectURL,
        gcCallbackUrl: redirectData.redirectUrl,
        externalUserID: tokenData?.gcData?.externalUserID,
      };

      dispatch(
        setAccessDetails({
          accessToken: result.accessToken,
          userID: result.userData.userID,
          emailID: result.userData.emailID,
          mobileNo: result.userData.mobileNo,
        })
      );

      const accessData = await waitForAccessData();
      if (accessData?.accessToken) {
        dispatch(setGCAuthData(finalData));
        dispatch(showKycPopup(true));
        newRelicErrLogs('GC_user_callback_function_trigger', 'info', {
          finalData: JSON.stringify(finalData),
          tokenData: JSON.stringify(tokenData),
        });
        await trackEvent('GC_user_callback_function_trigger', {
          finalData: JSON.stringify(finalData),
          tokenData: JSON.stringify(tokenData),
        });
        cb(finalData);
      } else {
        trackEvent('GC_user_access_data_issue', {
          accessData: JSON.stringify(accessData),
        });
        newRelicErrLogs('GC_user_access_data_issue', 'error', {
          accessData: JSON.stringify(accessData),
        });
      }
    } catch (e) {
      const errorMessage = processError(e || 'Unable to fetch data');
      await trackEvent('GC_user_API_auth_redirect_data_error', {
        errorMessage: errorMessage,
        url_id: id,
      });
      newRelicErrLogs('GC_user_API_auth_redirect_data_error', 'error', {
        errorMessage: errorMessage,
        url_id: id,
      });
      const gcData = getState()?.gcConfig?.configData?.themeConfig;
      // await delay(500);
      // dispatch(
      //   logout({
      //     isAutoLogout: true,
      //     redirect: gcData?.redirectUrlToGc || '/login',
      //   }) as any
      // );
    }
  };
}
