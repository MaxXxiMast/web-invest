import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import orderBy from 'lodash/orderBy';

import Divider from '@mui/material/Divider';

import { numberToCurrency } from '../../utils/number';
import { getObjectClassNames } from '../utils/designUtils';
import { mediaQueries } from '../utils/designSystem';
import { useAppSelector } from '../../redux/slices/hooks';

const classes: any = getObjectClassNames({
  announcedDate: {
    padding: '40px 25px 0 20px',
    fontWeight: 800,
    fontSize: 16,
    lineHeight: '24px',
    color: '#282C3F',
  },
  dateYear: {
    fontWeight: 600,
    fontSize: 12,
    lineHeight: '20px',
    color: 'var(--gripGullGrey, #99A5B9)',
  },
  fundingContainer: {
    marginTop: 16,
    background: '#FFFFFF',
    border: '1px solid #F1F1F1',
    boxSizing: 'border-box',
    borderRadius: 8,
    [mediaQueries.nonPhone]: {
      width: '120%',
    },
  },
  fundingDetailsContainer: {
    background: 'rgb(0,184,183, 0.1)',
    borderRadius: 4,
    padding: '29px 24px',
    maxWidth: 455,
    minHeight: 110,
    justifyContent: 'space-between',
    [mediaQueries.nonPhone]: {
      width: 525,
    },
    [mediaQueries.phone]: {
      flexDirection: 'column',
    },
  },
  fundingHeading: {
    fontWeight: 600,
    fontSize: 14,
    lineHeight: '17px',
    color: 'var(--gripGullGrey, #99A5B9)',
    [mediaQueries.phone]: {
      margin: '4px 0',
    },
  },
  fundingValue: {
    fontWeight: 600,
    fontSize: 16,
    lineHeight: '19px',
    color: '#282C3F',
  },
  valuationContainer: {
    [mediaQueries.nonPhone]: {
      width: '35%',
    },
  },
  investorContainer: {
    [mediaQueries.nonPhone]: {
      width: '50%',
    },
    [mediaQueries.phone]: {
      marginTop: 16,
    },
  },
  fundingBadge: {
    padding: '8px 12px',
    fontWeight: 800,
    fontSize: 16,
    lineHeight: '16px',
    color: '#282C3F',
    position: 'relative',
    zIndex: 2,
    marginTop: -10,
    marginBottom: -17,
    marginLeft: 25,
    background: '#FFFFFF',
    border: '1px solid #F1F1F1',
    boxSizing: 'border-box',
    borderRadius: 4,
  },
  break: {
    borderTop: '1px solid #eaedf1',
    height: '100%',
    width: '100%',
  },
  fundingContentContainer: {
    padding: '38px 20px 38px 0',
    [mediaQueries.nonPhone]: {
      width: 'auto',
    },
    [mediaQueries.phone]: {
      width: '90%',
    },
  },
  viewAllButton: {
    fontWeight: 800,
    fontSize: 14,
    lineHeight: '24px',
    color: '#00357C',
    padding: 12,
    cursor: 'pointer',
  },
  indicator: {
    marginBottom: -30,
    marginLeft: -4,
  },
  indicatorDot: {
    display: 'inline-block',
    background: 'var(--gripPrimaryGreen, #00B8B7)',
    borderRadius: '50%',
    width: 8,
    height: 8,
  },
});

function StartupEquityDetails() {
  const [showButton, setShowButton] = useState(true);
  const [fundingDetails, setFundingDetails] = useState<Object[]>([]);

  const selectedAsset = useAppSelector((state) => state.assets.selectedAsset);

  useEffect(() => {
    const partnerFundingDetails = orderBy(
      selectedAsset?.partnerFundingDetails,
      ['announcementDate'],
      'desc'
    );
    if (partnerFundingDetails.length < 3) {
      setShowButton(false);
    }

    if (!showButton) {
      setFundingDetails(partnerFundingDetails);
    } else {
      const partnerDetails = partnerFundingDetails.slice(0, 2);
      setFundingDetails(partnerDetails);
    }
  }, [selectedAsset, showButton]);

  const fundingBadge = (roundName: string) => {
    return (
      <>
        <div className={classes.indicator}>
          <span className={classes.indicatorDot} />
        </div>

        <div className={classes.fundingBadge}>{roundName}</div>
      </>
    );
  };

  const renderFundingDetails = (
    raisedAmount: string | number,
    leadInvestors: string
  ) => {
    return (
      <div className={`flex ${classes.fundingDetailsContainer}`}>
        <div className={`flex-column ${classes.valuationContainer}`}>
          <div className={classes.fundingHeading}>Valuation</div>
          <div className={classes.fundingValue}>
            $
            {parseFloat(String(raisedAmount)) >= 1
              ? `${numberToCurrency(raisedAmount, true)} M`
              : numberToCurrency(
                  parseFloat(String(raisedAmount)) * 1000000,
                  true
                )}
          </div>
        </div>
        <div className={`flex-column ${classes.investorContainer}`}>
          <div className={classes.fundingHeading}>Key Investor</div>
          <div className={classes.fundingValue}>{leadInvestors}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`flex-column ${classes.fundingContainer}`}>
        {fundingDetails.map((details: any) => {
          const { announcementDate, raisedAmount, roundName, leadInvestors } =
            details;
          const year = dayjs(announcementDate).format('YYYY');
          const month = dayjs(announcementDate).format('MMM');

          const uniqueId = details?.id || `${roundName}-${announcementDate}`;

          return (
            <div key={uniqueId} className="flex">
              <div className={classes.announcedDate}>
                {month} <span className={classes.dateYear}>{year}</span>
              </div>
              <Divider orientation="vertical" flexItem />
              <div className={`flex-column ${classes.fundingContentContainer}`}>
                {fundingBadge(roundName)}
                {renderFundingDetails(raisedAmount, leadInvestors)}
              </div>
            </div>
          );
        })}

        {showButton ? (
          <>
            <div className={classes.break} />
            <div
              className="flex_wrapper"
              onClick={() => {
                setShowButton(false);
              }}
            >
              <div className={classes.viewAllButton}>View All</div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

export default StartupEquityDetails;
