// Node Modules
import React, { useEffect, useRef, useState } from 'react';

// Components
import PartnerLogo from '../../assetsList/partnerLogo';
import RatingScale from '../../assetsList/RatingScale';
import { BadgeList } from '../../BadgeComponent';
import AssetProgress from './AssetProgress';
import MonthlyReturnCard from '../MonthlyReturnCard';
import TooltipCompoent from '../../primitives/TooltipCompoent/TooltipCompoent';
import MFLineChart from '../../mutual-funds/mf-line-chart/MFLineChart';

//Utils
import { getAssetOverview, getBondMFOverview } from './utils';
import { assetStatus } from '../../../utils/asset';
import {
  isAssetBondsMF,
  isHighYieldFd,
} from '../../../utils/financeProductTypes';
import { isHideCutOut } from '../../primitives/AssetCard/utils';
import { numberToIndianCurrencyWithDecimals } from '../../../utils/number';

//Hooks
import { useAppSelector } from '../../../redux/slices/hooks';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

//Styles
import styles from './AssetTopCard.module.css';

const AssetTopCard = () => {
  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const { selectedTenure, returnPercentage } = useAppSelector(
    (state) => state.mfConfig
  );
  const isMobile = useMediaQuery();
  const isFD = isHighYieldFd(asset);
  const isMF = isAssetBondsMF(asset);
  const dealStatus = assetStatus(asset);
  const irrDroppingDate = asset?.irrDroppingDate
    ? new Date(asset.irrDroppingDate)
    : null;
  const showIrr = isHideCutOut(irrDroppingDate, asset);
  const isDefault = useAppSelector(
    (state) => state.assets.showDefaultAssetDetailPage
  );

  const badgeScrollRef = useRef(null);
  const [showBgScroll, setShowBgScroll] = useState(true);
  const badges = asset?.badges ? asset?.badges?.split(',') : [];
  const badgeFilter = badges.filter(
    (badge: string) => badge && badge !== 'new'
  );
  const noBadges = !badgeFilter?.length;
  const [isVisible, setIsVisible] = useState(true);
  const isBondMutualFund = isAssetBondsMF(asset);
  const invAmt = 100000;
  const amountInPercent = (invAmt * (returnPercentage || 0)) / 100;

  useEffect(() => {
    const handleScroll = () => {
      if (badgeScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = badgeScrollRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5;
        setShowBgScroll(!isAtEnd);
      }
    };

    const scrollContainer = badgeScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const element = document.getElementById('assetLabel');
    if (element) {
      const elementWidth = element.offsetWidth;
      const windowWidth = window.innerWidth;
      setIsVisible(elementWidth <= 0.8 * windowWidth);
    }
  }, []);

  const { ratedBy = '', rating = '' } =
    asset?.assetMappingData?.calculationInputFields || {};
  const ratingInfo = `${ratedBy} ${rating}`;

  const assetOverviewInfo = isBondMutualFund
    ? getBondMFOverview(asset)
    : getAssetOverview(asset, isMobile, isFD);

  const renderDetails = () => {
    // Create a new array, optionally splicing the first element if dealstatus is 'past'
    const detailsToRender =
      dealStatus === 'past' && !isBondMutualFund
        ? assetOverviewInfo?.slice(0, -1)
        : assetOverviewInfo;

    if (isMF && isMobile) {
      return (
        <div className={styles.mfDetailsWrapper}>
          {detailsToRender?.map((data, _idx) => (
            <div key={data?.label} className={styles.detail}>
              <p className={styles.label}>
                {data?.label}
                {data?.tooltipContent ? (
                  <span className={styles.InfoIcon}>
                    <TooltipCompoent
                      toolTipText={data?.tooltipContent}
                      placementValue="bottom"
                    >
                      <span className={`icon-info`} />
                    </TooltipCompoent>
                  </span>
                ) : null}
              </p>
              <p className={styles.value}>
                {data?.cutOutValue && !showIrr ? (
                  <span className={styles.CutOut}>{data.cutOutValue}%</span>
                ) : null}
                {data?.prefix ? (
                  <span className={styles.prefix}>{data?.prefix} </span>
                ) : null}
                {data?.value}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <>
        {detailsToRender?.map((data, _idx) => (
          <React.Fragment key={data?.label}>
            <div className={styles.detail}>
              <div className={styles.label}>
                {data?.label}
                {data?.tooltipContent ? (
                  <span className={styles.InfoIcon}>
                    <TooltipCompoent
                      toolTipText={data?.tooltipContent}
                      placementValue="top"
                    >
                      <span className={`icon-info`} />
                    </TooltipCompoent>
                  </span>
                ) : null}
              </div>
              <div className={styles.value}>
                {data?.cutOutValue && !showIrr ? (
                  <span className={styles.CutOut}>{data.cutOutValue}%</span>
                ) : null}
                {data?.prefix ? (
                  <span className={styles.prefix}>{data?.prefix} </span>
                ) : null}
                {data?.value}
              </div>
            </div>
            {isMobile && _idx === 0 ? (
              <div className={styles.borderBottom} />
            ) : null}
          </React.Fragment>
        ))}
      </>
    );
  };

  const handleReplaceText = (input = '') => {
    if (typeof input !== 'string') return input;

    const match = input.match(/^(\d+(?:\.\d+)?)([MY])$/i);
    if (!match) return input;

    const [_, numberStr, unit] = match;
    const number = parseFloat(numberStr);
    const isSingular = number === 1;

    if (unit.toUpperCase() === 'M') {
      return `${parseFloat(Number(numberStr).toFixed(1))}${
        isSingular ? ' Month' : ' Months'
      }`;
    } else if (unit.toUpperCase() === 'Y') {
      return `${parseFloat(Number(numberStr).toFixed(1))}${
        isSingular ? ' Year' : ' Years'
      }`;
    }

    return input;
  };

  const renderMfInvestment = () => {
    if (isMF) {
      return (
        <div
          className={`${styles.dealProgress} ${styles.mfInvestment} ${
            noBadges ? styles.mfInvestmentFull : ''
          }`}
        >
          <div className={`flex-column ${styles.investmentText}`}>
            <p>
              Investment of <strong>₹1 Lakh</strong> would have become
            </p>
            <p
              className={`${styles.returnAmount} ${
                amountInPercent < 0 ? styles.red : ''
              }`}
            >
              <>{`${numberToIndianCurrencyWithDecimals(
                Number(invAmt + amountInPercent),
                1
              )}`}</>
              <span className={styles.returnPeriod}>
                {' '}
                in {handleReplaceText(selectedTenure)}
              </span>
            </p>
            {isMobile ? (
              <div
                className={`${styles.histogram} ${
                  amountInPercent < 0 ? styles.red : ''
                }`}
              >
                <span className="icon-histogram" />
              </div>
            ) : null}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderBottomDetails = () => {
    if (dealStatus === 'active') {
      if (!isFD && !isMF && isDefault) {
        return (
          <div className={styles.dealProgress}>
            <AssetProgress asset={asset} isFD={isFD} />
          </div>
        );
      }
      return null;
    }
    return null;
  };

  return (
    <>
      <div className={styles.cardContainer}>
        {asset?.detailsBadge && isVisible && (
          <div id="assetLabel" className={styles.assetLabel}>
            {asset?.detailsBadge}
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className={styles.logoContainer}>
            <PartnerLogo
              isPartnershipText
              asset={asset}
              showLot={false}
              height={isMobile ? 40 : 60}
              width={isMobile ? 80 : 120}
            />
            {isMF && !isMobile ? (
              <p className={styles.assetHeader}>{asset?.header}</p>
            ) : null}
          </div>

          <div
            className={`${styles.detailsWrapper} flex justify-between items-center`}
          >
            {!isMobile ? renderDetails() : null}
            <RatingScale
              rating={ratingInfo}
              // ratingScaleMapping={ratingScaleMapping}
            />
          </div>
        </div>
        {isMobile && isMF ? (
          <MFLineChart assetDescription={asset?.desc} />
        ) : null}

        {isMobile ? (
          isDefault ? (
            <div className="flex-column">
              {renderMfInvestment()}
              {renderDetails()}
            </div>
          ) : (
            <MonthlyReturnCard
              showOverview={() => {}}
              showLearnMore={() => {}}
              handleInvestNowBtnClick={() => {}}
              handleKycContinue={() => {}}
              isDefault={isDefault}
            />
          )
        ) : null}

        {!isMobile && !isFD && dealStatus === 'active' ? (
          <div className={styles.borderBottom}></div>
        ) : null}

        <div
          className={`flex justify-between items-center ${
            styles.assetCardFooter
          } ${isMobile ? 'direction-column-reverse' : ''}`}
        >
          {dealStatus === 'active' && !noBadges ? (
            <>
              <div className={styles.badgeScroll} ref={badgeScrollRef}>
                <BadgeList
                  badges={badges}
                  repeatInvestorsPercentage={asset?.repeatInvestorsPercentage}
                  isSliced={false}
                  badgeContainerClass={`${styles.badgeContainerClass} ${
                    isDefault
                      ? ''
                      : badgeFilter?.length <= 3
                      ? 'justify-center'
                      : ''
                  }`}
                  badgeClass={styles.badgeClass}
                  showIrr={showIrr}
                  irrDroppingDate={irrDroppingDate}
                />
              </div>
              {showBgScroll && (
                <div id="badgeBgScroll" className={styles.bgScroll}></div>
              )}
            </>
          ) : null}

          {!isMobile ? renderMfInvestment() : null}
          {renderBottomDetails()}
        </div>
      </div>
      {!isMobile && isMF ? <MFLineChart /> : null}
    </>
  );
};

export default AssetTopCard;
