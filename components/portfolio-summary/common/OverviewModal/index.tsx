import GripLoading from '../../../layout/Loading';
import { useAppSelector } from '../../../../redux/slices/hooks';
import MaterialModalPopup from '../../../primitives/MaterialModalPopup';
import { OverviewBreakdownResponse } from '../../investment-overview/types';
import { getBreakDownData, getReturnBreakdown } from '../../utils';
import PieChart from '../PieChart';
import styles from './OverviewModal.module.css';

type OverviewModalProps = {
  selectedOveriew?: any;
  isVerticalLayout?: boolean;
  handleOverviewModal?: () => void;
  breakdownData: Partial<OverviewBreakdownResponse>;
  filterName?: any;
};

const OverviewModal = ({
  selectedOveriew = undefined,
  isVerticalLayout = false,
  handleOverviewModal = () => {},
  breakdownData = {},
  filterName,
}: OverviewModalProps) => {
  const { totalAmountInvested, selectedAssetType } = useAppSelector(
    (state) => state.portfolioSummary
  );

  const breakdownsCards = getBreakDownData(
    selectedOveriew?.type,
    breakdownData,

    selectedAssetType,
    totalAmountInvested
  );

  const renderOverviewModal = () => (
    <div>
      <h3 className={styles.title}>{selectedOveriew?.label}</h3>
      <div
        className={`${
          isVerticalLayout ? 'flex-column' : 'flex'
        } justify-start ${styles.infoModal}`}
      >
        <div className={styles.infoCards}>
          {breakdownsCards?.map((card, _idx) => (
            <div
              key={`overview_${card?.label}}`}
              className={`flex-column gap-6 ${styles.card}`}
            >
              <div className={styles.infoLabel}>
                <span>{card?.label}</span>
              </div>
              <div
                className={`${styles.infoValue} ${
                  card?.isAccent ? styles.accentValue : ''
                }`}
              >
                {`${card?.value}`}
              </div>
              {card?.sublabel ? (
                <div className={styles.infoSublabel}>{card?.sublabel}</div>
              ) : null}
            </div>
          ))}
        </div>
        {!isVerticalLayout ? <div className={styles.separator}></div> : null}
        <div className={`flex-column justify-center gap-6 ${styles.pieChart}`}>
          <div className={styles.piechartLabel}>
            <span>{`${selectedOveriew?.label} breakdown`}</span>
          </div>
          <PieChart
            pieChartId={'portfolio-Overview'}
            data={getReturnBreakdown(breakdownData?.returnBreakdown ?? [])}
            isVerticalLayout={isVerticalLayout}
            showAmount
            showPercent
          />
        </div>
      </div>
      {selectedAssetType === 'Bonds, SDIs & Baskets' ? (
        <p className={styles.NoteText}>
          {selectedOveriew?.label === 'Amount Invested' ||
          filterName === 'Active Deals'
            ? 'Note: Baskets are segmented based on their composition of Bonds and SDIs'
            : 'Note: Baskets are segmented based on their composition of Bonds and SDIs. Returns also include sale amount if unit(s) are sold.'}
        </p>
      ) : null}
    </div>
  );

  return (
    <MaterialModalPopup
      showModal={!!selectedOveriew}
      isModalDrawer={true}
      hideClose={false}
      handleModalClose={handleOverviewModal}
      className={styles.overviewModal}
    >
      {Object.keys(breakdownData).length === 0 ? (
        <GripLoading />
      ) : (
        <>{renderOverviewModal()}</>
      )}
    </MaterialModalPopup>
  );
};

export default OverviewModal;
