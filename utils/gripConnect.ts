import store from '../redux';
import { getDataFromJWTToken } from './login';
import { getUTMParamsIfExist } from './utm';

export const isGCOrder = () => {
  if (isGCOrderViaToken()) return true;

  const utmParams: any = getUTMParamsIfExist();
  return utmParams?.medium === 'connect' && utmParams?.source;
};

export const getGCSource = () => {
  if (isGCOrder()) {
    const utmParams: any = getUTMParamsIfExist();
    return utmParams?.source;
  }

  return '';
};

export const isGCOrderViaToken = () => {
  const accessToken = store.getState().gcConfig.gcData.accessToken;
  const tokenData = getDataFromJWTToken(accessToken);
  return Boolean(tokenData?.gcData?.gcName || '');
};
