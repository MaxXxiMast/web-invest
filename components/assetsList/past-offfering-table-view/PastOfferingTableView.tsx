//Node Modules
import React, { useContext, useEffect, useState } from 'react';

//Components
import Pagination from '@mui/material/Pagination';
import Image from '../../primitives/Image';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';
import NoData from '../../common/noData';
import AssetTableSkeleton from '../../../skeletons/asset-table-skeleton/AssetTableSkeleton';
import SDIFilterTab from '../SDIFilterTab';

//Utils
import { generateAssetURL, validSections } from '../../../utils/asset';
import {
  getActiveStateByHash,
  getAssetSectionMapping,
  getTabName,
} from '../../../utils/assetList';
import { getLeasingTableData, pastOfferHeader } from '../utils';

//Redux
import { setAssetsSort } from '../../../redux/slices/config';
import { AssetsContext } from '../../../pages/assets';

//Hooks
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import useHash from '../../../utils/customHooks/useHash';

//Styles
import styles from './PastOfferings.module.css';

type TableDataModel = {
  logo: any;
  raisedAmount: number;
  irr: number;
  returns: any;
  subscription: number;
  type: string;
};

type TableHeaderModel = {
  name: string;
  isSortable: boolean;
  id: string;
};

type PastOfferingTableViewtype = {
  [props: string]: any;
};

type TableProps = {
  dataArr?: TableDataModel[];
  headers?: TableHeaderModel[];
  className?: string;
};

const defaultSortData = {
  sortOrder: null,
  sortType: null,
};

