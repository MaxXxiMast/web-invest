import React from 'react';
import Link from 'next/link';

// style
import classes from './PendingRequestNew.module.css';

// primitives
import Button from '../../primitives/Button';
import Image from '../../primitives/Image';

// utils
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';
import { handleStringLimit } from '../../../utils/string';
import { amoTextFormat } from '../../portfolio/utils';

type Props = {
  investmentValue: number;
  handleClick: () => void;
  amount: number;
  assetID: number;
  units: number;
  expireBy: string;
  partnerLogo: string;
  assetName: string;
  isMarketClosed: string;
  isAmo: number;
  rfqID: number | string;
  amoLink: string;
  amoStartDate: string;
  amoExpireBy: string;
};

const PayText = ({ amount = 0 }) => {
  return (
    <span className={classes.PayableInvestmentValue}>
      {`Pay ${numberToIndianCurrencyWithDecimals(amount)}`}
    </span>
  );
};

const PayPendingOrderBtn = (props) => {
  const { isAmo, isMarketClosed, rfqID, amount, handleClick } = props;
  const disableBtn = isAmo && isMarketClosed && !rfqID;

  const handleBtn = () => {
    if (disableBtn) {
      return;
    }
    handleClick?.();
  };
  return (
    <Button
      className={classes.DealBtn}
      onClick={handleBtn}
      disabled={disableBtn}
    >
      <PayText amount={amount} />
    </Button>
  );
};

const PendingRequestNew = (props: Props) => {
  const {
    assetName = '',
    isMarketClosed = '',
    isAmo = false,
    amoLink = '',
    rfqID = '',
  } = props;

  let expireText = amoTextFormat('Expires by', props?.expireBy, false);
  if (isAmo && !rfqID) {
    expireText = isMarketClosed
      ? amoTextFormat('Will be active on ', props?.amoStartDate, true)
      : amoTextFormat('Expires by', props?.amoExpireBy, true);
  }

  const showLink = isAmo && !rfqID && !isMarketClosed;

  return (
    <div className={classes.InvestCard}>
      <div className={`justify-between flex ${classes.CardTop}`}>
        {isAmo ? (
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
        ) : null}
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
              <span className={classes.PartnerName} title={props?.partnerLogo}>
                {handleStringLimit(props?.partnerLogo, 10)}
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
              <PayText amount={props?.amount} />
            </Link>
          ) : (
            <PayPendingOrderBtn
              isAmo={isAmo}
              isMarketClosed={isMarketClosed}
              rfqID={rfqID}
              amount={props?.amount}
              handleClick={props?.handleClick}
            />
          )}
        </div>
      </div>
      <div className={`flex ${classes.InvestmentIdDateContainer}`}>
        <div className={classes.InvestmentId}>{`ID : ${
          assetName && assetName.length > 14
            ? `${handleStringLimit(assetName, 7)}${assetName?.slice(-7)}`
            : assetName
        }`}</div>
        <div className={classes.InvestmentDate}>{expireText}</div>
      </div>
    </div>
  );
};

export default PendingRequestNew;
