import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import dayjs from 'dayjs';

// styles
import classes from './PendingRequestCard.module.css';

// Primitives
import Button from '../../../primitives/Button';
import Image from '../../../primitives/Image';

// utils
import { numberToIndianCurrencyWithDecimals } from '../../../../utils/number';
import { isToday } from '../../../../utils/dateFormatter';

// api
import { getPaymentType } from '../../../../api/payment';
import { fetchUtrNumber } from '../../../../api/order';

// other components
import { RenderBankDetailModal } from '../../../confirmation/order-journey/VerticalStepper';
import { AmoCard } from '../../../portfolio-investment/portfolio-card-rfq';
import { amoTextFormat } from '../../../portfolio/utils';

const GenericModal = dynamic(
  () => import('../../../user-kyc/common/GenericModal'),
  {
    ssr: false,
  }
);

type Props = {
  investmentValue: number;
  handleClick: () => void;
  amount: number;
  assetID: number;
  units: number;
  expireBy: string;
  partnerLogo: string;
  assetName: string;
  transactionID: string;
  handleUtrModal?: () => void;
  isAmo: number;
  rfqID: number | string;
  amoLink: string;
  amoStartDate: string;
  amoExpireBy: string;
  isMarketClosed: boolean;
};

const RenderBeneficiaryStatement = ({
  isTodaySettlementDate,
  settlementDate,
  handleModal,
  amount,
}: {
  isTodaySettlementDate: boolean;
  settlementDate: string | undefined;
  handleModal: () => void;
  amount: number;
}) => {
  return isTodaySettlementDate ? (
    <p className={classes.note}>
      This order only supports IMPS/NEFT/RTGS payment. Be investment ready on
      the settlement day by adding &nbsp;
      <button onClick={handleModal} className={classes.BeneficiaryBtn}>
        Beneficiary
      </button>
      &nbsp; beforehand. Please pay &nbsp;
      <span className={classes.Bold}>
        {numberToIndianCurrencyWithDecimals(amount)}
      </span>
      &nbsp; before 2:00 PM today
    </p>
  ) : (
    <p className={classes.note}>
      This order only supports IMPS/NEFT/RTGS payment. Be investment ready on
      the settlement day (
      {dayjs(settlementDate).tz('Asia/Kolkata').format('DD MMM YYYY')}) by
      adding &nbsp;
      <button onClick={handleModal} className={classes.BeneficiaryBtn}>
        Beneficiary
      </button>
      &nbsp; beforehand.
    </p>
  );
};

const PayText = ({ btnText }: { btnText: string }) => (
  <span className={classes.PayableInvestmentValue}>{btnText}</span>
);

const RenderPayNowBtn = ({
  showPayNeftBtn,
  handleUtrModal,
  handleClick,
  disableBtn,
  btnText,
}: {
  showPayNeftBtn: boolean;
  handleUtrModal: () => void;
  handleClick: () => void;
  disableBtn: boolean;
  btnText: string;
}) => (
  <Button
    className={classes.DealBtn}
    onClick={() => {
      showPayNeftBtn ? handleUtrModal() : handleClick();
    }}
    disabled={disableBtn}
  >
    <PayText btnText={btnText} />
  </Button>
);

