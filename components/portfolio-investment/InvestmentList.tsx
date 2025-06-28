//Node Modules
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

//Components
import FdCard from './fd-portfolio/fd-card';
import InvestmentCardV2 from './InvestmentCardV2';
import PortfolioCardRfq from './portfolio-card-rfq';

//Utils
import {
  financeProductTypeConstants,
  isAssetBonds,
  isAssetStartupEquity,
  isHighYieldFd,
  isSDISecondary,
} from '../../utils/financeProductTypes';
import { showModaltype } from '../../utils/portfolio';
import { downloadDocument } from '../../utils/url';

//Redux
import {
  fetchReturnSchedule,
  fetchDetailedInfo,
} from '../../redux/slices/bonds';
import { fetchRepaymentSchedule } from '../../redux/slices/user';

//Hooks
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';

//APIs
import { callErrorToast } from '../../api/strapi';
import { getPortfolioDocSignedUrl, getSignedUrl } from '../../api/document';

//Styles
import classes from './InvestmentCardV2/style.module.css';

//Dynamic Imports
const MaterialModalPopup = dynamic(
  () => import('../primitives/MaterialModalPopup'),
  { ssr: false }
);
const TransactionHistory = dynamic(() => import('./transaction-history/TransactionHistory'), {
  ssr: false,
});
const DealInfoModal = dynamic(() => import('./deal-info-modal/DealInfoModal'), { ssr: false });

