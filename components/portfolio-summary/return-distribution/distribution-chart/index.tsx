// Utils
import { DataChartFormatPayload, formatDataForPieChart } from '../utils';
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';

//Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

// Componentns
import PieChart from '../../common/PieChart';

//Styles
import styles from './DistributionChart.module.css';

const DistributionChart = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const returnDistribution = useAppSelector(
    (state) => state.portfolioSummary?.returnDistribution?.interestBrackets
  );

  return (
    <PieChart
      pieChartId="return-distribution"
      data={formatDataForPieChart(returnDistribution as DataChartFormatPayload)}
      className={`justify-start ${styles.chart}`}
      style={
        isMobile
          ? { width: '150px', height: '150px' }
          : { width: '225px', height: '225px' }
      }
    />
  );
};

export default DistributionChart;
