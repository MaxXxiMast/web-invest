import { useEffect, useState } from 'react';

import { CircularProgress } from '@mui/material';
import DematStatus from '../../components/user-kyc/mobile-app-components/demat-success';

import styles from './DematProgress.module.css';
import DematTimer from '../../components/user-kyc/financial/demat-add/DematTimer';
import { postMessageToNativeOrFallback } from '../../utils/appHelpers';

const DematProcessing = () => {
  const [loading, setLoading] = useState(true);
  const [showScreen, setShowScreen] = useState('');

  useEffect(() => {
    setTimeout(() => {
      const data = localStorage.getItem('dematStatus');
      if (data) {
        if (['success', 'failure'].includes(data)) {
          setShowScreen(data);
        } else {
          setShowScreen('Timer');
          postMessageToNativeOrFallback('dematGcRedirection', {
            data: { redirectUrl: data },
          });
        }
      }
      setLoading(false);
    }, 2000);
  }, []);

  if (loading)
    return (
      <div className={`flex_wrapper ${styles.container}`}>
        <CircularProgress />
      </div>
    );

  if (showScreen === 'Timer') return <DematTimer />;

  return <DematStatus status={showScreen === 'success'} />;
};

export default DematProcessing;
