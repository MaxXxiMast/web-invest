// NODE MODULES
import { useEffect } from 'react';

// Hookss
import useRudderStackAnalytics from '../../../utils/customHooks/useRudderAnalytics';
import { initializeGTM } from '../../../utils/gtm';
import { initMoengage } from '../../../utils/ThirdParty/scripts';

export default function ThirdPartyProvider({
  rudderStackKey,
}: {
  rudderStackKey: string;
}) {
  const { initializeSDK: initializeRudderSDK } = useRudderStackAnalytics();

  const handleWindowHeight = () => {
    const r = document.querySelector(':root');
    if (window && r) {
      (r as HTMLElement).style.setProperty(
        '--windowHeight',
        `${window.innerHeight}px`
      );
    }
  };

  // RudderStack Analytics
  useEffect(() => {
    if (rudderStackKey) {
      initializeRudderSDK(rudderStackKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rudderStackKey]);

  useEffect(() => {
    initMoengage();
    initializeGTM();
    handleWindowHeight();
    window.addEventListener('DOMContentLoaded', handleWindowHeight);
    window.addEventListener('resize', handleWindowHeight);
    return () => {
      window.removeEventListener('DOMContentLoaded', handleWindowHeight);
      window.removeEventListener('resize', handleWindowHeight);
    };
  }, []);

  return null;
}
