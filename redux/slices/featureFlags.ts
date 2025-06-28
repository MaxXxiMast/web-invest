import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../redux/slices';
import { fetchFeatureFlag } from '../../api/mf';
import { getOS } from '../../utils/userAgent';
import { isRenderedInWebview } from '../../utils/appHelpers';

interface FeaturesState {
  enabledMF: boolean;
  flagsFetched: boolean;
  marketPlace: boolean;
}

const initialState: FeaturesState = {
  enabledMF: false,
  flagsFetched: false,
  marketPlace: false,
};

const featuresSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {
    setFeatures: (state, action: PayloadAction<Partial<FeaturesState>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setFeatures } = featuresSlice.actions;
export default featuresSlice.reducer;

// Helper to determine feature flag value
function getFeatureFlagValue(mapping: any): boolean {
  const os = getOS();
  if (mapping?.visibility) {
    if (isRenderedInWebview()) {
      if (os === 'iOS') {
        return !!mapping?.ios;
      } else {
        return !!mapping?.android;
      }
    } else {
      return !!mapping?.web;
    }
  }
  return false;
}

export function fetchFeatureFlags(): AppThunk {
  return async (dispatch) => {
    try {
      const featureData = await fetchFeatureFlag();
      const mfFeatureFlag = featureData.find(
        (feature) => feature.featureName === 'infinity'
      );
      const marketPlaceData = featureData.find(
        (feature) => feature.featureName === 'marketPlace'
      );

      const enabledMF = getFeatureFlagValue(mfFeatureFlag?.mapping);
      const marketPlace = getFeatureFlagValue(marketPlaceData?.mapping);

      dispatch(
        setFeatures({
          enabledMF,
          marketPlace,
          flagsFetched: true,
        })
      );
    } catch (e) {
      console.log(e, 'error');
      dispatch(setFeatures({ flagsFetched: true }));
    }
  };
}
