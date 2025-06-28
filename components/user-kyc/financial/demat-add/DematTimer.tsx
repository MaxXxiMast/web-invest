import { useEffect } from 'react';
import { useRouter } from 'next/router';

//Components
import CountDownTimer from '../../../primitives/CountDownTimer';
import Button from '../../../primitives/Button';

//Utils
import { getTimeInFormat } from '../../../../utils/timer';

//API
import { handleKycStatus } from '../../../../api/rfqKyc';

//Styles
import styles from './DemtaTimer.module.css';

let isLoaded = false; //Flag to prevent multiple API calls on rerender

const DematTimer = () => {
  const router = useRouter();
  let interval;

  const handleRedirect = () => {
    router.replace('user-kyc?query=dematManual');
  };

  const getKycStatus = () => {
    interval = setInterval(async () => {
      const res = await handleKycStatus();
      const isDematComplete = res?.kycTypes?.find(
        (kycData: any) => kycData?.name === 'depository'
      )?.isKYCComplete;
      if (isDematComplete) {
        handleRedirect();
      }
    }, 20 * 1000);
  };

  useEffect(() => {
    if (!isLoaded) {
      getKycStatus();
    }
    isLoaded = true;
    return () => {
      isLoaded = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTime = ({ remainingTime }) => {
    const isTimeUp = remainingTime === 0;
    return <span>{isTimeUp ? `00:00` : getTimeInFormat(remainingTime)}</span>;
  };

  return (
    <>
      <div className={`flex_wrapper flex-column gap-12 ${styles.container}`}>
        <CountDownTimer
          isPlaying
          size={200}
          strokeWidth={12}
          duration={300}
          color={'#00B8B7'}
          trailColor={'#FFFFFF'}
          onComplete={() => {
            clearInterval(interval);
            handleRedirect();
            return {
              shouldRepeat: false,
            };
          }}
        >
          {renderTime}
        </CountDownTimer>
        <h3>Fetching Demat Status...</h3>
      </div>
      <div className={styles.BtnWrapper}>
        <Button onClick={handleRedirect} width={'100%'}>
          Enter Demat Manually
        </Button>
      </div>
    </>
  );
};

export default DematTimer;
