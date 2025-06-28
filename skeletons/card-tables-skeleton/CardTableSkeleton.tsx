import React from 'react';
import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import styles from './CardTableSkeleton.module.css';

interface CardTableSkeletonProps {
  columns?: number;
  rows?: number;
}

const CardTableSkeleton: React.FC<CardTableSkeletonProps> = ({
  columns = 5,
  rows = 3,
}) => {
  const rowsArray = Array(rows).fill(0);
  const columnsArray = Array(columns).fill(0);

  return (
    <div className={styles.CardBody}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columnsArray.map((_, index) => (
              <th key={`header-${index}`}>
                <CustomSkeleton
                  styles={{
                    width: index === 0 ? 80 : 60,
                    height: 16,
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowsArray.map((_, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {columnsArray.map((_, colIndex) => (
                <td key={`cell-${rowIndex}-${colIndex}`}>
                  {colIndex === 0 ? (
                    <CustomSkeleton
                      styles={{
                        width: 80,
                        height: 20,
                      }}
                    />
                  ) : colIndex === 1 ? (
                    <CustomSkeleton
                      styles={{
                        width: 40,
                        height: 20,
                      }}
                    />
                  ) : colIndex === 2 ? (
                    <CustomSkeleton
                      styles={{
                        width: 50,
                        height: 20,
                      }}
                    />
                  ) : (
                    <div className="flex_wrapper gap-6">
                      <CustomSkeleton
                        styles={{
                          width: 70,
                          height: 20,
                        }}
                      />
                      <CustomSkeleton
                        styles={{
                          width: 16,
                          height: 16,
                        }}
                      />
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CardTableSkeleton;
