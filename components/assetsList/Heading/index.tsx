// components
import SDIFilterTab from '../SDIFilterTab';
import ResetFilters from '../AssetFilters/ResetFIlters';
import { getProductTypeFromTitle } from '../AssetFilters/utils';

// css
import styles from './Heading.module.css';

const Heading = ({
  title,
  handleSubTabChange = (subTab: string) => {},
  SDITabArr,
  subCategory,
  headerStyle = '',
  totalCount = 0,
}) => {
  const productType = getProductTypeFromTitle(title);
  return (
    <div
      className={`${styles.stickyContainer} ${headerStyle}`}
      id="AssetHeading"
    >
      <div className={`${styles.TitleWrapper} flex items-center`}>
        <h3>{title}</h3>
        {productType && (
          <ResetFilters productType={productType} totalCount={totalCount} />
        )}
      </div>
      {/* Filter Tab for Desktop Only for SDI */}

      {productType === 'SDI Secondary' ? (
        <SDIFilterTab
          handleSubTabChange={handleSubTabChange}
          SDITabArr={SDITabArr}
          customClass={styles.FilterTabAssets}
          event={subCategory}
        />
      ) : null}
    </div>
  );
};

export default Heading;
