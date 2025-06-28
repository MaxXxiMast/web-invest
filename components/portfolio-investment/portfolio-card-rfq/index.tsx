//Node Modules
import { useEffect, useState } from 'react';
import Link from 'next/link';

//Components
import PartnerLogo from '../../assetsList/partnerLogo';
import Button from '../../primitives/Button';
import CopyToClipboardWidget from '../../primitives/CopyToClipboard';
import Image from '../../primitives/Image';
import RfqReturnsWidget from '../rfq-returns-widget';
import StatusList from '../status-list';
import SortBy from '../../primitives/SortBy/SortBy';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';

//Utils
import {
  handleInvestmentDetails,
  getOrderStatus,
  StatusListArr,
  showModaltype,
  getStatus,
  getSlideData,
  statusType,
  isPastDate,
} from '../../../utils/portfolio';
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
  handleStringLimit,
  urlify,
} from '../../../utils/string';
import {
  dateFormatter,
  formatDateYearTime,
} from '../../../utils/dateFormatter';
import { getMarketStatus } from '../../../utils/marketTime';
import { trackEvent } from '../../../utils/gtm';
import { amoTextFormat, getLiquidityDate } from '../../portfolio/utils';
import { isAssetBasket } from '../../../utils/financeProductTypes';

//Hooks
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

//Redux
import { setRFQPendingOrder } from '../../../redux/slices/orders';
import { setOpenPaymentModal } from '../../../redux/slices/config';

//Types
import { RFQPendingOrder } from '../../../redux/types/rfq';

//Styles
import classes from './PortfolioCardRfq.module.css';

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
  getPortfolioDocument: (doc: string) => any;
  earlyLiveAssetIds: number[];
  liquidityDates: {
    cutOffDate: string;
    fallbackDate: string;
  };
};

type SharedBtnProps = {
  disableBtn: boolean;
  showLink: boolean;
  onClickOnPendingRFQOrder: (rfqPendingOrder: RFQPendingOrder) => void;
  amoLink: string;
  portfolio: any;
};

const RenderPaymentPendingBtn = ({
  showLink,
  disableBtn,
  onClickOnPendingRFQOrder,
  portfolio,
  amoLink,
}) => {
  return showLink ? (
    <Link
      href={amoLink ? `https://${amoLink}` : 'discover'}
      target="_blank"
      className={classes.DealBtnAnchor}
    >
      Complete Investment
    </Link>
  ) : (
    <Button
      width={'100%'}
      className={classes.Btn}
      disabled={disableBtn}
      onClick={() => {
        trackEvent('CompleteInvestment_clicked', getSlideData(portfolio));
        onClickOnPendingRFQOrder(getSlideData(portfolio));
      }}
    >
      Complete Investment
    </Button>
  );
};

const DealInfo = {
  title: `Detailed Info`,
  icon: 'DetailedIcon',
  modal: 'DEAL',
  key: 'Deal',
};

const ReturnSchedule = {
  title: `Return Schedule`,
  icon: 'ReturnsIcon',
  modal: 'SCHEDULE',
  key: 'Schedule',
};

const Sell = {
  title: `Sell`,
  icon: 'icon-sell-anytime-outline',
  style: `${classes.linkDisabled}`,
  key: 'Sell',
};

const CompleteInvestmentBtn = ({
  isAmo,
  orderID,
  portfolio,
  expiresBy,
  isPending,
  handleCardBtnClick,
  showLink,
  disableBtn,
  onClickOnPendingRFQOrder,
  amoLink,
}) => {
  const isRfqOrder = portfolio.isRfq === 1;
  const isOrderExpire = isPastDate(expiresBy);
  const showBtn = isPending && isRfqOrder && (isAmo || !isOrderExpire);

  return showBtn ? (
    <RenderPaymentPendingBtn
      showLink={showLink}
      disableBtn={disableBtn}
      onClickOnPendingRFQOrder={onClickOnPendingRFQOrder}
      portfolio={portfolio}
      amoLink={amoLink}
    />
  ) : (
    <Button
      width={'100%'}
      className={`${classes.Btn} ${classes.HideDesktop}`}
      onClick={() => {
        trackEvent('ReturnSchedule_clicked', orderID);
        handleCardBtnClick('SCHEDULE', orderID);
      }}
    >
      Return Schedule
    </Button>
  );
};

