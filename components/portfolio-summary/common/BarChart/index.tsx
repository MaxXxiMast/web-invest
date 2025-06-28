import Charts from '../../../common/charts';
import { handleValues } from '../../utils';

const BarChart = ({
  type = 'column',
  style = {
    height: '300px',
    width: '680px',
  },
  data = [],
}) => {
  const isMobile = window.innerWidth < 680;

  style.width = isMobile ? `${window.innerWidth - 50}px` : style.width;
  const lineChartOption = {
    chart: {
      type: type,
      style: {
        fontFamily: 'var(--fontFamily)',
      },
    },
    credits: {
      enabled: false,
    },
    title: {
      text: '',
    },
    legend: {
      enabled: false,
    },
    xAxis: {
      type: 'category',
      labels: {
        autoRotation: [-45, -90],
      },
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        formatter: function () {
          return handleValues(this.value, isMobile);
        },
      },
      gridLineWidth: 0.5,
      tickAmount: 5,
      min: null,
    },
    tooltip: {
      formatter: function () {
        let point = this.point;
        let tooltipContent = `
            <div>
                <strong>${handleValues(point.y)}</strong>
            </div>`;
        return tooltipContent;
      },
    },
    plotOptions: {
      column: {
        borderRadius: 5, // Adjust border radius to create curved edges
        borderWidth: 0, // Adjust border width for columns
        maxPointWidth: 50, // Set maximum column width
        marker: {
          enabled: false,
        },
      },
    },
    series: [
      {
        name: '',
        color: '#00B8B7',

        data: data?.map((d) => [d.month, d.amount]),
      },
    ],
  };

  return (
    <Charts
      container="cashflow-chart"
      options={lineChartOption}
      style={style}
    />
  );
};

export default BarChart;
