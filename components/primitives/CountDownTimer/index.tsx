import {
  CountdownProps,
  useCountdown,
} from '../../../utils/customHooks/useCountDown';
import styles from './CountDownTimer.module.css';

const getWrapperStyle = (size: number): React.CSSProperties => ({
  position: 'relative',
  width: size,
  height: size,
});

export default function CountDownTimer(props: CountdownProps) {
  const { children, strokeLinecap, trailColor, trailStrokeWidth } = props;

  const {
    path,
    pathLength,
    stroke,
    strokeDashoffset,
    remainingTime,
    elapsedTime,
    size,
    strokeWidth,
  } = useCountdown(props);

  return (
    <div style={getWrapperStyle(size)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={path}
          fill="none"
          stroke={trailColor ?? '#d9d9d9'}
          strokeWidth={trailStrokeWidth ?? strokeWidth}
        />
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeLinecap={strokeLinecap ?? 'round'}
          strokeWidth={strokeWidth}
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {typeof children === 'function' && (
        <div className={styles.timeStyle}>
          {children({ remainingTime, elapsedTime, color: stroke })}
        </div>
      )}
    </div>
  );
}
