//NODE MODULES
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

//STYLES
import styles from './IRRDropBadge.module.css';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

interface IRRDropBadgeProps {
  dropTime: Date;
}

const IRRDropBadge = ({ dropTime }: IRRDropBadgeProps) => {
  const getTimeLeft = () => {
    const now = new Date();
    const difference = dropTime.getTime() - now.getTime();

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const initialTimeLeft = useMemo(
    () => (dropTime ? getTimeLeft() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dropTime]
  );
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

  useEffect(() => {
    if (!dropTime || dropTime.getTime() < Date.now()) {
      return;
    }

    const calculateTimeLeft = () => {
      setTimeLeft(getTimeLeft());
    };

    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropTime]);

  if (!dropTime || dropTime.getTime() < Date.now()) {
    return null;
  }

  return (
    <div className={styles.BadgeContainer}>
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}assets/dropping-soon.gif`}
        alt="Countdown gif"
        width={14}
        height={14}
      />
      <span>
        <strong>
          <i>Drops</i>
        </strong>{' '}
        {timeLeft === '0h 0m' ? 'in less than 1m' : 'in ' + timeLeft}
      </span>
    </div>
  );
};

export default IRRDropBadge;
