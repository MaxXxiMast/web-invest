import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';
import styles from './VideoSkeleton.module.css';

const VideoSkeleton = () => {
  const optionItem = (index: number) => {
    return (
      <div
        className={`SkeletonCard SkeletonPaper ${styles.itemPaper} `}
        key={`videoSkeleton_${index}`}
      >
        <div className={`flex ${styles.contenWrapper}`}>
          <CustomSkeleton
            styles={{
              width: 34,
              height: 34,
            }}
            className={styles.circularSkeleton}
          />
          <CustomSkeleton
            styles={{
              width: 107,
              height: 42,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`flex ${styles.mainWrapper}`}>
        <div className={`flex ${styles.title}`}>
          <CustomSkeleton
            styles={{
              width: 212,
              height: 31,
            }}
          />
        </div>
        <div className={`flex ${styles.itemWrapper}`}>
          {Array.from(Array(3), (e, i) => {
            return optionItem(i);
          })}
        </div>
      </div>
    </>
  );
};

export default VideoSkeleton;
