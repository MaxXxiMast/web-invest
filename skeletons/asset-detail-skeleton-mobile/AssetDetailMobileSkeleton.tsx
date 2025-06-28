import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import styles from './AssetDetailSkeletonMobile.module.css';

const AssetDetailMobileSkeleton = ({ isDefault = false }) => {
  const assetCardSkeleton = () => {
    if (isDefault)
      return (
        <div className={`flex-column ${styles.container}`}>
          <div className={`flex justify-between `}>
            <CustomSkeleton
              styles={{
                height: 65,
                width: '40%',
              }}
            />
            <CustomSkeleton
              styles={{
                height: 65,
                width: '40%',
              }}
            />
          </div>
          <div className={`flex justify-between gap-2`}>
            <CustomSkeleton
              styles={{
                height: 30,
                width: 120,
              }}
            />
            <CustomSkeleton
              styles={{
                height: 30,
                width: 120,
              }}
            />
          </div>
          <div className={`flex justify-between gap-2`}>
            <CustomSkeleton
              styles={{
                height: 30,
                width: 120,
              }}
            />
            <CustomSkeleton
              styles={{
                height: 30,
                width: 120,
              }}
            />
          </div>
          <CustomSkeleton
            styles={{
              height: 40,
              width: '100%',
            }}
          />
          <CustomSkeleton
            styles={{
              height: 20,
              width: '100%',
            }}
          />
        </div>
      );
    return (
      <div className={`flex-column ${styles.container}`}>
        <div className={`flex justify-between`}>
          <CustomSkeleton
            styles={{
              height: 30,
              width: 130,
            }}
          />
          <CustomSkeleton
            styles={{
              height: 30,
              width: 130,
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-8">
          <CustomSkeleton
            styles={{
              height: 45,
              width: 100,
            }}
          />
          <CustomSkeleton
            styles={{
              height: 65,
              width: 120,
            }}
          />
          <CustomSkeleton
            styles={{
              height: 45,
              width: 100,
            }}
          />
        </div>
        <CustomSkeleton
          styles={{
            height: 55,
            width: '100%',
          }}
        />
        <CustomSkeleton
          styles={{
            height: 150,
            width: '100%',
          }}
        />
        <CustomSkeleton
          styles={{
            height: 200,
            width: '100%',
          }}
        />
        <CustomSkeleton
          className="mt-12"
          styles={{
            height: 80,
            width: '100%',
          }}
        />
        <div className="flex justify-center items-center gap-4">
          <CustomSkeleton
            styles={{
              height: 25,
              width: 80,
            }}
          />
          <CustomSkeleton
            styles={{
              height: 25,
              width: 80,
            }}
          />
          <CustomSkeleton
            styles={{
              height: 25,
              width: 80,
            }}
          />
        </div>
        <div className="flex justify-center">
          <CustomSkeleton
            styles={{
              height: 25,
              width: 140,
            }}
          />
        </div>
        <div className="flex justify-center items-center gap-4">
          <CustomSkeleton
            styles={{
              height: 30,
              width: 80,
            }}
          />
          <CustomSkeleton
            styles={{
              height: 30,
              width: 80,
            }}
          />
          <CustomSkeleton
            styles={{
              height: 30,
              width: 80,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`flex-column items-center ${styles.flexWrapper}`}>
      {assetCardSkeleton()}
      <CustomSkeleton
        styles={{
          height: 260,
          width: '100%',
        }}
      />
      <CustomSkeleton
        styles={{
          height: 200,
          width: '100%',
        }}
      />
      <CustomSkeleton
        styles={{
          height: 200,
          width: '100%',
        }}
      />
      <CustomSkeleton
        className="mt-12"
        styles={{
          height: 80,
          width: '100%',
        }}
      />
    </div>
  );
};

export default AssetDetailMobileSkeleton;
