import { numberToCurrency } from '../../../utils/number';
import styles from './RenderSuggestionAmount.module.css';

type Props = {
  suggestionList: any;
  onClick: (val: string | number) => void;
  showFixedSuggestion?: boolean;
};

const RenderSuggestionAmount = (props: Props) => {
  const handleChipLabels = (val: string | number, index: number) => {
    if (props.showFixedSuggestion) {
      return `₹ ${numberToCurrency(val)} ${index === 0 ? '(min)' : ''}`;
    }
    return `+₹ ${numberToCurrency(val)}`;
  };

  return (
    <div className={styles.AmountCloud}>
      {/* Made fallback to empty list if suggestionList is undefined or null */}
      {(props.suggestionList ?? []).map((val: string | number, index: number) => (
        <span
          data-testid="suggestion-span"
          id={`${index}`}
          key={`${val}`}
          className={styles.CloudItem}
          onClick={() => props.onClick(val)}
        >
          {handleChipLabels(val, index)}
        </span>
      ))}
    </div>
  );
};

export default RenderSuggestionAmount;
