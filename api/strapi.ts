//Node Modules
import qs from 'qs';

//Redux
import store from '../redux/index';
import { setToast } from '../redux/slices/toast';
import { TokenManager } from '../redux/slices/utils/tokenManager';
import { logout } from '../redux/slices/user';

//Utils
import { getEnv } from '../utils/constants';
import { newRelicErrLogs, trackEvent } from '../utils/gtm';
import { getDataFromJWTToken } from '../utils/login';
import validateResponse from '../utils/validateResponse';
// import { setServerDown } from '../redux/slices/access';

let fallbackResponse = {};

/**
 * Get full grip URL from path
 * @param {string} path Path of the URL
 * @returns {string} Full Grip URL
 */
export function getGripURL(path: string = '') {
  let baseURL = process.env.NEXT_PUBLIC_GRIP_API_URL;
  if (!baseURL) {
    baseURL =
      getEnv() === 'production'
        ? 'https://www.gripinvest.in'
        : 'https://qa.gripinvest.in';
  }
  return `${baseURL}${path}`;
}

/**
 * Get full Strapi URL from path
 * @param {string} path Path of the URL
 * @returns {string} Full Strapi URL
 */
export function getStrapiURL(path: string = '') {
  return `${
    process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
  }${path}`;
}

export function callErrorToast(msg: string) {
  store.dispatch(
    setToast({
      visible: true,
      msg,
      type: 'error',
    })
  );
}

export function callSuccessToast(msg: string) {
  store.dispatch(
    setToast({
      visible: true,
      msg,
      type: 'success',
    })
  );
}

function checkOnlineStatus(): boolean {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return false; // default to offline if uncertain
}

/**
 * Helper to make GET requests to Strapi API endpoints
 * @param {string} path Path of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {Object} options Options passed to fetch
 * @param {Boolean} isGripApi @default false `true` when calling grip api
 * @param {Boolean} showToast @default true `false` when disable error toast
 * @param {Boolean} blob @default false `true` it is returns blob object
 * @param {Object} headerData extra headerdata while calling api
 * @returns Parsed API call response
 */
export async function fetchAPI(
  path: string,
  urlParamsObject: object | null = {},
  options: object = {},
  isGripApi = false,
  showToast = true,
  blob = false,
  headerData = {},
  isAuthenticatedAPI = true,
  sendFullErr = false
) {
  const requestUrl = buildRequestUrl(path, urlParamsObject, isGripApi);
  const mergedOptions = buildRequestOptions(
    options,
    headerData,
    isGripApi,
    path
  );

  try {
    if (isGripApi && isAuthenticatedAPI) {
      newRelicErrLogs('api_authorization_header', 'info', {
        requestUrl,
        mergedOptions,
      });
      await setAuthorizationHeader(mergedOptions);
    }

    const response = await fetch(requestUrl, mergedOptions);
    return await handleResponse(
      response,
      requestUrl,
      isGripApi,
      isAuthenticatedAPI,
      showToast,
      sendFullErr,
      blob,
      (options as any)?.method
    );
  } catch (error) {
    return handleFetchError(error, requestUrl, isGripApi);
  }
}

// Helper functions

function buildRequestUrl(
  path: string,
  urlParamsObject: object | null,
  isGripApi: boolean
): string {
  const queryString = qs.stringify(urlParamsObject);
  const basePath = `/api${path}`;
  const fullPath = queryString ? `${basePath}?${queryString}` : basePath;
  return isGripApi ? getGripURL(fullPath) : getStrapiURL(fullPath);
}

// build request options
function buildRequestOptions(
  options: object,
  headerData: object,
  isGripApi: boolean,
  path: string
): object {
  const gripApiOptions = isGripApi ? getDataAndHeaders({}, path) : {};
  return {
    headers: {
      'Content-Type': 'application/json',
      ...gripApiOptions,
      ...headerData,
    },
    cache: 'no-store',
    ...options,
  };
}

async function setAuthorizationHeader(mergedOptions: any) {
  const tokenInstance = TokenManager.getInstance();
  const token = await tokenInstance.getToken();
  const gcUserId = store.getState()?.gcConfig?.gcUserId;
  mergedOptions.headers['Authorization'] = `Bearer ${token}`;
  mergedOptions.headers['Gc-Redirect-Token'] = gcUserId;
}

export const isLocalhost = () => {
  if (
    process?.env.NODE_ENV !== 'development' ||
    typeof window === 'undefined'
  ) {
    return false;
  }

  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.')
  );
};

async function handleResponse(
  response: Response,
  requestUrl: string,
  isGripApi: boolean,
  isAuthenticatedAPI: boolean,
  showToast: boolean,
  sendFullErr: boolean,
  blob: boolean,
  method = 'GET'
): Promise<any> {
  if (response.ok || response.status === 304) {
    if (requestUrl.includes('v3') && method !== 'GET' && !isLocalhost()) {
      try {
        const clonedResponse = response.clone();
        await validateResponse(clonedResponse);
      } catch (error) {
        callErrorToast(error?.message || 'Invalid response data!');
        console.error(error);
        return {};
      }
    }
    return blob
      ? response
      : await parseResponseData(response, requestUrl, isGripApi);
  }

  if ([502, 503, 504].includes(response.status) && isGripApi) {
    // Handle server errors for Grip API
    newRelicErrLogs('server_error_502_503_504', 'error', {
      status: response.status,
      requestUrl,
    });
  }

  const errorResponse = await response.json();
  handleErrorResponse(
    response,
    errorResponse,
    requestUrl,
    isGripApi,
    isAuthenticatedAPI,
    showToast,
    sendFullErr
  );

  throw new Error(
    JSON.stringify({
      message:
        errorResponse?.msg || errorResponse?.message || 'An error occurred',
      status: response.status,
      url: requestUrl,
    })
  );
}

