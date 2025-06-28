import React, { useEffect } from 'react';
import Pagination from '@mui/material/Pagination';
import Tabination from '../primitives/Tabination/Tabination';
import Image from '../primitives/Image';
import { StatusTag } from '../referral-dashboard';

import styles from '../../styles/Referral/RewardHistoryTable.module.css';

import {
  filtersToExclude,
  tabArr,
  textAvailableForStatus,
} from '../../utils/referral';

type TableData = {
  reward: {
    icon: any;
    amount: any;
    status: any;
  };
  rewardFor: {
    title: any;
    user: any;
    reason: string;
  };
  assetInvested: {
    code: any;
    status: any;
  };
  date: any;
  status: any;
};

type TableProps = {
  data: TableData[];
  rowsPerPage: number;
  headers: any[];
  className?: any;
  filter?: any;
};

const RewardHistoryTable = ({
  data,
  rowsPerPage,
  headers,
  className,
  filter = '',
}: TableProps) => {
  const tableArr: TableData[] = filtersToExclude.includes(
    filter.toString().toLowerCase()
  )
    ? data
    : data.filter((item) => item.status === filter.toString().toLowerCase());

  const [page, setPage] = React.useState(1);
  const [tableData, setTableData] = React.useState(
    tableArr?.slice(0, rowsPerPage)
  );
  useEffect(() => {
    const updatedTableData: TableData[] = filtersToExclude.includes(
      filter.toString().toLowerCase()
    )
      ? data
      : data.filter((item) => item.status === filter.toString().toLowerCase());
    setTableData(updatedTableData?.slice(0, rowsPerPage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const [activeTab, setActiveTab] = React.useState(tabArr[0]);

  const tabChangeEvent = (tabName: any) => {
    setActiveTab(tabName);
  };

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
    if (rowsPerPage > 0) {
      const newArr = tableArr?.slice(
        (newPage - 1) * rowsPerPage,
        (newPage - 1) * rowsPerPage + rowsPerPage
      );
      setTableData(newArr);
    }
  };

  const RewardCard = ({ data }: any) => {
    return (
      <div className={`${styles.RefereeCard} ${data.status}`}>
        <div className={`${styles.CardIcon} Heading3`}>
          <Image 
            src={data.icon} 
            alt={data.status}
            width={32}
            height={32}
            layout={'intrinsic'} 
          />
        </div>
        <div className={styles.CardDetails}>
          <h3 className="Heading4">{data.amount}</h3>
          <p className="TextStyle1">{data.status}</p>
        </div>
      </div>
    );
  };

  function tablePageCount(totalCount: number, perPageItem: number) {
    return totalCount < perPageItem ? 1 : Math.ceil(totalCount / perPageItem);
  }

  const MobileCard = ({ data, className }: any) => {
    const getStylesForAssetCode = () => {
      const isStatusAvailable = textAvailableForStatus.includes(data.status);
      return `${isStatusAvailable ? styles.CardFooterLeft : ''} TextStyle1`;
    };

    const getStylesForAssetInvestedStatus = () => {
      return `${
        data.assetInvested.status === 'Accepting Investments' ? 'accepting' : ''
      }`;
    };

    return (
      <div className={`${styles.MobileCard} ${className}`}>
        <div className={styles.CardBody}>
          <div className={styles.CardBodyInner}>
            <div className={styles.CardBodyLeft}>
              <RewardCard data={data.reward} />
            </div>
            <div className={styles.CardBodyRight}>
              <StatusTag status={data.status} className={styles.CardStatus} />
              <div className={`${styles.CardDate} TextStyle1`}>{data.date}</div>
            </div>
          </div>
          <div className={`${styles.ForText} TextStyle1`}>
            {data.rewardFor.title ? data.rewardFor.title : ''} {` `}
            <br />
            {data?.rewardFor?.reason || ''}
          </div>
        </div>
        {(data.assetInvested.code || data.assetInvested.status) &&
          data.status !== 'redeemed' &&
          data.status !== 'redeeming' && (
            <div className={styles.CardFooter}>
              <div className={`${styles.AssetInvestedText} TextStyle1`}>
                <div className={styles.CardFooterInner}>
                  <div className={getStylesForAssetCode()}>
                    {data.assetInvested.code ? data.assetInvested.code : ''}
                  </div>
                  <div className={`${styles.CardFooterRight} TextStyle1`}>
                    {data.assetInvested.status ? (
                      <span className={getStylesForAssetInvestedStatus()}>
                        {data.assetInvested.status}{' '}
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  const renderMobileCard = (item: TableData, index: number) => {
    const mobileCardClass = item.status === 'redeemed' ? styles.RedeemedBg : '';
    return (
      <MobileCard
        className={mobileCardClass}
        data={item}
        key={`MobileCard__${index}`}
      />
    );
  };

  const renderTabData = (tab: string, index: number) => {
    const referralData =
      tab !== 'All'
        ? tableArr.filter((item) => item.status === tab.toLowerCase())
        : tableArr;
    return (
      <div tab-ele={tab} key={`${tab}-${index}`}>
        {referralData.map(renderMobileCard)}
      </div>
    );
  };

  const getStyleForAssetStatus = (item: any) => {
    return `${
      item.assetInvested.status === 'Accepting Investments' ? 'accepting' : ''
    }`;
  };

  const renderAssetInvestedCodeAndStatus = (item: any) => {
    return (
      <div className={`${styles.AssetInvestedText} TextStyle1`}>
        {item.assetInvested.code ? item.assetInvested.code : ''}
        <br />

        {item.assetInvested.status ? (
          <span className={getStyleForAssetStatus(item)}>
            {item.assetInvested.status}{' '}
          </span>
        ) : (
          ''
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`${className} ${styles.DesktopTable}`}>
        <table className={styles.RewardHistoryTable}>
          <thead>
            <tr>
              {headers.map((item: any) => {
                return (
                  <th key={`item__${item}`} className="TextStyle2">
                    {item}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {tableData.map((item: any) => {
              return (
                <tr
                  key={`item__${item.rewardFor.title}`}
                  className={`${item.status === 'redeemed' ? 'redeemed' : ''}`}
                >
                  <td>
                    <RewardCard data={item.reward} />
                  </td>
                  <td>
                    <div className={`${styles.ForText} TextStyle1`}>
                      {item.rewardFor.title ? item.rewardFor.title : ''}
                      {item?.rewardFor?.reason ? (
                        <>
                          <br />
                          <br />
                          {item?.rewardFor?.reason || ''}
                        </>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    {item.status === 'redeemed' || item.status === 'redeeming'
                      ? ''
                      : renderAssetInvestedCodeAndStatus(item)}
                  </td>
                  <td>
                    <StatusTag status={item.status} />
                  </td>
                  <td>
                    <span className="TextStyle1"> {item.date}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={styles.TablePagination}>
          <div className={styles.PaginationLeft}>
            <span className="TextStyle2">
              Showing {page}-{tablePageCount(tableArr.length, rowsPerPage)} from{' '}
              {tablePageCount(tableArr.length, rowsPerPage)} pages
            </span>
          </div>
          <div className={styles.PaginationRight}>
            <Pagination
              onChange={(event, val) => handleChangePage(event, val)}
              variant="outlined"
              shape="rounded"
              defaultPage={1}
              page={page}
              count={tablePageCount(tableArr.length, rowsPerPage)}
            />
          </div>
        </div>
      </div>

      {/* MOBILE SECTION */}
      <div className={styles.MobileTabination}>
        <Tabination
          showShortBy={false}
          tabArr={tabArr}
          className={`${styles.MobileReferalHistoryTab}`}
          activeTab={activeTab}
          tabContentClass={styles.MobileReferalHistoryTabContent}
          handleTabChange={(tabName: any) => tabChangeEvent(tabName)}
          id={'MobileReferalHistoryTab'}
        >
          {tabArr.map(renderTabData)}
        </Tabination>
      </div>
    </>
  );
};

export default RewardHistoryTable;
