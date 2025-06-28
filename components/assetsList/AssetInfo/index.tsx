// NODE_MODULES
import React, { useState } from 'react';
import RHP from 'react-html-parser';

// Components
import TenureInMonthsAndYrs from '../TenureInMonthsAndYears';
import InfoModal from '../../primitives/InfoModal/Infomodal';
import PriceWidget from '../../primitives/PriceWidget';

// Utils
import {
  committedInvestment,
  getRepaymentCycle,
  assetStatus,
} from '../../../utils/asset';
import {
  isHighYieldFd,
  isAssetStartupEquity,
  financeProductTypeConstants,
  isAssetCommercialProduct,
} from '../../../utils/financeProductTypes';
import { toCurrecyStringWithDecimals } from '../../../utils/number';
import {
  fundingRoundTooltips,
  getAssetDetailInfo,
  percentageBasedOnSchedule,
} from '../utils';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// STYLES
import { classes } from '../AssetInfostyles';
import styles from './AssetInfo.module.css';

interface MyProps {
  asset: any;
  bondInvestmentOverView?: boolean;
  isPercentBar?: boolean;
  scheduleList?: any[];
  isAssetDetailPage?: boolean;
}

const AssetInfo: React.FC<MyProps> = (props) => {
  const [modal, setModal] = useState('');
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');

  const isMobile = useMediaQuery();

  const renderReturnsDefinitionModal = () => {
    if (
      props.asset?.financeProductType === financeProductTypeConstants.realEstate
    ) {
      setModal('yield');
    } else if (
      props.asset?.financeProductType === financeProductTypeConstants.inventory
    ) {
      setModal(`${props.asset?.returnsType?.toLowerCase()}`);
    } else {
      setModal('irr');
    }
  };

  const getPercentageComponent = () => {
    const { asset, scheduleList } = props;
    let collectedAmount = toCurrecyStringWithDecimals(
      asset.collectedAmount || 0,
      1,
      true
    );

    const status = assetStatus(asset);

    if (status === 'past') {
      collectedAmount = toCurrecyStringWithDecimals(
        asset.totalReturnsAmount || 0,
        1,
        true
      );
    }

    const hideCollectedValues = status !== 'active';

    return (
      <div className={`flex-column ${styles.percentageLoaderContainer}`}>
        <div className={styles.percentageLoaderProgress}>
          <span
            style={{
              width: `${
                hideCollectedValues
                  ? percentageBasedOnSchedule(scheduleList)
                  : committedInvestment(asset, true)
              }%`,
            }}
          ></span>
        </div>
        <div
          className={`flex justify-between ${styles.percentageTextContainer}`}
        >
          {!hideCollectedValues && (
            <div>
              <span className={styles.percentageTextgreen}>
                {collectedAmount?.split(' ')[0]}
                {collectedAmount?.split(' ')[1]}
              </span>
              <span className={styles.percentageTextBlack}>
                {' '}
                /{' '}
                {toCurrecyStringWithDecimals(
                  asset.totalAmount + asset.preTaxTotalAmount || 0,
                  1,
                  true
                )}
              </span>
            </div>
          )}

          <div className={styles.percentageTextBlack}>
            {hideCollectedValues
              ? percentageBasedOnSchedule(scheduleList)
              : committedInvestment(asset, true)}
            %
            <span className={styles.percentageTextCompleted}>
              {hideCollectedValues ? ' Returns' : ''} Completed
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderSuffixValue = (detail: any) => {
    return (
      <PriceWidget
        originalValue={`${detail.value} ${detail.suffix}`}
        cutoutValue={`${detail?.cutoutValue}${detail.suffix}`}
        isNegative={detail?.isNegative}
        isCampaignEnabled={detail?.isCampaignEnabled}
        classes={{
          mainValueClass: styles?.mainValueClass,
          cutOutValueClass: styles?.cutOutValueClass,
        }}
        imageSize={isMobile ? 14 : 17}
        irrDroppingDate={props.asset?.irrDroppingDate}
        id={detail?.id}
      />
    );
  };

  const { isPercentBar, isAssetDetailPage } = props;
  const assetDetail = getAssetDetailInfo(
    props?.asset,
    props?.bondInvestmentOverView
  );
  const isCommercialDeal = isAssetCommercialProduct(props.asset);

  const renderInterestComponent = () => {
    const repaymentCycle = getRepaymentCycle(props?.asset);
    if (
      !repaymentCycle ||
      isHighYieldFd(props?.asset) ||
      isAssetStartupEquity(props?.asset)
    ) {
      return null;
    }

    return (
      <div className={styles.InterestFrequency}>
        <span>Interest Frequency</span>
        <span>{repaymentCycle}</span>
      </div>
    );
  };

  const renderValue = (detail: any) => {
    let renderedValue: any;
    let value = detail?.value;

    if (detail.id === 'tenure') {
      renderedValue = (
        <TenureInMonthsAndYrs
          value={value}
          suffixClassName={styles.tenureSuffix}
        />
      );
    } else if (detail.suffix) {
      renderedValue = renderSuffixValue(detail);
    } else {
      renderedValue = detail.value;
    }
    return renderedValue;
  };

  return (
    <>
      <div
        className={`items-align-center-row-wise justify-between ${styles.Container}`}
      >
        <div className={`flex ${styles.AssetDetailContainer}`}>
          {assetDetail
            ?.filter((detail: any) => !detail?.hideInOverview)
            .map((detail: any) => {
              let value = detail?.value;
              const isCommercialProductTenure =
                detail.id === 'tenure' && isCommercialDeal;

              if (isCommercialProductTenure) {
                value = detail?.formatter?.();
              }
              return (
                <div
                  key={detail?.id}
                  className={`items-align-center-column-wise justify-start ${
                    classes.assetInfo
                  } ${isPercentBar ? styles.precentAssetInfo : ''}`}
                >
                  <div className={classes.value}>{renderValue(detail)}</div>
                  <div className={classes.label}>{detail.label}</div>
                  {detail?.heading ? (
                    <span
                      className={classes.modalText}
                      onClick={() => {
                        if (detail.label !== 'Funding Round') {
                          renderReturnsDefinitionModal();
                          setHeading(
                            detail?.modalHeading
                              ? detail.modalHeading
                              : detail?.heading
                          );
                          setContent(
                            detail?.isHtml ? RHP(detail?.data) : detail?.data
                          );
                        } else {
                          setModal(`${detail?.id}`);
                          setHeading(
                            detail?.modalHeading
                              ? detail.modalHeading
                              : detail?.heading
                          );
                          setContent(fundingRoundTooltips[detail?.id]);
                        }
                      }}
                    >
                      {detail?.heading}
                    </span>
                  ) : null}
                </div>
              );
            })}
        </div>
        {renderInterestComponent()}
        {isPercentBar && getPercentageComponent()}
      </div>
      <InfoModal
        isModalDrawer
        showModal={Boolean(modal.length)}
        modalTitle={heading}
        modalContent={content}
        className={styles.ModalPopupInner}
        handleModalClose={() => {
          setModal('');
          setContent('');
          setHeading('');
        }}
      />
    </>
  );
};

export default AssetInfo;
