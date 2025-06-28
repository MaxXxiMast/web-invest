import { useRef } from 'react';

import { DotLottiePlayer } from '@dotlottie/react-player';
import type { DotLottieCommonPlayer } from '@dotlottie/react-player';

import Verifying from '../../../../components/lotties/verifying.lottie';
import Completed from '../../../../components/lotties/completed.lottie';
import Warning from '../../../../components/lotties/warning.lottie';

type ModalProps = {
  lottieType?: string;
};
const LottieModal = ({ lottieType = '' }: ModalProps) => {
  const lottieRef = useRef<DotLottieCommonPlayer>(null);
  const getLottieData = () => {
    switch (lottieType) {
      case 'verifying':
        return Verifying;
      case 'completed':
        return Completed;
      case 'warning':
        return Warning;
      default:
        return null;
    }
  };

  return (
    <DotLottiePlayer
      src={getLottieData()}
      autoplay
      loop={lottieType === 'verifying'}
      style={{
        height: '100px',
        width: '100px',
      }}
      ref={lottieRef}
    />
  );
};

export default LottieModal;
