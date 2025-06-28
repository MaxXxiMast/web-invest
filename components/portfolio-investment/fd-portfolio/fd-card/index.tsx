// NODE MODULES
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';

// Components
import PartnerLogo from '../../../assetsList/partnerLogo';
import SortBy from '../../../primitives/SortBy/SortBy';
import Image from '../../../primitives/Image';
import CopyToClipboardWidget from '../../../primitives/CopyToClipboard';
import FDReturnsWidget from '../fd-returns-widget';
import Button from '../../../primitives/Button';

// Hooks
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../../../redux/slices/hooks';

// API
import { fetchRepaymentSchedule } from '../../../../redux/slices/user';

// Utils
import {
  dateFormatter,
  formatDateYearTime,
} from '../../../../utils/dateFormatter';
import {
  handleInvestmentDetails,
  showModaltype,
  getStatus,
  statusType,
} from '../../../../utils/portfolio';
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
  handleStringLimit,
  urlify,
} from '../../../../utils/string';
import { amoTextFormat } from '../../../portfolio/utils';
import { getPaymentScheduleData } from './utils';
import { getTenure } from '../../../fd-graph/utils';

// Styles
import classes from './FDCard.module.css';

//Dynamic Imports
const MaterialModalPopup = dynamic(
  () => import('../../../primitives/MaterialModalPopup'),
  { ssr: false }
);

const VisualiseTable = dynamic(
  () => import('../../../primitives/VisualiseTable'),
  { ssr: false }
);

type Props = {
  className?: string;
  portfolio?: any;
  sortByRef: any;
  handleCardAction: (ele: string) => void;
  handleCardBtnClick?: (
    type: showModaltype,
    orderID?: string,
    txnID?: string
  ) => void;
};

type popupOptType = {
  title: string;
  icon: string;
  modal: showModaltype;
};

