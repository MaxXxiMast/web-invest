// COMPONENTS
import CustomSkeleton from '../../components/primitives/CustomSkeleton/CustomSkeleton';

// STYLESHEETS
import styles from './AssetCardSkeletonDiscovery.module.css';

const AssetCardSkeletonDiscovery = () => {
  return (
    <div className={styles.Card}>
      <div className={`flex-column ${styles.titleSkeleton}`}>
        <CustomSkeleton className={styles.Title} />
        <CustomSkeleton className={styles.SubTitle} />
      </div>
      <div className={`flex ${styles.itemWrapper}`}>
        <CustomSkeleton className={`${styles.ProductCard} ${styles.CardOne}`} />
        <CustomSkeleton className={`${styles.ProductCard} ${styles.CardTwo}`} />
        {/* Desktop only element */}
        <CustomSkeleton
          className={`${styles.ProductCard} ${styles.CardThree}`}
        />
      </div>
    </div>
  );
};

export default AssetCardSkeletonDiscovery;
