import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import classes from './InvestmentSuccessSkeleton.module.css';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';

function InvestmentSuccessSkeleton() {
  const isMobileDevice = useMediaQuery('(max-width: 992px)');
  return (
    <div className={classes.container}>
      <div
        className={`flex width100 justify-center ${classes.headerContainer}`}
      >
        <div
          className={`flex width100 items-center ${classes.header}`}
          style={{
            height: 164,
          }}
        >
          <CustomSkeleton
            className={classes.circularSkeleton}
            styles={{
              width: 80,
              height: 80,
            }}
          />
          <div>
            <CustomSkeleton
              className={classes.mb_10}
              styles={{
                width: isMobileDevice ? 166 : 292,
                height: 36,
              }}
            />
            <CustomSkeleton
              styles={{
                width: isMobileDevice ? 200 : 292,
                height: 24,
              }}
            />
          </div>
        </div>
      </div>
      <div className={classes.invesmentDetails}>
        <div className={classes.invesmentDetailsContainer}>
          <div className={`flex width100 justify-center ${classes.mb_10}`}>
            <CustomSkeleton
              styles={{
                width: 202,
                height: 56,
              }}
            />
          </div>

          <div className={`flex width100 justify-between ${classes.mb_10}`}>
            {[...Array(2)].map((el, index) => (
              <div
                className={`flex-column`}
                style={{
                  width: '45%',
                }}
                key={`skeleton_${index}_${Date.now()}`}
              >
                <CustomSkeleton
                  className={classes.mb_10}
                  styles={{
                    width: isMobileDevice ? '100%' : 165,
                    height: 52,
                  }}
                />
                <CustomSkeleton
                  styles={{
                    width: isMobileDevice ? '100%' : 165,
                    height: 25,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={classes.stepsContainer}>
        {!isMobileDevice ? (
          <>
            <CustomSkeleton
              className={classes.mb_20}
              styles={{
                width: 144,
                height: 30,
              }}
            />
            <div className={classes.stepsBox}>
              <div className={`flex width100 items-center`}>
                <CustomSkeleton
                  className={classes.circularSkeleton}
                  styles={{
                    width: 50,
                    height: 50,
                  }}
                />
                <div>
                  <CustomSkeleton
                    className={classes.mb_10}
                    styles={{
                      width: 292,
                      height: 30,
                    }}
                  />
                  <CustomSkeleton
                    className={classes.mb_10}
                    styles={{
                      width: 292,
                      height: 30,
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : null}

        <CustomSkeleton
          className={`${classes.mb_20} ${classes.mt_40}`}
          styles={{
            width: 292,
            height: 36,
          }}
        />
        <div
          className={`flex width100 justify-between ${classes.referBox}`}
          style={{
            width: 360,
            height: 128,
          }}
        >
          <div>
            <CustomSkeleton
              className={classes.mb_20}
              styles={{
                width: 201,
                height: 30,
              }}
            />
            <CustomSkeleton
              className={classes.mb_20}
              styles={{
                width: 201,
                height: 24,
              }}
            />
          </div>
          <div
            className={`flex width100 items-end`}
            style={{
              width: 'max-content',
              height: '100%',
            }}
          >
            <CustomSkeleton
              className={classes.circularSkeleton}
              styles={{
                width: 50,
                height: 50,
              }}
            />
          </div>
        </div>
      </div>

      {isMobileDevice ? (
        <div
          className={`flex justify-between items-center width100 ${classes.actionContainer}`}
        >
          <CustomSkeleton
            styles={{
              width: 89,
              height: 23,
            }}
          />
          <CustomSkeleton
            styles={{
              width: 193,
              height: 48,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default InvestmentSuccessSkeleton;