export const AmoCard = ({ showTag }) => {
  if (!showTag) {
    return null;
  }

  return (
    <div className={`flex ${classes.AmoTag}`}>
      <span
        className="icon-amo-icon"
        style={{
          color: 'var(--gripPrimaryGreen, #00b8b7)',
          fontSize: 18,
        }}
      />
      <p className={classes.AmoTagText}> After Market Order</p>
    </div>
  );
};

const PortfolioCardRfq = ({
  className = '',
  portfolio = {},
  sortByRef = null,
  handleCardAction,
  handleCardBtnClick,
  getPortfolioDocument,
  earlyLiveAssetIds = [],
  liquidityDates,
}: Props) => {
  const isMobile = useMediaQuery('(max-width: 992px)');
  const dispatch = useAppDispatch();

  const [filterArr, setFilterArr] = useState<any>([]);
  const getPartnerLogoheight = () => (isMobile ? 32 : 40);
  const getPartnerLogowidth = () => (isMobile ? 100 : 105);

  const dataArr: StatusListArr[] = getOrderStatus(portfolio);

  const portfolioStatus: statusType = getStatus(
    portfolio?.txns[0]?.status,
    portfolio?.transferInitiatedDate,
    portfolio?.isRfq
  );

  const { orderDate, expectedReturns, orderID, transactionID } =
    portfolio.txns[0] || {};

  const useOrderDate = orderDate;
  const LiquidityDate = getLiquidityDate(
    portfolio?.assetID,
    useOrderDate,
    earlyLiveAssetIds,
    portfolio?.isAssetReturnsCompleted,
    liquidityDates
  );

  const mobileFilterArr =
    portfolio?.isRfq === 1
      ? portfolioStatus == 'PENDING'
        ? [Sell, DealInfo, ReturnSchedule]
        : [Sell, DealInfo]
      : LiquidityDate
      ? [Sell]
      : [];

  useEffect(() => {
    const orderDocs =
      portfolio?.docs?.map((docData: any) => {
        return `${docData.displayName}_${docData.objectPath}`;
      }) ?? [];

    isMobile
      ? setFilterArr([...mobileFilterArr, ...orderDocs])
      : setFilterArr([...orderDocs]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio, isMobile]);

  const [propertiesArr, setPropertiesArr] = useState(
    handleInvestmentDetails(portfolio)
  );

  const {
    units,
    expiresBy,
    totalAmtReceived,
    noOfReturnsReceived,
    noOfReturnsScheduled,
    nextReturnAmount,
    nextReturnDate,
    isAmo,
    isRfqGenerated,
    amoLink,
    amoExpireBy,
    amoStartDate,
  } = portfolio || {};

  useEffect(() => {
    if (isMobile) {
      const arr = handleInvestmentDetails(portfolio)
        .filter((ele) => !ele?.hideInMobile)
        .sort((a, b) => a?.mobileOrder - b?.mobileOrder);
      setPropertiesArr([...arr]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const handleRedirect = () => {
    const { partner, assetDetails, assetID } = portfolio;
    return urlify(
      `/assetdetails/${partner?.name}/${assetDetails?.categoryName}/${assetDetails?.assetName}/${assetID}`.toLowerCase()
    );
  };
  const RenderList = ({ icon, title, isImageIcon = true }) => {
    return (
      <>
        <span className={`flex items-center gap-12`}>
          {isImageIcon ? (
            <span
              className={`${icon}`}
              style={{
                fontSize: 24,
                color: 'var(--gripLuminousDark, #282c3f)',
              }}
            />
          ) : (
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/${icon}.svg`}
              width={24}
              height={24}
              alt="ReturnsIcon"
              layout="fixed"
            />
          )}

          {title}
        </span>
        <span
          className="icon-caret-right"
          style={{
            fontSize: 15,
            color: 'var(--gripEbonyClay, #292c3e)',
          }}
        />
      </>
    );
  };

  const renderAssetDocuments = (
    activeIndex: number,
    setShowFilter: (arg0: boolean) => void,
    setActiveIndex: (arg0: number) => void,
    showFilter: any
  ) => {
    return filterArr.map((item, index) => {
      const { title, icon, modal, key, style = '' } = item ?? {};
      const isAssetDetail = ['Sell', 'Deal', 'Schedule'].includes(key);

      const itemDisplayName = isAssetDetail
        ? ''
        : getPortfolioDocument(item)?.displayName;

      if (title === 'Sell') {
        if (!LiquidityDate) return null;

        return (
          <li
            key={`item__${title}`}
            className={`flex justify-between items-center ${style}`}
          >
            <RenderList
              icon={icon}
              title={`${title} (Unlocks on ${LiquidityDate} 4:00 PM) `}
              isImageIcon={true}
            />
          </li>
        );
      }

      if (isAssetDetail) {
        return (
          <li
            key={`item__${title}`}
            className={`flex justify-between items-center ${style}`}
            onClick={() => {
              trackEvent('assetDocuments_clicked', transactionID);
              handleCardBtnClick(modal, orderID, transactionID);
            }}
          >
            <RenderList icon={icon} title={title} isImageIcon={false} />
          </li>
        );
      } else if (itemDisplayName) {
        const listIcon =
          itemDisplayName === 'Order Receipt'
            ? 'icon-rupees'
            : 'icon-deal-sheet';
        return (
          <li
            key={`item_${title}`}
            className="flex justify-between items-center"
            onClick={() => {
              handleCardAction(item);
              setActiveIndex(index);
              setShowFilter(!showFilter);
            }}
          >
            <RenderList icon={listIcon} title={itemDisplayName} />
          </li>
        );
      } else {
        return null;
      }
    });
  };

  const onClickOnPendingRFQOrder = (rfqPendingOrder: RFQPendingOrder) => {
    dispatch(setRFQPendingOrder(rfqPendingOrder));
    dispatch(setOpenPaymentModal(true));
  };

  const marketTiming = useAppSelector((state) => state.config.marketTiming);
  const marketStatus = getMarketStatus(
    marketTiming?.marketStartTime,
    marketTiming?.marketClosingTime,
    marketTiming?.isMarketOpenToday
  );

  const isMarketClosed = ['closed', 'opens in'].includes(marketStatus);
  const isPending = portfolioStatus === 'PENDING';
  const disableBtn = isAmo && !isRfqGenerated && isMarketClosed;
  const showLink = isAmo && !isRfqGenerated && !isMarketClosed;
  const isBasket = isAssetBasket(portfolio?.assetDetails);

  const ExpireText = ({ hideMobile = false }) => {
    let text = '';

    const orderExpireText = amoTextFormat(
      'Expires by',
      expiresBy,
      false,
      formatDateYearTime
    );
    const orderDateText = amoTextFormat(
      'Order placed on',
      useOrderDate,
      true,
      formatDateYearTime
    );
    const amoExpireText = amoTextFormat(
      'Expires by',
      amoExpireBy,
      true,
      formatDateYearTime
    );
    const amoActiveText = amoTextFormat(
      'Will be active on',
      amoStartDate,
      true,
      formatDateYearTime
    );

    if (isPending) {
      if (disableBtn) {
        text = amoActiveText;
      } else if (showLink) {
        text = amoExpireText;
      } else {
        text = orderExpireText;
      }
    } else {
      text = orderDateText;
    }

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

  const NaText = 'NA';
  const isinText = isBasket ? NaText : portfolio?.isinNumber ?? NaText;

  return (
    <div
      id={`${transactionID?.slice(-12) ?? 'NA'}`}
      className={`flex-column ${classes.Card} ${handleExtraProps(className)}`}
    >
      <div className={classes.Top}>
        <AmoCard showTag={isAmo} />
        <div className={`flex items-center ${classes.Header}`}>
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

            <span
              className={`${classes.Numbers} ${classes.FontSize12} ${classes.HideDesktop} ${classes.MobileIsin}`}
            >
              ISIN <span>{isinText}</span>
            </span>
          </a>
          <div className={classes.List}>
            <ul className="flex">
              {propertiesArr.map((ele) => {
                return (
                  <li key={`${ele?.label}`}>
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
                text={`${portfolio?.assetDetails?.assetName ?? NaText}`}
                className={classes.HideMobile}
              />
            </span>
            <span
              className={`flex items-center ${classes.Numbers} ${classes.HideMobile}`}
            >
              ISIN
              <span>{isinText}</span>
              <CopyToClipboardWidget
                text={`${isinText}`}
                className={classes.HideMobile}
                enabled={isinText !== NaText}
              />
            </span>
          </div>
          <div className={`${classes.HideDesktop} ${classes.MobileLotSize}`}>
            {units} Lot(s) purchased for {portfolio?.tenure}{' '}
            {portfolio?.tenure > 1 ? 'months' : 'month'} Tenure
          </div>
        </div>
        <div className={`flex items-center ${classes.Body}`}>
          <div className={`flex-column ${classes.StatusWrapper}`}>
            {portfolioStatus !== 'COMPLETE' ? (
              <StatusList dataArr={dataArr} />
            ) : (
              <RfqReturnsWidget
                className={classes.ReturnSummary}
                receivedReturns={totalAmtReceived?.toFixed(2) || 0}
                totalReturns={expectedReturns?.toFixed(2) || 0}
                nextReturnDate={nextReturnDate}
                nextReturnAmount={nextReturnAmount?.toFixed(2) || 0}
                noOfReturnsReceived={noOfReturnsReceived}
                noOfReturnsScheduled={noOfReturnsScheduled}
              />
            )}
          </div>
          {Number(expectedReturns) > Number(totalAmtReceived) && (
            <>
              {portfolioStatus === 'COMPLETE' ? (
                <div className={`${classes.Status} ${classes.Success}`}>
                  Earning Returns
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
        <ExpireText />
        <div className={`flex justify-between`}>
          <div
            className={`flex items-center ${classes.Left} ${classes.HideMobile}`}
          >
            <span
              className={classes.Link}
              onClick={() => {
                trackEvent('ReturnSchedule_clicked', orderID);
                handleCardBtnClick('SCHEDULE', orderID);
              }}
            >
              Return Schedule
            </span>

            <span
              className={classes.Link}
              onClick={() => {
                trackEvent('DetailedInfo_clicked', transactionID);
                handleCardBtnClick('DEAL', orderID, transactionID);
              }}
            >
              Detailed Info
            </span>

            {LiquidityDate ? (
              <span
                className={`flex_wrapper ${classes.Link} ${classes.linkDisabled}`}
              >
                Sell
                <TooltipCompoent
                  toolTipText={`Unlocks on ${LiquidityDate} 4:00 PM`}
                >
                  <span className={`icon-info ${classes.infoIcon}`} />
                </TooltipCompoent>
              </span>
            ) : null}
          </div>
          <div className={`flex items-center ${classes.Right}`}>
            <ExpireText hideMobile={true} />
            <CompleteInvestmentBtn
              isPending={isPending}
              onClickOnPendingRFQOrder={onClickOnPendingRFQOrder}
              portfolio={portfolio}
              handleCardBtnClick={handleCardBtnClick}
              orderID={orderID}
              expiresBy={expiresBy}
              isAmo={isAmo}
              amoLink={amoLink}
              disableBtn={disableBtn}
              showLink={showLink}
            />
            {filterArr.length > 0 && (
              <SortBy
                ref={sortByRef}
                isMobileDrawer
                data={filterArr}
                mobileDrawerTitle={`Actions`}
                handleFilterItem={(ele: any) => handleCardAction(ele)}
                customDataRenderer={renderAssetDocuments}
                className={`${classes.Menu}`}
              >
                <span
                  className="icon-dots"
                  style={{
                    fontSize: 20,
                    color: 'var(--gripEbonyClay, #292c3e)',
                  }}
                />
              </SortBy>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCardRfq;
