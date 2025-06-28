import Charts from '../../../common/charts';
import { handleValues } from '../../utils';
import styles from './PieChart.module.css';

const PieChart = ({
  pieChartId = 'PieChart',
  data = [],
  dataMapping = {
    keyName: 'label',
    value: 'value',
    subLabel: 'subLabel',
    color: 'color',
  },
  isVerticalLayout = false,
  style = {
    height: '200px',
    width: '200px',
  },
  className = '',
  showAmount = false,
  showPercent = false,
}) => {
  const pieChartOption = {
    chart: {
      style: {
        fontFamily: 'var(--fontFamily)',
        overflow: 'visible',
      },
      renderTo: 'container',
      type: 'pie',
      backgroundColor: 'transparent',
      spacingTop: 0,
      spacingBottom: 0,
      spacingLeft: 0,
      spacingRight: 0,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: '',
    },
    plotOptions: {
      pie: {
        shadow: false,
        borderWidth: 0,
      },
    },
    tooltip: {
      formatter: function () {
        return `<b> ${this.point.name}</b>
        ${showAmount ? ' ' + handleValues(this.y, false, false) : ''}${
          showPercent ? '(' + this.percentage?.toFixed(1) + '%)' : ''
        }`;
      },
    },
    series: [
      {
        name: 'Investment Share',
        innerSize: '30%',
        dataLabels: {
          enabled: false,
        },
        data: data?.map((d) => {
          return {
            name: d?.[dataMapping?.keyName],
            y: d?.[dataMapping?.value],
            color: d?.[dataMapping?.color],
          };
        }),
      },
    ],
  };

  return (
    <div
      className={`${
        isVerticalLayout ? 'flex-column' : 'flex'
      } items-center justify-between ${styles.container} ${className}`}
    >
      <Charts container={pieChartId} options={pieChartOption} style={style} />
      <div className={`flex-column gap-12`}>
        {data.map((ele, _idx) => (
          <div
            key={`${ele?.[dataMapping.keyName]}`}
            className={`flex gap-12 items-center`}
          >
            <div
              style={{
                backgroundColor: ele?.[dataMapping.color],
              }}
              className={styles.legendColor}
            />
            <div className={styles.label}>
              <span>{ele?.[dataMapping.keyName]}</span>{' '}
              {ele?.[dataMapping.subLabel] ? (
                <span className={styles.subLabel}>
                  {ele?.[dataMapping.subLabel]}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