const PastOfferingTableView = (props: PastOfferingTableViewtype) => {
  const {
    loading = true,
    pdLoading = true,
    getAssets = () => {},
    searchText = '',
    setSubCategory = () => {},
    SDITabArr,
  } = useContext(AssetsContext);

  const isMobile = useMediaQuery();
  const dispatch = useAppDispatch();
  const assetsSort = useAppSelector((state) => state.config.assetsSort);

  const { hash } = useHash();
  const { assetSubType: subCategory, assetType: scrollActiveSection } =
    getActiveStateByHash(hash);

  const sectionMapping = getAssetSectionMapping();
  const storedList = useAppSelector((state) => state.assets.past);

  const [assetData, setAssetData] = useState([]);
  useEffect(() => {
    if (!loading && !pdLoading) {
      setAssetData(getAssets(scrollActiveSection, subCategory));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollActiveSection, subCategory, loading, pdLoading, storedList]);

  const getAssetData = () => {
    return assetData?.map((el: any) => {
      let singleAssetData = {
        ...el,
        tableData: {
          logo: el.logo,
          ...getLeasingTableData(el, scrollActiveSection),
        },
      };
      return singleAssetData;
    });
  };
  const getPaginatedList = (page: number = 1, data: any[] = []) => {
    return data?.slice((page - 1) * 10, page * 10);
  };
  const [page, setPage] = useState(1);
  const [sortData, setSortData] = useState(defaultSortData);
  const [assetList, setAssetList] = useState(getAssetData()); //full unsorted asset list
  const [pastDealData, setPastDealData] = useState([...assetList]); //sorted asset list(if sorting is applied else full asset list)
  const [paginatedData, setPaginatedData] = useState([]); //sorted(if any) and paginated asset list
  const rowsPerPage = 10;

  useEffect(() => {
    if (assetData?.length && !paginatedData?.length) {
      const assetTableData = getAssetData();
      setAssetList([...assetTableData]);
      setPastDealData([...assetTableData]);
      const { pastSortData, pastSearchText } = assetsSort;
      if (pastSortData) {
        const dataArr = getSortAndSearchData(
          pastSortData?.sortOrder,
          pastSortData?.sortType,
          assetTableData,
          pastSearchText
        );

        setPaginatedData(getPaginatedList(1, dataArr));
      } else {
        setPaginatedData(getPaginatedList(1, assetTableData));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetData]);

  useEffect(() => {
    const hasSpecialChar = /[^a-zA-Z0-9 ]/.test(searchText);
    if (hasSpecialChar) return;
    let assetData = [...assetList];
    assetData = getSortAndSearchData(
      sortData?.sortOrder,
      sortData?.sortType,
      assetData,
      searchText
    );
    setPastDealData([...assetData]);

    setPaginatedData(getPaginatedList(1, assetData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, assetList]);

  useEffect(() => {
    const assetData = getAssetData();
    setAssetList(assetData);
    setPastDealData([...assetData]);

    setPaginatedData(getPaginatedList(1, assetData));
    setPage(1);
    setSortData(defaultSortData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollActiveSection, assetData]);

  useEffect(() => {
    setPaginatedData(getPaginatedList(page, pastDealData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const { pastPageNo, pastSortData, pastSearchText } = assetsSort;
    if (pastSortData) {
      const dataArr = getSortAndSearchData(
        pastSortData?.sortOrder,
        pastSortData?.sortType,
        assetList,
        pastSearchText
      );
      setPastDealData([...dataArr]);

      setPaginatedData(getPaginatedList(1, dataArr));
      setPage(pastPageNo);
      setSortData(pastSortData);
      dispatch(
        setAssetsSort({
          tabSection: scrollActiveSection as validSections,
          tab: 'past',
          pastPageNo: 1,
          pastSortData: defaultSortData,
          pastSearchText: searchText,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetList, scrollActiveSection]);
  const changePage = (event: any, pageNo: number) => {
    setPage(pageNo);
  };
  const tablePageCount = (totalCount: number, perPageItem: number) => {
    return totalCount < perPageItem ? 1 : Math.ceil(totalCount / perPageItem);
  };
  const getSortAndSearchData = (
    sortOrder: string,
    sortType: string,
    arr: any[],
    search: string = ''
  ) => {
    const sortedArr = arr?.sort((a, b) => {
      return sortOrder === 'descending'
        ? b?.tableData[sortType] - a?.tableData[sortType]
        : a?.tableData[sortType] - b?.tableData[sortType];
    });
    const filteredArr = sortedArr?.filter((el) =>
      el.partnerName.toLowerCase().includes(search?.toLowerCase())
    );
    return filteredArr;
  };

  const handleAssetClick = (asset) => {
    localStorage.setItem('isFromAssetDetail', 'true');
    dispatch(
      setAssetsSort({
        tabSection: getTabName(
          sectionMapping,
          asset.productCategory || asset.financeProductType
        ) as validSections,
        tab: 'past',
        pastPageNo: page,
        pastSortData: sortData,
        pastSearchText: searchText,
      })
    );
    setTimeout(() => {
      window.open(generateAssetURL(asset), '_self');
    }, 100);
  };

  const handleTableSorting = (id: string, isHeaderClick = false) => {
    if (!isMobile && isHeaderClick) {
      return;
    }
    let sortId = id;
    if (id === 'returns') {
      sortId = 'returnInValue';
    }
    if (id === 'raisedAmount') {
      sortId = 'raisedAmountInValue';
    }
    const isDescending =
      sortId === sortData?.sortType && sortData?.sortOrder === 'ascending';
    const dataArr = getSortAndSearchData(
      isDescending ? 'descending' : 'ascending',
      sortId,
      assetList,
      searchText
    );
    setPastDealData([...dataArr]);

    setPaginatedData(getPaginatedList(1, dataArr));
    setPage(1);
    setSortData({
      sortOrder: isDescending ? 'descending' : 'ascending',

      sortType: sortId,
    });
  };

  const getReturnPercentageStyle = (returnPercentage) => ({
    color: returnPercentage >= 100 ? '#02C988' : '##555770',
  });
  if (pdLoading || loading) {
    return <AssetTableSkeleton isMobileDevice={isMobile} />;
  }
  const getTableHeaderData = () => {
    return pastOfferHeader[scrollActiveSection];
  };
  const getSortingIcon = (data) => {
    if (data.isSortable) {
      return (
        <span
          onClick={() => handleTableSorting(data.id)}
          className={styles.SortingIconContainer}
        >
          <span className={`icon-sort ${styles.SortingIcon}`} />
        </span>
      );
    }
    return null;
  };
  const getInfoPopUp = (data) => {
    if (data?.info) {
      return (
        <TooltipCompoent
          linkClass={styles.InfoIcon}
          toolTipText={data?.infoDetail?.text}
        >
          <span className={`icon-info ${styles.Icon}`} />
        </TooltipCompoent>
      );
    }
    return null;
  };

  const getTableHeaderUI = (headers: TableHeaderModel[]) => {
    if (headers?.length > 0) {
      return (
        <thead>
          <tr>
            {headers.map((data: any) => {
              return (
                <th key={data?.id}>
                  <div className={styles.tableHeaderSingleCell}>
                    <span onClick={() => handleTableSorting(data.id, true)}>
                      {data.name} {` `}
                    </span>
                    {getSortingIcon(data)}
                    {getInfoPopUp(data)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
      );
    }
    return null;
  };

  const TableHeader = ({ headers }: TableProps) => {
    return getTableHeaderUI(headers);
  };

  const getOfferSubscriptionUI = (data: any) => {
    return (
      <td>
        {data?.tableData?.subscription}%{' '}
        <span className={styles.FlameIconContainer}>
          {data?.tableData?.subscription > 100 && (
            <span className={`icon-fire ${styles.FlameIcon}`} />
          )}
        </span>
      </td>
    );
  };

  const getpartnerLogo = (data: any) => {
    return data?.tableData?.logo ? (
      <Image
        width={112}
        height={36}
        layout="fixed"
        src={data?.tableData?.logo}
        alt="Logo"
        className={styles.partnerLogo}
      />
    ) : (
      <div className={styles.PartnerNameText}>{data?.partnerName}</div>
    );
  };

  const leasingBody = (data: any, index: number) => {
    return (
      <tr onClick={() => handleAssetClick(data)} key={`tableRow_${index}`}>
        <td>{getpartnerLogo(data)}</td>
        <td>{data?.tableData?.raisedAmount}</td>
        {getOfferSubscriptionUI(data)}
        <td>{data?.tableData?.irr}%</td>
        <td>
          <div>{data?.tableData?.returns}</div>
          <div
            style={getReturnPercentageStyle(data?.tableData?.returnPercentage)}
          >
            {data?.tableData?.returnPercentage}%
          </div>
        </td>
      </tr>
    );
  };

  const bondsBody = (data: any, index: number) => {
    return (
      <tr onClick={() => handleAssetClick(data)} key={`tableRow_${index}`}>
        <td>{getpartnerLogo(data)}</td>
        <td>{data?.tableData?.raisedAmount}</td>
        <td>{data?.tableData?.ytm}%</td>
        <td className={styles.BondsRatingText}>
          {data?.bonds?.bondRatedBy} {data?.tableData?.rating}
        </td>
      </tr>
    );
  };

  const inventoryBody = (data: any, index: number) => {
    return (
      <tr onClick={() => handleAssetClick(data)} key={`tableRow_${index}`}>
        <td>{getpartnerLogo(data)}</td>
        <td>{data?.tableData?.raisedAmount}</td>
        {getOfferSubscriptionUI(data)}
        <td>{data?.tableData?.yield || 0}%</td>
      </tr>
    );
  };

  const startupEquityBody = (data: any, index: number) => {
    return (
      <tr onClick={() => handleAssetClick(data)} key={`tableRow_${index}`}>
        <td>{getpartnerLogo(data)}</td>
        <td>{data?.tableData?.raisedAmount}</td>
        {getOfferSubscriptionUI(data)}
        <td>{data?.tableData?.leadInvestor || '-'}</td>
      </tr>
    );
  };

  const realEstateBody = (data: any, index: number) => {
    return (
      <tr onClick={() => handleAssetClick(data)} key={`tableRow_${index}`}>
        <td>{getpartnerLogo(data)}</td>
        <td>{data?.tableData?.raisedAmount}</td>
        <td>{data?.tableData?.irr}%</td>
        {getOfferSubscriptionUI(data)}
      </tr>
    );
  };

  const sdiBody = (data: any, index: number) => {
    return (
      <tr onClick={() => handleAssetClick(data)} key={`tableRow_${index}`}>
        <td>{getpartnerLogo(data)}</td>
        <td>{data?.tableData?.raisedAmount}</td>
        <td>{data?.tableData?.irr}%</td>
        <td className={styles.BondsRatingText}>
          {data?.sdiSecondary?.ratedBy} {data?.tableData?.rating}
        </td>
      </tr>
    );
  };

  const tableBodyObj = {
    bonds: bondsBody,
    leasing: leasingBody,
    inventory: inventoryBody,
    startupEquity: startupEquityBody,
    realEstate: realEstateBody,
    sdi: sdiBody,
    highyieldfd: bondsBody,
  };

  const getTableBody = (data: any, index: number) => {
    if (data) {
      return tableBodyObj[scrollActiveSection]
        ? tableBodyObj[scrollActiveSection](data, index)
        : null;
    }
    return null;
  };

  const TableBody = ({ dataArr, headers }: TableProps) => {
    const assetListData = isMobile ? pastDealData : paginatedData;
    return (
      <tbody>
        {assetListData.length > 0 &&
          assetListData.map((data: any, index: number) => {
            return getTableBody(data, index);
          })}

        {dataArr.length === 0 && (
          <>
            <td colSpan={headers?.length}></td>
          </>
        )}
      </tbody>
    );
  };

  const TablePagination = ({ dataArr }: TableProps) => {
    return (
      <div className={`TablePagination`}>
        <div className={`PaginationLeft`}>
          <span className="TextStyle2">
            Showing {(page - 1) * 10 + 1}-
            {dataArr.length > page * 10 ? page * 10 : dataArr.length} from{' '}
            {dataArr.length} data
          </span>
        </div>
        <div className={`PaginationRight`}>
          <Pagination
            onChange={changePage}
            variant="outlined"
            shape="rounded"
            defaultPage={1}
            page={page}
            count={tablePageCount(dataArr.length, rowsPerPage)}
            boundaryCount={1}
          />
        </div>
      </div>
    );
  };

  const getTablePagination = (dataArr) => {
    if (!isMobile) {
      return <TablePagination dataArr={dataArr} />;
    }
    return null;
  };

  const TableComponent = ({ dataArr, headers, className = '' }: TableProps) => {
    if (dataArr.length > 0) {
      return (
        <>
          <div className={styles.TableWrapper}>
            <table className={`CustomTable ${className}`}>
              <TableHeader headers={headers} />
              <TableBody dataArr={dataArr} />
            </table>
          </div>
          {getTablePagination(dataArr)}
        </>
      );
    } else {
      return (
        <NoData
          className={styles.NoDataPlaceholder}
          header={
            searchText
              ? 'No results found'
              : 'No past deals with current product'
          }
          subHeader={searchText ? 'Please try with different name' : ''}
        />
      );
    }
  };

  const handleSubTabChange = (subTab: string) => {
    const subCategorySelected = subTab.startsWith('SEBI Regulated')
      ? 'sebi'
      : 'rbi';
    setSubCategory(subCategorySelected);
  };

  return (
    <>
      {scrollActiveSection === 'sdi' ? (
        <SDIFilterTab
          handleSubTabChange={handleSubTabChange}
          subCategory={subCategory}
          SDITabArr={SDITabArr}
          customClass={styles.FilterTab}
        />
      ) : null}
      <div className={styles.PastOfferings} id="PastOfferingsContainer">
        <div className={styles.PastOfferingsRight}>
          <TableComponent
            className={styles.CustomTable}
            dataArr={pastDealData}
            headers={getTableHeaderData()}
          />
        </div>
      </div>
    </>
  );
};

export default PastOfferingTableView;
