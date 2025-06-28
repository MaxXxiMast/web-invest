import React from 'react';
import Link from 'next/link';

import Image from '../../Image';
import Button, { ButtonType } from '../../Button';
import TooltipCompoent from '../../TooltipCompoent/TooltipCompoent';
import RatingScale from '../../../assetsList/RatingScale';

import { numberToIndianCurrency } from '../../../../utils/number';
import {
  AssetType,
  RegulatedBy,
} from '../../../FilterAndCompare/utils/helperUtils';

import styles from './ResultRow.module.css';

const ResultRow: React.FC<any> = ({
  deal,
  handleChangeDealModal,
  totalNumberOfDeals,
  redirectToAsset,
  tooltips,
}) => {
  const RatingInfo = () => {
    if (!deal?.rating) return 'N/A';
    return (
      <RatingScale
        rating={deal?.rating}
        isShowLevel={false}
        className={styles.ratingScaleValue}
        ratedBy={deal?.ratedBy?.toUpperCase() || ''}
        containerClass={styles.Rating}
      />
    );
  };

  const regulationLabel = RegulatedBy(deal);

  return (
    <>
      <td>
        <div className={styles.regulated}>
          <span className={`flex_wrapper gap-2 ${styles.regulatedBadge}`}>
            <span className="icon-shield" />
            {regulationLabel}
            {Boolean(tooltips?.[regulationLabel]) ? (
              <TooltipCompoent toolTipText={tooltips?.[regulationLabel]}>
                <span className="icon-info" />
              </TooltipCompoent>
            ) : null}
          </span>
          <div className={styles.dealLogo}>
            <Image
              src={deal?.logo}
              alt="logo"
              layout="fixed"
              height={30}
              width={80}
              onClick={() => redirectToAsset(deal)}
            />
          </div>
        </div>
        {totalNumberOfDeals > 2 && (
          <Link
            href="#"
            className={styles.link}
            onClick={(e) => {
              e.preventDefault();
              handleChangeDealModal(true);
            }}
          >
            Swap Deal
          </Link>
        )}
      </td>
      <td className={styles.dataContent}>{AssetType(deal) ?? 'N/A'}</td>
      <td className={styles.dataContent}>
        {AssetType(deal) === 'High Yield FDs' ? (
          <>
            {deal?.irr ?? 'N/A'}%<sup>*</sup> Interest
          </>
        ) : (
          deal?.irr ?? 'N/A'
        )}
      </td>
      <td className={styles.dataContent}>{deal?.tenure ?? 'N/A'}</td>
      <td className={`${styles.dataContent} ${styles.rateCard}`}>
        {RatingInfo()}
      </td>
      <td className={styles.dataContent}>
        {deal?.minInvest
          ? numberToIndianCurrency(deal?.minInvest, false)
          : 'N/A'}
      </td>
      <td className={styles.dataContent}>{deal?.securityCover ?? 'N/A'}</td>
      <div className="text-center">
        <Button
          variant={ButtonType.Inverted}
          className={styles.exploreButton}
          width={'120px'}
          onClick={() => redirectToAsset(deal)}
        >
          Explore
        </Button>
      </div>
    </>
  );
};

export default ResultRow;
