// Imports remain unchanged

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Utils
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Primtives
import Button from '../../primitives/Button';

// APIS
import { getUserInvestmentData } from '../../../api/portfolio';

// Contexts
import { PendingPgOrderContext } from '../../../pages/pg-confirmation';

//styles
import classes from './NonFtiGraph.module.css';

interface RenderTextBtnContentProps {
  isMobile: boolean;
  redirectToSDIs: () => void;
}

const RenderTextBtnContent: React.FC<RenderTextBtnContentProps> = ({
  redirectToSDIs,
  isMobile,
}) => (
  <div
    className={`flex-column ${classes.RightContent}`}
    data-automation="investment-right-content"
  >
    <h3 data-automation="investment-right-heading" className={classes.Heading}>
      Improve your portfolio performance further by investing latest SDIs
    </h3>
    <Button
      onClick={redirectToSDIs}
      data-automation="investment-explore-sdi-button"
      className={classes.Btn}
      width={isMobile ? '100%' : 150}
    >
      Explore SDIs
    </Button>
  </div>
);

interface RenderGraphProps {
  NonFtiGraphData: Array<any>;
  userPortfolioPercentage: number;
  isMobile: boolean;
}

const RenderGraph: React.FC<RenderGraphProps> = ({
  NonFtiGraphData,
  userPortfolioPercentage,
  isMobile,
}) => (
  <div className={classes.graphWrapper} data-automation="graph-wrapper">
    <div className={classes.graphContainer}>
      <div
        className={`flex width100 justify-center ${classes.graph}`}
        data-automation="graph-graph"
      >
        {NonFtiGraphData?.map((ele) => {
          const styles: React.CSSProperties = {
            background: ele.bgColor,
            color: ele.color,
          };

          const value =
            ele?.id === 'user-portfolio'
              ? Number(userPortfolioPercentage)?.toFixed(2)
              : Number(ele.value).toFixed(2);

          if (isMobile) {
            styles.width = `calc(${Number(value)}% + ${Number(value) * 15}px)`;
          } else {
            styles.height = `calc(${Number(value)}% + ${Number(value) * 5}px)`;
            styles.width = '80px';
          }

          if (!value) {
            return null;
          }

          return (
            <div
              key={ele.name}
              className={`flex ${classes.barContainer}`}
              data-automation={`investment-bar-container${ele.id}`}
            >
              <div
                data-automation={`investment-bar-${ele.id}`}
                className={classes.bar}
                style={styles}
              >
                <span>{isMobile ? ele.name : value + '%'}</span>
              </div>
              <span className={classes.barName}>
                {isMobile ? value + '%' : ele.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

interface RenderGraphWrapperProps {
  NonFtiGraphData: Array<any>;
  userPortfolioPercentage: number;
  redirectToSDIs: () => void;
  isMobile: boolean;
}

const RenderGraphWrapper: React.FC<RenderGraphWrapperProps> = ({
  NonFtiGraphData,
  userPortfolioPercentage,
  redirectToSDIs,
  isMobile,
}) => (
  <div
    className={`flex justify-between items-center ${classes.Wrapper}`}
    data-automation="investment-wrapper"
  >
    <div
      className={`flex-column ${classes.LeftContent}`}
      data-automation="investment-left-content"
    >
      <div
        data-automation="investment-header-container"
        className={classes.HeadingContainer}
      >
        <h3
          data-automation="investment-right-heading"
          className={classes.Heading}
        >
          Improve your portfolio performance further by investing latest SDIs
        </h3>
      </div>
      <RenderGraph
        NonFtiGraphData={NonFtiGraphData}
        userPortfolioPercentage={userPortfolioPercentage}
        isMobile={isMobile}
      />
      <div
        data-automation="investment-btn-container"
        className={classes.BtnContainer}
      >
        <Button
          onClick={redirectToSDIs}
          data-automation="investment-explore-sdi-button"
          className={classes.Btn}
          width={isMobile ? '100%' : 150}
        >
          Explore SDIs
        </Button>
      </div>
    </div>
  </div>
);

const NonFtiGraphConfirmation: React.FC = () => {
  const isMobile = useMediaQuery();
  const router = useRouter();
  const [userPortfolioPercentage, setUserPortfolioPercentage] = useState(0);

  const data = useContext(PendingPgOrderContext);
  const { NonFtiGraphData, isGC, redirectToGC } = data ?? {};

  useEffect(() => {
    getUserInvestmentData(
      'Bonds,SDI Secondary,Lease Financing,Inventory Financing,Commercial Property,High Yield FDs',
      'all'
    ).then((res) => {
      setUserPortfolioPercentage(res?.xirr || 0);
    });
  }, []);

  const redirectToSDIs = () => {
    isGC ? redirectToGC() : router.push('/assets#active#leaseX');
  };

  return (
    <div
      className={`flex width100 ${classes.container}`}
      data-automation="Fti-container"
    >
      <RenderTextBtnContent
        isMobile={isMobile}
        redirectToSDIs={redirectToSDIs}
      />
      <RenderGraphWrapper
        NonFtiGraphData={NonFtiGraphData}
        userPortfolioPercentage={userPortfolioPercentage}
        redirectToSDIs={redirectToSDIs}
        isMobile={isMobile}
      />
    </div>
  );
};

export default NonFtiGraphConfirmation;
