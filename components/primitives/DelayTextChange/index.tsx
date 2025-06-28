import { useState, useCallback, useEffect } from 'react';
import styles from './DelayTextChange.module.css';

type DelayTextChange = {
  dataArr: string[];
  seconds?: number;
};

export default function DelayTextChange({
  dataArr,
  seconds = 5,
}: DelayTextChange) {
  const [index, setIndex] = useState(0);

  /**
   * Note the use of useCallback here is to prevent useEffect from running on each render
   */
  const shuffle = useCallback(() => {
    setIndex((prevIndex) => {
      // reset index if current index is greater than array size
      return prevIndex + 1 < dataArr.length ? prevIndex + 1 : 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const intervalID = setInterval(shuffle, seconds * 1000);
    return () => clearInterval(intervalID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffle]);

  if (!dataArr.length) return null;

  return <span className={styles.text}>{dataArr[index]}</span>;
}
