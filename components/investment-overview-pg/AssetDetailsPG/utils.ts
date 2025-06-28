import { getMaturityDate, getMaturityMonths } from '../../../utils/asset';
import {
  isAssetBasket,
  isSDISecondary,
} from '../../../utils/financeProductTypes';
import { roundOff } from '../../../utils/number';

export const getAssetDetails = (asset: any, lotSize: number) => {
  const isSDI = isSDISecondary(asset);
  const isbasket = isAssetBasket(asset);
  const tenure = getMaturityDate(asset);
  const months = getMaturityMonths(tenure);

  const irr =
    asset?.assetMappingData?.calculationInputFields?.preTaxYtm ||
    asset?.assetMappingData?.calculationInputFields?.irr ||
    asset?.bonds?.preTaxYtm ||
    asset?.sdiSecondary?.irr ||
    asset?.preTaxYtm ||
    asset?.irr;

  return [
    {
      label: isSDI ? 'Lots' : 'Units',
      value: lotSize,
    },
    {
      label: isSDI || isbasket ? 'IRR' : 'YTM',
      value: `${roundOff(irr ?? 0, 2)}${isSDI ? '%' : ''}`,
    },
    {
      label: '',
      value: `${months} Month${months > 1 ? 's' : ''}`,
    },
  ];
};
