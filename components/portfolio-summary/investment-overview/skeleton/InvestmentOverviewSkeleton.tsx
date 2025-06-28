import React from 'react';
import CustomSkeleton from '../../../primitives/CustomSkeleton/CustomSkeleton';

const InvestmentOverviewSkeleton = ({ isMobile = false }) => {
  const renderCards = (count: number) => (
    <div className="flex justify-between gap-6">
      {Array(count).fill(
        <CustomSkeleton
          styles={{
            width: '100%',
            height: 90,
            margin: '8px 0',
          }}
        />
      )}
    </div>
  );
  return (
    <div className="gap-12">
      <div className="flex justify-between items-center">
        <CustomSkeleton
          styles={{
            width: 180,
            height: 30,
            margin: '0px  0 24px',
          }}
        />
        <CustomSkeleton
          styles={{
            width: 80,
            height: 30,
            margin: '0px  0 24px',
          }}
        />
      </div>
      {isMobile ? (
        <>
          {renderCards(2)} {renderCards(2)}
        </>
      ) : (
        <>{renderCards(4)}</>
      )}
      <CustomSkeleton
        styles={{
          height: 0,
          margin: 10,
        }}
      />
    </div>
  );
};

export default InvestmentOverviewSkeleton;
