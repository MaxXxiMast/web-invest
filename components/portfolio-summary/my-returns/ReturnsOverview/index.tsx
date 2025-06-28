// Hooks
import { useAppSelector } from '../../../../redux/slices/hooks';

// Utils
import { numberToIndianCurrencyWithDecimals } from '../../../../utils/number';
import { handleExtraProps } from '../../../../utils/string';

// Types
import type { MyReturnsType } from '../ReturnsTable/types';

// Styles
import styles from './ReturnsOverview.module.css';

type ReturnsOverviewProps = {
  selectedType: MyReturnsType;
};

export default function ReturnsOverview({
  selectedType,
}: ReturnsOverviewProps) {
  const {
    returns: { totalReturns = 0, data = [] },
  } = useAppSelector((state) => state.portfolioSummary);

  const totalCount = data?.length || 0;

  const renderOverviewCell = (label = '', value = '', className = '') => {
    return (
      <div
        className={`flex-column ${
          styles.OverviewCellContainer
        } ${handleExtraProps(className)}`}
      >
        <span className={styles.TextStyle14}>{label}</span>
        <span>{value}</span>
      </div>
    );
  };

  const renderReturnsOverview = () => {
    return (
      <div
        className={`flex justify-between  ${
          styles.OverviewContainer
        } ${handleExtraProps(selectedType)}`}
      >
        {renderOverviewCell('# of returns', `${totalCount}`)}
        {renderOverviewCell(
          'Total Returns',
          numberToIndianCurrencyWithDecimals(totalReturns),
          styles.TotalReturns
        )}
      </div>
    );
  };
  return renderReturnsOverview();
}
