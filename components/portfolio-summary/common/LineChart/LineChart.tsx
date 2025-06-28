import { FC, memo } from 'react';
import dayjs from 'dayjs';

//components
import Charts from '../../../common/charts';

//Utils
import { numberToIndianCurrencyWithDecimals } from '../../../../utils/number';
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
interface LineChartProps {
  style?: React.CSSProperties;
  data?: { xData: string; yData: number }[];
  isNegative?: boolean;
}

const LineChart: FC<LineChartProps> = memo(
  ({
    style = {
      height: '260px',
      width: '100%',
    },
    data = [],
    isNegative = false,
  }) => {
    const isMobile = useMediaQuery();
    const tooltipPosition = (lWidth: number, lHeight: number, point: any) => {
      let xPos = point?.plotX - lWidth / 2;

      // Ensure tooltip stays within bounds
      if (xPos < 0) xPos = isMobile ? -8 : 0; // Prevents left overflow
      if (xPos + lWidth > (isMobile ? 300 : 560))
        xPos = point?.plotX - lWidth + (isMobile ? 10 : 30); // Prevents right overflow
      return {
        x: xPos,
        y: 0,
      };
    };
    const ymax = Math.max(...data.map((d) => d.yData));
    const minValue = 0;
    const maxValue = ymax + ymax * 0.3;

    const lineColor = isNegative
      ? ' var(--deepCarminePink, #ef3c3c)'
      : 'var(--gripPrimaryGreen, #00B8B7)';

    const crosshairColor = isNegative
      ? 'var(--deepCarminePink, #ef3c3c)'
      : '#80DBDB';

    const fillGradient = isNegative
      ? [
          [0, 'rgba(239, 60, 60, 0.1)'],
          [1, 'rgba(239, 60, 60, 0.0001)'],
          [2, 'rgba(0, 0, 0, 0)'],
        ]
      : [
          [0, 'rgba(0, 184, 183, 0.3)'],
          [1, 'rgba(0, 184, 183, 0)'],
          [2, 'rgba(0, 0, 0, 0)'],
        ];

    const lineChartOption = {
      chart: {
        type: 'areaspline',
        style: {
          fontFamily: 'var(--fontFamily)',
        },
        events: {
          load: function () {
            const chart = this;
            const series = chart.series[0];
            const middleIndex = Math.floor(series.data.length / 2); // Get center index
            const point = series.data[middleIndex];

            if (point) {
              point.setState('hover'); // Simulate hover effect
              chart.tooltip.refresh(point); // Show tooltip
              chart.xAxis[0].drawCrosshair(null, point); // Show crosshair
            }
          },
        },
        spacing: [0, 0, 0, 0],
        margin: isMobile ? [0, 3, 12, 3] : [0, 18, 12, 18],
        backgroundColor: 'transparent',
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
        categories: data?.map((d) => d.xData),
        crosshair: {
          width: 1,
          color: crosshairColor,
        },
        visible: false,
        startOnTick: false,
        endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
        tickWidth: 0,
      },
      yAxis: {
        title: {
          text: '',
        },
        labels: {
          formatter: function () {
            return numberToIndianCurrencyWithDecimals(this.value);
          },
        },
        visible: false,
        min: minValue,
        max: maxValue,
        startOnTick: false,
        endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
        tickWidth: 0,
      },
      tooltip: {
        backgroundColor: 'transparent',
        shadow: false,
        borderWidth: 0,
        useHTML: true,
        positioner: tooltipPosition,
        formatter: function () {
          let point = this.point;
          const formattedDate = dayjs(data[point.x]?.xData).format(
            'Do MMM YYYY'
          );
          return `
          <div style="white-space: nowrap; background: #fff; margin-top: -8px; padding: 4px;">
            <strong class=''>NAV: ${numberToIndianCurrencyWithDecimals(
              data[point.x]?.yData
            )}</strong>
             | <span>${formattedDate || 'N/A'}</span>
          </div>`;
        },
      },
      plotOptions: {
        areaspline: {
          lineWidth: 2,
          clip: false,
          cropThreshold: 0,
          states: {
            hover: {
              lineWidth: 2,
              halo: { size: 0, opacity: 0 },
              clip: false,
            },
          },
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: fillGradient,
          },
          marker: {
            enabled: false,
          },
        },
      },
      series: [
        {
          name: '',
          color: lineColor,
          data: data?.map((d) => d.yData),
          marker: {
            enabled: false,
            clip: false,
            states: {
              hover: {
                enabled: true,
                radius: 4,
                lineWidth: 2,
              },
            },
          },
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
  }
);

LineChart.displayName = 'LineChart';
export default LineChart;
