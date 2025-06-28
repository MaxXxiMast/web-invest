// NODE MODULES
import React from 'react';
import Image from 'next/image';

// STYLES
import styles from './PopoverBuySell.module.css';

// UTILS
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

interface TimelineItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  disabled?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  icon,
  label,
  value,
  disabled = false,
}) => (
  <div className={`flex justify-between items-center ${styles.timelineItem}`}>
    <div className="flex items-center justify-between">
      <span className={styles.iconWrapper}>{icon}</span>
      <span className={styles.label} aria-disabled={disabled}>
        {label}
      </span>
    </div>
    <div className={styles.value}>
      {label === 'Money Transfer' && value !== '-'
        ? `${value.split(',')[0]}, 7:30 PM`
        : value}
    </div>
  </div>
);

interface PopoverBuySellProps {
  orderPlacedDate: string;
  processingStatus: string;
  transferLabel: string;
  transferValue: string;
}

const PopoverBuySell: React.FC<PopoverBuySellProps> = ({
  orderPlacedDate,
  processingStatus,
  transferLabel,
  transferValue,
}) => {
  const isValidDate = transferValue !== '-';
  const transferDate = isValidDate ? new Date(transferValue) : null;
  const currentDate = new Date();
  const isTransferDatePassed = isValidDate ? transferDate < currentDate : false;
  const getTransferDateIcon = () => {
    if (processingStatus === 'confirmed' || processingStatus === 'initiated') {
      return isTransferDatePassed ? (
        <span className={`icon-check-circle ${styles.IconTick}`} />
      ) : (
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/hour-glass.svg`}
          width={20}
          height={20}
          alt="Processing Request"
        />
      );
    }
    return <span className={styles.icon} />;
  };
  return (
    <div>
      <TimelineItem
        icon={<span className={`icon-check-circle ${styles.IconTick}`} />}
        label="Order Placed"
        value={orderPlacedDate}
      />
      <TimelineItem
        icon={
          processingStatus === 'confirmed' ||
          processingStatus === 'initiated' ? (
            <span className={`icon-check-circle ${styles.IconTick}`} />
          ) : (
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/hour-glass.svg`}
              width={20}
              height={20}
              alt="Processing Request"
            />
          )
        }
        label="Processing Request"
        value={processingStatus}
      />
      <TimelineItem
        icon={getTransferDateIcon()}
        label={transferLabel}
        value={transferValue}
        disabled={
          processingStatus !== 'confirmed' && processingStatus !== 'initiated'
        }
      />
    </div>
  );
};

export default PopoverBuySell;
