import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import classes from './LedgerTableSkeleton.module.css';

function LedgerTableSkeleton() {
  return (
    <>
      {/* MOBILE SKELETON */}
      <div className={`flex-column width100 ${classes.hideInDesktop}`}>
        {[...Array(5)].map((el, index) => (
          <div
            key={`skeleton_${index}_${Date.now()}`}
            className={`flex width100 justify-between ${classes.mb_30}`}
          >
            <div className="flex width100">
              <CustomSkeleton
                className={classes.circularSkeleton}
                styles={{
                  width: 33,
                  height: 33,
                }}
              />

              <div>
                <CustomSkeleton
                  className={classes.mb_6}
                  styles={{
                    width: 220,
                    height: 38,
                  }}
                />
                <CustomSkeleton
                  styles={{
                    width: 172,
                    height: 19,
                  }}
                />
              </div>
            </div>
            <div
              className="flex items-center"
              style={{
                width: 'max-content',
                height: '100%',
              }}
            >
              <CustomSkeleton
                styles={{
                  width: 45,
                  height: 19,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP SKELETON */}
      <div
        className={`flex-column width100  justify-between  ${classes.hideInMobile}`}
        style={{
          height: 350,
        }}
      >
        {[...Array(5)].map((el, index) => (
          <div
            key={`skeleton_${index}_${Date.now()}`}
            className={`flex width100 justify-between `}
          >
            <CustomSkeleton
              className={classes.circularSkeleton}
              styles={{
                width: 100,
                height: 40,
              }}
            />
            <div>
              <CustomSkeleton
                className={classes.mb_6}
                styles={{
                  width: 399,
                  height: 19,
                }}
              />
              <CustomSkeleton
                styles={{
                  width: 172,
                  height: 19,
                }}
              />
            </div>
            <div
              className={`flex justify-end items-end width100`}
              style={{
                height: '100%',
              }}
            >
              <CustomSkeleton
                styles={{
                  width: 56,
                  height: 23,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default LedgerTableSkeleton;
