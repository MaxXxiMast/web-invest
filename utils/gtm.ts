import TagManager from 'react-gtm-module';
import dayjs from 'dayjs';
import { getEnv, getLibraryKeys } from './constants';
import { isMobile } from './resolution';
import { getUTMParamsIfExist } from './utm';
import { trackAgentParams } from './userAgent';
import { getIpData, setIpData } from './ipHandling';
import Cookies from 'js-cookie';
import store from '../redux';
import {
  isRenderedInWebview,
  postMessageToNativeOrFallback,
} from './appHelpers';
import { isGCOrder } from './gripConnect';

export const initializeGTM = () => {
  if (getEnv() === 'production') {
    TagManager.initialize({ gtmId: getLibraryKeys().gtm });
  }
};

export const isNewUser = (user: any) => {
  const createdDate = dayjs(dayjs(user?.createdAt).format('YYYY-MM-DD'));
  const allowedDifference = 500;
  const actuallyDifference = dayjs(dayjs().format('YYYY-MM-DD')).diff(
    createdDate,
    'day'
  );
  if (actuallyDifference <= allowedDifference) {
    return true;
  }
  return false;
};

export const pushToDataLayer = (data: any) => {
  TagManager.dataLayer({
    dataLayer: data,
  });
};
export const fireReferralEvent = (eventName: string) => {
  pushToDataLayer({
    event: eventName,
  });
};

export const fireCreateNewUser = () => {
  pushToDataLayer({
    event: 'successfulSignup',
  });
};

export const fireCheckout = () => {
  pushToDataLayer({
    event: 'paymentCheckout',
  });
};

export const trackUser = (userID: number) => {
  (window as any).dataLayer = (window as any).dataLayer || [];
  let user = (window as any).dataLayer.find((e: any) => e.userID);
  if (!user || (user && user.userID !== userID)) {
    pushToDataLayer({ userID });
  }
};

const getExpVersion = () => {
  const expVersion = Cookies.get('experimentVariant');
  if (!expVersion) {
    return 'N/A';
  }
  return expVersion;
};

export const trackEvent = async (
  eventName: string,
  data?: any,
  buttonId?: string,
  state?: any
) => {
  try {
    let obj = { ...data };
    if (getIpData() === '') {
      await setIpData();
    }

    if (buttonId && typeof buttonId === 'string') {
      const ele = document.getElementById(buttonId);
      obj = {
        buttonId,
        cta_text:
          ele?.innerHTML?.replace('<span>', '')?.replace('</span>', '') ?? '',
        ...obj,
      };
    }

    const ipData = JSON.parse(getIpData());
    const application = Cookies.get('webViewRendered')
      ? 'Mobile App'
      : 'Website';

    const gcData = state
      ? state?.gcConfig?.gcData
      : store.getState().gcConfig.gcData;

    const trackGCObject = {
      GC_ID: gcData?.gciConfigID,
      GC_Name: gcData?.gciName,
      External_user_id: gcData?.externalUserID,
    };

    obj = {
      ...obj,
      ...ipData,
      ...trackAgentParams(),
      ...getUTMParamsIfExist(),
      ...trackGCObject,
      exp_version: getExpVersion(),
      application,
    };
    window['rudderanalytics']?.track(eventName, obj);
  } catch (e) {
    console.log(e, 'error');
  }
};

export const trackEventPostMessageToNativeOrFallback = async (
  state?: any
): Promise<Record<string, any>> => {
  try {
    if (getIpData() === '') {
      await setIpData();
    }
    const ipData = JSON.parse(getIpData());

    const application = Cookies.get('webViewRendered')
      ? 'Mobile App'
      : 'Website';
    const gcData = state
      ? state?.gcConfig?.gcData
      : store.getState().gcConfig.gcData;

    const trackGCObject = {
      GC_ID: gcData?.gciConfigID,
      GC_Name: gcData?.gciName,
      External_user_id: gcData?.externalUserID,
    };

    const combinedData = {
      ...ipData,
      ...trackAgentParams(),
      ...getUTMParamsIfExist(),
      ...trackGCObject,
      exp_version: getExpVersion(),
      application,
    };

    return combinedData;
  } catch (error) {
    console.error(error, 'error');
    return {};
  }
};

export const createTransaction = async (order: any, user: any) => {
  let orderData = {
    transactionId: order.transactionID,
    transactionAffiliation: isMobile() ? 'GRIP Mobile' : 'GRIP Web',
    transactionTotal: order.amount,
    asset_id: order?.assetID,
    order_amount: order?.amount,
    tenure: order?.tenure,
    irr: order?.irr,
    partner_names: order?.partnerName,
    asset_name: order?.assetName,
    transactionProducts: [
      {
        sku: order.assetName,
        name: order.partnerName,
        category: order.assetCategory,
        price: order.amount,
        quantity: order.units,
      },
    ],
  };
  if (order.isOrderSuccessful) {
    trackEvent('transactionComplete', orderData);

    //New User Event
    if (order.totalOrders === 1 && isNewUser(user)) {
      if (isRenderedInWebview() && !isGCOrder()) {
        const trackingData = await trackEventPostMessageToNativeOrFallback();
        postMessageToNativeOrFallback('new_user_order', {
          ...trackingData,
          orderData,
        });
      } else {
        trackEvent('newUserOrder', orderData);
      }
    }
  } else {
    trackEvent('transactionFailed', orderData);
  }
};

export const newRelicErrorLog = (
  error: string,
  customAttributes: Record<string, any> = {}
) => {
  window?.['newrelic']?.noticeError(error, customAttributes);
};

export const newRelicErrLogs = (
  logName: string,
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' = 'trace',
  customAttributes: Record<string, any> = {}
) => {
  try {
    window?.['newrelic']?.log(logName, {
      level,
      customAttributes,
    });
  } catch (error) {
    console.error('Error logging to New Relic:', error);
  }
};
