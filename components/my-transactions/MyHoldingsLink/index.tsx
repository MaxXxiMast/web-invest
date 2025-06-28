import { useRouter } from 'next/router';

// components
import Image from '../../primitives/Image';

// utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';

// styles
import styles from './MyHoldingsLink.module.css';

interface MyHoldingsLinkProps {
  activeFilter?: string;
}

const MyHoldingsLink = ({ activeFilter }: MyHoldingsLinkProps) => {
  const router = useRouter();
  const navigateToMyHoldings = () => {
    trackEvent('view_current_holdings_insights', {
      category: activeFilter,
    });
    router.push('/portfolio#my_holdings');
  };
  return (
    <div
      className={`${styles.container} flex-column justify-between`}
      data-testid="MyHoldingsLink"
    >
      <p>View Current Holdings and Insights</p>
      <button
        onClick={navigateToMyHoldings}
        className={`${styles.button} flex items-center`}
      >
        <span>Current Holdings</span>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/click.svg`}
          alt="click"
          height={25}
          width={25}
          layout="intrinsic"
        />
      </button>
    </div>
  );
};

export default MyHoldingsLink;
