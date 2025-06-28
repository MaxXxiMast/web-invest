import React from 'react';

// components
import RiskRange from './risk-range';
import DistributionChart from './distribution-chart';
import AssetWidget from './asset-widget';

// css

const ReturnDistribution = () => {
  return (
    <div className="items-align-center-column-wise">
      <div className="width100">
        <DistributionChart />
      </div>
      <RiskRange />
      <AssetWidget />
    </div>
  );
};

export default React.memo(ReturnDistribution);
