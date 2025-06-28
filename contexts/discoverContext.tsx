import { createContext } from 'react';

type DiscoverContextProps = Partial<{
  amo_orders_pending_pay: number;
  amo_orders_pending_pay_rfq: number;
  market_open: boolean;
  orders_pending_pay: number;
}>;

export const DiscoverContext = createContext<DiscoverContextProps>({});
