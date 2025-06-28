import { useState } from 'react';
import Image from 'next/image';
import styles from './Dealassist.module.css';

import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { useAppSelector } from '../../../redux/slices/hooks';
import {
  selectAiPopupMessages,
  selectAiPopupAssetId,
} from '../../../redux/slices/AiAssist';

import Button from '../../primitives/Button';
import { isHighYieldFd } from '../../../utils/financeProductTypes';
import { isGCOrder } from '../../../utils/gripConnect';

interface DealAssistProps {
  setShowAiPopup?: (show: boolean) => void;
  onMinimize?: () => void;
  asset?: any;
}
const Dealassist: React.FC<DealAssistProps> = ({
  setShowAiPopup,
  onMinimize,
  asset,
}) => {
  const [clickCount, setClickCount] = useState(1);
  const isMobile = useMediaQuery();
  const isGC = isGCOrder();
  const userID = useAppSelector((state) => state.user.userData?.userID);
  const persistedMessages = useAppSelector(selectAiPopupMessages);
  const persistedAssetId = useAppSelector(selectAiPopupAssetId);

  const handleButtonClick = () => {
    setClickCount(clickCount + 1);

    const DealAssistClickData = {
      userID: userID || 'Guest',
      clickCount,
      timestamp: new Date().toISOString(),
    };

    trackEvent('deal_assist_button_clicked', DealAssistClickData);

    setShowAiPopup?.(true);
  };
  const showDot =
    onMinimize &&
    persistedMessages.length > 0 &&
    asset?.assetID === persistedAssetId;

  return (
    <>
      {!isHighYieldFd(asset) ? (
        isGC ? (
          <Button
            className={styles.dealAssistGCButton}
            width={40}
            style={{ height: 40 }}
            onClick={handleButtonClick}
          >
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}ai-assist/deal-assist-star.svg`}
              alt="Deal Assist Star"
              width={20}
              height={20}
            />
            {showDot && (
              <span data-testid="blue-dot" className={styles.blueDot}></span>
            )}
          </Button>
        ) : (
          <Button
            className={`flex items-center ${styles.dealAssistButton}`}
            id="DealAssistButton"
            onClick={handleButtonClick}
            width={115}
            style={{
              right: isMobile ? 50 : 0,
              height: isMobile ? 28 : 32,
            }}
          >
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}ai-assist/deal-assist-star.svg`}
              alt="Deal Assist Star"
              width={15}
              height={15}
            />
            Deal Assist
            {showDot && (
              <span data-testid="blue-dot" className={styles.blueDot}></span>
            )}
          </Button>
        )
      ) : null}
    </>
  );
};

export default Dealassist;