const FDCard = ({
  className = '',
  portfolio = {},
  sortByRef = null,
  handleCardAction,
  handleCardBtnClick,
}: Props) => {
  const getPartnerLogoheight = () => (window.innerWidth < 768 ? 32 : 40);
  const getPartnerLogowidth = () => (window.innerWidth < 768 ? 100 : 105);
  const isMobile = useMediaQuery();

  const dispatch = useDispatch();

  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false);

  const portfolioStatus: statusType = getStatus(
    portfolio?.txns?.[0]?.status,
    portfolio?.transferInitiatedDate,
    portfolio?.isRfq
  );
  const filterArr: popupOptType[] = [
    { title: `Detailed Info`, icon: 'DetailedIcon', modal: 'DEAL' },
  ];

  const [propertiesArr, setPropertiesArr] = useState(
    handleInvestmentDetails(portfolio)
  );

  const { totalAmtReceived, transactionID } = portfolio || {};

  const { orderID, orderDate, expectedReturns } = portfolio?.txns?.[0] || {};

  const { repaymentLoading } = useAppSelector((state) => state.user);

  const useOrderDate = orderDate;

  useEffect(() => {
    if (isMobile) {
      const arr = handleInvestmentDetails(portfolio)
        .filter((ele) => !ele?.hideInMobile)
        .sort((a, b) => a?.mobileOrder - b?.mobileOrder);
      setPropertiesArr([...arr]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const handleReturnSchedule = async (orderID: string) => {
    dispatch(
      fetchRepaymentSchedule(
        portfolio?.assetID,
        orderID ?? portfolio?.orderID
      ) as any
    );
    setShowPaymentSchedule(true);
  };

  const handleRedirect = () => {
    const { partner, assetDetails, assetID } = portfolio;
    return urlify(
      `/assetdetails/${partner?.name}/${assetDetails?.category}/${assetDetails?.assetName}/${assetID}`.toLowerCase()
    );
  };

  const renderAssetDetailsList = () => {
    return filterArr.map(({ title, icon, modal }, _idx) => (
      <li
        key={`title__${title}`}
        className="flex justify-between items-center"
        onClick={() => {
          handleCardBtnClick(modal, orderID, transactionID);
        }}
      >
        <span className="flex items-center gap-12">
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/${icon}.svg`}
            width={24}
            height={24}
            alt="ReturnsIcon"
            layout="fixed"
          />
          {title}
        </span>
        <span className={`icon-caret-down ${classes.DownIcon}`} />
      </li>
    ));
  };

  const renderExpireText = (hideMobile = false) => {
    const text = amoTextFormat(
      'FD Booked on',
      useOrderDate,
      true,
      formatDateYearTime
    );

    return (
      <span
        className={`${classes.Txt} ${
          hideMobile ? classes.HideMobile : classes.HideDesktop
        }`}
      >
        {text}
      </span>
    );
  };

  const renderPartnerLogo = () => {
    return (
      <a
        className={`flex items-center ${classes.Logo}`}
        href={handleRedirect()}
        target="_blank"
        rel="noreferrer"
      >
        <PartnerLogo
          asset={portfolio}
          showUnit={false}
          height={getPartnerLogoheight()}
          width={getPartnerLogowidth()}
          isDiscoveryPage={true}
        />
        <span className={classes.HideMobile}>
          <span className={`icon-link ${classes.LinkIcon}`} />
        </span>
      </a>
    );
  };

  const renderAssetProperties = () => {
    return (
      <div className={classes.List}>
        <ul className="flex">
          {propertiesArr.map((ele) => {
            return (
              <li key={`${ele?.label}__label`}>
                <div className={`flex-column ${classes.Item}`}>
                  <span className={classes.Val}>
                    {ele?.value}
                    {ele.suffix}
                  </span>
                  <span className={classes.Label}>{ele.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <>
      <div
        id={`${transactionID?.slice(-12) ?? 'NA'}`}
        className={`flex-column ${classes.Card} ${handleExtraProps(className)}`}
      >
        <div className={classes.Top}>
          <div className={`flex items-center ${classes.Header}`}>
            {renderPartnerLogo()}
            {renderAssetProperties()}
            <div className={`flex-column ${classes.AssetNumbers}`}>
              <span className={`${classes.OrderDate} ${classes.HideDesktop}`}>
                {useOrderDate
                  ? dateFormatter({
                      dateTime: useOrderDate,
                      timeZoneEnable: true,
                      dateFormat: formatDateYearTime,
                    })
                  : '-'}
              </span>
              <span className={`flex items-center ${classes.OrderAssetID}`}>
                Deal ID{' '}
                <span title={portfolio?.assetDetails?.assetName}>
                  {handleStringLimit(
                    portfolio?.assetDetails?.assetName.toUpperCase(),
                    12
                  )}
                </span>{' '}
                <CopyToClipboardWidget
                  text={`${portfolio?.assetDetails?.assetName ?? 'NA'}`}
                  className={classes.HideMobile}
                />
              </span>
            </div>
            <div className={`${classes.HideDesktop} ${classes.MobileLotSize}`}>
              {`Selected tenure for ${getTenure(portfolio?.tenure)}`}
            </div>
          </div>
          <div className={`flex items-center ${classes.Body}`}>
            <div className={`flex-column ${classes.StatusWrapper}`}>
              <FDReturnsWidget
                className={classes.ReturnSummary}
                receivedReturns={totalAmtReceived?.toFixed(2) || 0}
                totalReturns={expectedReturns?.toFixed(2) || 0}
                maturityDate={portfolio?.maturityDate}
              />
            </div>
            {Number(expectedReturns) > Number(totalAmtReceived) && (
              <>
                {portfolioStatus === 'COMPLETE' ? (
                  <div className={`${classes.Status} ${classes.Success}`}>
                    Earning Interest
                  </div>
                ) : (
                  <>
                    {portfolioStatus === 'TRANSFER' ||
                    portfolioStatus === 'CONFIRMED' ? (
                      <div className={`${classes.Status} ${classes.Pending}`}>
                        Awaiting Transfer
                      </div>
                    ) : (
                      <div className={`${classes.Status} ${classes.Pending}`}>
                        Payment Pending
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className={classes.Bottom}>
          {renderExpireText()}
          <div className={`flex justify-between`}>
            <div
              className={`flex items-center ${classes.Left} ${classes.HideMobile}`}
            >
              <span
                className={classes.Link}
                onClick={() => handleReturnSchedule(orderID)}
              >
                Return Schedule
              </span>
            </div>
            <div className={`flex items-center ${classes.Right}`}>
              {renderExpireText(true)}
              <Button
                width={''}
                className={`${classes.Btn} ${classes.HideDesktop}`}
                onClick={() => {
                  handleReturnSchedule(orderID);
                }}
              >
                Return Schedule
              </Button>
              {filterArr.length > 0 && (
                <SortBy
                  ref={sortByRef}
                  isMobileDrawer
                  data={filterArr.map(({ title }) => title)}
                  mobileDrawerTitle={`Actions`}
                  handleFilterItem={(ele: any) => handleCardAction(ele)}
                  customDataRenderer={renderAssetDetailsList}
                  className={`${classes.Menu} ${classes.HideDesktop}`}
                >
                  <span
                    className="icon-dots"
                    style={{
                      fontSize: 17,
                      color: 'var(--gripEbonyClay, #292c3e)',
                    }}
                  />
                </SortBy>
              )}
            </div>
          </div>
        </div>
      </div>
      <MaterialModalPopup
        isModalDrawer
        showModal={showPaymentSchedule}
        handleModalClose={() => {
          setShowPaymentSchedule(false);
        }}
        className={classes.TransactionModal}
        drawerExtraClass={classes.TransactionModalDrawer}
      >
        <VisualiseTable
          showSchedule={showPaymentSchedule}
          loading={repaymentLoading}
          data={getPaymentScheduleData(portfolio?.repaymentSchedule?.list)}
          handleBackEvent={() => {
            setShowPaymentSchedule(false);
          }}
          handleCloseModal={() => {
            setShowPaymentSchedule(false);
          }}
        />
      </MaterialModalPopup>
    </>
  );
};

export default FDCard;
