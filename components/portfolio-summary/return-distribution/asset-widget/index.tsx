import { useState } from 'react';

// COMPONENTS
import Button from '../../../primitives/Button';
import AssetSlider from '../../asset-slider/component';

// STYLES
import styles from './AssetWidget.module.css';

const AssetWidget = () => {
  const [showAssetSlider, setShowAssetSlider] = useState(false);
  const [assetSuggestion, setAssetSuggestion] = useState('');
  const closeAssetSlider = () => {
    setShowAssetSlider(false);
  };

  return (
    <>
      {assetSuggestion === '' ? null : (
        <Button
          onClick={() => setShowAssetSlider(true)}
          className={styles.assetSliderButton}
        >
          {`Show me deals with ${assetSuggestion} returns`}
        </Button>
      )}
      <div className={styles.assetDrawerContainer}>
        <AssetSlider
          showFlyer={showAssetSlider}
          closeFlyer={closeAssetSlider}
          setAssetSuggestion={setAssetSuggestion}
        />
      </div>
    </>
  );
};

export default AssetWidget;