async function parseResponseData(
  response: Response,
  requestUrl: string,
  isGripApi: boolean
) {
  try {
    const data = await response.json();
    if (!isGripApi) {
      fallbackResponse[`${requestUrl}`] = data;
    }
    return data;
  } catch {
    return {};
  }
}

function handleErrorResponse(
  response: Response,
  errorResponse: any,
  requestUrl: string,
  isGripApi: boolean,
  isAuthenticatedAPI: boolean,
  showToast: boolean,
  sendFullErr: boolean
) {
  if (!isGripApi) {
    return fallbackResponse[`${requestUrl}`];
  }

  if ([401, 403].includes(response.status)) {
    newRelicErrLogs('Login_error_401_403_status_API', 'error', {
      status: response.status,
    });
    handleUnauthorizedError(
      response,
      errorResponse,
      isAuthenticatedAPI,
      requestUrl
    );
  }

  if (showToast && response.status !== 401) {
    callErrorToast(processError(errorResponse?.msg || errorResponse?.message));
  }

  if (sendFullErr) {
    throw new Error(
      JSON.stringify({
        message:
          errorResponse?.msg || errorResponse?.message || 'An error occurred',
        status: response.status,
        url: requestUrl,
      })
    );
  }
}

async function handleUnauthorizedError(
  response: Response,
  errorResponse: any,
  isAuthenticatedAPI: boolean,
  requestUrl: string
) {
  if (response.status === 403) {
    callErrorToast('Your account has been blocked as per your request');
  }

  if (isAuthenticatedAPI) {
    const tokenData = getDataFromJWTToken(
      await TokenManager.getInstance().getToken()
    );
    newRelicErrLogs('Login_error_401_403_Logout', 'error', {
      status: response?.status,
      tokenData: JSON.stringify(tokenData),
      requestUrl,
    });
    if (tokenData?.gcData?.gcName) {
      const gcData = store.getState()?.gcConfig?.configData?.themeConfig;
      await trackEvent('GC_user_authentication_failed', {
        url: requestUrl,
        status: response?.status,
        message: errorResponse?.msg || errorResponse?.message || 'Unauthorized',
        gcTokenData: JSON.stringify(tokenData),
        gcName: tokenData?.gcData?.gcName,
        gcData: JSON.stringify(gcData),
      });
      newRelicErrLogs('GC_user_authentication_failed', 'error', {
        url: requestUrl,
        status: response?.status,
        message: errorResponse?.msg || errorResponse?.message || 'Unauthorized',
        gcTokenData: JSON.stringify(tokenData),
        gcName: tokenData?.gcData?.gcName,
        gcData: JSON.stringify(gcData),
      });

      // await delay(500);
      // if (gcData?.redirectUrlToGc) {
      //   redirectHandler({
      //     pageUrl: gcData.redirectUrlToGc,
      //     pageName: 'gc_logout',
      //   });
      // }
    } else {
      const externalUserId = tokenData?.gcData?.externalUserID;
      const userID = store.getState()?.access?.userID;
      newRelicErrLogs('authenticated_API_user_logout', 'error', {
        externalUserId,
        userID,
        status: response.status,
        message: errorResponse?.msg || errorResponse?.message || 'Unauthorized',
      });
      store.dispatch(
        logout({
          isAutoLogout: true,
          redirect: '/login',
          externalUserId,
        }) as any
      );
    }

    // throw new Error(
    //   JSON.stringify({
    //     message: errorResponse?.msg || errorResponse?.message || 'Unauthorized',
    //     status: response.status,
    //     url: requestUrl,
    //   })
    // );
  }
}

function handleFetchError(
  error: any,
  requestUrl: string,
  isGripApi: boolean
): any {
  if (!isGripApi) {
    return fallbackResponse[`${requestUrl}`];
  }
  if (error.message === 'Failed to fetch') {
    newRelicErrLogs('failed_to_fetch', 'info', {
      requestUrl,
      isOnline: checkOnlineStatus(),
    });
  }
  throw error;
}

export const getDataAndHeaders = (
  headerData: any,
  path: string,
  contentType?: string
) => {
  let headers: any = {};

  const accessToken = store.getState().access.accessToken;
  if (accessToken && !path.includes('//s3')) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  headers = {
    ...headers,
    ...headerData,
  };

  return headers;
};

export const convertObjectToFormDataObj = function (obj: any) {
  const data = new FormData();

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] instanceof File) {
        data.append(key, obj[key]);
      } else {
        data.set(key, obj[key]);
      }
    }
  }

  return data;
};

export const processError = (error: any) => {
  if (
    typeof error === 'object' &&
    error?.message?.includes('status code 429')
  ) {
    return 'Too many requests. Please try again after sometime.';
  }
  if (typeof error === 'string') {
    return error;
  } else if (typeof error === 'object' && typeof error.msg === 'string') {
    return error.msg;
  } else if (
    typeof error === 'object' &&
    error.response &&
    error.response.data &&
    (error.response.data.msg || error.response.data.message)
  ) {
    const msg = error.response.data.msg || error.response.data.message;
    if (typeof msg === 'object') {
      return msg.map((text: any, i: number) => `${i + 1}. text`).join(',');
    }
    return msg;
  } else if (
    typeof error === 'object' &&
    error.response &&
    error.response.data &&
    error.response.data.message
  ) {
    return error.message;
  }
  return 'Something went wrong!';
};
