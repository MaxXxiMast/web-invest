import { useEffect, useState } from 'react';
import ProgressBar from '../../../primitives/ProgressBar/ProgressBar';
import styles from './AOFLoader.module.css';

type AOFProgressBarProps = { isOpen: boolean };

export default function AOFProgressBar({ isOpen }: AOFProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [timer, setNewTime] = useState(5);

  let timeoutId: number | null = null;

  const handleTimer = () => {
    if (timer >= 2) {
      setNewTime((time) => time - 1);
      setProgress((prevProgress) =>
        prevProgress > 100 ? 1000 : prevProgress + 20
      );
    }
    if (timer === 0) {
      clearInterval(timeoutId as any);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line
      (timeoutId as any) = setInterval(handleTimer, 1000);
    }
    return () => clearInterval(timeoutId as any);
  }, [timer]);

  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [isOpen]);

  return (
    <ProgressBar
      barHeight={10}
      progressWidth={progress}
      className={styles.AOFProgressBar}
    />
  );
}
