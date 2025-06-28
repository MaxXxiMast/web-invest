import React from 'react';
import { BadgeComponentProps, badgePriority, getVisibleBadges } from './utils';
import { urlify } from '../../utils/string';
import { roundOff } from '../../utils/number';

import styles from './BadgeComponent.module.css';
import IRRDropBadge from '../IrrDroppingBadge';

type BadgeListProps = {
  badges: string[];
  repeatInvestorsPercentage: number;
  isSliced?: boolean;
  showIrr?: boolean;
  badgeContainerClass?: string;
  badgeClass?: string;
  irrDroppingDate?: any;
};

const BadgeComponent = ({
  label,
  repeatInvestorsPercentage,
  badgeClass,
}: BadgeComponentProps & {
  repeatInvestorsPercentage: number;
  badgeClass?: string;
}) => {
  const matchingBadge = badgePriority.find((badge) => badge.label === label);
  if (!matchingBadge) {
    console.warn(`No matching badge found for label: ${label}`);
    return null;
  }

  const displayLabel =
    label === 'repeat investors' && repeatInvestorsPercentage
      ? `${roundOff(repeatInvestorsPercentage, 0)}% ${label}`
      : label;

  const colorClass = styles[urlify(`color-${label}`).split('/').join('')];
  const badgeIconClass = `${matchingBadge.icon} ${styles.badgeIcon} ${
    colorClass || styles['default-badge-color']
  }`;

  return (
    <span
      className={`${styles.CardFooterBadge} ${badgeClass}`}
      title={displayLabel}
    >
      <span className={badgeIconClass} aria-hidden="true"></span>
      <span className={styles.badgeLabel}>{displayLabel}</span>
    </span>
  );
};

export const BadgeList = ({
  badges,
  repeatInvestorsPercentage,
  isSliced = true,
  badgeContainerClass,
  badgeClass,
  showIrr = false,
  irrDroppingDate,
}: BadgeListProps) => {
  const visibleBadges = getVisibleBadges(badges, isSliced);

  return (
    <div className={`${styles.badgeContainer} ${badgeContainerClass}`}>
      {visibleBadges.map((badge) => (
        <BadgeComponent
          key={badge.label}
          label={badge.label}
          repeatInvestorsPercentage={repeatInvestorsPercentage}
          badgeClass={badgeClass}
        />
      ))}
      {showIrr ? <IRRDropBadge dropTime={irrDroppingDate} /> : null}
    </div>
  );
};
