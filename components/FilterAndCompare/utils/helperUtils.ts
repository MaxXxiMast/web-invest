const ProductTypeMapping = {
  XCase: 'Basket',
  'High Yield FDs': 'High Yield FDs',
  'Securitized Debt Instruments': 'SDI',
  'Corporate Bonds': 'Corporate Bond',
  'Unlisted PTC': 'SDI',
};

export const AssetType = (deal) => {
  return (
    ProductTypeMapping?.[deal?.productCategory] || deal?.productCategory || ''
  );
};

export const RegulatedBy = (deal: any) => {
  return deal?.isRfq ? 'SEBI Regulated' : 'RBI Regulated';
};

export const getDefaultFilter = (irrOptions, tenureOptions) => {
  const defaultIRR = irrOptions.find((option) => option.default);
  const defaultTenure = tenureOptions.find((option) => option.default);

  return [
    { ...defaultIRR, filterLabel: 'IRR/YTM' },
    { ...defaultTenure, filterLabel: 'Tenure' },
  ];
};
