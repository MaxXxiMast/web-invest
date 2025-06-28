import { numberToCurrency } from '../../../utils/number';
import styles from './MfCalculatorChips.module.css';

type Props = {
  chipArr: number[];
  selectedChip: number;
  handleChipClick?: (value: number) => void;
  popularChipIndex?: number;
};

const MfCalculatorChips = ({
  chipArr = [],
  selectedChip,
  handleChipClick,
  popularChipIndex = 1,
}: Props) => {
  if (chipArr.length === 0) {
    return null;
  }
  return (
    <div className={`flex ${styles.AmountCloud}`} id="CalculatorChips">
      {chipArr.map((value, index) => {
        const isSelected = Number(selectedChip) === Number(value);
        return (
          <span
            key={value}
            onClick={() => {
              handleChipClick(value);
            }}
            className={`${styles.AmountCloudItem} ${
              isSelected ? styles.selectedChip : ''
            }`}
            data-testid={`₹${value}`}
          >
            {`₹${numberToCurrency(value)}`}
            {index === popularChipIndex && (
              <p className={styles.popularTag}>Popular</p>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default MfCalculatorChips;
