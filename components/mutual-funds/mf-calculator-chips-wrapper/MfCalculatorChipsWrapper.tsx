import { useDispatch } from 'react-redux';
import React from 'react';

import { setMfData } from '../redux/mf';
import { useAppSelector } from '../../../redux/slices/hooks';
import MfCalculatorChips from '../mf-calculator-chips/MfCalculatorChips';

const MfCalculatorChipsWrapper = React.memo(() => {
  const dispatch = useDispatch();
  const { inputValue = 0 } = useAppSelector(
    (state) => (state as any)?.mfConfig ?? {}
  );

  const handleChipClick = (val: number) => {
    dispatch(
      setMfData({
        inputValue: val,
      })
    );
  };

  return (
    <MfCalculatorChips
      chipArr={[100000, 150000, 200000]}
      selectedChip={inputValue}
      handleChipClick={(val) => handleChipClick(val)}
    />
  );
});

MfCalculatorChipsWrapper.displayName = 'MfCalculatorChipsWrapper';

export default MfCalculatorChipsWrapper;
