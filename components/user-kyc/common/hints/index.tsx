import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../../utils/string';
import Image from '../../../primitives/Image';
import styles from './Hints.module.css';

type HintsProps = {
  hints: string[];
  className?: string;
};

export default function Hints({ hints, className }: HintsProps) {
  return (
    <div
      className={`flex-column ${styles.HintContainer} ${handleExtraProps(
        className
      )}`}
    >
      <div className={`flex items-center ${styles.g8}`}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}commons/BulbIcon.svg`}
          alt="BulbIcon"
          layout={'fixed'}
          width={16}
          height={16}
        />
        <span className={styles.HintMainTitle}>Hints</span>
      </div>
      <ul className={`flex-column ${styles.g8}`}>
        {hints.map((hint) => {
          return (
            <li key={hint} className={`flex items-center ${styles.g8}`}>
              <span className={styles.Circle} />
              <span className={styles.HintTitle}>{hint}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
