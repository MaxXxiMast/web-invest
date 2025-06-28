import { useEffect } from 'react';
import { useRouter } from 'next/router';

//COmponents
import Button, { ButtonType } from '../../../primitives/Button';

//Utils
import { setActiveClass } from '../../../../utils/scroll';
import { useAppSelector } from '../../../../redux/slices/hooks';

//Styles
import styles from './FilterButton.module.css';

const FilterButton = ({
  isFilterApplied = false,
  isMobile = false,
  setShowFilters,
}) => {
  const router = useRouter();

  const { isFilteredKYCComplete = true } =
    useAppSelector((state) => state?.user?.kycConfigStatus?.default) || {};

  const handleScroll = () => {
    const assetFilterButton = document.getElementById('assetFilterButton');
    const isY50 = window.scrollY > 50;
    if (!isFilteredKYCComplete && assetFilterButton) {
      setActiveClass(assetFilterButton, isY50, 'Active');
    }
  };

  useEffect(() => {
    if (
      window.innerWidth <= 767 &&
      router.pathname === '/assets' &&
      !isFilteredKYCComplete
    ) {
      // Scroll event handler function
      window.addEventListener('scroll', handleScroll);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isFilteredKYCComplete]);

  const handleClick = () => {
    setShowFilters(true);
  };

  return (
    <>
      <div className={styles.buttonContainer} id="assetFilterButton">
        <Button
          width={isMobile ? 60 : 122}
          className={styles.filterButton}
          variant={ButtonType.PrimaryLight}
          onClick={handleClick}
        >
          <div className="flex items-center justify-center gap-6">
            <span className={`icon-filter ${styles.filterIcon}`}></span>
            {!isMobile && 'Sort & Filter'}
          </div>
        </Button>
        {isFilterApplied && <div className={styles.filterApplied}></div>}
      </div>
    </>
  );
};

export default FilterButton;
