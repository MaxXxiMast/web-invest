//Node Modules
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

//Components
import InvestmentList from './InvestmentList';

//Utils
import { financeProductTypeConstants } from '../../utils/financeProductTypes';
import { fetchAPI } from '../../api/strapi';

//Redux
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
import { seeMorePorfolio } from '../../redux/slices/user';

//Styles
import styles from './LeasingInvestments.module.css';

//Dynamic Imports
const NoData = dynamic(() => import('../common/noData'), { ssr: false });
const CircularProgressLoader = dynamic(
  () => import('../primitives/CircularProgressLoader'),
  { ssr: false }
);

const LeasingInvestments = ({
  className = '',
  id = '',
  heading = '',
  portfolio,
  dataId = '',
  isHoldings = false,
}) => {
  const dispatch = useAppDispatch();
  const { investmentCount = 0 } = useAppSelector(
    (state) => state.user.portfolio
  );
  const [loading, setLoading] = useState(false);
  const [liquidityAssets, setLiquidityAssets] = useState([]);
  const [liquidityDates, setLiquidityDates] = useState();

  const isPortFolioCard =
    dataId == financeProductTypeConstants.bonds ||
    dataId == financeProductTypeConstants.Baskets ||
    dataId == financeProductTypeConstants.sdi;

  const getHeader = () => {
    return <h3 className="Heading3">{heading}</h3>;
    // NOSONAR: This is a temporary fix for the heading issue
    // return dataId == financeProductTypeConstants.sdi ? (
    //   <h3 className="Heading3">Securitized Debt Instruments</h3>
    // ) : (
    //   <h3 className="Heading3">{heading}</h3>
    // );
  };

  const handleSeeMore = () => {
    setLoading(true);
    dispatch(seeMorePorfolio(dataId, portfolio.length));
  };

  useEffect(() => {
    setLoading(false);
  }, [portfolio.length]);

  useEffect(() => {
    const getEarlyLiquidityAssets = async () => {
      try {
        const res = await fetchAPI(
          '/inner-pages-data',
          {
            filters: { url: '/liquidity' },
            populate: '*',
          },
          {},
          false
        );
        const assetIds =
          res?.data?.[0]?.attributes?.pageData?.[0]?.objectData
            ?.earlyLiveAssetIds;
        const liquidityDates =
          res?.data?.[0]?.attributes?.pageData?.[0]?.objectData?.liquidityDates;
        setLiquidityAssets(assetIds);
        setLiquidityDates(liquidityDates);
      } catch (error) {
        console.log(error);
      }
    };
    if (!liquidityAssets?.length) {
      getEarlyLiquidityAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`${styles.LeasingInvestments} ${className}`}
      id={id}
      data-testid="LeasingInvestments"
    >
      {isHoldings ? null : (
        <div className="SubSectionTitleSection">
          {getHeader()}
          <span className={`${styles.DealCount} TextStyle1`}>
            {investmentCount[dataId]}{' '}
            {investmentCount[dataId] > 1 ? 'Deals' : 'Deal'}
          </span>
        </div>
      )}
      <div className={styles.LeasingInvestmentsBody}>
        <ul>
          {(isPortFolioCard
            ? portfolio.sort(
                (portfolio1: any, portfolio2: any) =>
                  new Date(portfolio2?.orderDate).getTime() -
                  new Date(portfolio1?.orderDate).getTime()
              )
            : portfolio
          ).map((ele: any) => (
            <InvestmentList
              key={`cardItem_${ele}`}
              portfolio={ele}
              isPortFolioCard={isPortFolioCard}
              earlyLiveAssetIds={liquidityAssets}
              liquidityDates={liquidityDates}
            />
          ))}
        </ul>

        {portfolio.length < investmentCount[dataId] && (
          <div className={styles.ReadMore}>
            {loading ? (
              <CircularProgressLoader size={25} thickness={5} />
            ) : (
              <div className={styles.ReadmoreHandler} onClick={handleSeeMore}>
                <span>See More</span>
                <span className={`icon-caret-down ${styles.CaretDown}`} />
              </div>
            )}
          </div>
        )}
        {portfolio.length === 0 && window.innerWidth >= 768 && (
          <NoData
            subHeader="You have no investments in this product"
            header=""
          />
        )}
      </div>
    </div>
  );
};

export default LeasingInvestments;
