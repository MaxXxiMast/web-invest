import Skeleton from '@mui/material/Skeleton';
import styles from './Skeleton.module.css';

const LoadingComponent = () => {
  const renderHeaderSkeleton = () => {
    return (
      <div
        className={`${styles.Header} flex justify-between items-center ${styles.HideMobile}`}
      >
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton width={20} height={20} variant="rounded" />
      </div>
    );
  };

  const renderMobileStepperSkeleton = () => {
    return (
      <div className={`flex-column ${styles.Header} ${styles.HideDesktop}`}>
        <div className={`flex justify-between items-center`}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton width={20} height={20} variant="rounded" />
        </div>
        <Skeleton
          variant="text"
          height={62}
          className={`${styles.HideDesktop}`}
        />
      </div>
    );
  };

  const renderBodySkeleton = () => {
    return (
      <div className={`flex ${styles.Body}`}>
        <div className={`${styles.Sidebar} ${styles.HideMobile}`}>
          <Skeleton variant="rectangular" width={160} height={360} />
        </div>
        <div className={`flex-column ${styles.RightBody}`}>
          <Skeleton variant="text" height={56} />
          <Skeleton variant="text" height={56} />
          <Skeleton variant="text" height={56} />
        </div>
      </div>
    );
  };

  const renderLayoutSkeleton = () => {
    return [
      renderHeaderSkeleton(),
      renderMobileStepperSkeleton(),
      renderBodySkeleton(),
    ];
  };

  return (
    <div className={styles.Layout}>
      <div className="containerNew">
        <div className={`flex-column ${styles.Wrapper}`}>
          {renderLayoutSkeleton()}
        </div>
      </div>
    </div>
  );
};

export default LoadingComponent;
