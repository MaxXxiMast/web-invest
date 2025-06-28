//Utils
import { assetStatus, committedInvestment } from '../../../utils/asset';
import { toCurrecyStringWithDecimals } from '../../../utils/number';

//Styles
import styles from './AssetProgress.module.css';

const AssetProgress = ({ asset, isFD = false }) => {
  if (assetStatus(asset) !== 'active' || isFD) {
    return null;
  }

  const collectedAmount = toCurrecyStringWithDecimals(
    asset.collectedAmount || 0,
    1,
    true
  );

  return (
    <>
      <div className={styles.LeaseProgress}>
        <span
          style={{
            width: `${committedInvestment(asset)}%`,
          }}
        ></span>
      </div>
      <div className={styles.LeaseCompletion}>
        <p className={styles.LeaseCompletionFigure}>
          {collectedAmount?.split(' ')[0]} {collectedAmount?.split(' ')[1]} /
          <span>
            {' '}
            {toCurrecyStringWithDecimals(
              asset.totalAmount + asset.preTaxTotalAmount || 0,
              1,
              true
            )}
          </span>
        </p>

        <p className="text-right">
          <span>{committedInvestment(asset, true)}%</span>{' '}
          <span className={styles.CompletedText}>Completed</span>
        </p>
      </div>
    </>
  );
};

export default AssetProgress;
