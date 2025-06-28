import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

const MfCalculatorSkeleton = () => {
  return (
    <div className="flex-column" data-testid="mf-calculator-skeleton">
      <div
        style={{
          padding: '24px 24px 20px',
        }}
      >
        <div
          className="flex"
          style={{
            gap: 16,
          }}
        >
          <CustomSkeleton
            styles={{
              height: 32,
              flex: 1,
            }}
          />
          <CustomSkeleton
            styles={{
              height: 32,
              width: 130,
            }}
          />
        </div>
        <CustomSkeleton
          styles={{
            height: 65,
            width: '100%',
            marginTop: 16,
          }}
        />
        <div className="text-center">
          <CustomSkeleton
            styles={{
              height: 36,
              width: '100%',
              maxWidth: 220,
              margin: '25px auto 0 auto',
            }}
          />
        </div>

        <CustomSkeleton
          styles={{
            height: 54,
            width: '100%',
            marginTop: 32,
          }}
        />
        <CustomSkeleton
          styles={{
            height: 54,
            width: '100%',
            marginTop: 32,
          }}
        />
      </div>
    </div>
  );
};

export default MfCalculatorSkeleton;
