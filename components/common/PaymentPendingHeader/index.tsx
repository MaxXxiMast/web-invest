// NODE MODULES
import { useRouter } from 'next/router';

// Components
import Image from '../../primitives/Image';
import PoweredByGrip from '../../primitives/PoweredByGrip';

// Utils
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { isGCOrder } from '../../../utils/gripConnect';

import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// Styles
import styles from './PaymentPendingHeader.module.css';

type Props = {
  isClickable?: boolean;
};

const PaymentPendingHeader = ({ isClickable = true }: Props) => {
  const isMobile = useMediaQuery();
  const imageWidth = isMobile ? 65 : 88;
  const imageHeight = isMobile ? 23 : 32;
  const isGC = isGCOrder();
  const router = useRouter();
  const isPaymentProcessing = [
    '/payment-processing',
    '/rfq-payment-processing',
  ].includes(router.pathname);

  const renderGrip = () => {
    return (
      <Image
        src={`${GRIP_INVEST_BUCKET_URL}commons/logo.svg`}
        alt="Logo"
        layout={'fixed'}
        width={imageWidth}
        height={imageHeight}
      />
    );
  };

  const renderLogo = () => {
    if (isGC) {
      if (isPaymentProcessing && isMobile) {
        return renderGrip();
      }
      return <PoweredByGrip />;
    }

    return renderGrip();
  };

  return (
    <div className={styles.Header}>
      <div
        className={styles.Logo}
        onClick={() => {
          if (isClickable) {
            window.open('/', '_self', 'noopener');
          }
        }}
      >
        {renderLogo()}
      </div>
      {isGC ? (
        <div className={styles.BottomFooter}>
          <PoweredByGrip />
        </div>
      ) : null}
    </div>
  );
};

export default PaymentPendingHeader;
