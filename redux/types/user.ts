export type SetToastType = {
  visible: boolean;
  msg: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'default';
};

export type MarketTimingData = Partial<{
  currentDate: string;
  isMarketOpenNow: boolean;
  isMarketOpenToday: boolean;
  marketClosingTime: number;
  marketStartTime: number;
  reason: string;
}>;
