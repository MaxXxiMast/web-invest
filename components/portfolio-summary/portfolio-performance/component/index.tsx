// NODE MODULES
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

// HOOKS
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../../../redux/slices/hooks';

// UTILS
import { PerformanceArrModel } from '../utils';
import { trackEvent } from '../../../../utils/gtm';

// COMPONENTS
import Button from '../../../primitives/Button';
import PortfolioPerformanceSkeleton from '../skeleton';

// CONTEXTS
import { PortfolioContext } from '../../context';

// STYLES
import classes from './PortfolioPerformance.module.css';

const PortfolioPerformance = () => {
  const { pageData = [] } = useContext(PortfolioContext);
  const {
    preTaxIrr = 0,
    loader = false,
  }: { preTaxIrr: number; loader: boolean } = useSelector(
    (state: any) => state?.portfolioSummary
  ) as any;
  const hidePreTaxIrr = !preTaxIrr || preTaxIrr < 8 || 20 < preTaxIrr;

  // GET selectedAssetType
  const {
    selectedAssetType = 'Bonds, SDIs & Baskets',
    totalAmountInvested = 0,
  } = useAppSelector((state) => state.portfolioSummary);

  // GET UserID
  const { userID = '' } = useAppSelector((state) => state?.user?.userData);

  const portfolioPerformanceData = useMemo(
    () =>
      ((pageData as any[]) || []).filter((ele) => {
        let filterKey = 'performance-graph';
        if (selectedAssetType === 'High Yield FDs') {
          filterKey = 'performance-graph-fd';
        }

        return ele?.keyValue === filterKey;
      })[0]?.objectData || {},
    [pageData, selectedAssetType]
  );

  const performaceGraphArr = useMemo(
    () => portfolioPerformanceData?.performaceGraphArr || [],
    [portfolioPerformanceData]
  )?.sort((a: PerformanceArrModel, b: PerformanceArrModel) => {
    return Number(b?.value) - Number(a?.value);
  });

  const performanceTextArr = useMemo(
    () => portfolioPerformanceData?.performanceTextArr || [],
    [portfolioPerformanceData]
  );

  const isMobile = useMediaQuery('(max-width: 992px)');
  const router = useRouter();

  const [graphArr, setGraphArr] =
    useState<PerformanceArrModel[]>(performaceGraphArr);

  useEffect(() => {
    setGraphArr(performaceGraphArr);
  }, [performaceGraphArr]);

  const findHeadingText = () => {
    if (hidePreTaxIrr) {
      return (
        portfolioPerformanceData?.nonInvstedUser ||
        'Grip users usually earn 2x of FD returns'
      );
    }
    const currentPortfolioLevel = graphArr.findIndex(
      (ele) => ele?.id === 'user-portfolio'
    );
    if (currentPortfolioLevel !== -1) {
      const arrLength = graphArr.length - 1;
      const itemIndex = arrLength - currentPortfolioLevel;
      return performanceTextArr?.[itemIndex]?.heading;
    }
    return '';
  };

  useEffect(() => {
    if (!hidePreTaxIrr) {
      const arr = [...performaceGraphArr];
      const itemIndex = arr.findIndex((ele) => ele?.id === 'user-portfolio');
      if (itemIndex >= 0) {
        arr[itemIndex].value = parseFloat(preTaxIrr.toFixed(1));
        arr.sort((a, b) => {
          if (Number(a.value) === Number(b.value)) {
            return a.id === 'user-portfolio' ? -1 : 1;
          }
          return Number(b.value) - Number(a.value);
        });

        setGraphArr(arr);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preTaxIrr, performaceGraphArr]);

  const handleClick = () => {
    trackEvent('portfolio_summary_view_deals', {
      'user id': userID,
      asset_type: selectedAssetType,
      'amount invested': totalAmountInvested,
      timestamp: new Date().toISOString(),
    });

    router.push(
      `${portfolioPerformanceData?.buttonConfig?.buttonLink || 'assets'}`
    );
    localStorage.setItem('redirectedFrom', 'portfolio');
  };

  if (loader) {
    return <PortfolioPerformanceSkeleton />;
  }
  return (
    <div
      className={`flex-column width100 ${classes.container}`}
      data-automation="performance-container"
    >
      <div
        className={`flex justify-between items-center ${classes.Wrapper}`}
        data-automation="performance-wrapper"
      >
        <div
          className={classes.LeftContent}
          data-automation="performance-left-content"
        >
          <div className={classes.graphWrapper} data-automation="graph-wrapper">
            <div className={classes.graphContainer}>
              <div
                className={`flex-column width100 justify-center ${classes.graph}`}
                data-automation="graph-graph"
              >
                {graphArr.map((ele) => {
                  const styles: React.CSSProperties = {
                    background: ele.bgColor,
                    color: ele.color,
                  };

                  const extraValue = Number(ele.value) * 5;
                  if (isMobile) {
                    styles.height = `calc(${Number(
                      ele.value
                    )}% + ${extraValue}px)`;
                  } else {
                    styles.width = `calc(${Number(
                      ele.value
                    )}% + ${extraValue}px)`;
                  }

                  if (!ele.value) {
                    return null;
                  }

                  return (
                    <div
                      key={ele.name}
                      className={`flex ${classes.barContainer}`}
                      data-automation={`performance-bar-${ele.id}`}
                    >
                      <div
                        className={classes.bar}
                        style={{
                          ...styles,
                        }}
                      >
                        <span>{ele.value}%</span>
                      </div>
                      <span className={classes.barName}>{ele.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`flex-column ${classes.RightContent}`}
          data-automation="performance-right-content"
        >
          <h3 data-automation="performance-right-heading">
            {findHeadingText()}
          </h3>
          <Button
            onClick={handleClick}
            data-automation="performance-view-deal-button"
          >
            {portfolioPerformanceData?.buttonConfig?.buttonText ||
              'View Latest Deals'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPerformance;
