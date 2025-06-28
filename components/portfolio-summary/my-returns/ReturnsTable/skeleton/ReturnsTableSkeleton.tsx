import React from 'react';
import CustomSkeleton from '../../../../primitives/CustomSkeleton/CustomSkeleton';
import { handleExtraProps } from '../../../../../utils/string';

type ReturnsTableSkeletonProps = {
  className?: string;
};

function ReturnsTableSkeleton({ className }: ReturnsTableSkeletonProps) {
  const renderCards = (count: number) => (
    <div className="flex-column justify-between">
      {Array(count).fill(
        <CustomSkeleton
          styles={{
            width: '100%',
            height: 90,
            margin: '2px 0',
          }}
        />
      )}
    </div>
  );

  return (
    <div className={`flex-column gap-6 ${handleExtraProps(className)}`}>
      <CustomSkeleton
        styles={{
          margin: '0 0 10px 0',
          height: 0,
        }}
      />
      {renderCards(6)}
    </div>
  );
}

export default ReturnsTableSkeleton;
