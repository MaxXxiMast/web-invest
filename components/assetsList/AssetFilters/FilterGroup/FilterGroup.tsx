//components
import { useEffect, useRef, useState } from 'react';
import TooltipCompoent from '../../../primitives/TooltipCompoent/TooltipCompoent';

//styles
import styles from './FilterGroup.module.css';

const FilterGroup = ({
  label = '',
  tooltipContent = '',
  options = [],
  value = [],
  onChange = (value: any) => {},
  showModal = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const handleOptionChange = (optionValue) => {
    const updatedSelection = value?.includes(optionValue)
      ? value.filter((value) => value !== optionValue)
      : [...value, optionValue];

    onChange(updatedSelection);
  };
  const checkOverflow = () => {
    const el = scrollRef.current;
    if (!el) return;

    const isOverflowing = el.scrollWidth > el.clientWidth;
    const atLeft = el.scrollLeft === 0;
    const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    setShowLeft(isOverflowing && !atLeft);
    setShowRight(isOverflowing && !atRight);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkOverflow();

    el.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);

    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

  return (
    <div className={`flex items-center ${styles.filterContainer}`}>
      <p className={styles.filterLabel}>
        {label}{' '}
      </p>
      <div className={styles.scrollContainer}>
        {showLeft && <div className={styles.leftGradient} />}

        <div className={styles.optionsContainer} ref={scrollRef}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionChange(option.value)}
              className={` flex items-center justify-center gap-6
              ${styles.option} ${
                value?.includes(option.value) ? styles.selectedOption : ''
              }`}
            >
              {value?.includes(option.value) ? (
                <span className="icon-tick"></span>
              ) : null}
              {option.label}
            </div>
          ))}
        </div>
        {showRight && <div className={styles.rightGradient} />}
      </div>{' '}
    </div>
  );
};

export default FilterGroup;
