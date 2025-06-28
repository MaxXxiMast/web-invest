import LottieModal from '../../common/GenericModal/LottieModal';
import styles from './DematSucces.module.css';

const DematStatus = ({ status = true }) => {
  if (!status)
    return (
      <div className={`flex-column items-center ${styles.Wrapper}`}>
        {LottieModal({ lottieType: 'warning' })}
        <h3>Demat verification Failed</h3>
        <p>
          We could not find a valid ECAS document. You may close this tab and
          try entering the demat manually on app
        </p>
      </div>
    );

  return (
    <div className={`flex-column items-center ${styles.Wrapper}`}>
      {LottieModal({ lottieType: 'completed' })}
      <h3>Demat verification completed</h3>
      <p>You may close this tab now! Please switch to the app to resume KYC.</p>
    </div>
  );
};

export default DematStatus;
