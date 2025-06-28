import Image from '../../primitives/Image';

import styles from './MetricsSection.module.css';

type MetricCardProps = {
  data: {
    label: string;
    value: string;
    icon: string;
    id: string;
    background: string;
  };
};

function getKeyMetricsJSX(metricObject: any) {
  return (
    <span className={styles.MetricValue}>
      {metricObject.prefix}
      {metricObject.value}
    </span>
  );
}

function MetricCard({ data }: MetricCardProps) {
  return (
    <div
      className={`flex items-center ${styles.MetricCardContainer} ${data.background}`}
    >
      <div className={styles.MetricCardImage}>
        <Image src={data.icon} alt="datalogo" />
      </div>
      <div className="flex-column items-start ">
        {data.id === 'investment' ? (
          getKeyMetricsJSX(data)
        ) : (
          <div className={styles.MetricValue}>{data.value}</div>
        )}
        <div className={styles.MetricLabel}>
          {data.label} {data.id === 'investment' ? '*' : ''}
        </div>
        <div></div>
      </div>
    </div>
  );
}

export default MetricCard;
