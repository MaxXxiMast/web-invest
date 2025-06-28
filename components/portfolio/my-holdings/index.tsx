import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

// components
import Mobile from './Mobile';
import Desktop from './Desktop';

// APIs
import { getUserHoldings, getUserHoldingsCount } from '../../../api/portfolio';
import { getUserPortfolio } from '../../../api/user';

// redux
import { getPortfolio, loadPortfolioPage } from '../../../redux/slices/user';
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';

// utils
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import {
  hiddenProductTypes,
  hiddenSideBarData,
  MY_HOLDINGS_SEARCH_LENGTH,
  productTypeMapping,
  sideBarData,
} from './utils';
import { trackEvent } from '../../../utils/gtm';

import { financeProductTypeConstants } from '../../../utils/financeProductTypes';

// types
import { MyHoldingsApiResponse, Holdings, MyHoldingsCount } from './types';

const MyHoldings = () => {
  const dispatch = useAppDispatch();
  const [dealType, setDealType] = useState('active');
  const isMobile = useMediaQuery();
  const [myHoldingsCount, setMyHoldingsCount] = useState<MyHoldingsCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [holdings, setHoldings] = useState<Holdings>([]);
  const [activeProductType, setActiveProductType] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalEntries, setTotalEntries] = useState(0);
  const userID = useAppSelector((state) => state.user?.userData?.userID);

  useEffect(() => {
    trackEvent('check_liquidity_flag', {
      user_id: userID,
      liquidity_enabled: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeProductType && myHoldingsCount.length > 0) {
      if (!hiddenProductTypes.includes(activeProductType)) {
        fetchMyHoldings(productTypeMapping[activeProductType], 1, '', dealType);
      }
    }
  }, [activeProductType]);

  useEffect(() => {
    if (myHoldingsCount.length > 0 && !activeProductType) {
      setActiveProductType(myHoldingsCount[0].id);
    }
  }, [myHoldingsCount, activeProductType]);

  useEffect(() => {
    const getPortfolioCount = async () => {
      const investmentTypes = [
        financeProductTypeConstants.highyieldfd,
        financeProductTypeConstants.leasing,
        financeProductTypeConstants.inventory,
        financeProductTypeConstants.startupEquity,
        financeProductTypeConstants.realEstate,
      ];

      try {
        setTabLoading(true);
        const investmentCount: Record<string, number> = {};

        // Fetch holdings count for both active and past investments
        const [activeHoldingsResponse, pastHoldingsResponse, ...portfolioData] = await Promise.all([
          getUserHoldingsCount({ orderStatus: 'active' }),
          getUserHoldingsCount({ orderStatus: 'past' }),
          ...investmentTypes.map((type) => getUserPortfolio(type, 4, 0)),
        ]);

        // Update sidebar holdings count
        const updatedHoldingsCount = sideBarData.map((item: any) => {
          const activeCount = activeHoldingsResponse[item.key] || 0;
          const pastCount = pastHoldingsResponse[item.key] || 0;
          
          // Only include the item if it has either active or past investments
          if (activeCount > 0 || pastCount > 0) {
            return { ...item, count: activeCount };
          }
          return item;
        });

        const { count } =
          updatedHoldingsCount.find(
            (item: any) => item.id === activeProductType
          ) ?? {};
        // Update total entries count on specific sidebar item (Bonds, Baskets, SDIs)
        setTotalEntries(count ?? 0);

        // Map portfolio data to investment count
        portfolioData.forEach((data, index) => {
          investmentCount[investmentTypes[index]] = data.totalInvestmentCount;
        });

        // Update hidden holdings count
        const updatedMyHoldingsCountHidden = hiddenSideBarData.map((item) => ({
          ...item,
          count: investmentCount[item.id],
        }));
        // Merge both counts
        const holdingsArray = [
          ...updatedHoldingsCount,
          ...updatedMyHoldingsCountHidden,
        ].filter((item) => {
          const activeCount = item.count || 0;
          const pastCount = pastHoldingsResponse[item.key] || 0;
          return activeCount > 0 || pastCount > 0;
        });

        setMyHoldingsCount(holdingsArray);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setTabLoading(false);
      }
    };

    getPortfolioCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(getPortfolio() as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      myHoldingsCount.length > 0 && // this length check is to avoid unnecessary API calls and don't add myHoldingsCount as dependency
      (search.length == 0 || search.length >= MY_HOLDINGS_SEARCH_LENGTH)
    )
      debouncedSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (
      ['Baskets', 'Bonds', 'SDIs'].includes(activeProductType) &&
      myHoldingsCount.length > 0 // this length check is to avoid unnecessary API calls and don't add myHoldingsCount as dependency
    ) {
      fetchMyHoldingsCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProductType, dealType]);

  const fetchMyHoldingsCount = async () => {
    const response = await getUserHoldingsCount({
      orderStatus: dealType,
      financeProductType:
        dealType === 'active' && !search
          ? null
          : productTypeMapping[activeProductType], // this condition is to fetch all active holdings when activeProductType changes
      search: search,
    });

    const activeKey = sideBarData.find(
      (item: any) => item.id === activeProductType
    )?.key;
    // Update total entries count on specific sidebar item (Bonds, Baskets, SDIs) if present in response
    setTotalEntries((pre) => response[activeKey] ?? pre);

    // Update the count for specific sidebar items (Baskets, Bonds, SDIs) if present in response
    const updatedSideBarData = myHoldingsCount.map(
      (item: any) => {
        if (['Baskets', 'Bonds', 'SDIs'].includes(item?.id)) {
          const currentCount = response[item.key] !== undefined ? response[item.key] : item.count;
          return { ...item, count: currentCount };
        }
        return item;
      }
    );
    setMyHoldingsCount(updatedSideBarData);
  };

  const fetchMyHoldings = async (
    productType: string = 'Bonds',
    page = 1,
    search = '',
    orderStatus = 'active'
  ) => {
    if (orderStatus === 'active' || page == 1) {
      // This condition ensures that active holdings are fetched, while past holdings are retrieved only in the initial request.
      setLoading(true);
      const response: MyHoldingsApiResponse = await getUserHoldings({
        financeProductType: productType,
        skip: (page - 1) * 4,
        search,
        orderStatus,
      });
      setHoldings(response.data);
      setLoading(false);
    }
  };

  const loadHiddenProductType = useCallback(
    async (productType: string, page = 1) => {
      setLoading(true);
      setTotalEntries(0);
      await dispatch(
        loadPortfolioPage(productType, (page - 1) * 4, () => setLoading(false))
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const handleDealType = (e: any) => {
    setDealType(e.target.value);
    setPage(1);
    fetchMyHoldings(
      productTypeMapping[activeProductType],
      1,
      search,
      e.target.value
    );
  };

  const handleProductType = (e: string) => {
    if (e === activeProductType) return;
    setSearch('');
    setPage(1);
    setActiveProductType(e);
    setDealType('active');
    if (hiddenProductTypes.includes(e)) loadHiddenProductType(e);
    else fetchMyHoldings(productTypeMapping[e]);
  };

  const totalPages = Math.ceil(totalEntries / 4) || 1;

  const handlePageChange = (_: any, page: number) => {
    setPage(page);
    if (hiddenProductTypes.includes(activeProductType)) {
      loadHiddenProductType(activeProductType, page);
      return;
    }
    fetchMyHoldings(
      productTypeMapping[activeProductType],
      page,
      search,
      dealType
    );
  };

  const debouncedSearch = debounce(() => {
    setPage(1);
    fetchMyHoldingsCount();
    fetchMyHoldings(productTypeMapping[activeProductType], 1, search, dealType);
  }, 500);

  const handleSearch = (e: string) => {
    setSearch(e);
  };

  const size = 4;
  const skip = (page - 1) * size;
  const isActive = dealType === 'active';

  return isMobile ? (
    <Mobile
      loading={loading}
      dealType={dealType}
      setDealType={handleDealType}
      myHoldingsCount={myHoldingsCount}
      holdings={isActive ? holdings : holdings.slice(skip, skip + size)}
      activeProductType={activeProductType}
      handleProductType={handleProductType}
      page={page}
      totalPages={totalPages}
      handlePageChange={handlePageChange}
      search={search}
      handleSearch={handleSearch}
      tabLoading={tabLoading}
    />
  ) : (
    <Desktop
      loading={loading}
      dealType={dealType}
      setDealType={handleDealType}
      myHoldingsCount={myHoldingsCount}
      holdings={isActive ? holdings : holdings.slice(skip, skip + size)}
      activeProductType={activeProductType}
      handleProductType={handleProductType}
      page={page}
      totalPages={totalPages}
      handlePageChange={handlePageChange}
      search={search}
      handleSearch={handleSearch}
      totalEntries={totalEntries}
      tabLoading={tabLoading}
    />
  );
};

export default MyHoldings;