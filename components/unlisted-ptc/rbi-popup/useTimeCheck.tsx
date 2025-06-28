import Cookies from 'js-cookie';
import store from '../../../redux';
import {
  setIsTimeLessThanTwoHoursFD,
  setIsTimeLessThanTwoHoursRBI,
} from '../../../redux/slices/access';

export const updateTimeCheck = () => {
  const currentTime = new Date().getTime();
  const twoHoursInMillis = 2 * 60 * 60 * 1000; // Convert 2 hours to milliseconds

  const storedTime = parseInt(Cookies.get('storedTime')); // Retrieve stored time from cookies
  const storedTimeFd = parseInt(Cookies.get('storedTimeFd'));

  if (storedTime) {
    const isGreater = currentTime - storedTime > twoHoursInMillis;
    store.dispatch(setIsTimeLessThanTwoHoursRBI(isGreater));
  } else {
    store.dispatch(setIsTimeLessThanTwoHoursRBI(true));
  }

  if (storedTimeFd) {
    const isGreater = currentTime - storedTimeFd > twoHoursInMillis;
    store.dispatch(setIsTimeLessThanTwoHoursFD(isGreater));
  } else {
    store.dispatch(setIsTimeLessThanTwoHoursFD(true));
  }
};
