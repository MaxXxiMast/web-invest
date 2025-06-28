import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import classes from './VaultSkeleton.module.css';

function VaultSkeleton() {
  const availableBalance = () => (
    <div className={`flex-column width100 ${classes.detailBox}`}>
      <CustomSkeleton
        styles={{
          width: 131,
          height: 22,
        }}
        className={classes.mb_6}
      />
      <CustomSkeleton
        styles={{
          width: 131,
          height: 22,
        }}
        className={classes.mb_30}
      />
      <div className={`flex width100 justify-between`}>
        <CustomSkeleton
          styles={{
            width: 133,
            height: 49,
          }}
        />
        <CustomSkeleton
          styles={{
            width: 133,
            height: 49,
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE SKELETON */}
      <div className={`flex-column width100 ${classes.hideInDesktop}`}>
        {availableBalance()}
        <div
          className={`flex-column width100 ${classes.detailBox} ${classes.mb_20}`}
        >
          <div className={`flex width100 ${classes.mb_30}`}>
            <CustomSkeleton
              className={classes.circularSkeleton}
              styles={{
                width: 55,
                height: 55,
              }}
            />
            <div>
              <CustomSkeleton
                className={classes.mb_6}
                styles={{
                  width: 223,
                  height: 22,
                }}
              />
              <CustomSkeleton
                className={classes.mb_6}
                styles={{
                  width: 223,
                  height: 22,
                }}
              />
              <CustomSkeleton
                className={classes.mb_6}
                styles={{
                  width: 159,
                  height: 22,
                }}
              />
            </div>
          </div>
          <div className={`flex width100 justify-between ${classes.mb_20}`}>
            <div>
              <CustomSkeleton
                className={classes.mb_6}
                styles={{
                  width: 220,
                  height: 22,
                }}
              />
              <CustomSkeleton
                styles={{
                  width: 220,
                  height: 22,
                }}
              />
            </div>
            <CustomSkeleton
              styles={{
                width: 48,
                height: 30,
              }}
            />
          </div>
          <div className={`flex justify-center`}>
            <CustomSkeleton
              styles={{
                width: 117,
                height: 22,
              }}
            />
          </div>
        </div>
        <CustomSkeleton
          className={classes.mb_20}
          styles={{
            width: 192,
            height: 43,
          }}
        />
        <CustomSkeleton
          className={classes.mb_30}
          styles={{
            width: 216,
            height: 37,
          }}
        />

        <div className={`flex-column width100`}>
          {[...Array(2)].map((el, index) => (
            <>
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
            </>
          ))}
        </div>
      </div>

      {/* DESKTOP SKELETON */}
      <div
        className={`flex width100 ${classes.container} ${classes.hideInMobile}`}
      >
        <div className="width100">
          <div className={`flex width100 ${classes.detailBox}`}>
            <CustomSkeleton
              className={classes.circularSkeleton}
              styles={{
                width: 51,
                height: 51,
              }}
            />
            <div>
              <CustomSkeleton
                className={classes.mb_6}
                styles={{
                  width: 567,
                  height: 30,
                }}
              />
              <CustomSkeleton
                className={classes.mb_30}
                styles={{
                  width: 132,
                  height: 30,
                }}
              />
              <div className={`flex width100 justify-between`}>
                <CustomSkeleton
                  styles={{
                    width: 425,
                    height: 30,
                  }}
                />
                <CustomSkeleton
                  styles={{
                    width: 112,
                    height: 30,
                  }}
                />
              </div>
            </div>
          </div>
          <div className={`flex width100 ${classes.mb_30}`}>
            <CustomSkeleton
              styles={{
                width: 216,
                height: 30,
              }}
            />
            <div className={`flex width100 justify-end`}>
              <CustomSkeleton
                styles={{
                  width: 166,
                  height: 30,
                }}
                className={classes.mr_20}
              />
              <CustomSkeleton
                styles={{
                  width: 166,
                  height: 30,
                }}
              />
            </div>
          </div>
          <div
            className={`flex-column justify-between`}
            style={{
              height: 270,
            }}
          >
            {[...Array(3)].map((el, index) => (
              <>
                <div
                  key={`skeleton_${index}_${Date.now()}`}
                  className={`flex justify-between`}
                >
                  <CustomSkeleton
                    styles={{
                      width: 189,
                      height: 56,
                    }}
                    className={classes.circularSkeleton}
                  />
                  <div>
                    <CustomSkeleton
                      styles={{
                        width: 399,
                        height: 19,
                      }}
                      className={classes.mb_6}
                    />
                    <CustomSkeleton
                      styles={{
                        width: 172,
                        height: 19,
                      }}
                    />
                  </div>
                  <div
                    className={`flex width100 justify-end items-end`}
                    style={{
                      height: '100%',
                    }}
                  >
                    <CustomSkeleton
                      styles={{
                        height: 23,
                        width: 56,
                      }}
                    />
                  </div>
                </div>
              </>
            ))}
          </div>
        </div>
        <div>
          {availableBalance()}
          <div className={classes.detailBox}>
            <div className={`flex width100 ${classes.mb_30}`}>
              <CustomSkeleton
                className={classes.circularSkeleton}
                styles={{
                  width: 33,
                  height: 33,
                }}
              />
              <CustomSkeleton
                styles={{
                  width: 121,
                  height: 24,
                }}
              />
            </div>
            <CustomSkeleton
              styles={{
                width: 314,
                height: 56,
              }}
              className={classes.mb_6}
            />
            <CustomSkeleton
              styles={{
                width: 232,
                height: 30,
              }}
              className={classes.mb_30}
            />
            <CustomSkeleton
              styles={{
                width: 314,
                height: 56,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default VaultSkeleton;
