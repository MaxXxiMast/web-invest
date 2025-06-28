//styles
import styles from './SortFilter.module.css';
import RadioGroupCustom from '../../../primitives/RadioGroup';

const SortFilter = ({ options = [], value, onChange = (value: any) => {} }) => {
  const handleOptionChange = (event) => {
    const value = event.target.value;
    onChange(value);
  };

  return (
    <RadioGroupCustom
      row={false}
      aria-label="assetFilter"
      name="assetFilter"
      options={options}
      value={value}
      classes={{ root: styles.radioGroup, radioRoot: styles.radioRoot }}
      handleChangeEvent={handleOptionChange}
      id="assetFilter"
    />
  );
};

export default SortFilter;
