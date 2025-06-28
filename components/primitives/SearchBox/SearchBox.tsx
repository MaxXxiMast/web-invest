import React, { useState } from 'react';
import InputFieldSet from '../../common/inputFieldSet';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import Image from 'next/image';

import styles from './SearchBox.module.css';

type Props = {
  className?: string;
  showIcon?: boolean;
  handleInputChange?: (event: any, err?: boolean) => void;
  value: string;
  placeHolder?: string;
};

const SearchBox = ({
  className = '',
  showIcon = true,
  handleInputChange = () => {},
  value = '',
  placeHolder = 'Search by partner',
}: Props) => {
  const [error, setError] = useState(false);
  const [focus, setFocus] = useState(false);
  const focusedBorder = `1px solid ${
    error
      ? 'var(--gripRed, #fb5a4b)'
      : focus
      ? '#00367C'
      : 'var(--gripMercuryThree, #e6e6e6)'
  }`;

  const clearSearch = () => {
    handleInputChange('');
  };
  const getClearSearchIcon = () => {
    return value ? (
      <Image
        className={styles.ClearSearch}
        onClick={clearSearch}
        alt="clear"
        src={`${GRIP_INVEST_BUCKET_URL}icons/close-circle-red.svg`}
        layout='intrinsic'
        width={16}
        height={16}
      />
    ) : null;
  };

  //Allow only alphanumeric characters for search
  const sanitizeInputChange = (inputValue: string, error: boolean) => {
    if (/[^a-zA-Z0-9 ]/.test(inputValue)) {
      handleInputChange(value, error);
    } else {
      handleInputChange(inputValue, error);
    }
  };

  return (
    <div
      style={{ border: focusedBorder }}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      className={`${styles.SearchBox} ${className}`}
    >
      {showIcon ? (
        <span
          className={`icon-search ${styles.SearchIcon}`}
          data-testid="search-icon"
        />
      ) : null}
      <InputFieldSet
        type=""
        value={value}
        setError={setError}
        placeHolder={placeHolder}
        onChange={(e) => {
          sanitizeInputChange(e.target.value, error);
        }}
      />
      {getClearSearchIcon()}
    </div>
  );
};

export default SearchBox;
