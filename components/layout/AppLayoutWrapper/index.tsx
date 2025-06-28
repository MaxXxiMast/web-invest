import { type PropsWithChildren } from 'react';
import { isGCOrder } from '../../../utils/gripConnect';
import GCAppLayout from './GCAppLayout';
import PlatformAppLayout from './PlatformAppLayout';

export default function AppLayoutWrapper({ children }: PropsWithChildren<{}>) {
  const isGC = isGCOrder();

  const AppLayoutComp = isGC ? GCAppLayout : PlatformAppLayout;

  return <AppLayoutComp>{children}</AppLayoutComp>;
}
