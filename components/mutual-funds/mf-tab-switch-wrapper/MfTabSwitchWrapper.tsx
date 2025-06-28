import React from 'react';
import { useDispatch } from 'react-redux';

// Components
import TabSwitch from '../../primitives/TabSwitch/TabSwitch';

// Utils
import { tabArr } from './utils';
import { TenureType } from '../utils/types';

// Redux
import { useAppSelector } from '../../../redux/slices/hooks';
import { setMfData } from '../redux/mf';

const MfTabSwitchWrapper = React.memo(() => {
  const dispatch = useDispatch();
  const { tenureType = 'oneTime' }: { tenureType: TenureType } = useAppSelector(
    (state) => (state as any)?.mfConfig ?? {}
  );

  const handleTabChange = (tab: TenureType) => {
    dispatch(
      setMfData({
        tenureType: tab,
      })
    );
  };

  return (
    <TabSwitch
      activeTab={tenureType}
      setActiveTab={handleTabChange}
      tabs={tabArr}
    />
  );
});

MfTabSwitchWrapper.displayName = 'MfCalculatorChipsWrapper';

export default MfTabSwitchWrapper;
