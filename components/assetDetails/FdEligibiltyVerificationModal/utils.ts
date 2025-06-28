const isApplicable = (value: boolean) =>
  value ? 'Applicable' : 'Not Applicable';

export const getEligibilityInfoContainer = (kycDetails: {
  isWomen: boolean;
  isSrCitizen: boolean;
}) => {
  return [
    {
      key: 'srCitizen',
      label: 'Senior citizen',
      value: isApplicable(kycDetails.isSrCitizen),
    },
    {
      key: 'women',
      label: 'Women',
      value: isApplicable(kycDetails.isWomen),
    },
  ];
};
