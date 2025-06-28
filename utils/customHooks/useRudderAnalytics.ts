import { useState } from 'react';
import type { LoadOptions, RudderAnalytics } from '@rudderstack/analytics-js';
import { newRelicErrLogs } from '../gtm';

const DATA_PLANE_URL = 'https://gripinvestyot.dataplane.rudderstack.com';

type RudderStackAnalyticsResponse = {
  initializeSDK: (API_KEY: string) => Promise<void>;
};

const useRudderStackAnalytics = (): RudderStackAnalyticsResponse => {
  const [analytics, setAnalytics] = useState<RudderAnalytics>();

  // load call options
  const loadOptions: LoadOptions = {
    integrations: { All: true },
  };

  const initializeSDK = async (API_KEY: string) => {
    if (!analytics) {
      const initialize = async () => {
        const { RudderAnalytics } = await import('@rudderstack/analytics-js');
        const analyticsInstance = new RudderAnalytics();

        analyticsInstance.load(API_KEY, DATA_PLANE_URL, loadOptions);

        analyticsInstance.ready(() => {
          console.log('We are all set!!!');
        });

        setAnalytics(analyticsInstance);
      };

      initialize().catch((error) => {
        newRelicErrLogs('Rudderstack_Initialization_Failed', 'error', {
          error: JSON.stringify(error),
        });
      });
    }
  };

  return { initializeSDK };
};

export default useRudderStackAnalytics;
