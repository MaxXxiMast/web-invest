import { useCallback, useContext } from 'react';
import { GlobalContext } from '../../pages/_app';
import { isRenderedInWebview } from '../appHelpers';
import { getOS } from '../userAgent';


const useAssetVisibilityOsBased = () => {
    const { hideiOS = [], hideAndroid = [] }: any = useContext(GlobalContext);
  return useCallback((assets: any[]) => {
    let assetArr = [...assets];
    if (isRenderedInWebview()) {
      const osType = getOS();
      if (osType === 'Android') {
        assetArr = assetArr.filter(
          (ele) => !(hideAndroid as number[]).includes(ele?.assetID)
        );
      }
      if (osType === 'iOS') {
        assetArr = assetArr.filter(
          (ele) => !(hideiOS as number[]).includes(ele?.assetID)
        );
      }
    }
    return assetArr;
  }, [hideAndroid, hideiOS]);
};

export default useAssetVisibilityOsBased; 