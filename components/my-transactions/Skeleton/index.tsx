import React from 'react';

// components
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// styles
import styles from './MyTransactions.module.css';

const Skeleton = ({ isMobile = false }) => {
  const renderSkeleton = () => {
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
      data-testid="MyTransactionsSkeleton"
    >
      {renderSkeleton()}
    </div>
  );
};

export default Skeleton;
