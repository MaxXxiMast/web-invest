import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

// components
import Mobile from './Mobile';
import Desktop from './Desktop';

// APIs
import {
  getUserTransactions,
  getUserTransactionsCount,
} from '../../api/portfolio';

// utils
import { financeProductTypeMapping, sideBarData } from './utils';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { trackEvent } from '../../utils/gtm';

// types
import type {
  MyTransactionsCount,
  MyTransactions as MyTransactionsType,
} from './types';

// redux
import { useAppSelector } from '../../redux/slices/hooks';

const MyTransactions = () => {
  const isMobile = useMediaQuery();
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [transactions, setTransactions] = useState<MyTransactionsType>([]);
  const [activeProduct, setActiveProduct] = useState('');
  const [transactionsCount, setTransactionsCount] =
    useState<MyTransactionsCount>([]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [orderType, setOrderType] = useState('ALL');
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const { userData } = useAppSelector((state) => state.user);

  const fetchMyTransactionsCount = async () => {
    setTabLoading(true);
    const response = await getUserTransactionsCount();

    const myHoldingsCount = sideBarData
      .map((item) => ({
        ...item,
        count: response[item.key] || 0,
      }))
      .filter((item) => item.count);

    if (
      userData?.investmentData?.['Leasing']?.investments ||
      userData?.investmentData?.['Inventory']?.investments
    ) {
      myHoldingsCount.push({
        id: 'Leasing & Inventory',
        key: 'llp',
        name: 'Leasing & Inventory',
        iconName: 'icon-badge',
        order: 4,
        count: 0,
        hideCount: true,
      });
    }

    // Set the default product type to the first one in the list
    !activeProduct &&
      fetchMyTransactions(myHoldingsCount[0]?.id, 1, '', orderType);
    !activeProduct && setActiveProduct(myHoldingsCount[0]?.id);

    setTransactionsCount(myHoldingsCount);
    setTabLoading(false);
  };

  const fetchMyTransactions = useCallback(
    async (financeProductType, page = 1, search = '', orderType = 'ALL') => {
      if (financeProductType && financeProductType !== 'Leasing & Inventory') {
        setLoading(true);

        try {
          const res = await getUserTransactions({
            financeProductType: financeProductTypeMapping[financeProductType],
            search,
            skip: (page - 1) * 4,
            orderType,
          });

          if (search) {
            trackEvent('transaction_search', {
              search_text: search,
              results: res.totalOrders,
              category: activeProduct,
            });
          }

          setTotalPages(Math.ceil(res.totalOrders / 4) || 1);
          setTotalOrders(res.totalOrders);
          setTransactions(res.data);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchMyTransactionsCount();
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    if (userData) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, activeProduct]);

  useEffect(() => {
    const fetchBondsData = async () => {
      try {
        await fetchMyTransactions('Bonds');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchBondsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updatedCount = transactionsCount?.map((item) => ({
      ...item,
      count: item.name === activeProduct ? totalOrders : item.count,
    }));
    setTransactionsCount(updatedCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalOrders]);

  const debouncedSearch = useCallback(
    debounce((search) => {
      fetchMyTransactions(activeProduct, 1, search, orderType);
    }, 500),
    [fetchMyTransactions, activeProduct, orderType]
  );

  const handleSearch = (search: string) => {
    setSearch((prev) => {
      if (prev === search) return search;
      if (prev.length < 3 && search.length < 3) return search;
      debouncedSearch(search.length < 3 ? '' : search);
      return search;
    });
  };

  const handlePageChange = (_: any, page: number) => {
    setPage(page);
    fetchMyTransactions(activeProduct, page, search, orderType);
  };

  const handleProductChange = (product: string) => {
    if (product === activeProduct) return;
    setOrderType('ALL');
    setPage(1);
    setSearch('');
    setActiveProduct(product);
    fetchMyTransactions(product);
  };

  const handleOrderType = (e: any) => {
    const newOrderType = e.target.value;
    setOrderType(newOrderType);
    setPage(1);
    fetchMyTransactions(activeProduct, 1, search, e.target.value);
    trackEvent('transactions_order_type_changed', {
      state: newOrderType,
      category: activeProduct,
    });
  };

  return isMobile ? (
    <Mobile
      loading={loading}
      search={search}
      handleSearch={handleSearch}
      transactions={transactions}
      activeProduct={activeProduct}
      transactionsCount={transactionsCount}
      handleProductChange={handleProductChange}
      page={page}
      totalPages={totalPages}
      handlePageChange={handlePageChange}
      orderType={orderType}
      handleOrderType={handleOrderType}
      tabLoading={tabLoading}
    />
  ) : (
    <Desktop
      loading={loading}
      search={search}
      totalOrders={totalOrders}
      handleSearch={handleSearch}
      transactions={transactions}
      activeProduct={activeProduct}
      transactionsCount={transactionsCount}
      handleProductChange={handleProductChange}
      page={page}
      totalPages={totalPages}
      handlePageChange={handlePageChange}
      orderType={orderType}
      handleOrderType={handleOrderType}
      tabLoading={tabLoading}
    />
  );
};

export default MyTransactions;
