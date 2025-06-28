import React, { useEffect } from 'react';
import Highcharts from 'highcharts';

type Props = {
  modules?: any;
  container?: any;
  options?: any;
  style?: any;
};

let ref: any = null;
const Charts = ({ modules, container, options, style }: Props) => {
  let chart: any;
  let formatter = function (this: any) {
    return this.point.name;
  };
  const addFormator = () => {
    if (options?.series[0]?.dataLabels?.enabled)
      options.series[0].dataLabels.formatter = formatter;
  };
  useEffect(() => {
    if (!ref) {
      if (modules) {
        modules.forEach(function (module: (arg0: typeof Highcharts) => void) {
          module(Highcharts);
        });
      }
      addFormator();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      chart = new Highcharts['Chart'](container, options);
    }
    return () => {
      chart?.destroy();
    };
  });
  return React.createElement('div', { id: container, style: style });
};

export default Charts;
