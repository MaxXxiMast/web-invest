import { useState, useEffect } from 'react';
import { handleExtraProps } from '../../../../../utils/string';
import styles from './Timer.module.css';

interface TimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
  className?: string;
  isActive?: boolean;
}

const Timer = ({
  initialSeconds = 60,
  onComplete,
  className = '',
  isActive = true,
}: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete, isActive]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${styles.timerContainer} ${handleExtraProps(className)}`}>
      <p className={styles.timerText}>
        {`${`Fetching your details - `} ${formatTime(timeLeft)} left`}
      </p>
    </div>
  );
};

export default Timer;
