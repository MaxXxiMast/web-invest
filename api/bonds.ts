import { fetchAPI } from './strapi';

export const getHolidayList = () => {
  return fetchAPI(`/v2/assets/bonds/holidayList`, {}, {}, true);
};

export const fetchScheduleOfReturn = (assetID: number | string) => {
  return fetchAPI(`/v1/assets/${assetID}/portfolio`, {}, {}, true);
};
