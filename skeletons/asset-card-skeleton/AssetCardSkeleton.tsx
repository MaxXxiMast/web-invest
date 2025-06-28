import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';

type Props = {
  width?: number | string;
  showHeader?: boolean;
  showFooter?: boolean;
};

const AssetCardSkeleton = ({
  width = 100,
  showHeader = true,
  showFooter = true,
}: Props) => {
  return (
    <div
      className="SkeletonCard"
      style={{
        width,
      }}
    >
      {showHeader ? (
        <CustomSkeleton
          styles={{
            width: '30%',
            height: 40,
          }}
        />
      ) : null}
      <CustomSkeleton
        styles={{
          width: '100%',
          height: 45,
          marginTop: 17,
        }}
      />
      <CustomSkeleton
        styles={{
          width: '100%',
          height: 140,
          marginTop: 17,
        }}
      />

      {showFooter ? (
        <CustomSkeleton
          styles={{
            width: '70%',
            height: 32,
            marginTop: 17,
          }}
        />
      ) : null}
    </div>
  );
};

export default AssetCardSkeleton;
