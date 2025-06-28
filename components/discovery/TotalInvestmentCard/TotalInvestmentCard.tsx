// NODE MODULES
import { useRouter } from 'next/router';
import Skeleton from '@mui/material/Skeleton';

// Components
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';
// import PortfolioSummary from '../PortfolioSummary';

// Utils
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import { useAppSelector } from '../../../redux/slices/hooks';

// Styles
import styles from './TotalInvestmentCard.module.css';

type Props = {
  showImageSlide: boolean;
};
const TotalInvestmentCard = ({ showImageSlide = false }: Props) => {
  const router = useRouter();

  const portfolioData = useAppSelector(
    (state) => state.user?.portfolioDiscoverData
  );

  const isLoading = () => {
    return !portfolioData;
  };

  const handleViewPortFolio = () => {
    router.push('/portfolio');
  };

  const returnRecieved = () => {
    if (!portfolioData?.totalReturnsReceived) {
      return 0;
    }
    return Math.floor(
      ((portfolioData?.totalReturnsReceived || 0) /
        (portfolioData?.totalExpectedReturns || 0)) *
        100
    );
  };

  const getTotalInvestmentArrow = () => (
    <div className={styles.totalInvestmentArrowContainer}>
      <span
        className="icon-caret-right"
        style={{
          color: 'var(--greyCloud, #b5b5b5)',
          fontSize: 12,
          fontWeight: 700,
        }}
      />
    </div>
  );

  if (isLoading()) {
    return (
      <div className={`${styles.skeletonContainer}`}>
        <Skeleton
          animation="wave"
          variant="rounded"
          width={101}
          height={15}
          classes={{
            root: styles.skeletonColor,
          }}
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={'100%'}
          height={55}
          classes={{
            root: styles.skeletonColor,
          }}
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={'100%'}
          height={26}
          classes={{
            root: styles.skeletonColor,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${styles.investmentContainer} ${
        !showImageSlide ? styles.investmentContainerWOImageSlider : ''
      }`}
    >
      <div className={styles.investmentHeader}>Total Investments</div>
      <div
        className={`items-align-center-row-wise pointer`}
        onClick={handleViewPortFolio}
      >
        <span className={styles.investedValue}>
          {numberToIndianCurrencyWithDecimals(
            portfolioData?.totalInvestmentAmount || 0
          )}
        </span>
        {getTotalInvestmentArrow()}
      </div>
      <div className={`items-align-center-row-wise justify-between`}>
        <div className={styles.returnProgressBar}>
          <span style={{ width: `${returnRecieved()}%` }}></span>
        </div>
        <div className={styles.reurnText}>
          {returnRecieved() || 0}% Returns Received
        </div>
        <div className={styles.tooltipContainer}>
          <TooltipCompoent toolTipText={'Returns don’t include startup equity'}>
            <span className={`icon-info`} />
          </TooltipCompoent>
        </div>
      </div>
      {/* <PortfolioSummary /> */}
    </div>
  );
};

export default TotalInvestmentCard;
