export const getOptions = (
  assetByYTM: {
    asset8: any[];
    asset11: any[];
    asset14: any[];
  },
  selectedAsset: string
) => {
  return [
    {
      value: 'asset8',
      labelKey: '8-11%',
      disabled: !assetByYTM.asset8.length,
      selected: selectedAsset === 'asset8',
    },
    {
      value: 'asset11',
      labelKey: '11-14%',
      disabled: !assetByYTM.asset11.length,
      selected: selectedAsset === 'asset11',
    },
    {
      value: 'asset14',
      labelKey: '14% and higher',
      disabled: !assetByYTM.asset14.length,
      selected: selectedAsset === 'asset14',
    },
  ];
};

export const getAssetCategory = (selectedAsset: string) => {
  switch (selectedAsset) {
    case 'asset8':
      return '8-11%';
    case 'asset11':
      return '11-14%';
    case 'asset14':
      return '14% and higher';
  }
};
