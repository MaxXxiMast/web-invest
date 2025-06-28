import { useAppSelector } from '../../../redux/slices/hooks';
import CircularProgressLoader from '../../primitives/CircularProgressLoader';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// Styles
import styles from './ProcessingPaymentLayout.module.css';

type ProcessingPaymentLayoutProps = {
  title: string;
  subTitle: string;
};

export default function ProcessingPaymentLayout({
  title,
  subTitle,
}: ProcessingPaymentLayoutProps) {
  const gcDataDone = useAppSelector((state) => state.redirect.gcDataDone);
  const renderSkeleton = (
    <div
      className={`items-align-center-column-wise ${styles.SkeletonContainer}`}
    >
      <CustomSkeleton
        styles={{ width: 50, height: 50, borderRadius: 99999999 }}
      />
      <CustomSkeleton styles={{ width: 235, height: 24 }} />
      <CustomSkeleton styles={{ width: 290, height: 24 }} />
    </div>
  );

  const renderLoader = (
    <div className={`items-align-center-column-wise ${styles.MainContainer}`}>
      <CircularProgressLoader />

      <span className={styles.processingHeader}>{title}</span>

      <span className={styles.processingText}>{subTitle}</span>
    </div>
  );

  return (
    <div className={`items-align-center-row-wise ${styles.container}`}>
      <div className="containerNew">
        {gcDataDone ? renderLoader : renderSkeleton}
      </div>
    </div>
  );
}
