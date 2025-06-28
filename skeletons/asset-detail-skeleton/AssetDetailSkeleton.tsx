import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import styles from './AssetDetailSkeleton.module.css';

const AssetDetailSkeleton = () => {
  return (
    <div className={`flex-column ${styles.flexWrapper}`}>
      <CustomSkeleton
        styles={{
          height: 200,
          width: '100%',
        }}
      />
      <div className="flex justify-between gap-12">
        <CustomSkeleton
          styles={{
            height: 250,
            width: '100%',
          }}
        />
        <CustomSkeleton
          styles={{
            height: 250,
            width: '100%',
          }}
        />
      </div>
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

export default AssetDetailSkeleton;
