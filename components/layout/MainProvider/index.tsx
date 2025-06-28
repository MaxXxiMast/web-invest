import dynamic from 'next/dynamic';
import { type PropsWithChildren } from 'react';
const PlatformMain = dynamic<PropsWithChildren<{}>>(
  () => import('./PlatformMain'),
  {
    ssr: false,
  }
);

const GCPlatformMain = dynamic<PropsWithChildren<{}>>(
  () => import('./GCPlatformMain'),
  {
    ssr: false,
  }
);

export default function MainProvider({ children }: PropsWithChildren<{}>) {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '';
  const isNotExternalPage = pathname && !pathname.includes('external');

  const ProviderMainComp = isNotExternalPage ? PlatformMain : GCPlatformMain;

  return (
    <ProviderMainComp>
      {children}
    </ProviderMainComp>
  );
}
