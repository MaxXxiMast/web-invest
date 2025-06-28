import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';
import classes from './AssetCalculatorSkeleton.module.css';

const AssetCalculatorSkeleton = () => {
  return (
    <div
      className={`"flex-column ${classes.SkeletonCard}`}
      data-testid="mf-calculator-skeleton"
    >
      <div
        className="flex"
        style={{
          gap: 16,
        }}
      >
        <CustomSkeleton
          styles={{
            height: 38,
            flex: 1,
          }}
        />
        <CustomSkeleton
          styles={{
            height: 38,
            width: 130,
          }}
        />
      </div>
      <CustomSkeleton
        styles={{
          height: 65,
          width: '100%',
          marginTop: 20,
        }}
      />
      <div className="text-center">
        <CustomSkeleton
          styles={{
            height: 28,
            width: '100%',
            maxWidth: 220,
            margin: '24px auto 0 auto',
          }}
        />
      </div>
      <CustomSkeleton
        styles={{
          height: 115,
          width: '100%',
          marginTop: 30,
        }}
      />
      <div className="text-center">
        <CustomSkeleton
          styles={{
            height: 18,
            width: '100%',
            margin: '32px auto 0 auto',
            maxWidth: 150,
          }}
        />
      </div>
      <CustomSkeleton
        styles={{
          height: 54,
          width: '100%',
          marginTop: 15,
          marginBottom: -45,
        }}
      />
    </div>
  );
};

export default AssetCalculatorSkeleton;
