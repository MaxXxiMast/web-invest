import dynamic from 'next/dynamic';
import { handleExtraProps } from '../../utils/string';
import styles from './NumberAnimator.module.css';

const FlipNumbers = dynamic(() => import('react-flip-numbers'), {
  ssr: false,
});

/**
 * This function is used to handle the string values
 * and convert them into number
 * @param value
 * @returns
 */

const handleStringValues = (value: string | number) => {
  const givenValue = String(value);
  if (givenValue) {
    return Number(givenValue.replace(/[^\d.]/g, ''));
  }
  return 0;
};

type Props = {
  numValue: number | string;
  prefixIcon?: string;
  numberWidth?: number;
  numberHeight?: number;
  includeComma?: boolean;
  wrapperClassName?: string;
  className?: string;
  locale?: string;
  roundOff?: number;
  color?: string;
  duration?: number;
};

const NumberAnimation = ({
  numValue,
  prefixIcon = '₹',
  wrapperClassName = '',
  locale = 'en-IN',
  roundOff = 2,
  numberWidth = 13,
  numberHeight = 20,
  duration = 0.5,
  color = 'var(--gripLuminousDark,#282c3f)',
}: Props) => {
  if (Number.isNaN(numValue) || numValue === null || numValue === undefined) {
    return null;
  }

  const value = Number(handleStringValues(numValue).toFixed(roundOff));
  if (value === null) return null;

  const formattedValue = value.toLocaleString(locale, {
    minimumFractionDigits: roundOff,
    maximumFractionDigits: roundOff,
  });

  return (
    <span
      className={`${styles.Animator} ${handleExtraProps(wrapperClassName)}`}
    >
      <span>{prefixIcon}</span>
      <FlipNumbers
        width={numberWidth}
        height={numberHeight}
        color={color}
        play
        numbers={formattedValue}
        numberClassName={styles.Numbers}
        numberStyle={{
          fontSize: 'inherit',
        }}
        duration={duration}
      />
    </span>
  );
};

export default NumberAnimation;
