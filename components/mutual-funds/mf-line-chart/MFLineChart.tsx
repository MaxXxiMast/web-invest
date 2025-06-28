import { useEffect, useState } from 'react';

//Components
import LineChart from '../../portfolio-summary/common/LineChart/LineChart';

//Utils
import { getDateRangeFromFilter } from './utils';
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import {
  getFilterYrs,
  getPercentageIncrease,
  handleToFixed,
} from '../utils/utils';

//API
import { fetchNavData } from '../../../api/mf';

//Redux
import { setMfData } from '../redux/mf';

//Styles
import styles from './MFLineChart.module.css';

const MFLineChart = ({ assetDescription = '' }) => {
  const dispatch = useAppDispatch();
  const filters = ['1M', '6M', '1Y', '3Y', '5Y', 'MAX'];
  const [activeFilter, setActiveFilter] = useState('1Y');
  const [returnPercentage, setReturnPercentage] = useState(0);
  const [chartData, setChartData] = useState([]);
  const selectedTenure = useAppSelector(
    (state) => state.mfConfig.selectedTenure
  );

  const asset = useAppSelector((state) => state.assets.selectedAsset);

  const fetchChartData = async (filter: string) => {
    const { startDate, endDate } = getDateRangeFromFilter(filter);
    const res = await fetchNavData(asset?.securityID, startDate, endDate);
    const data = res?.map((d) => ({
      xData: d?.['date'],
      yData: d?.['nav'],
    }));
    const percentage = getPercentageIncrease(
      data[0]?.yData,
      data[data.length - 1]?.yData
    );
    const selectedTenure =
      filter !== 'MAX'
        ? filter
        : getFilterYrs(data[0]?.xData, data[data.length - 1]?.xData);
    dispatch(setMfData({ returnPercentage: percentage }));
    dispatch(setMfData({ selectedTenure }));
    setReturnPercentage(percentage);
    setChartData(data);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    fetchChartData(filter);
  };

  useEffect(() => {
    fetchChartData(activeFilter);
  }, []); // Empty dependency array ensures this runs only once

  const renderInterest = () => (
    <div className={styles.annualInfoContainer}>
      {assetDescription ? (
        <div className={styles.desc}> {assetDescription}</div>
      ) : null}
      <div>
        <div
          className={`${styles.annualInterest} ${
            returnPercentage < 0 ? styles.red : ''
          }`}
        >
          {handleToFixed(Number(returnPercentage))}%
        </div>
        <div className={styles.annualText}>{selectedTenure} Annualised</div>
      </div>
    </div>
  );

  const renderLinechart = () => {
    return <LineChart data={chartData} isNegative={returnPercentage < 0} />;
  };

  return (
    <div className={`flex-column ${styles.container}`}>
      {renderInterest()}
      {renderLinechart()}
      <div className={`flex_wrapper gap-4 ${styles.filterContainer}`}>
        {filters.map((filter) => (
          <span
            key={filter}
            className={filter === activeFilter ? styles.active : ''}
            onClick={() => handleFilter(filter)}
          >
            {filter}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MFLineChart;
