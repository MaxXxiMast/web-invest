import React from 'react';

// components
import CustomSkeleton from '../../../primitives/CustomSkeleton/CustomSkeleton';

// styles
import styles from './MyHoldings.module.css';

const Skeleton = ({
  isMobile = false,
  isFd = false,
  isHiddenProductType = false,
}) => {
  const renderSkeleton = () => {
    if (isFd) {
      return (
        <>
          {[1, 2, 3, 4].map((e) => (
            <CustomSkeleton
              key={`skeleton-${e}`}
              styles={{
                width: '100%',
                height: isMobile ? 400 : 200,
              }}
            />
          ))}
        </>
      );
    }
    if (isHiddenProductType)
      return (
        <div className={`flex-wrap gap-12`}>
          {[1, 2, 3, 4].map((e) => (
            <CustomSkeleton
              key={`skeleton-${e}`}
              styles={{
                width: isMobile ? '100%' : 'calc(50% - 6px)',
                height: isMobile ? 400 : 270,
              }}
            />
          ))}
        </div>
      );
    return (
      <>
        {!isMobile && (
          <CustomSkeleton
            styles={{
              width: '100%',
              height: 30,
            }}
          />
        )}
        {[1, 2, 3, 4].map((e) => (
          <CustomSkeleton
            key={`skeleton-${e}`}
            styles={{
              width: '100%',
              height: isMobile ? 150 : 100,
            }}
          />
        ))}
      </>
    );
  };

  return (
    <div
      className={`flex-column ${styles.skeleton}`}
      data-testid="MyHoldingsSkeleton"
    >
      {renderSkeleton()}
    </div>
  );
};

export default Skeleton;
