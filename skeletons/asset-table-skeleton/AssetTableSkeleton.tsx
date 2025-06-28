import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';

type Props = {
  isMobileDevice?: boolean;
};

const AssetTableSkeleton = ({ isMobileDevice = false }: Props) => {
  const tableColItem = (index: number) => {
    const renderWidth = () => {
      if (index === 1 || index === 3) {
        return '15%';
      }
      if (index === 4) {
        return '25%';
      }
      return '10%';
    };
    return (
      <div
        className={`flex-column`}
        style={{
          gap: isMobileDevice ? 25 : 45,
          width: renderWidth(),
        }}
        key={`past-deal-${index}`}
      >
        <CustomSkeleton
          styles={{
            height: 21,
            width: `${index === 3 || index === 4 ? '60%' : '100%'}`,
          }}
        />
        {Array.from(Array(5), (e, i) => {
          return (
            <CustomSkeleton
              styles={{
                height: 34,
                width: '100%',
              }}
              key={`skeleton_${i}`}
            />
          );
        })}
      </div>
    );
  };

  if (isMobileDevice) {
    return (
      <div className={`flex justify-between `}>
        {Array.from(Array(5), (e, i) => {
          return tableColItem(i);
        })}
      </div>
    );
  }
  return (
    <>
      <div className="SkeletonCard">
        <div className={`flex justify-between`}>
          {Array.from(Array(5), (e, i) => {
            return tableColItem(i);
          })}
        </div>
      </div>
      <div
        className={`flex justify-end`}
        style={{
          marginTop: 30,
        }}
      >
        <CustomSkeleton
          styles={{
            width: '40%',
            height: 43,
          }}
        />
      </div>
    </>
  );
};

export default AssetTableSkeleton;
