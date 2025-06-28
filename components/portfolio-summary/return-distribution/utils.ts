export type DataChartFormatPayload = {
  '8to11': number;
  '11to14': number;
  '14andAbove': number;
};

export const formatDataForPieChart = (data: DataChartFormatPayload) => {
  const under11Data = data?.['8to11'] || 0;
  const below14Data = data?.['11to14'] || 0;
  const above14Data = data?.['14andAbove'] || 0;

  const suffix = (value: number) => (value > 1 ? 'transactions' : 'transaction');

  return [
    {
      label: `8-11% (${under11Data} ${suffix(under11Data)})`,
      value: under11Data,
      color: '#14B8A6',
    },
    {
      label: `11-14% (${below14Data} ${suffix(below14Data)})`,
      value: below14Data,
      color: '#3B82F6',
    },
    {
      label: `14% and higher (${above14Data} ${suffix(above14Data)})`,
      value: above14Data,
      color: '#52A4F9',
    },
  ];
};
