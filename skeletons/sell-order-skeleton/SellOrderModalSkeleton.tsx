import React from 'react';
import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import styles from './SellOrderModalSkeleton.module.css';

const SellOrderModalSkeleton: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <CustomSkeleton
          styles={{
            width: 200,
            height: 28,
          }}
        />
      </div>
      <div className={`flex items-center justify-between ${styles.assetInfo}`}>
        <CustomSkeleton
          styles={{
            width: 100,
            height: 43,
          }}
        />

        <div
          className={`flex direction-column items-center justify-center ${styles.detailRow}`}
        >
          <CustomSkeleton
            styles={{
              width: 80,
              height: 16,
              margin: '0 0 8px 0',
            }}
          />
          <CustomSkeleton
            styles={{
              width: 40,
              height: 20,
            }}
          />
        </div>
        <div
          className={`flex direction-column items-end justify-center ${styles.detailRow}`}
        >
          <CustomSkeleton
            styles={{
              width: 120,
              height: 16,
              margin: '0 0 8px 0',
            }}
          />
          <div className="flex items-center">
            <CustomSkeleton
              styles={{
                width: 40,
                height: 20,
                margin: '0 8px 0 0',
              }}
            />
            <CustomSkeleton
              styles={{
                width: 16,
                height: 16,
                borderRadius: '50%',
              }}
            />
          </div>
        </div>
      </div>
      <div className={`flex items-center justify-between ${styles.maturity}`}>
        <CustomSkeleton
          styles={{
            width: 130,
            height: 18,
          }}
        />
        <CustomSkeleton
          styles={{
            width: 100,
            height: 18,
          }}
        />
      </div>

      <div className={`flex-column ${styles.inputSection}`}>
        <CustomSkeleton
          styles={{
            width: '100%',
            height: 56,
          }}
        />
      </div>

      <CustomSkeleton
        styles={{
          width: '100%',
          height: 48,
          margin: '24px 0',
        }}
      />

      <div className={styles.terms}>
        <CustomSkeleton
          styles={{
            width: '90%',
            height: 16,
            margin: 'auto',
          }}
        />
      </div>
    </div>
  );
};

export default SellOrderModalSkeleton;
