import React from 'react';
import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import styles from './DealDetailsSkeleton.module.css';

const DealDetailsSkeleton: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className="flex-column gap-6">
        <CustomSkeleton
          styles={{
            width: 120,
            height: 24,
          }}
        />
        <CustomSkeleton
          styles={{
            width: 180,
            height: 24,
          }}
        />
        <CustomSkeleton
          styles={{
            width: 90,
            height: 24,
          }}
        />
      </div>

      <div className={styles.divider} />

      <div className="flex-column gap-6">
        <div className="flex items-center justify-between">
          <CustomSkeleton
            styles={{
              width: 100,
              height: 24,
            }}
          />
          <CustomSkeleton
            styles={{
              width: 80,
              height: 20,
            }}
            className={styles.downloadSkeleton}
          />
        </div>

        <div className="flex items-center justify-between">
          <CustomSkeleton
            styles={{
              width: 80,
              height: 24,
            }}
          />
          <CustomSkeleton
            styles={{
              width: 80,
              height: 20,
            }}
            className={styles.downloadSkeleton}
          />
        </div>
      </div>
    </div>
  );
};

export default DealDetailsSkeleton;
