import CustomSkeleton from '../../../primitives/CustomSkeleton/CustomSkeleton';
import classes from './PortfolioPerformanceSkeleton.module.css';

const PortfolioPerformanceSkeleton = () => {
  return (
    <div
      className={`flex justify-between items-center ${classes.flexWrapmobile}`}
    >
      <CustomSkeleton
        styles={{
          width: '35%',
          height: 275,
        }}
      />
      <CustomSkeleton
        styles={{
          width: '55%',
          height: 150,
        }}
      />
    </div>
  );
};

export default PortfolioPerformanceSkeleton;
