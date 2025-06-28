import Cookie from 'js-cookie';

type UTMQueryParamResponse = {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  referrer: string;
  name: string;
  content: string;
  creative: string;
  adset: string;
  adgroup: string;
  placement: string;
  device: string;
  fbclid: string;
  gclid: string;
};

interface UTMParams extends UTMQueryParamResponse {
  search: string;
}

const getDataUTMParam = (param: any) => {
  return param ? param : 'Not received';
};

export const isUtmParamExist = (queryParams: any): boolean => {
  const preDefinedParams = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_referrer',
    'utm_name',
    'utm_content',
    'utm_creative',
    'utm_adset',
    'utm_adgroup',
    'utm_placement',
    'utm_device',
    'fbclid',
    'gclid',
  ];
  const keys = Object.keys(queryParams);
  return preDefinedParams.some((param) => keys.includes(param));
};

export const popuplateUTMParams = (queryParams: any): UTMQueryParamResponse => {
  return {
    source: getDataUTMParam(queryParams?.utm_source),
    medium: getDataUTMParam(queryParams?.utm_medium),
    campaign: getDataUTMParam(queryParams?.utm_campaign),
    term: getDataUTMParam(queryParams?.utm_term),
    referrer: getDataUTMParam(queryParams?.utm_referrer),
    name: getDataUTMParam(queryParams?.utm_name),
    content: getDataUTMParam(queryParams?.utm_content),
    creative: getDataUTMParam(queryParams?.utm_creative),
    adset: getDataUTMParam(queryParams?.utm_adset),
    adgroup: getDataUTMParam(queryParams?.utm_adgroup),
    placement: getDataUTMParam(queryParams?.utm_placement),
    device: getDataUTMParam(queryParams?.utm_device),
    fbclid: getDataUTMParam(queryParams?.fbclid),
    gclid: getDataUTMParam(queryParams?.gclid),
  };
};

export const getUTMParamsIfExist = () => {
  if (Cookie.get('utm')) {
    return getUTMParams();
  }
  return {};
};

export const getUTMParams = () => {
  const {
    source,
    campaign,
    medium,
    name,
    referrer,
    term,
    search,
    content,
    creative,
    adset,
    adgroup,
    placement,
    device,
    fbclid,
    gclid,
  } = JSON.parse(Cookie.get('utm')) as UTMParams;
  return {
    source,
    medium,
    campaign,
    term,
    referrer,
    name,
    utmSearch: search,
    content,
    creative,
    adset,
    adgroup,
    placement,
    device,
    fbclid,
    gclid,
  };
};