const PendingRequestCard = (props: Props) => {
  const [isOnlineAvailable, setIsOnlineAvailable] = useState(true);
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [isTodaySettlementDate, setIsTodaySettlementDate] = useState(true);
  const [settlementDate, setSettlementDate] = useState();
  const [neftDetails, setNeftDetails] = useState({});
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [utrStatus, setUtrStatus] = useState();

  const {
    transactionID = '',
    amount = '',
    assetID = '',
    assetName = '',
    isAmo,
    rfqID,
    amoLink,
    amoStartDate,
    amoExpireBy,
    isMarketClosed,
  } = props;

  let expireText = amoTextFormat('Expires by', props?.expireBy);

  if (isAmo && !rfqID) {
    expireText = isMarketClosed
      ? amoTextFormat('Will be active on', amoStartDate, true)
      : amoTextFormat('Expires by ', amoExpireBy, true);
  }

  const showLink = isAmo && !rfqID && !isMarketClosed;

  useEffect(() => {
    if (assetID && amount && transactionID) {
      handlePaymentType();
      fetchUtrStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetID, amount, transactionID]);

  const fetchUtrStatus = async () => {
    const data = await fetchUtrNumber(transactionID);
    setUtrStatus(data?.utr);
  };

  const handlePaymentType = async () => {
    try {
      const data = await getPaymentType(
        assetID,
        Math.round(Number(amount)),
        transactionID
      );

      const priorityExchange =
        Number(data?.NSE?.priority) === 1 ? 'NSE' : 'BSE';
      const responseData: any = data?.[priorityExchange] || {};

      const isUpiAvailable = responseData?.upi?.isAllowed;
      const isNetBankingAvailable = responseData?.netBanking?.isAllowed;

      setIsOnlineAvailable(isUpiAvailable || isNetBankingAvailable);

      setIsOfflineAvailable(
        responseData?.offline?.isAllowed && !responseData?.offline?.isExpired
      );

      setNeftDetails(responseData?.offline?.details || {});
      setSettlementDate(responseData?.settlementDate);

      const isTodayDate = isToday(responseData?.settlementDate);
      setIsTodaySettlementDate(isTodayDate);
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleModal = () => setShowBeneficiaryModal(true);

  const isNeftAvailable = isOfflineAvailable && isTodaySettlementDate;

  const showPayNeftBtn = !isOnlineAvailable && isNeftAvailable;

  let btnText = showPayNeftBtn
    ? "I've paid via NEFT/RTGS"
    : 'Pay ' + numberToIndianCurrencyWithDecimals(props?.amount);

  btnText = utrStatus ? 'UTR recorded' : btnText;

  const disableBtn =
    (!isOnlineAvailable && isOfflineAvailable && !isTodaySettlementDate) ||
    utrStatus ||
    (isAmo && isMarketClosed && !rfqID);

  return (
    <div className={classes.InvestCard}>
      <div className={`justify-between flex ${classes.CardTopContainer}`}>
        <AmoCard showTag={isAmo} />
        <div className={`justify-between flex `}>
          <div
            className={`${classes.headerLeft} ${
              !props?.units ? classes.headerLeftAlign : ''
            }`}
          >
            <div className={classes.InvestmentCardIcon}>
              {props?.partnerLogo &&
              (props?.partnerLogo as string).includes('https') ? (
                <Image
                  src={props?.partnerLogo}
                  width={108}
                  height={41}
                  layout="fixed"
                  alt={'Partner Logo'}
                  className={classes.LogoImage}
                />
              ) : (
                <span className={classes.PartnerName}>
                  {props?.partnerLogo}
                </span>
              )}
            </div>
            {!props?.units ? null : (
              <div className={classes.numberOfLots}>
                {`x ${props?.units} Lot(s)`}
              </div>
            )}
          </div>

          <div className={classes.FooterNewRight}>
            {showLink ? (
              <Link
                href={amoLink ? `https://${amoLink}` : 'discover'}
                target={'_blank'}
                className={classes.DealBtnAnchor}
                passHref
              >
                <span className={classes.PayableInvestmentValue}>
                  Pay {numberToIndianCurrencyWithDecimals(props?.amount)}
                </span>
              </Link>
            ) : (
              <RenderPayNowBtn
                showPayNeftBtn={showPayNeftBtn}
                handleUtrModal={props?.handleUtrModal}
                handleClick={props?.handleClick}
                disableBtn={disableBtn}
                btnText={btnText}
              />
            )}
          </div>
        </div>
        {!isOnlineAvailable && !showLink ? (
          <p className={`flex ${classes.CardBottom}`}>
            <span className={`icon-info ${classes.InfoIcon}`} />
            {utrStatus ? (
              <p className={classes.note}>
                We’ve recorded your payment UTR and proof. You’ll be informed
                once the order is settled at the Exchange.
              </p>
            ) : (
              <RenderBeneficiaryStatement
                isTodaySettlementDate={isTodaySettlementDate}
                settlementDate={settlementDate}
                handleModal={handleModal}
                amount={props?.amount}
              />
            )}
          </p>
        ) : null}
      </div>
      <div className={`flex ${classes.InvestmentIdDateContainer}`}>
        <div className={classes.InvestmentId}>{`ID : ${
          assetName && assetName.length > 14
            ? assetName?.slice(0, 7) + '...' + assetName?.slice(-7)
            : assetName
        }`}</div>
        <div className={classes.InvestmentDate}>{expireText}</div>
      </div>
      <GenericModal
        showModal={showBeneficiaryModal}
        hideIcon={true}
        drawerExtraClass={classes.Drawer}
        hideClose={false}
        handleModalClose={() => setShowBeneficiaryModal(false)}
      >
        <RenderBankDetailModal
          neftDetails={neftDetails}
          settlementDate={settlementDate}
          totalPayableAmount={amount}
        />
      </GenericModal>
    </div>
  );
};

export default PendingRequestCard;
