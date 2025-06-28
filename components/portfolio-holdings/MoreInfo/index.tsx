import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// COMPONENTS
import Button, { ButtonType } from '../../primitives/Button';
import Image from '../../primitives/Image';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import CardTable, { transformAPIResponse } from '../CardTable';
import DealDetails from './DealDetails';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';
import DealDetailsSkeleton from '../../../skeletons/deal-details-skeleton/DealDetailsSkeleton';
import CardTableSkeleton from '../../../skeletons/card-tables-skeleton/CardTableSkeleton';

// API
import { fetchMoreInfo, fetchTransactionInfo } from '../../../api/order';

// UTILS
import { tableHeaders } from './utils';

// STYLES
import styles from './MoreInfo.module.css';

interface MoreInfoProps {
  showModal: boolean;
  onClose: () => void;
  securityID: number;
  logo: string;
  orderID: number;
  transactionLogo: string;
  units?: number;
  orderType?: string;
  activeProduct?: string;
  dealType?: string;
}

export interface DealDetailsType {
  isin: string;
  dealID?: string;
  tranche?: string;
  orderDate?: Date | string;
  dealSheet?: string;
  orderReceipt?: string;
  settlementDate?: Date | string;
}

interface CardTableType {
  isin: string;
  units: number;
}

const MoreInfo: React.FC<MoreInfoProps> = ({
  showModal,
  onClose,
  securityID,
  logo,
  orderID,
  transactionLogo,
  units,
  orderType,
  activeProduct,
  dealType,
}) => {
  const pathName = usePathname();
  const isHoldingsView =
    pathName?.includes('my_holdings') ||
    window.location.hash === '#my_holdings';
  const isTransactionsView =
    pathName?.includes('transactions') ||
    window.location.hash === '#transactions';

  const [tableData, setTableData] = useState<Array<any>>([]);
  const [holdingsData, setHoldingsData] = useState<CardTableType>({
    isin: '',
    units: 0,
  });
  const [transactionData, setTransactionData] = useState<DealDetailsType>({
    isin: '',
    dealID: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadHoldingsData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const apiResponse = await fetchMoreInfo(securityID);
        if (apiResponse && apiResponse.length > 0) {
          setHoldingsData({
            isin: apiResponse[0].isin || '',
            units: apiResponse[0].units || 0,
          });
        }
        const transformedData = transformAPIResponse(apiResponse);
        setTableData(transformedData);
      } catch (error) {
        console.error('Error fetching holdings data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadTransactionData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const transactionResponse = await fetchTransactionInfo(orderID);
        if (transactionResponse) {
          setTransactionData({
            isin: transactionResponse.isin || '',
            dealID: transactionResponse.dealID || '',
            tranche: transactionResponse.tranche || '',
            orderDate: transactionResponse.orderDate || '',
            dealSheet: transactionResponse.dealSheet || '',
            orderReceipt: transactionResponse.orderReceipt || '',
            settlementDate: transactionResponse.settlementDate || '',
          });
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (showModal) {
      if (isHoldingsView) {
        loadHoldingsData();
      } else if (isTransactionsView && orderID) {
        loadTransactionData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [securityID, orderID, showModal, isHoldingsView, isTransactionsView]);

  const renderContent = React.useCallback(() => {
    if (isLoading) {
      if (isHoldingsView) {
        return <CardTableSkeleton columns={tableHeaders.length} rows={3} />;
      } else {
        return <DealDetailsSkeleton />;
      }
    }
    if (isHoldingsView) {
      return (
        <>
          <CardTable tableHeaders={tableHeaders} tableData={tableData} />
        </>
      );
    } else {
      return (
        <DealDetails
          dealDetails={transactionData}
          orderType={orderType}
          activeProduct={activeProduct}
        />
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHoldingsView, isLoading, tableData, transactionData]);

  const displayData = isHoldingsView ? holdingsData : transactionData;

  return (
    <MaterialModalPopup
      showModal={showModal}
      handleModalClose={onClose}
      isModalDrawer
      cardStyles={{ padding: '0' }}
      className={`${styles.moreInfoPopup}`}
    >
      <div className="flex-column gap-12">
        <h4 className={styles.heading}>More Info</h4>
        <div className={`flex items-center justify-between ${styles.dealInfo}`}>
          <Image
            layout="fixed"
            src={logo || transactionLogo}
            alt="deal Logo"
            className={styles.logo}
          />
          <div className="flex-column gap-6">
            {isLoading ? (
              <>
                <p>
                  <CustomSkeleton
                    styles={{
                      width: displayData.isin
                        ? `${displayData.isin.length * 8}px`
                        : 100,
                      height: 16,
                    }}
                  />
                </p>
                <p>
                  <CustomSkeleton
                    styles={{
                      width: 100,
                      height: 16,
                    }}
                  />
                </p>
              </>
            ) : (
              <>
                {isHoldingsView ? (
                  <>
                    <p>ISIN: {displayData.isin}</p>
                    <p>
                      {dealType === 'active' ? 'Active Unit(s):' : 'Unit(s):'}{' '}
                      {units}
                    </p>
                  </>
                ) : (
                  <>
                    {orderType === 'SELL' ? null : (
                      <p>Deal ID: {(displayData as DealDetailsType).dealID}</p>
                    )}
                    <p> ISIN: {displayData.isin}</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {renderContent()}

        <div className={styles.okButton}>
          <Button
            variant={ButtonType.BorderLess}
            width="100%"
            onClick={onClose}
          >
            <span>OKAY</span>
          </Button>
        </div>
      </div>
    </MaterialModalPopup>
  );
};

export default MoreInfo;
