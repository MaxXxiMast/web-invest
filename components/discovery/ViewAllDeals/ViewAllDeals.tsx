import { useRouter } from 'next/router';

import styles from './ViewAllDeals.module.css';

type Props = {
  variant?: 'primary' | 'secondary';
};

function ViewAllDeals({ variant = 'primary' }: Props) {
  const router = useRouter();

  const handleViewAllClick = () => {
    router.push('/assets');
  };

  return (
    <div className={`${styles.viewAllDealMobile} ${variant}`}>
      <div className={styles.LiveTagContainer}>
        <span className={styles.LiveTag} />
        <div className={styles.ViewAllDealText}>{`We have 15+ live deals`}</div>
      </div>
      <div className={styles.LiveDealButton} onClick={handleViewAllClick}>
        View All Deals
      </div>
    </div>
  );
}

export default ViewAllDeals;