const InvestmentList = ({
  portfolio,
  isPortFolioCard = false,
  earlyLiveAssetIds = [],
  liquidityDates,
}) => {
  const {
    returnSchedule = [],
    returnScheduleLoading = false,
    detailedInfo = {},
  } = useAppSelector((state) => state.bond);
  const dispatch = useAppDispatch();

  const [showModalType, setShowModalType] = useState<showModaltype>(null);
  const [filterArr, setFilterArr] = useState([`Deal Info`, `Transaction Info`]);
  const isCorporateBondAsset = isAssetBonds(portfolio?.assetDetails);
  const isSDISecondaryAsset = isSDISecondary(portfolio?.assetDetails);
  const sortByRef = useRef(null);

  useEffect(() => {
    const { spvDocs } = portfolio;
    const spvDocuments =
      spvDocs &&
      spvDocs[portfolio?.spvID] &&
      spvDocs[portfolio?.spvID].map(
        (docData: any) => `${docData.displayName}_${docData.docID}`
      );

    const orderDocs = portfolio?.docs?.map((docData: any) => {
      return `${docData.displayName}_${docData.objectPath}`;
    });

    const cardOptionArr = isAssetStartupEquity(portfolio)
      ? [`Deal Info`]
      : [`Deal Info`, `Transaction Info`];
    let totalDocuments = cardOptionArr;

    if (orderDocs?.length) {
      // Remove duplicates document names
      totalDocuments = Array.from(new Set([...totalDocuments, ...orderDocs]));
    }

    if (spvDocuments?.length) {
      // Remove duplicates document names
      totalDocuments = Array.from(
        new Set([...totalDocuments, ...spvDocuments])
      );
    }

    if (totalDocuments?.length) {
      setFilterArr(totalDocuments);
    }

    return () => setFilterArr(cardOptionArr);
  }, [portfolio]);

  const hideExpectedReturns = () => {
    return [
      financeProductTypeConstants.startupEquity,
      financeProductTypeConstants.bonds,
      financeProductTypeConstants.sdi,
      financeProductTypeConstants.Baskets,
    ].includes(String(portfolio?.assetDetails?.financeProductType));
  };
  const handleCardBtnClick = (
    type: typeof showModalType = 'TRANSACTION',
    orderID?: string,
    transactionID?: string
  ) => {
    if (type === 'SCHEDULE')
      dispatch(
        fetchRepaymentSchedule(
          portfolio?.assetDetails?.assetID,
          orderID ?? portfolio?.txns[0]?.orderID
        )
      );
    if (type === 'DEAL' && (isCorporateBondAsset || isSDISecondaryAsset)) {
      if (transactionID) {
        dispatch(fetchDetailedInfo(transactionID));
      } else {
        dispatch(fetchReturnSchedule(portfolio?.assetDetails?.assetID));
      }
    }
    setShowModalType(type);
  };

  const openUrl = async (document: string) => {
    let docID = document.split('_')[1];
    let isPortfolioDoc = false;
    if (!docID) {
      return null;
    }
    const { spvDocs } = portfolio;
    let doc =
      spvDocs &&
      spvDocs[portfolio?.spvID] &&
      spvDocs[portfolio?.spvID].find(
        (docData: any) => Number(docData.docID) === Number(docID)
      );

    if (!doc) {
      isPortfolioDoc = true;
      doc =
        portfolio?.docs &&
        portfolio?.docs.find((docData: any) => docData.objectPath === docID);
    }
    if (!doc) {
      return;
    }

    const urlData = isPortfolioDoc
      ? await getPortfolioDocSignedUrl(doc.objectPath)
      : await getSignedUrl(doc);
    if (urlData && urlData?.url) {
      downloadDocument(urlData?.url);
    } else {
      callErrorToast('Cannot open the document, please try again in some time');
    }
  };

  const handleCardAction = (ele: string) => {
    if (ele === 'Deal Info') {
      handleCardBtnClick('DEAL');
      return;
    }
    if (ele === 'Transaction Info') {
      handleCardBtnClick('TRANSACTION');
      return;
    }
    openUrl(ele);
  };

  const getPortfolioDocument = (document: string) => {
    let docID = document.split('_').pop();
    if (!docID) {
      return null;
    }
    const { spvDocs } = portfolio;
    let doc =
      spvDocs &&
      spvDocs[portfolio?.spvID] &&
      spvDocs[portfolio?.spvID].find(
        (docData: any) => Number(docData.docID) === Number(docID)
      );

    if (!doc) {
      doc =
        portfolio?.docs &&
        portfolio?.docs.find((docData: any) => docData.objectPath === docID);
    }
    if (!doc) {
      return;
    }
    return doc;
  };

  /**
   * It renders the documents for a asset of the user so that they can download if needed
   *
   * @param activeIndex current checked index
   * @param setShowFilter dropdown update method
   * @param setActiveIndex active checked update method
   * @param showFilter if `true` then we should show filter dropdown
   * @returns List of all documents
   */
  const renderAssetDocuments = (
    activeIndex: number,
    setShowFilter: (arg0: boolean) => void,
    setActiveIndex: (arg0: number) => void,
    showFilter: any
  ) => {
    return filterArr.map((item, index) => {
      const isAssetDetail = item === 'Deal Info' || item === 'Transaction Info';
      const portfolioItem = isAssetDetail ? item : getPortfolioDocument(item);
      const liClassName = `${activeIndex === index ? 'Active' : ''}`;

      const itemDisplayName = isAssetDetail ? item : portfolioItem?.displayName;

      return portfolioItem ? (
        <li
          key={`item_${item}`}
          className={liClassName}
          onClick={() => {
            handleCardAction(item);
            setActiveIndex(index);
            setShowFilter(!showFilter);
          }}
        >
          <span>{`${itemDisplayName}`}</span>
        </li>
      ) : null;
    });
  };

  const renderCard = () => {
    if (isHighYieldFd(portfolio?.assetDetails)) {
      return (
        <li
          key={`${portfolio?.assetID}_${portfolio?.isinNumber}`}
          style={{ width: '100%' }}
        >
          <FdCard
            sortByRef={sortByRef}
            handleCardAction={handleCardAction}
            portfolio={portfolio}
            handleCardBtnClick={handleCardBtnClick}
          />
        </li>
      );
    }

    if (isPortFolioCard) {
      return (
        <li
          key={`${portfolio?.assetID}_${portfolio?.isinNumber}`}
          style={{ width: '100%' }}
        >
          <PortfolioCardRfq
            sortByRef={sortByRef}
            handleCardAction={handleCardAction}
            portfolio={portfolio}
            handleCardBtnClick={handleCardBtnClick}
            getPortfolioDocument={getPortfolioDocument}
            earlyLiveAssetIds={earlyLiveAssetIds}
            liquidityDates={liquidityDates}
          />
        </li>
      );
    }

    return (
      <li key={`${portfolio?.assetID}_${portfolio?.isinNumber}`}>
        <InvestmentCardV2
          filterArr={filterArr}
          sortByRef={sortByRef}
          renderAssetDocuments={renderAssetDocuments}
          handleCardAction={handleCardAction}
          portfolio={portfolio}
          isPortFolio
          handleCardBtnClick={handleCardBtnClick}
        />
      </li>
    );
  };

  return (
    <>
      {renderCard()}
      <MaterialModalPopup
        isModalDrawer
        showModal={
          showModalType === 'TRANSACTION' || showModalType === 'SCHEDULE'
        }
        handleModalClose={() => {
          setShowModalType(null);
        }}
        className={classes.TransactionModal}
        drawerExtraClass={classes.TransactionModalDrawer}
      >
        <TransactionHistory
          handleBackEvent={() => {
            setShowModalType(null);

            sortByRef?.current?.children[0]?.click();
          }}
          handleCloseModal={() => {
            setShowModalType(null);
          }}
          data={portfolio}
          isPortFolioCard={isPortFolioCard}
          hideExpectedReturns={hideExpectedReturns()}
          showSchedule={showModalType === 'SCHEDULE'}
        />
      </MaterialModalPopup>

      <MaterialModalPopup
        isModalDrawer
        showModal={showModalType === 'DEAL'}
        className={classes.DealInfoModal}
        handleModalClose={() => setShowModalType(null)}
      >
        <DealInfoModal
          handleBackEvent={() => {
            setShowModalType(null);

            sortByRef?.current?.children[0]?.click();
          }}
          portfolio={portfolio}
          isDetailedInfo={isPortFolioCard}
          returnSchedule={returnSchedule}
          detailedInfo={detailedInfo}
          loading={
            isCorporateBondAsset || isSDISecondaryAsset
              ? returnScheduleLoading
              : false
          }
          showCompletedReturns={
            isHighYieldFd(portfolio?.assetDetails)
              ? false
              : !isSDISecondaryAsset
          }
          dynamicData={isCorporateBondAsset || isSDISecondaryAsset}
        />
      </MaterialModalPopup>
    </>
  );
};

export default InvestmentList;
