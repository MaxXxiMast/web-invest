import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Kolkata');

export const getMarketStartTime = (marketStartTime) => marketStartTime / 1000;
export const getMarketCloseTime = (marketCloseTime) => marketCloseTime / 1000;
export const getMarketOpenCloseCounterTime = (marketOpenCloseCounterTime) =>
  marketOpenCloseCounterTime * 60;

// This will check if market is in open status
export const handleIsMarketOpen = ({ startTime, closeTime }) => {
  const currentTime = dayjs().unix();
  return currentTime >= startTime && currentTime <= closeTime;
};

// This will check if market is in moving to open status
export const handleMarketOpenIn = ({ startTime, marketOpenDelayTimer }) => {
  const currentTime = dayjs().unix();
  return (
    currentTime >= startTime - marketOpenDelayTimer && currentTime <= startTime
  );
};

// This will check if market is in moving to close status
export const handleMarketCloseIn = ({ closeTime, marketOpenDelayTimer }) => {
  const currentTime = dayjs().unix();
  return (
    currentTime >= closeTime - marketOpenDelayTimer && currentTime <= closeTime
  );
};

export const pullMarketStatus = ({
  startTime,
  closeTime,
  marketOpenDelayTimer,
}) => {
  if (handleMarketOpenIn({ startTime, marketOpenDelayTimer })) {
    return 'opens in';
  } else if (handleMarketCloseIn({ closeTime, marketOpenDelayTimer })) {
    return 'closes in';
  } else if (handleIsMarketOpen({ startTime, closeTime })) {
    return 'open';
  } else {
    return 'closed';
  }
};

export const getMarketStatus = (
  marketStartTime: number,
  marketCloseTime: number,
  isMarketOpenToday: boolean
) => {
  if (!isMarketOpenToday) {
    return 'closed';
  }

  // Unix times to convert in seconds
  const startTime = getMarketStartTime(marketStartTime);
  const closeTime = getMarketCloseTime(marketCloseTime);
  const marketOpenDelayTimer = getMarketOpenCloseCounterTime(15);

  return pullMarketStatus({ startTime, closeTime, marketOpenDelayTimer });
};
