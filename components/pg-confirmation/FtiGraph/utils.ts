export const getGraphArr = ({
  preTaxYtm,
  irr,
  assetImage,
  FtiGraphObj,
  bondPartnerLogo,
  bondIrr,
  bondRating,
}) => {
  return [
    { ...(FtiGraphObj ?? {}) },
    {
      id: 'fd-you-just-bought',
      name: 'The FD you just  bought',
      color: '#282C3F',
      value: preTaxYtm ?? irr ?? 0,
      valueSize: 22,
      valueColor: '#282C3F ',
      lableSize: 14,
      labelFontWieight: 600,
      bgColor:
        'linear-gradient(180deg, rgba(253, 214, 91, 0.47) 0%, rgba(253, 214, 91, 0.09) 100%)',
      assetImage: assetImage,
    },
    {
      id: 'corporate-bond-on-grip',
      name: `${
        bondRating === 'A' ? '"A" rated' : 'Rated'
      } Corporate Bond on Grip`,
      color: '#282C3F',
      value: bondIrr ?? 0,
      valueColor: '#00B8B7 ',
      valueSize: 26,
      lableSize: 14,
      labelFontWieight: 600,
      bgColor:
        'linear-gradient(180deg, #CFF 0%, rgba(205, 255, 255, 0.21) 100%)',
      assetImage: bondPartnerLogo ?? '',
      showBtn: true,
    },
  ];
};
