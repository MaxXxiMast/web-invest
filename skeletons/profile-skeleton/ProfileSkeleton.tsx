import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import styles from './ProfileSkeleton.module.css';

function ProfileSkeleton() {
  return (
    <>
      {/* MOBILE SKELETON */}
      <div
        className={`${styles.MobileSkeleton} ${styles.phoneSkeletonContainer}`}
      >
        <div
          className={`flex ${styles.skeletonContainerInner} ${styles.mb_30}`}
        >
          <CustomSkeleton
            styles={{
              width: 62,
              height: 62,
            }}
            className={styles.circularSkeleton}
          />
          <div className={'flex-column justify-center'}>
            <CustomSkeleton
              styles={{
                width: 160,
                height: 27,
              }}
              className={styles.mb_7}
            />
            <CustomSkeleton
              styles={{
                width: 160,
                height: 15,
              }}
              className={styles.mb_7}
            />
          </div>
          <CustomSkeleton
            styles={{
              width: 103,
              height: 28,
            }}
            className={styles.DesktopSkeleton}
          />
        </div>
        <div
          className="flex-column justify-between"
          style={{
            width: '90vw',
            height: 330,
          }}
        >
          {[...Array(6)].map((el, index) => (
            <div className="flex" key={`skeleton_${index}_${Date.now()}`}>
              <CustomSkeleton
                styles={{
                  width: '100%',
                  height: 40,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP SKELETON */}
      <div className={`${styles.DesktopSkeleton} ${styles.container}`}>
        <div className={`flex ${styles.headerContainer}`}>
          <div className={`flex ${styles.width100}`}>
            <CustomSkeleton
              className={styles.circularSkeleton}
              styles={{
                width: 76,
                height: 76,
              }}
            />
            <div>
              <CustomSkeleton
                styles={{
                  width: 160,
                  height: 27,
                }}
                className={styles.mb_7}
              />
              <CustomSkeleton
                styles={{
                  width: 160,
                  height: 15,
                }}
                className={styles.mb_7}
              />
              <CustomSkeleton
                styles={{
                  width: 103,
                  height: 28,
                }}
                className={styles.mb_7}
              />
            </div>
          </div>
          <div className={`flex justify-end  ${styles.width100}`}>
            <CustomSkeleton
              styles={{
                width: 132,
                height: 58,
              }}
            />
          </div>
        </div>
        <div className="flex">
          <div className={`flex ${styles.skeleton1Container}`}>
            <CustomSkeleton
              styles={{
                width: 257,
                height: 253,
              }}
            />
            <div>
              <CustomSkeleton
                styles={{
                  width: 160,
                  height: 27,
                }}
                className={styles.mb_30}
              />
              <div
                className="flex-column justify-between"
                style={{
                  height: 300,
                }}
              >
                {[...Array(6)].map((el, index) => (
                  <div
                    className="flex justify-between"
                    key={`skeleton_${index}_${Date.now()}`}
                    style={{
                      width: 320,
                    }}
                  >
                    <CustomSkeleton
                      styles={{
                        width: 144,
                        height: 27,
                      }}
                    />
                    <CustomSkeleton
                      styles={{
                        width: 144,
                        height: 27,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            className={`flex-column justify-between items-end ${styles.width100}`}
            style={{
              height: 450,
            }}
          >
            <CustomSkeleton
              styles={{
                width: 144,
                height: 27,
              }}
            />
            <CustomSkeleton
              styles={{
                width: 115,
                height: 55,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileSkeleton;
