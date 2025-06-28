// Common Components
import Image from '../../primitives/Image';

// Utils
// import {
//   filterInvestmentArr,
//   investmentFilterMapping,
// } from '../../../utils/portfolio';
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { useAppSelector } from '../../../redux/slices/hooks';

// Styles
import styles from './PortfolioSummary.module.css';

// import SortBy from '../../primitives/SortBy/SortBy';

// const discoverfilterInvestmentArr = filterInvestmentArr.filter(
//   (name) => !name?.toLowerCase().includes('metrics')
// );

function PortfolioSummary() {
  /**
   * Can be used later
   * Updated due to this: https://gripinvest.atlassian.net/browse/PT-25862
   */

  // const [investmentFilter, setInvestmentFilter] = useState(
  //   discoverfilterInvestmentArr[0]
  // );

  // const handleSetInvestment = (val: string) => {
  //   setInvestmentFilter(val);
  //   props.getPortfolioSummary(
  //     'all',
  //     investmentFilterMapping[val],
  //     () => {},
  //     true
  //   );
  // };

  const portfolioData = useAppSelector(
    (state) => state.user?.portfolioDiscoverData
  );

  return (
    <div className={styles.MainContainer}>
      <div className={`${styles.DownloadIcon}`}>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/cash.svg`}
          width={20}
          height={20}
          layout="fixed"
          alt="cash"
        />
      </div>

      <div className={styles.HighlightedText}>
        <span>{`Returns of ${numberToIndianCurrencyWithDecimals(
          portfolioData?.totalExpectedReturns || 0
        )} `}</span>{' '}
        are scheduled for
      </div>
      {/* Updated due to this: https://gripinvest.atlassian.net/browse/PT-25862 */}
      {/* Can be used later */}
      {/* <div className={styles.HighlightedText}>
        <span>{`Returns of ${numberToIndianCurrencyWithDecimals(
          props?.summary?.expectedAmount || 0
        )} `}</span>{' '}
        are scheduled for
      </div> */}
      {/* <SortBy
        filterName={investmentFilter}
        data={discoverfilterInvestmentArr}
        handleFilterItem={(ele: string) => {
          handleSetInvestment(ele);
        }}
        isMobileDrawer={true}
        mobileDrawerTitle="Select Option"
        className={styles.FilterContainer}
        selectedValue={2}
      /> */}
    </div>
  );
}

export default PortfolioSummary;
