import { useEffect, useState } from 'react';
import { fetchAPI } from '../../../api/strapi';
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { setGCConfig } from '../../../redux/slices/gc';
import { setGCDataCalled } from '../../../redux/slices/redirect';
import { loadFonts } from '../../../utils/fonts';
import GripLoading from '../Loading';

export default function GCAppLayout({ children }) {
  const dispatch = useAppDispatch();
  const gciConfigID = useAppSelector(
    (state) => state.gcConfig.gcData?.gciConfigID
  );
  const [loading, setLoading] = useState(true);

  const updateCSSVariable = (colorObj: any) => {
    Object.keys(colorObj).forEach((key) => {
      document.documentElement.style.setProperty(key, colorObj[key]);
    });
  };

  const resetCSSVariables = (colorObj: any) => {
    Object.keys(colorObj).forEach((key) => {
      document.documentElement.style.removeProperty(key);
    });
  };

  useEffect(() => {
    let originalColors: any = {};

    const getGcConfigData = async () => {
      try {
        const gcConfigData = await fetchAPI(`/gc-configs`, {
          filters: {
            gcPartnerID: gciConfigID,
          },
          populate: {
            themeConfig: '*',
          },
        });

        const data = gcConfigData?.data?.[0]?.attributes?.themeConfig;
        dispatch(
          setGCConfig({
            themeConfig: data,
          })
        );
        dispatch(setGCDataCalled(true));
        const rootColors = data?.['root-colors'] ?? {};
        const gcFontFamily = data?.fontFamily ?? 'Inter';
        const gcFontFamilyURL = data?.fontFamilyURL ?? 'Inter';

        // Store original values before updating
        Object.keys(rootColors).forEach((key) => {
          originalColors[key] = getComputedStyle(
            document.documentElement
          ).getPropertyValue(key);
        });

        const finalFontDataObj = {
          family: gcFontFamily,
          url: gcFontFamilyURL,
          options: {
            style: 'normal',
          },
        };

        loadFonts([finalFontDataObj] as any[], gcFontFamily);
        updateCSSVariable(rootColors);
      } catch (error) {
        console.log('Error in fetching GC config data', error);
      } finally {
        setLoading(false);
      }
    };

    if (gciConfigID) {
      getGcConfigData();
    }

    return () => {
      resetCSSVariables(originalColors);
      loadFonts(['Inter'] as any[], 'Inter');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gciConfigID]);

  if (loading) {
    return <GripLoading />;
  }

  return <>{children}</>;
}
