import CircularProgress from '@mui/material/CircularProgress';
import styles from './CircularProgressLoader.module.css';

type CircularProgressLoaderProps = {
  size?: number;
  thickness?: number;
};

export default function CircularProgressLoader({
  size = 40,
  thickness = 6,
}: CircularProgressLoaderProps) {
  return (
    <div className={styles.circularProgressContainer}>
      <CircularProgress
        variant="determinate"
        size={size}
        thickness={thickness}
        value={100}
        className={styles.circularProgressDeterminate}
      />
      <CircularProgress
        variant="indeterminate"
        size={size}
        thickness={thickness}
        disableShrink
        className={styles.circularProgressInDeterminate}
        classes={{
          circle: styles.circularProgressInDeterminateCircle,
        }}
      />
    </div>
  );
}
