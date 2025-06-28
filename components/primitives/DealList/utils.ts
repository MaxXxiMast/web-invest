export const processAssetData = (asset) => {
  const irrValue = `${parseFloat(asset?.irr).toFixed(2)}`;
  if (asset.productCategory === 'High Yield FDs') {
    asset.irr = irrValue;
  } else {
    asset.irr = `${irrValue}% YTM`;
  }
  const tenureType = asset?.tenureType || `Month${asset.tenure > 1 ? 's' : ''}`;
  asset.tenure = asset.tenure ? `${asset.tenure} ${tenureType}` : '-';

  return asset;
};
